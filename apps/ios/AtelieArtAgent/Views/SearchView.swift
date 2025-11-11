//
//  SearchView.swift
//  AtelieArtAgent
//
//  Main search interface screen
//

import SwiftUI
import PhotosUI

struct SearchView: View {
    @StateObject private var viewModel = SearchViewModel()
    @State private var showImagePicker = false
    @State private var showCamera = false
    @State private var selectedItem: PhotosPickerItem?
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Hero Section
                VStack(spacing: 12) {
                    Text("Your Personal Art Agent")
                        .font(.system(size: 44, weight: .bold, design: .serif))
                        .multilineTextAlignment(.center)
                    
                    Text("Discover art from professional artists with the help of AI")
                        .font(.title3)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)
                
                // Search Card
                VStack(spacing: 20) {
                    // Text Input
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Describe what you're looking for")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        
                        TextEditor(text: $viewModel.textQuery)
                            .frame(minHeight: 100)
                            .padding(8)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color(.systemGray4), lineWidth: 1)
                            )
                            .disabled(viewModel.isLoading)
                    }
                    
                    // Image Upload
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Upload a room photo (optional)")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        
                        if let image = viewModel.imagePreview {
                            ZStack(alignment: .topTrailing) {
                                Image(uiImage: image)
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .frame(height: 200)
                                    .clipped()
                                    .cornerRadius(12)
                                
                                Button(action: { viewModel.removeImage() }) {
                                    Image(systemName: "xmark.circle.fill")
                                        .foregroundColor(.white)
                                        .background(Color.black.opacity(0.6))
                                        .clipShape(Circle())
                                }
                                .padding(8)
                            }
                        } else {
                            VStack(spacing: 16) {
                                Image(systemName: "photo.badge.plus")
                                    .font(.system(size: 48))
                                    .foregroundColor(.secondary)
                                
                                Text("Drag and drop an image here, or tap to browse")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.center)
                                
                                HStack(spacing: 12) {
                                    PhotosPicker(selection: $selectedItem, matching: .images) {
                                        Label("Upload", systemImage: "photo")
                                            .font(.subheadline)
                                            .padding(.horizontal, 16)
                                            .padding(.vertical, 8)
                                            .background(Color(.systemGray5))
                                            .cornerRadius(8)
                                    }
                                    
                                    Button(action: { showCamera = true }) {
                                        Label("Camera", systemImage: "camera")
                                            .font(.subheadline)
                                            .padding(.horizontal, 16)
                                            .padding(.vertical, 8)
                                            .background(Color(.systemGray5))
                                            .cornerRadius(8)
                                    }
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 200)
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .strokeBorder(style: StrokeStyle(lineWidth: 2, dash: [5]))
                                    .foregroundColor(.secondary)
                            )
                        }
                    }
                    
                    // Error Message
                    if let error = viewModel.errorMessage {
                        Text(error)
                            .font(.subheadline)
                            .foregroundColor(.red)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(8)
                    }
                    
                    // Search Button
                    Button(action: {
                        Task {
                            await viewModel.search()
                            if viewModel.searchResults != nil {
                                // Navigation will be handled by parent
                            }
                        }
                    }) {
                        HStack {
                            if viewModel.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text("Find Art")
                                    .fontWeight(.semibold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(viewModel.canSearch && !viewModel.isLoading ? Color.yellow : Color.gray)
                        .foregroundColor(.black)
                        .cornerRadius(12)
                    }
                    .disabled(!viewModel.canSearch || viewModel.isLoading)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(16)
                .shadow(radius: 4)
            }
            .padding()
        }
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showCamera) {
            ImagePicker(image: Binding(
                get: { viewModel.selectedImage },
                set: { if let img = $0 { viewModel.selectImage(img) } }
            ))
        }
        .onChange(of: selectedItem) { newItem in
            Task {
                if let data = try? await newItem?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    viewModel.selectImage(image)
                }
            }
        }
        .navigationDestination(isPresented: Binding(
            get: { viewModel.searchResults != nil },
            set: { if !$0 { viewModel.searchResults = nil } }
        )) {
            if let response = viewModel.searchResults {
                ResultsView(searchResponse: response, roomImage: viewModel.imagePreview)
            }
        }
    }
}

// Image Picker for Camera
struct ImagePicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.presentationMode) var presentationMode
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = context.coordinator
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePicker
        
        init(_ parent: ImagePicker) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.image = image
            }
            parent.presentationMode.wrappedValue.dismiss()
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.presentationMode.wrappedValue.dismiss()
        }
    }
}

