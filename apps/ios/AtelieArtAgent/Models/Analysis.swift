//
//  Analysis.swift
//  AtelieArtAgent
//
//  Models for AI analysis data
//

import Foundation

enum AnalysisStatus: String, Codable {
    case pending = "pending"
    case processing = "processing"
    case done = "done"
    case failed = "failed"
}

struct AIAnalysisResult: Codable {
    let id: String
    let artworkId: String
    let status: AnalysisStatus
    let analysisDate: Date
    let imageUrl: String
    let title: String
    let studioName: String
    let aiData: AIAnalysisData?
    let error: String?
    let createdAt: Date
    let updatedAt: Date
}

struct AIAnalysisData: Codable {
    let basicVisualProperties: BasicVisualProperties
    let textureAnalysis: TextureAnalysis
    let styleAndGenre: StyleAndGenre
    let subjectMatter: SubjectMatter
    let mediumAndTechnique: MediumAndTechnique
    let composition: Composition
    let spaceAndDisplay: SpaceAndDisplay
    let psychologicalImpact: PsychologicalImpact
    let marketAnalysis: MarketAnalysis
    let tags: [String]
}

struct BasicVisualProperties: Codable {
    let dominantColors: [String]
    let secondaryColors: [String]
    let colorTemperature: String // "warm" | "cool" | "neutral"
    let colorPalette: [String]
}

struct TextureAnalysis: Codable {
    let textureType: String
    let textureDescription: String
    let surfaceQuality: String
}

struct StyleAndGenre: Codable {
    let style: String
    let genre: String
    let movement: String?
    let period: String?
}

struct SubjectMatter: Codable {
    let primarySubject: String
    let secondarySubjects: [String]
    let themes: [String]
    let narrative: String?
}

struct MediumAndTechnique: Codable {
    let medium: String
    let technique: String
    let materials: [String]?
}

struct Composition: Codable {
    let layout: String
    let focalPoint: String
    let balance: String
    let perspective: String?
}

struct SpaceAndDisplay: Codable {
    let recommendedRoomTypes: [String]
    let recommendedWallColor: [String]
    let lightingRecommendations: [String]
    let sizeRecommendations: String
}

struct PsychologicalImpact: Codable {
    let mood: [String]
    let energyLevel: String // "low" | "medium" | "high"
    let emotionalTone: String
}

struct MarketAnalysis: Codable {
    let targetAudience: [String]
    let priceRange: String?
    let collectibility: String // "low" | "medium" | "high"
}

struct AnalysisStats: Codable {
    let total: Int
    let pending: Int
    let processing: Int
    let done: Int
    let failed: Int
    let successRate: Double
}

struct EnqueueResponse: Codable {
    let success: Bool
    let enqueued: Int
    let jobIds: [String]
}

