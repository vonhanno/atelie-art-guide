//
//  Config.swift
//  AtelieArtAgent
//
//  Configuration for API base URL and environment settings
//

import Foundation

struct Config {
    static var apiBaseURL: String {
        #if DEBUG
        return "http://localhost:3001"
        #else
        // Update with your production API URL
        return "https://your-production-api.com"
        #endif
    }
    
    static var apiURL: URL {
        guard let url = URL(string: apiBaseURL) else {
            fatalError("Invalid API base URL: \(apiBaseURL)")
        }
        return url
    }
}

