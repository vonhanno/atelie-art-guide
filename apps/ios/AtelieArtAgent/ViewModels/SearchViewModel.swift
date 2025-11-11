//
//  SearchViewModel.swift
//  AtelieArtAgent
//
//  ViewModel for the search interface
//

import SwiftUI
import PhotosUI

@MainActor
class SearchViewModel: ObservableObject {
    @Published var textQuery: String = ""
    @Published var selectedImage: UIImage?
    @Published var imagePreview: UIImage?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var searchResults: SearchResponse?
    
    private let apiClient = APIClient.shared
    private let imageService = ImageService.shared
    
    var canSearch: Bool {
        !textQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || selectedImage != nil
    }
    
    func selectImage(_ image: UIImage) {
        // Resize if too large (max 10MB)
        let resized = imageService.resizeImage(image, maxDimension: 1920)
        selectedImage = resized
        imagePreview = resized
        errorMessage = nil
    }
    
    func removeImage() {
        selectedImage = nil
        imagePreview = nil
    }
    
    func search() async {
        guard canSearch else {
            errorMessage = "Please enter a description or upload a room photo"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let response: SearchResponse
            
            if let image = selectedImage, !textQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                // Combined search
                guard let base64 = imageService.imageToBase64(image) else {
                    throw APIError.invalidResponse
                }
                response = try await apiClient.searchCombined(query: textQuery, imageBase64: base64)
            } else if let image = selectedImage {
                // Image-only search
                guard let base64 = imageService.imageToBase64(image) else {
                    throw APIError.invalidResponse
                }
                response = try await apiClient.searchImage(imageBase64: base64)
            } else {
                // Text-only search
                response = try await apiClient.searchText(query: textQuery)
            }
            
            searchResults = response
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}

