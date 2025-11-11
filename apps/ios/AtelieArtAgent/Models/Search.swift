//
//  Search.swift
//  AtelieArtAgent
//
//  Models for search functionality
//

import Foundation

struct MatchResult: Codable, Identifiable {
    let artworkId: String
    let score: Double
    let reasons: [String]
    let confidence: String // "low" | "medium" | "high"
    let artwork: AlgoliaArtwork
    let analysis: AIAnalysisData?
    
    var id: String { artworkId }
}

struct RoomAnalysis: Codable {
    let style: String
    let colors: [RoomColor]
    let lighting: String
    let roomSize: String // "small" | "medium" | "large"
    let mood: String
    let suitableArtStyles: [String]
    let recommendedSizes: [String]
    let paletteTemperature: String // "warm" | "cool" | "neutral"
}

struct RoomColor: Codable {
    let name: String
    let hex: String
    let pct: Double
}

struct TextQueryCriteria: Codable {
    let styles: [String]
    let colors: [String]
    let mood: String
    let size: String
    let medium: String
    let priceRange: PriceRange
    let context: String
}

struct PriceRange: Codable {
    let min: Double
    let max: Double
}

struct SearchResponse: Codable {
    let success: Bool
    let criteria: SearchCriteria?
    let roomAnalysis: RoomAnalysis?
    let results: [MatchResult]
    let count: Int
}

struct SearchCriteria: Codable {
    let roomAnalysis: RoomAnalysis?
    let textCriteria: TextQueryCriteria?
}

struct SearchErrorResponse: Codable {
    let success: Bool
    let error: String
}

