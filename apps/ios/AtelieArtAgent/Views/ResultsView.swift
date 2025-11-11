//
//  ResultsView.swift
//  AtelieArtAgent
//
//  Results screen displaying matched artworks
//

import SwiftUI

struct ResultsView: View {
    let searchResponse: SearchResponse?
    let roomImage: UIImage?
    @StateObject private var viewModel = ResultsViewModel()
    @Environment(\.dismiss) var dismiss
    @State private var selectedArtwork: AlgoliaArtwork?
    @State private var showVisualizer = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: { dismiss() }) {
                    Label("New Search", systemImage: "arrow.left")
                        .font(.subheadline)
                }
                
                Spacer()
                
                Text("\(viewModel.filteredResults.count) Artwork\(viewModel.filteredResults.count != 1 ? "s" : "") Found")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Spacer()
                
                Menu {
                    ForEach(SortOption.allCases, id: \.self) { option in
                        Button(action: {
                            viewModel.sortOption = option
                            viewModel.applyFilters()
                        }) {
                            HStack {
                                Text(option.displayName)
                                if viewModel.sortOption == option {
                                    Image(systemName: "checkmark")
                                }
                            }
                        }
                    }
                } label: {
                    Image(systemName: "arrow.up.arrow.down")
                        .padding(8)
                        .background(Color(.systemGray5))
                        .cornerRadius(8)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            
            if viewModel.filteredResults.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "photo.on.rectangle.angled")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)
                    
                    Text("No artworks match your filters")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    
                    Button(action: { dismiss() }) {
                        Text("Start New Search")
                            .font(.subheadline)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 12)
                            .background(Color.yellow)
                            .foregroundColor(.black)
                            .cornerRadius(8)
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollView {
                    LazyVGrid(columns: [
                        GridItem(.adaptive(minimum: 300), spacing: 16)
                    ], spacing: 16) {
                        ForEach(viewModel.filteredResults) { match in
                            ArtworkCard(
                                match: match,
                                onViewInRoom: {
                                    selectedArtwork = match.artwork
                                    showVisualizer = true
                                },
                                onViewOnAtelie: {
                                    if let url = URL(string: "https://atelie.art/artworks/\(match.artworkId)") {
                                        UIApplication.shared.open(url)
                                    }
                                }
                            )
                            .onTapGesture {
                                selectedArtwork = match.artwork
                            }
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { viewModel.showFilters.toggle() }) {
                    Image(systemName: "line.3.horizontal.decrease.circle")
                }
            }
        }
        .sheet(isPresented: $viewModel.showFilters) {
            FilterSidebar(viewModel: viewModel)
        }
        .onAppear {
            if let response = searchResponse {
                viewModel.setResults(response.results)
            }
        }
        .navigationDestination(isPresented: $showVisualizer) {
            if let artwork = selectedArtwork {
                RoomVisualizerView(artwork: artwork, roomImage: roomImage)
            }
        }
        .navigationDestination(item: $selectedArtwork) { artwork in
            ArtworkDetailView(artwork: artwork)
        }
    }
}

struct FilterSidebar: View {
    @ObservedObject var viewModel: ResultsViewModel
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            Form {
                Section("Price Range") {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("\(Int(viewModel.priceRange.lowerBound)) - \(Int(viewModel.priceRange.upperBound))")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        
                        RangeSlider(
                            range: $viewModel.priceRange,
                            bounds: 0...max(viewModel.priceRange.upperBound, 10000)
                        )
                    }
                }
                
                Section("Styles") {
                    ForEach(viewModel.availableStyles.prefix(10), id: \.self) { style in
                        Toggle(style.capitalized, isOn: Binding(
                            get: { viewModel.selectedStyles.contains(style) },
                            set: { _ in viewModel.toggleStyle(style) }
                        ))
                    }
                }
                
                Section("Colors") {
                    ForEach(viewModel.availableColors.prefix(10), id: \.self) { color in
                        Toggle(color.capitalized, isOn: Binding(
                            get: { viewModel.selectedColors.contains(color) },
                            set: { _ in viewModel.toggleColor(color) }
                        ))
                    }
                }
                
                Section("Artist") {
                    TextField("Search artist...", text: $viewModel.artistSearch)
                        .onChange(of: viewModel.artistSearch) { _ in
                            viewModel.applyFilters()
                        }
                }
                
                if !viewModel.selectedStyles.isEmpty || !viewModel.selectedColors.isEmpty || !viewModel.artistSearch.isEmpty {
                    Section {
                        Button("Clear Filters", action: {
                            viewModel.clearFilters()
                        })
                        .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// Simple Range Slider
struct RangeSlider: View {
    @Binding var range: ClosedRange<Double>
    let bounds: ClosedRange<Double>
    
    var body: some View {
        VStack {
            HStack {
                Text("\(Int(bounds.lowerBound))")
                    .font(.caption)
                Spacer()
                Text("\(Int(bounds.upperBound))")
                    .font(.caption)
            }
            
            // Simplified slider - in production, use a proper range slider component
            VStack(spacing: 8) {
                Slider(value: Binding(
                    get: { range.lowerBound },
                    set: { range = $0...range.upperBound }
                ), in: bounds)
                
                Slider(value: Binding(
                    get: { range.upperBound },
                    set: { range = range.lowerBound...$0 }
                ), in: bounds)
            }
        }
    }
}

