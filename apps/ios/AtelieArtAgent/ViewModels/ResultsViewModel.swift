//
//  ResultsViewModel.swift
//  AtelieArtAgent
//
//  ViewModel for the results screen
//

import SwiftUI

enum SortOption: String, CaseIterable {
    case bestMatch = "best-match"
    case priceLow = "price-low"
    case priceHigh = "price-high"
    case newest = "newest"
    case random = "random"
    
    var displayName: String {
        switch self {
        case .bestMatch: return "Best Match"
        case .priceLow: return "Price: Low to High"
        case .priceHigh: return "Price: High to Low"
        case .newest: return "Newest First"
        case .random: return "Random"
        }
    }
}

@MainActor
class ResultsViewModel: ObservableObject {
    @Published var results: [MatchResult] = []
    @Published var filteredResults: [MatchResult] = []
    @Published var sortOption: SortOption = .bestMatch
    @Published var priceRange: ClosedRange<Double> = 0...10000
    @Published var selectedStyles: Set<String> = []
    @Published var selectedColors: Set<String> = []
    @Published var artistSearch: String = ""
    @Published var showFilters: Bool = false
    
    var availableStyles: [String] {
        Array(Set(results.compactMap { $0.analysis?.styleAndGenre.style }))
            .sorted()
    }
    
    var availableColors: [String] {
        Array(Set(results.flatMap { $0.analysis?.basicVisualProperties.dominantColors ?? [] }))
            .sorted()
    }
    
    func setResults(_ newResults: [MatchResult]) {
        results = newResults
        
        // Set initial price range
        if !results.isEmpty {
            let prices = results.map { $0.artwork.price }
            let maxPrice = prices.max() ?? 10000
            priceRange = 0...maxPrice
        }
        
        applyFilters()
    }
    
    func applyFilters() {
        var filtered = results
        
        // Price filter
        filtered = filtered.filter { result in
            result.artwork.price >= priceRange.lowerBound && result.artwork.price <= priceRange.upperBound
        }
        
        // Style filter
        if !selectedStyles.isEmpty {
            filtered = filtered.filter { result in
                guard let style = result.analysis?.styleAndGenre.style.lowercased() else { return false }
                return selectedStyles.contains { selectedStyle in
                    style.contains(selectedStyle.lowercased())
                }
            }
        }
        
        // Color filter
        if !selectedColors.isEmpty {
            filtered = filtered.filter { result in
                guard let colors = result.analysis?.basicVisualProperties.dominantColors else { return false }
                return selectedColors.contains { selectedColor in
                    colors.contains { color in
                        color.lowercased().contains(selectedColor.lowercased())
                    }
                }
            }
        }
        
        // Artist filter
        if !artistSearch.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            let searchTerm = artistSearch.lowercased()
            filtered = filtered.filter { result in
                result.artwork.studioName.lowercased().contains(searchTerm)
            }
        }
        
        // Sort
        switch sortOption {
        case .bestMatch:
            filtered.sort { $0.score > $1.score }
        case .priceLow:
            filtered.sort { $0.artwork.price < $1.artwork.price }
        case .priceHigh:
            filtered.sort { $0.artwork.price > $1.artwork.price }
        case .newest:
            filtered.sort { ($0.artwork.year ?? 0) > ($1.artwork.year ?? 0) }
        case .random:
            filtered.shuffle()
        }
        
        filteredResults = filtered
    }
    
    func clearFilters() {
        selectedStyles.removeAll()
        selectedColors.removeAll()
        artistSearch = ""
        if !results.isEmpty {
            let prices = results.map { $0.artwork.price }
            let maxPrice = prices.max() ?? 10000
            priceRange = 0...maxPrice
        }
        applyFilters()
    }
    
    func toggleStyle(_ style: String) {
        if selectedStyles.contains(style) {
            selectedStyles.remove(style)
        } else {
            selectedStyles.insert(style)
        }
        applyFilters()
    }
    
    func toggleColor(_ color: String) {
        if selectedColors.contains(color) {
            selectedColors.remove(color)
        } else {
            selectedColors.insert(color)
        }
        applyFilters()
    }
}

