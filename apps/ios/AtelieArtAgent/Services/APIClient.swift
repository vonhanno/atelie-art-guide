//
//  APIClient.swift
//  AtelieArtAgent
//
//  API client for communicating with the Fastify REST API
//

import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(statusCode: Int, message: String?)
    case decodingError(Error)
    case networkError(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .httpError(let statusCode, let message):
            return message ?? "HTTP error with status code: \(statusCode)"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        }
    }
}

class APIClient {
    static let shared = APIClient()
    
    private let session: URLSession
    private let baseURL: URL
    
    private init() {
        self.baseURL = Config.apiURL
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: configuration)
    }
    
    // MARK: - Artwork Endpoints
    
    func searchArtworks(
        query: String? = nil,
        artist: String? = nil,
        availability: String? = nil,
        technique: String? = nil,
        page: Int = 1,
        hitsPerPage: Int = 20
    ) async throws -> ArtworkSearchResponse {
        var components = URLComponents(url: baseURL.appendingPathComponent("api/artworks/search"), resolvingAgainstBaseURL: false)!
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "page", value: "\(page)"),
            URLQueryItem(name: "hitsPerPage", value: "\(hitsPerPage)")
        ]
        
        if let query = query, !query.isEmpty {
            queryItems.append(URLQueryItem(name: "q", value: query))
        }
        if let artist = artist, !artist.isEmpty {
            queryItems.append(URLQueryItem(name: "artist", value: artist))
        }
        if let availability = availability, !availability.isEmpty {
            queryItems.append(URLQueryItem(name: "availability", value: availability))
        }
        if let technique = technique, !technique.isEmpty {
            queryItems.append(URLQueryItem(name: "technique", value: technique))
        }
        
        components.queryItems = queryItems
        
        guard let url = components.url else {
            throw APIError.invalidURL
        }
        
        return try await performRequest(url: url, method: "GET")
    }
    
    func getArtwork(id: String) async throws -> AlgoliaArtwork {
        let url = baseURL.appendingPathComponent("api/artworks/\(id)")
        return try await performRequest(url: url, method: "GET")
    }
    
    // MARK: - Analysis Endpoints
    
    func enqueueAnalysis(artworkIds: [String]) async throws -> EnqueueResponse {
        let url = baseURL.appendingPathComponent("api/analysis/enqueue")
        let body = ["artworkIds": artworkIds]
        return try await performRequest(url: url, method: "POST", body: body)
    }
    
    func getAnalysisStatus() async throws -> AnalysisStats {
        let url = baseURL.appendingPathComponent("api/analysis/status")
        return try await performRequest(url: url, method: "GET")
    }
    
    func getAnalysis(id: String) async throws -> AIAnalysisResult {
        let url = baseURL.appendingPathComponent("api/analysis/\(id)")
        return try await performRequest(url: url, method: "GET")
    }
    
    func getAnalysisByArtworkId(artworkId: String) async throws -> AIAnalysisResult {
        let url = baseURL.appendingPathComponent("api/analysis/artwork/\(artworkId)")
        return try await performRequest(url: url, method: "GET")
    }
    
    func retryAnalysis(id: String) async throws -> [String: Bool] {
        let url = baseURL.appendingPathComponent("api/analysis/retry/\(id)")
        return try await performRequest(url: url, method: "POST")
    }
    
    // MARK: - Search Endpoints
    
    func searchText(query: String) async throws -> SearchResponse {
        let url = baseURL.appendingPathComponent("api/search/text")
        let body = ["query": query]
        return try await performRequest(url: url, method: "POST", body: body)
    }
    
    func searchImage(imageBase64: String) async throws -> SearchResponse {
        let url = baseURL.appendingPathComponent("api/search/image")
        let body = ["imageBase64": imageBase64]
        return try await performRequest(url: url, method: "POST", body: body)
    }
    
    func searchCombined(query: String, imageBase64: String) async throws -> SearchResponse {
        let url = baseURL.appendingPathComponent("api/search/combined")
        let body = ["query": query, "imageBase64": imageBase64]
        return try await performRequest(url: url, method: "POST", body: body)
    }
    
    // MARK: - Generic Request Method
    
    private func performRequest<T: Decodable>(
        url: URL,
        method: String,
        body: [String: Any]? = nil
    ) async throws -> T {
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let body = body {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }
        
        do {
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }
            
            // Handle HTTP errors
            guard (200...299).contains(httpResponse.statusCode) else {
                let errorMessage = try? JSONDecoder().decode(SearchErrorResponse.self, from: data).error
                throw APIError.httpError(statusCode: httpResponse.statusCode, message: errorMessage)
            }
            
            // Decode response
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            
            // Handle date formats that might come from the API
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
            decoder.dateDecodingStrategy = .custom { decoder in
                let container = try decoder.singleValueContainer()
                let dateString = try container.decode(String.self)
                
                if let date = formatter.date(from: dateString) {
                    return date
                }
                
                // Try ISO8601
                formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
                if let date = formatter.date(from: dateString) {
                    return date
                }
                
                // Try timestamp
                if let timestamp = Double(dateString) {
                    return Date(timeIntervalSince1970: timestamp / 1000.0)
                }
                
                throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid date format: \(dateString)")
            }
            
            return try decoder.decode(T.self, from: data)
        } catch let error as APIError {
            throw error
        } catch let error as DecodingError {
            throw APIError.decodingError(error)
        } catch {
            throw APIError.networkError(error)
        }
    }
}

// MARK: - Date Decoding Helper

extension JSONDecoder.DateDecodingStrategy {
    static func custom(_ decoder: @escaping (Decoder) throws -> Date) -> JSONDecoder.DateDecodingStrategy {
        return .custom(decoder)
    }
}

