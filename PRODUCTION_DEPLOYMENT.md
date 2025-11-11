# Production Deployment Guide

## Quick Start for Production

This guide covers deploying the Atelie Art Agent platform to production.

## Prerequisites

- ✅ Firebase project created: **Atelie Art Agent** (ID: `atelie-art-agent`)
- ✅ Firestore Database enabled in Production mode
- ✅ Service account created with proper permissions
- ✅ All environment variables configured

## Deployment Steps

### 1. Firebase Setup (One-time)

Follow `FIREBASE_SETUP.md` to:
- Create Firestore database
- Deploy security rules
- Set up service account

### 2. Environment Variables

**For Google Cloud Run / App Engine:**
```bash
FIREBASE_PROJECT_ID=atelie-art-agent
# ADC (Application Default Credentials) used automatically
```

**For Other Platforms:**
```bash
FIREBASE_PROJECT_ID=atelie-art-agent
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
# Store in Secret Manager / Environment Secrets
```

**Required for all platforms:**
```bash
# Algolia
ALGOLIA_APP_ID=your_app_id
ALGOLIA_API_KEY=your_api_key
ALGOLIA_INDEX_NAME=artworks

# OpenAI
OPENAI_API_KEY=sk-...
AI_PROVIDER=openai

# Redis
REDIS_URL=redis://your-redis-url

# API
API_PORT=3001
WORKER_CONCURRENCY=3

# Next.js Admin
NEXTAUTH_URL=https://your-admin-domain.com
NEXTAUTH_SECRET=your-secret-key
```

### 3. Build for Production

```bash
# Install dependencies
pnpm install

# Build all apps
pnpm build
```

### 4. Deploy Services

#### Option A: Google Cloud Run (Recommended)

**API Service:**
```bash
cd apps/api
gcloud run deploy atelie-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars FIREBASE_PROJECT_ID=atelie-art-agent,API_PORT=8080
```

**Worker Service:**
```bash
cd apps/worker
gcloud run deploy atelie-worker \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars FIREBASE_PROJECT_ID=atelie-art-agent,WORKER_CONCURRENCY=3
```

**Admin Dashboard:**
```bash
cd apps/admin
# Deploy to Vercel or Cloud Run
```

#### Option B: Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  api:
    build: ./apps/api
    ports:
      - "3001:3001"
    environment:
      - FIREBASE_PROJECT_ID=atelie-art-agent
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  worker:
    build: ./apps/worker
    environment:
      - FIREBASE_PROJECT_ID=atelie-art-agent
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### 5. Verify Deployment

1. **Check API Health:**
   ```bash
   curl https://your-api-url/api/analysis/status
   ```

2. **Check Firestore Connection:**
   - Monitor Firebase Console → Firestore → Usage
   - Check application logs for Firebase initialization

3. **Test Admin Dashboard:**
   - Visit admin URL
   - Try searching artworks
   - Enqueue an analysis job

## Monitoring & Maintenance

### Firestore Monitoring

- Monitor read/write operations in Firebase Console
- Set up billing alerts
- Review security rules regularly

### Application Monitoring

- Monitor API response times
- Track worker job processing
- Set up error alerts

### Scaling

- **API:** Scale based on request volume
- **Worker:** Scale based on queue depth
- **Redis:** Ensure adequate memory for queue

## Security Checklist

- ✅ Firestore rules deny client access
- ✅ Service account credentials secured
- ✅ Environment variables in Secret Manager
- ✅ API endpoints protected (add auth if needed)
- ✅ Admin dashboard protected with NextAuth
- ✅ Redis secured (password/auth if exposed)

## Troubleshooting

### Firebase Connection Issues

```bash
# Check service account permissions
gcloud projects get-iam-policy atelie-art-agent

# Verify Firestore is enabled
gcloud firestore databases list
```

### Worker Not Processing Jobs

- Check Redis connection
- Verify worker logs
- Check queue status in Redis

### API Errors

- Check Firebase initialization logs
- Verify environment variables
- Check Firestore indexes

## Next Steps

After deployment:
1. Set up monitoring and alerts
2. Configure backup strategy for Firestore
3. Set up CI/CD pipeline
4. Document API endpoints for team
5. Set up staging environment

