//
//  Artwork.swift
//  AtelieArtAgent
//
//  Models for artwork data from Algolia
//

import Foundation

struct AlgoliaArtwork: Codable, Identifiable, Hashable {
    let objectID: String
    let title: String
    let studioName: String
    let imageUrls: [String]?
    let price: Double
    let currency: String
    let dimensions: Dimensions
    let techniques: [String]
    let year: Int?
    let infoText: String?
    let status: String
    
    var id: String { objectID }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(objectID)
    }
    
    static func == (lhs: AlgoliaArtwork, rhs: AlgoliaArtwork) -> Bool {
        lhs.objectID == rhs.objectID
    }
}

struct Dimensions: Codable {
    let widthCm: Double
    let heightCm: Double
}

struct ArtworkSearchResponse: Codable {
    let hits: [AlgoliaArtwork]
    let nbHits: Int
    let page: Int
    let nbPages: Int
    let hitsPerPage: Int
}

