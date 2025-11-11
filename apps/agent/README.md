# AI Art Agent - Public-Facing Web App

Your Personal Art Agent is a production-ready AI-powered art recommendation web application that helps users discover artwork from Atelie.art using AI.

## Features

- **Text Search**: Natural language descriptions to find matching artworks
- **Image Search**: Upload room photos for AI-powered room analysis
- **Combined Search**: Combine text and image inputs for better results
- **Smart Matching**: Uses AI-generated metadata from Project 1 to score and rank artworks
- **Interactive Visualizer**: "View in Room" feature to visualize artworks in your space
- **Advanced Filters**: Filter by price, style, color, artist, and more
- **Responsive Design**: Works perfectly on mobile and desktop

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Canvas**: React Konva for room visualizer
- **API**: Fastify backend (shared with admin app)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database (shared with Project 1)
- OpenAI API key
- Algolia account with artworks index

### Installation

1. Install dependencies from the root:
```bash
pnpm install
```

2. Set up environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
OPENAI_API_KEY=sk-...
DATABASE_URL=postgres://...
ALGOLIA_APP_ID=...
ALGOLIA_API_KEY=...
ALGOLIA_INDEX_NAME=artworks
```

3. Start the development server:
```bash
pnpm dev
```

The agent app will be available at `http://localhost:3002`

## Project Structure

```
apps/agent/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── page.tsx      # Home page with search
│   │   ├── results/      # Results/gallery page
│   │   └── visualizer/   # View in Room visualizer
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── SearchInterface.tsx
│   │   ├── ArtworkCard.tsx
│   │   └── RoomVisualizer.tsx
│   └── lib/             # Utilities
└── package.json
```

## API Endpoints

The app uses the following API endpoints (from `apps/api`):

- `POST /api/search/text` - Text-based search
- `POST /api/search/image` - Image-based search
- `POST /api/search/combined` - Combined search
- `GET /api/artworks/:id` - Get single artwork

## Usage

1. **Text Search**: Enter a natural language description like "Large abstract blue artwork for a bright office"
2. **Image Search**: Upload a room photo to analyze the space
3. **Combined**: Use both text and image for more accurate results
4. **View Results**: Browse filtered and sorted results with match scores
5. **Visualize**: Click "View in Room" to see how artwork looks in your space

## Matching Algorithm

The matching engine uses a weighted scoring system:

- Style compatibility: 25%
- Color harmony: 30%
- Mood alignment: 20%
- Size appropriateness: 15%
- Psychological impact: 10%

Each artwork receives a score (0-100) with match reasons.

## Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

See `.env.example` for required environment variables.

## License

Private - Atelie.art

