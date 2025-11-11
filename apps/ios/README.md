# Atelie Art Agent iOS App

Native Swift/SwiftUI iOS application for the AI Art Agent platform. This app connects to the Fastify REST API to provide AI-powered art discovery and recommendation features.

## Features

- **Search Interface**: Search for artworks using text descriptions and/or room photos
- **AI-Powered Matching**: Get personalized artwork recommendations based on room analysis or text queries
- **Results View**: Browse matched artworks with filtering and sorting capabilities
- **Room Visualizer**: Visualize how artworks look in your room photos
- **Artwork Details**: View detailed information and AI analysis of artworks
- **Analysis Request**: Request AI analysis for artworks that haven't been analyzed yet

## Requirements

- **iOS**: 16.0+
- **Xcode**: 14.0+
- **Swift**: 5.9+
- **API Server**: The Fastify API server must be running (see main project README)

## Setup Instructions

### 1. Create Xcode Project

Since this is a source-only repository, you'll need to create an Xcode project:

1. Open Xcode
2. Create a new project:
   - Choose **iOS** → **App**
   - Product Name: `AtelieArtAgent`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Minimum Deployment: **iOS 16.0**
3. Save the project in the `apps/ios/` directory

### 2. Add Source Files

Add all the Swift files from this directory to your Xcode project:

```
AtelieArtAgent/
├── AtelieArtAgentApp.swift
├── Models/
│   ├── Artwork.swift
│   ├── Analysis.swift
│   └── Search.swift
├── Services/
│   ├── APIClient.swift
│   └── ImageService.swift
├── ViewModels/
│   ├── SearchViewModel.swift
│   └── ResultsViewModel.swift
├── Views/
│   ├── SearchView.swift
│   ├── ResultsView.swift
│   ├── ArtworkCard.swift
│   ├── ArtworkDetailView.swift
│   └── RoomVisualizerView.swift
└── Utils/
    └── Config.swift
```

**Important**: Make sure to:
- Add files to the correct target
- Organize files into groups matching the folder structure
- Ensure all files are included in the build

### 3. Configure API Base URL

Update `Config.swift` with your API server URL:

```swift
struct Config {
    static var apiBaseURL: String {
        #if DEBUG
        return "http://localhost:3001"  // Local development
        #else
        return "https://your-production-api.com"  // Production
        #endif
    }
}
```

**Note**: For iOS Simulator, `localhost` works fine. For physical devices, you'll need to use your computer's local IP address (e.g., `http://192.168.1.100:3001`).

### 4. Configure Info.plist

Add the following to your `Info.plist` to allow HTTP connections and camera access:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to capture room photos for artwork visualization.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library to select room photos for artwork visualization.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>We need permission to save artwork visualizations to your photo library.</string>
```

### 5. Start API Server

Make sure the Fastify API server is running:

```bash
cd apps/api
pnpm dev
```

The API should be running on `http://localhost:3001` (or your configured port).

### 6. Build and Run

1. Select your target device or simulator
2. Build and run the project (⌘R)
3. The app should launch and connect to your API server

## Project Structure

```
AtelieArtAgent/
├── App/
│   └── AtelieArtAgentApp.swift          # App entry point
├── Models/                               # Data models
│   ├── Artwork.swift                    # Algolia artwork models
│   ├── Analysis.swift                   # AI analysis models
│   └── Search.swift                     # Search and match models
├── Services/                             # Business logic
│   ├── APIClient.swift                  # HTTP client for API
│   └── ImageService.swift               # Image manipulation utilities
├── ViewModels/                           # View models (MVVM)
│   ├── SearchViewModel.swift            # Search screen logic
│   └── ResultsViewModel.swift          # Results screen logic
├── Views/                                # SwiftUI views
│   ├── SearchView.swift                 # Main search interface
│   ├── ResultsView.swift                # Results grid with filters
│   ├── ArtworkCard.swift                # Artwork card component
│   ├── ArtworkDetailView.swift          # Artwork detail screen
│   └── RoomVisualizerView.swift         # Room visualization
└── Utils/                                # Utilities
    └── Config.swift                     # Configuration
```

## API Endpoints Used

The app uses the following API endpoints:

- `GET /api/artworks/search` - Search artworks from Algolia
- `GET /api/artworks/:id` - Get single artwork
- `POST /api/search/text` - Text-based artwork search
- `POST /api/search/image` - Image-based artwork search
- `POST /api/search/combined` - Combined text and image search
- `GET /api/analysis/artwork/:artworkId` - Get analysis by artwork ID
- `POST /api/analysis/enqueue` - Request analysis for artworks

## Architecture

The app follows the **MVVM (Model-View-ViewModel)** pattern:

- **Models**: Swift structs conforming to `Codable` for API responses
- **Views**: SwiftUI views that display UI
- **ViewModels**: Observable objects that handle business logic and state
- **Services**: Reusable services like `APIClient` and `ImageService`

## Key Features Implementation

### Search Interface
- Text input for describing desired artwork
- Photo picker for room photos
- Camera capture support
- Image preview with remove option
- Base64 encoding for image uploads

### Results Screen
- Grid layout with artwork cards
- Filtering by price, style, color, artist
- Sorting by match score, price, year, random
- Collapsible filter sidebar (mobile)
- Match score badges with confidence colors

### Room Visualizer
- Overlay artwork on room photo
- Drag to reposition
- Pinch to resize
- Rotate functionality
- Opacity adjustment
- Grid overlay option
- Save composite image to Photos

### Artwork Details
- Large artwork image
- Artwork metadata
- AI analysis sections (expandable)
- Request analysis button
- View in room button
- Link to Atelie.art website

## Troubleshooting

### API Connection Issues

1. **Cannot connect to API**:
   - Verify API server is running: `curl http://localhost:3001/api/analysis/status`
   - For physical devices, use your computer's IP address instead of `localhost`
   - Check firewall settings

2. **CORS Errors**:
   - iOS apps don't have CORS restrictions, but ensure API CORS is configured (already done in `apps/api/src/index.ts`)

3. **Image Upload Fails**:
   - Check image size (max 10MB)
   - Verify base64 encoding is working
   - Check API logs for errors

### Build Issues

1. **Missing Files**:
   - Ensure all Swift files are added to the Xcode project target
   - Check file membership in Xcode

2. **Compilation Errors**:
   - Verify iOS deployment target is 16.0+
   - Check Swift version compatibility
   - Clean build folder (⌘⇧K) and rebuild

### Runtime Issues

1. **Camera/Photo Library Access Denied**:
   - Check Info.plist permissions
   - Grant permissions in Settings app

2. **Images Not Loading**:
   - Verify image URLs are valid
   - Check network connectivity
   - Review API response format

## Development Notes

- The app uses async/await for all network calls (iOS 15+)
- Image loading uses SwiftUI's `AsyncImage` (iOS 15+)
- All API errors are handled and displayed to users
- The app supports both light and dark mode
- Responsive design works on iPhone and iPad

## Future Enhancements

- [ ] AR mode using ARKit for room visualization
- [ ] Favorites/saved artworks
- [ ] Search history
- [ ] Share functionality
- [ ] Push notifications for analysis completion
- [ ] Offline mode with cached data
- [ ] User accounts and sync

## License

Same license as the main project.

