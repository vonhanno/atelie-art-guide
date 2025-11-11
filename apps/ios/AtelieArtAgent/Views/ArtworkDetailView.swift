//
//  ArtworkDetailView.swift
//  AtelieArtAgent
//
//  Detail view for individual artwork
//

import SwiftUI

struct ArtworkDetailView: View {
    let artwork: AlgoliaArtwork
    @State private var analysis: AIAnalysisResult?
    @State private var isLoadingAnalysis = false
    @State private var errorMessage: String?
    @State private var requestingAnalysis = false
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Artwork Image
                AsyncImage(url: URL(string: artwork.imageUrls?.first ?? "")) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                            .frame(height: 400)
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                    case .failure:
                        Image(systemName: "photo")
                            .font(.system(size: 48))
                            .foregroundColor(.gray)
                    @unknown default:
                        EmptyView()
                    }
                }
                .frame(maxHeight: 500)
                .clipped()
                .cornerRadius(12)
                
                // Artwork Info
                VStack(alignment: .leading, spacing: 12) {
                    Text(artwork.title)
                        .font(.title)
                        .fontWeight(.bold)
                    
                    Text(artwork.studioName)
                        .font(.title2)
                        .foregroundColor(.secondary)
                    
                    Text("\(artwork.currency) \(Int(artwork.price).formatted())")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.yellow)
                    
                    if let year = artwork.year {
                        Text("Year: \(year)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    if !artwork.techniques.isEmpty {
                        Text("Techniques: \(artwork.techniques.joined(separator: ", "))")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    Text("Dimensions: \(Int(artwork.dimensions.widthCm)) × \(Int(artwork.dimensions.heightCm)) cm")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()
                
                // Action Buttons
                HStack(spacing: 12) {
                    Button(action: {
                        // Navigate to visualizer
                    }) {
                        Label("View in Room", systemImage: "eye")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(.systemGray5))
                            .foregroundColor(.primary)
                            .cornerRadius(12)
                    }
                    
                    Button(action: {
                        if let url = URL(string: "https://atelie.art/artworks/\(artwork.objectID)") {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        Label("View on Atelie", systemImage: "arrow.up.right.square")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.yellow)
                            .foregroundColor(.black)
                            .cornerRadius(12)
                    }
                }
                .padding(.horizontal)
                
                // Analysis Section
                if let analysis = analysis {
                    if analysis.status == .done, let aiData = analysis.aiData {
                        AnalysisDetailView(analysis: aiData)
                    } else if analysis.status == .failed {
                        VStack(spacing: 8) {
                            Text("Analysis Failed")
                                .font(.headline)
                                .foregroundColor(.red)
                            
                            if let error = analysis.error {
                                Text(error)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(12)
                    } else {
                        HStack {
                            ProgressView()
                            Text("Analysis in progress...")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                    }
                } else {
                    Button(action: requestAnalysis) {
                        HStack {
                            if requestingAnalysis {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text("Request AI Analysis")
                                    .fontWeight(.semibold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(requestingAnalysis ? Color.gray : Color.yellow)
                        .foregroundColor(.black)
                        .cornerRadius(12)
                    }
                    .disabled(requestingAnalysis)
                    .padding(.horizontal)
                }
                
                if let error = errorMessage {
                    Text(error)
                        .font(.subheadline)
                        .foregroundColor(.red)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(12)
                        .padding(.horizontal)
                }
            }
            .padding()
        }
        .navigationTitle(artwork.title)
        .navigationBarTitleDisplayMode(.large)
        .task {
            await loadAnalysis()
        }
    }
    
    private func loadAnalysis() async {
        isLoadingAnalysis = true
        do {
            analysis = try await APIClient.shared.getAnalysisByArtworkId(artworkId: artwork.objectID)
        } catch {
            // Analysis might not exist yet, which is fine
            if !(error.localizedDescription.contains("404") || error.localizedDescription.contains("not found")) {
                errorMessage = error.localizedDescription
            }
        }
        isLoadingAnalysis = false
    }
    
    private func requestAnalysis() {
        requestingAnalysis = true
        errorMessage = nil
        
        Task {
            do {
                _ = try await APIClient.shared.enqueueAnalysis(artworkIds: [artwork.objectID])
                // Poll for analysis result
                try await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds
                await loadAnalysis()
            } catch {
                errorMessage = error.localizedDescription
            }
            requestingAnalysis = false
        }
    }
}

struct AnalysisDetailView: View {
    let analysis: AIAnalysisData
    @State private var expandedSections: Set<String> = []
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("AI Analysis")
                .font(.title2)
                .fontWeight(.bold)
                .padding(.horizontal)
            
            AnalysisSection(
                title: "Visual Properties",
                content: analysis.basicVisualProperties.dominantColors.joined(separator: ", ")
            )
            
            AnalysisSection(
                title: "Style & Genre",
                content: "\(analysis.styleAndGenre.style), \(analysis.styleAndGenre.genre)"
            )
            
            AnalysisSection(
                title: "Subject Matter",
                content: analysis.subjectMatter.primarySubject
            )
            
            AnalysisSection(
                title: "Composition",
                content: analysis.composition.layout
            )
            
            AnalysisSection(
                title: "Space & Display",
                content: analysis.spaceAndDisplay.recommendedRoomTypes.joined(separator: ", ")
            )
            
            AnalysisSection(
                title: "Psychological Impact",
                content: analysis.psychologicalImpact.mood.joined(separator: ", ")
            )
        }
    }
}

struct AnalysisSection: View {
    let title: String
    let content: String
    @State private var isExpanded = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Button(action: { isExpanded.toggle() }) {
                HStack {
                    Text(title)
                        .font(.headline)
                    Spacer()
                    Image(systemName: isExpanded ? "chevron.down" : "chevron.right")
                }
            }
            .buttonStyle(PlainButtonStyle())
            
            if isExpanded {
                Text(content)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .padding(.leading)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

