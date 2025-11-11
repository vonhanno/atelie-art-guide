# iOS Art Agent App - Development Prompt

## Overview
Build a native Swift/SwiftUI iOS app that replicates the functionality of the AI Art Agent web application. The app connects to an existing Fastify REST API server and provides an AI-powered art discovery and recommendation platform.

## API Connection
- **Base URL**: Configurable (default: `http://localhost:3001` for development)
- **API Endpoints**: See API documentation below
- **Authentication**: None required (public API)
- **Network Layer**: Use URLSession with async/await (iOS 15+)

## Core Features

### 1. Search Interface (Home Screen)
**Purpose**: Allow users to search for artworks using text descriptions and/or room photos.

**UI Components**:
- Hero section with app title: "Your Personal Art Agent"
- Subtitle: "Discover art from professional artists with the help of AI"
- Text input field (multiline) with placeholder: "e.g., Large abstract blue artwork for a bright office"
- Image upload section with:
  - Drag and drop area (or tap to select)
  - Camera button to capture room photo
  - Photo library picker
  - Image preview with remove button
  - Max file size: 10MB
- "Find Art" button (disabled until text or image is provided)
- Loading state with spinner and "Finding Art..." text
- Error message display

**Functionality**:
- Support three search modes:
  1. **Text-only**: POST to `/api/search/text` with `{ query: string }`
  2. **Image-only**: POST to `/api/search/image` with `{ imageBase64: string }` (convert image to base64)
  3. **Combined**: POST to `/api/search/combined` with `{ query: string, imageBase64: string }`
- Convert selected image to base64 (remove data URL prefix)
- Handle API errors gracefully
- Navigate to Results screen on success

**API Endpoints**:
- `POST /api/search/text` - Text search
- `POST /api/search/image` - Image search  
- `POST /api/search/combined` - Combined search

**Response Format**:
```json
{
  "success": true,
  "criteria": { /* roomAnalysis or textCriteria */ },
  "results": [ /* MatchResult[] */ ],
  "count": number
}
```

---

### 2. Results Screen
**Purpose**: Display matched artworks with filtering and sorting capabilities.

**UI Layout**:
- Header with:
  - Back button to return to search
  - Result count: "{count} Artwork(s) Found"
  - Sort dropdown (mobile: button that opens sheet)
- Split view (iPad) or stacked (iPhone):
  - **Filters Sidebar** (collapsible on mobile):
    - Price range slider (min: 0, max: from results)
    - Style checkboxes (multi-select)
    - Color checkboxes (multi-select)
    - Artist search text field
    - "Clear Filters" button
  - **Results Grid**:
    - Responsive grid (1 column mobile, 2 tablet, 3 iPad)
    - Artwork cards (see ArtworkCard component below)
    - Empty state: "No artworks match your filters" with "Start New Search" button

