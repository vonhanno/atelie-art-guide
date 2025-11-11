//
//  RoomVisualizerView.swift
//  AtelieArtAgent
//
//  Room visualizer for placing artwork in room photos
//

import SwiftUI

struct RoomVisualizerView: View {
    let artwork: AlgoliaArtwork
    let roomImage: UIImage?
    
    @State private var artworkPosition: CGPoint = CGPoint(x: 200, y: 100)
    @State private var artworkSize: CGSize = CGSize(width: 300, height: 400)
    @State private var artworkRotation: Double = 0
    @State private var opacity: Double = 1.0
    @State private var showGrid: Bool = false
    @State private var lockAspectRatio: Bool = true
    @State private var artworkImage: UIImage?
    
    var body: some View {
        VStack(spacing: 16) {
            // Controls
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    Button(action: rotateArtwork) {
                        Label("Rotate", systemImage: "rotate.right")
                            .font(.subheadline)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Color(.systemGray5))
                            .cornerRadius(8)
                    }
                    
                    Button(action: zoomIn) {
                        Label("Zoom In", systemImage: "plus.magnifyingglass")
                            .font(.subheadline)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Color(.systemGray5))
                            .cornerRadius(8)
                    }
                    
                    Button(action: zoomOut) {
                        Label("Zoom Out", systemImage: "minus.magnifyingglass")
                            .font(.subheadline)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Color(.systemGray5))
                            .cornerRadius(8)
                    }
                    
                    Toggle("Grid", isOn: $showGrid)
                        .toggleStyle(SwitchToggleStyle())
                    
                    Toggle("Lock Aspect", isOn: $lockAspectRatio)
                        .toggleStyle(SwitchToggleStyle())
                    
                    Button(action: saveImage) {
                        Label("Save", systemImage: "square.and.arrow.down")
                            .font(.subheadline)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Color.yellow)
                            .foregroundColor(.black)
                            .cornerRadius(8)
                    }
                }
                .padding()
            }
            
            // Opacity Slider
            VStack(alignment: .leading, spacing: 8) {
                Text("Opacity: \(Int(opacity * 100))%")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Slider(value: $opacity, in: 0...1)
            }
            .padding(.horizontal)
            
            // Canvas
            GeometryReader { geometry in
                ZStack {
                    // Room Background
                    if let roomImage = roomImage {
                        Image(uiImage: roomImage)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: geometry.size.width, height: geometry.size.height)
                            .clipped()
                    } else {
                        Color(.systemGray5)
                    }
                    
                    // Grid Overlay
                    if showGrid {
                        GridOverlay(size: geometry.size)
                    }
                    
                    // Artwork Overlay
                    if let artworkImage = artworkImage {
                        Image(uiImage: artworkImage)
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: artworkSize.width, height: artworkSize.height)
                            .rotationEffect(.degrees(artworkRotation))
                            .opacity(opacity)
                            .position(artworkPosition)
                            .gesture(
                                DragGesture()
                                    .onChanged { value in
                                        artworkPosition = value.location
                                    }
                            )
                            .gesture(
                                MagnificationGesture()
                                    .onChanged { value in
                                        let scale = value
                                        artworkSize = CGSize(
                                            width: artworkSize.width * scale,
                                            height: artworkSize.height * (lockAspectRatio ? scale : 1.0)
                                        )
                                    }
                            )
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color(.systemGray6))
                .cornerRadius(12)
            }
            .frame(height: 400)
            .padding(.horizontal)
        }
        .navigationTitle("View in Room")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadArtworkImage()
        }
    }
    
    private func loadArtworkImage() async {
        guard let urlString = artwork.imageUrls?.first,
              let url = URL(string: urlString) else {
            return
        }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            artworkImage = UIImage(data: data)
        } catch {
            print("Failed to load artwork image: \(error)")
        }
    }
    
    private func rotateArtwork() {
        artworkRotation = (artworkRotation + 90).truncatingRemainder(dividingBy: 360)
    }
    
    private func zoomIn() {
        artworkSize = CGSize(
            width: artworkSize.width * 1.1,
            height: artworkSize.height * 1.1
        )
    }
    
    private func zoomOut() {
        artworkSize = CGSize(
            width: artworkSize.width * 0.9,
            height: artworkSize.height * 0.9
        )
    }
    
    private func saveImage() {
        guard let roomImage = roomImage,
              let artworkImage = artworkImage else {
            return
        }
        
        let artworkFrame = CGRect(
            x: artworkPosition.x - artworkSize.width / 2,
            y: artworkPosition.y - artworkSize.height / 2,
            width: artworkSize.width,
            height: artworkSize.height
        )
        
        if let combined = ImageService.shared.combineImages(
            roomImage: roomImage,
            artworkImage: artworkImage,
            artworkFrame: artworkFrame,
            opacity: opacity
        ) {
            UIImageWriteToSavedPhotosAlbum(combined, nil, nil, nil)
        }
    }
}

struct GridOverlay: View {
    let size: CGSize
    
    var body: some View {
        Path { path in
            let gridSize: CGFloat = 10
            let stepX = size.width / gridSize
            let stepY = size.height / gridSize
            
            // Vertical lines
            for i in 0...Int(gridSize) {
                let x = CGFloat(i) * stepX
                path.move(to: CGPoint(x: x, y: 0))
                path.addLine(to: CGPoint(x: x, y: size.height))
            }
            
            // Horizontal lines
            for i in 0...Int(gridSize) {
                let y = CGFloat(i) * stepY
                path.move(to: CGPoint(x: 0, y: y))
                path.addLine(to: CGPoint(x: size.width, y: y))
            }
        }
        .stroke(Color.gray.opacity(0.5), lineWidth: 1)
    }
}

