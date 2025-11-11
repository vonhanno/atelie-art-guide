//
//  ArtworkCard.swift
//  AtelieArtAgent
//
//  Card component for displaying artwork in results grid
//

import SwiftUI

struct ArtworkCard: View {
    let match: MatchResult
    let onViewInRoom: () -> Void
    let onViewOnAtelie: () -> Void
    
    private var confidenceColor: Color {
        switch match.confidence {
        case "high":
            return .green
        case "medium":
            return .yellow
        default:
            return .gray
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image Section
            ZStack(alignment: .topTrailing) {
                AsyncImage(url: URL(string: match.artwork.imageUrls?.first ?? "")) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    case .failure:
                        Image(systemName: "photo")
                            .foregroundColor(.gray)
                    @unknown default:
                        EmptyView()
                    }
                }
                .aspectRatio(1, contentMode: .fill)
                .clipped()
                
                // Match Score Badge
                Text("\(Int(match.score))% match")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(confidenceColor)
                    .cornerRadius(8)
                    .padding(8)
            }
            
            // Content Section
            VStack(alignment: .leading, spacing: 8) {
                Text(match.artwork.title)
                    .font(.headline)
                    .lineLimit(1)
                
                Text(match.artwork.studioName)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                
                Text("\(match.artwork.currency) \(Int(match.artwork.price).formatted())")
                    .font(.title3)
                    .fontWeight(.bold)
                
                // Match Reasons
                if !match.reasons.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Why it matches:")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                        
                        ForEach(match.reasons.prefix(3), id: \.self) { reason in
                            Text("• \(reason)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .lineLimit(2)
                        }
                    }
                }
            }
            .padding()
            
            // Action Buttons
            HStack(spacing: 8) {
                Button(action: onViewInRoom) {
                    Label("View in Room", systemImage: "eye")
                        .font(.subheadline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(Color(.systemGray5))
                        .foregroundColor(.primary)
                        .cornerRadius(8)
                }
                
                Button(action: onViewOnAtelie) {
                    Label("View on Atelie", systemImage: "arrow.up.right.square")
                        .font(.subheadline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(Color.yellow)
                        .foregroundColor(.black)
                        .cornerRadius(8)
                }
            }
            .padding(.horizontal)
            .padding(.bottom)
        }
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