**Filtering Logic**:
- Filter by price range (min-max)
- Filter by style (check if artwork's analysis.styleAndGenre.style matches selected styles)
- Filter by color (check if artwork's analysis.basicVisualProperties.dominantColors includes selected colors)
- Filter by artist name (case-insensitive contains search)
- Apply all filters simultaneously (AND logic)

**Sorting Options**:
- Best Match (default) - by match score descending
- Price: Low to High - by artwork.price ascending
- Price: High to Low - by artwork.price descending
- Newest First - by artwork.year descending
- Random - shuffle results

**Data Structure**:
Each result is a `MatchResult`:
```swift
struct MatchResult: Codable {
    let artworkId: String
    let score: Double  // 0-100 match score
    let reasons: [String]  // Why it matches
    let confidence: String  // "high", "medium", "low"
    let artwork: AlgoliaArtwork
    let analysis: AIAnalysisData?
}
```

---

### 3. Artwork Card Component
**Purpose**: Display individual artwork in results grid.

**UI Elements**:
- **Image Section**:
  - Square aspect ratio
  - Artwork image (from `artwork.imageUrls[0]`)
  - Match score badge (top-right corner):
    - Green background for "high" confidence
    - Yellow background for "medium" confidence
    - Gray background for "low" confidence
    - Text: "{score}% match" (rounded)
- **Content Section**:
  - Title (truncated to 1 line)
  - Artist name (studioName)
  - Price: "{currency} {price}" (formatted with commas)
  - "Why it matches" section (if reasons exist):
    - Bullet list of match reasons
- **Action Buttons**:
  - "View in Room" button (navigates to Visualizer)
  - "View on Atelie" button (opens Safari to `https://atelie.art/artworks/{artworkId}`)

**Styling**:
- Card with shadow
- Hover/press effect
- Rounded corners
- Proper spacing and typography

---

### 4. Room Visualizer Screen
**Purpose**: Allow users to visualize how an artwork looks in their room photo.

**UI Layout**:
- Back button
- Two-column layout (iPad) or stacked (iPhone):
  - **Left Column**: Artwork Info Card
    - Artwork image (square)
    - Title
    - Artist name
    - Price
    - "View on Atelie.art" button
  - **Right Column**: Visualizer Canvas
    - Canvas showing room photo as background
    - Artwork image overlaid (draggable, resizable, rotatable)
    - Grid overlay (optional toggle)
    - Controls toolbar:
      - Rotate button (90° increments)
      - Zoom In button
      - Zoom Out button
      - Grid toggle checkbox
      - Lock Aspect Ratio checkbox
      - Opacity slider (0-100%)
      - Download button (save composite image to Photos)

**Functionality**:
- Load artwork from API: `GET /api/artworks/{artworkId}`
- Load room image from previous search (store in app state or UserDefaults)
- Canvas interactions:
  - Drag artwork to reposition
  - Pinch to resize (respect aspect ratio if locked)
  - Rotate gesture or button
  - Adjust opacity with slider
- Grid overlay: 10x10 grid lines
- Download: Combine room image + artwork into single image and save to Photos
- Use SwiftUI Canvas or UIKit for drawing

**API Endpoint**:
- `GET /api/artworks/{artworkId}` - Get artwork details

---

### 5. Artwork Detail Screen (Optional Enhancement)
**Purpose**: Show detailed information about an artwork including AI analysis.

**Features**:
- Large artwork image gallery (swipeable)
- Artwork metadata (title, artist, price, dimensions, etc.)
- AI Analysis sections (if analysis exists):
  - Basic Visual Properties
  - Texture Analysis
  - Style & Genre
  - Subject Matter
  - Medium & Technique
  - Composition
  - Space & Display Recommendations
  - Psychological Impact
  - Market Analysis
- "Request Analysis" button (if no analysis exists)
- "View in Room" button
- "View on Atelie" button

**API Endpoints**:
- `GET /api/artworks/{artworkId}` - Get artwork
- `GET /api/analysis/artwork/{artworkId}` - Get analysis
- `POST /api/analysis/enqueue` - Request analysis

---

## Technical Requirements

### Architecture
- **Pattern**: MVVM (Model-View-ViewModel) or similar
- **State Management**: SwiftUI `@State`, `@StateObject`, `@ObservedObject`
- **Networking**: URLSession with async/await
- **Image Loading**: AsyncImage or third-party library (e.g., SDWebImageSwiftUI)
- **JSON Parsing**: Codable protocol

### Project Structure
```
AtelieArtAgent/
├── App/
│   └── AtelieArtAgentApp.swift
├── Models/
│   ├── Artwork.swift
│   ├── Analysis.swift
│   ├── MatchResult.swift
│   └── APIResponse.swift
├── Services/
│   ├── APIClient.swift
│   └── ImageService.swift
├── ViewModels/
│   ├── SearchViewModel.swift
│   ├── ResultsViewModel.swift
│   └── VisualizerViewModel.swift
├── Views/
│   ├── SearchView.swift
│   ├── ResultsView.swift
│   ├── ArtworkCard.swift
│   ├── VisualizerView.swift
│   └── Components/
│       ├── FilterSidebar.swift
│       └── SortPicker.swift
└── Utils/
    ├── Config.swift
    └── Extensions.swift
```

### Dependencies
- **Minimum iOS Version**: iOS 16.0+
- **Swift Version**: Swift 5.9+
- **Optional Libraries**:
  - SDWebImageSwiftUI (for image caching)
  - SwiftUI Canvas helpers (if needed)

### Configuration
Create `Config.swift`:
```swift
struct Config {
    static var apiBaseURL: String {
        #if DEBUG
        return "http://localhost:3001"
        #else
        return "https://your-production-api.com"
        #endif
    }
}
```

### API Client Implementation
Create `APIClient.swift` with methods:
- `searchText(query: String) async throws -> SearchResponse`
- `searchImage(imageBase64: String) async throws -> SearchResponse`
- `searchCombined(query: String, imageBase64: String) async throws -> SearchResponse`
- `getArtwork(id: String) async throws -> Artwork`
- `getAnalysis(artworkId: String) async throws -> Analysis`

Handle errors:
- Network errors
- API errors (4xx, 5xx)
- JSON parsing errors
- Display user-friendly error messages

---

## Design Guidelines

### Color Scheme
- **Primary**: Yellow (#FFDA3E) - for buttons and highlights
- **Background**: System background (supports light/dark mode)
- **Text**: System colors (adapts to light/dark mode)
- **Confidence Badges**:
  - High: Green (#10B981)
  - Medium: Yellow (#F59E0B)
  - Low: Gray (#6B7280)

### Typography
- **Headings**: System font, bold, serif preferred for titles
- **Body**: System font, regular
- **Labels**: System font, medium weight

### Layout
- Use SwiftUI's adaptive layouts
- Support iPhone and iPad
- Responsive grid layouts
- Proper spacing (8pt grid system)
- Safe area insets

### User Experience
- Smooth animations and transitions
- Loading states for all async operations
- Error handling with retry options
- Pull-to-refresh where appropriate
- Infinite scroll or pagination for results
- Haptic feedback for interactions

---

## API Response Types

### MatchResult
```swift
struct MatchResult: Codable {
    let artworkId: String
    let score: Double
    let reasons: [String]
    let confidence: String  // "high" | "medium" | "low"
    let artwork: AlgoliaArtwork
    let analysis: AIAnalysisData?
}

struct AlgoliaArtwork: Codable {
    let objectID: String
    let title: String
    let studioName: String
    let price: Double
    let currency: String
    let imageUrls: [String]?
    let year: Int?
    // ... other fields
}

struct AIAnalysisData: Codable {
    let basicVisualProperties: BasicVisualProperties
    let textureAnalysis: TextureAnalysis
    let styleAndGenre: StyleAndGenre
    // ... other analysis sections
}
```

---

## Testing Considerations

### Unit Tests
- API client methods
- ViewModel logic
- Filtering and sorting logic
- Image conversion utilities

### UI Tests
- Search flow
- Results filtering
- Visualizer interactions
- Navigation flows

---

## Additional Features (Future Enhancements)

1. **Favorites**: Save favorite artworks
2. **Search History**: Remember recent searches
3. **Share**: Share artwork or visualizations
4. **AR Mode**: Use ARKit for room visualization
5. **Offline Mode**: Cache recent searches
6. **Push Notifications**: Notify when analysis completes
7. **User Account**: Sync favorites across devices

---

## Notes

- The app should work independently - no shared code with web apps
- All data comes from the REST API
- Handle network connectivity issues gracefully
- Optimize image loading and caching
- Follow iOS Human Interface Guidelines
- Ensure accessibility (VoiceOver support, Dynamic Type)
- Test on multiple device sizes (iPhone SE to iPad Pro)

---

## Getting Started

1. Create new Xcode project (iOS App, SwiftUI)
2. Set minimum deployment target to iOS 16.0
3. Create folder structure as outlined above
4. Implement API client first
5. Build models based on API responses
6. Create ViewModels for business logic
7. Build UI views incrementally
8. Test with real API endpoints
9. Polish UI/UX and add animations
10. Add error handling and edge cases

---

## API Base URL Configuration

For development, use: `http://localhost:3001`  
For production, update `Config.swift` with your deployed API URL.

**Important**: Update the API server's CORS configuration to allow your iOS app's origin if needed (though iOS apps typically don't have CORS restrictions like web browsers).

