# Atelie AI Art Agent - Phase 1: Artwork Analysis Platform

Production-ready AI Artwork Analysis Platform for Atelie.art that analyzes artworks from Algolia using AI to generate detailed metadata.

## 🏗️ Monorepo Structure

```
├── apps/
│   ├── admin/      # Next.js 15 dashboard (search + selection + progress monitor)
│   ├── worker/     # Background queue for AI analysis
│   └── api/        # Fastify API (serves jobs, results, config)
├── packages/
│   ├── db/         # Firebase Firestore database client
│   └── shared/     # Zod schemas + utils + API types
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PNPM >= 8
- Firebase Project (Atelie Art Agent)
- Redis

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials (see FIREBASE_SETUP.md for Firebase config)

# Start all services in development
pnpm dev
```

### Development

- **Admin Dashboard**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Worker**: Runs automatically, processes jobs from Redis queue

## 📦 Packages

### `packages/db`
Firebase Firestore database client and operations. See `FIREBASE_SETUP.md` for setup instructions.

### `packages/shared`
Shared Zod schemas, TypeScript types, and utilities used across apps.

### `apps/admin`
Next.js 15 dashboard for searching artworks, selecting them for analysis, and monitoring batch processing.

### `apps/api`
Fastify REST API for artwork search, analysis queue management, and results retrieval.

### `apps/worker`
Background worker that processes AI analysis jobs using BullMQ.

## 🔧 Environment Variables

See `.env.example` for all required environment variables.

## 📝 Features

- ✅ Algolia artwork search and selection
- ✅ Batch AI analysis pipeline with progress tracking
- ✅ Retry mechanism for failed analyses
- ✅ Real-time status updates
- ✅ Export AI metadata as JSON
- ✅ Admin authentication

## 🎯 Next Steps

Phase 2 will build the "AI Art Agent & Recommendation Platform" using this analyzed data to match art with rooms and users.

