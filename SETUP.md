# Setup Guide

## Prerequisites

- **Node.js** >= 18.0.0
- **PNPM** >= 8.0.0
- **Firebase Project** (Atelie Art Agent - Project ID: `atelie-art-agent`)
- **Redis** (running locally or remote)

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Algolia
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_API_KEY=your_algolia_api_key
ALGOLIA_INDEX_NAME=artworks

# AI Provider
OPENAI_API_KEY=sk-your-openai-key
AI_PROVIDER=openai

# Firebase
FIREBASE_PROJECT_ID=atelie-art-agent
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
# See FIREBASE_SETUP.md for detailed Firebase configuration

# Redis
REDIS_URL=redis://localhost:6379

# API
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001

# NextAuth (optional for now)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Worker
WORKER_CONCURRENCY=3
```

### 3. Set Up Firebase

See `FIREBASE_SETUP.md` for detailed Firebase configuration steps.

**Quick setup:**
1. Create a Firebase project: **Atelie Art Agent** (Project ID: `atelie-art-agent`)
2. Enable Firestore Database
3. Create a service account and download the JSON key
4. Add `FIREBASE_SERVICE_ACCOUNT` to your `.env` file (as JSON string)
5. Set `FIREBASE_PROJECT_ID=atelie-art-agent`

### 4. Start Development Servers

In separate terminals:

```bash
# Terminal 1: Start API server
cd apps/api
pnpm dev

# Terminal 2: Start Worker
cd apps/worker
pnpm dev

# Terminal 3: Start Admin Dashboard
cd apps/admin
pnpm dev
```

Or use the root command to start all:

```bash
pnpm dev
```

## Project Structure

```
├── apps/
│   ├── admin/      # Next.js 15 dashboard
│   ├── api/        # Fastify REST API
│   └── worker/     # BullMQ worker for AI analysis
├── packages/
│   ├── db/         # Prisma schema and client
│   └── shared/     # Shared types and schemas
```

## Usage

### Admin Dashboard

1. Open http://localhost:3000
2. Use the **Search & Select** tab to:
   - Search artworks from Algolia
   - Filter by artist, availability, technique
   - Select multiple artworks
   - Add them to the analysis queue

3. Use the **Batch Processing** tab to:
   - Monitor analysis progress
   - View statistics (pending, processing, done, failed)
   - Retry failed analyses
   - Filter by status

4. Use the **Analysis Preview** tab to:
   - View detailed AI analysis results
   - Export JSON data
   - Re-analyze artworks

### API Endpoints

- `GET /api/artworks/search` - Search artworks from Algolia
- `POST /api/analysis/enqueue` - Add artworks to analysis queue
- `GET /api/analysis/status` - Get analysis statistics
- `GET /api/analysis/:id` - Get single analysis result
- `GET /api/analysis/artwork/:artworkId` - Get analysis by artwork ID
- `POST /api/analysis/retry/:id` - Retry failed analysis
- `GET /api/analysis` - List all analyses (with filters)
- `GET /api/analysis/export` - Export all completed analyses as JSON

## Troubleshooting

### Firebase Connection Issues

- Ensure `FIREBASE_SERVICE_ACCOUNT` is valid JSON
- Check `FIREBASE_PROJECT_ID` matches your Firebase project
- Verify Firestore Database is enabled in Firebase Console
- See `FIREBASE_SETUP.md` for troubleshooting

### Redis Connection Issues

- Ensure Redis is running: `redis-cli ping`
- Check `REDIS_URL` is correct
- Default Redis port is 6379

### Worker Not Processing Jobs

- Check Redis connection
- Verify `OPENAI_API_KEY` is set
- Check worker logs for errors
- Ensure Algolia credentials are correct

### API CORS Issues

- Update CORS origin in `apps/api/src/index.ts`
- Ensure `NEXT_PUBLIC_API_URL` matches your API server URL

## Production Deployment

1. Build all apps: `pnpm build`
2. Set production environment variables (use Application Default Credentials for Firebase)
3. Ensure Firestore is configured in Firebase Console
4. Start services:
   - API: `cd apps/api && pnpm start`
   - Worker: `cd apps/worker && pnpm start`
   - Admin: `cd apps/admin && pnpm start`

## Next Steps

Once Phase 1 is complete, you can proceed to Phase 2: "AI Art Agent & Recommendation Platform" which will use this analyzed data to match art with rooms and users.

