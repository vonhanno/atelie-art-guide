# Git & Vercel Deployment Guide

## 🚀 Quick Setup

### 1. Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Atelie AI Art Agent Platform"

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/your-username/atelie-ai-art-agent.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2. Connect to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/admin`
   - **Build Command:** `cd ../.. && pnpm build --filter=@atelie/admin`
   - **Install Command:** `cd ../.. && pnpm install`
   - **Output Directory:** `.next`

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd apps/admin
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name: atelie-admin (or your choice)
# - Directory: ./
# - Override settings? No
```

### 3. Configure Environment Variables in Vercel

Go to **Project Settings** → **Environment Variables** and add:

**Required Variables:**
```bash
# Firebase
FIREBASE_PROJECT_ID=atelie-art-agent
FIREBASE_SERVICE_ACCOUNT=<your-service-account-json-string>

# Algolia
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_API_KEY=your_algolia_api_key
ALGOLIA_INDEX_NAME=artworks

# OpenAI
OPENAI_API_KEY=sk-...
AI_PROVIDER=openai

# API URL (your API deployment URL)
NEXT_PUBLIC_API_URL=https://your-api-url.com
API_URL=https://your-api-url.com

# NextAuth
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=generate-a-random-secret-key

# Redis (if using external Redis)
REDIS_URL=redis://your-redis-url
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Monorepo Configuration

Since this is a monorepo, Vercel needs to understand the structure:

**In Vercel Dashboard:**
- **Root Directory:** Leave empty (or set to `apps/admin` if deploying only admin)
- **Build Command:** `cd ../.. && pnpm build --filter=@atelie/admin`
- **Install Command:** `cd ../.. && pnpm install`
- **Output Directory:** `.next`

**Or use `vercel.json` in `apps/admin`:**
The `apps/admin/vercel.json` file is already configured for this.

### 5. Deploy API & Worker Separately

The API and Worker should be deployed separately:

**API (Fastify):**
- Deploy to Cloud Run, Railway, or Render
- See `PRODUCTION_DEPLOYMENT.md` for details

**Worker (BullMQ):**
- Deploy to Cloud Run, Railway, or Render
- Needs Redis connection
- See `PRODUCTION_DEPLOYMENT.md` for details

**Admin Dashboard (Next.js):**
- Deploy to Vercel (this guide)

## 📁 Project Structure for Vercel

```
atelie-ai-art-agent/
├── apps/
│   ├── admin/          ← Deploy this to Vercel
│   ├── api/           ← Deploy separately (Cloud Run, etc.)
│   └── worker/        ← Deploy separately (Cloud Run, etc.)
├── packages/
│   ├── db/
│   └── shared/
└── vercel.json        ← Root config (optional)
```

## 🔧 Vercel Configuration Files

### Root `vercel.json` (Optional)
Already created - handles monorepo builds

### `apps/admin/vercel.json` (Recommended)
Already created - specific admin app config

### `apps/admin/next.config.js`
Already configured with `transpilePackages` for monorepo

## 🚨 Important Notes

1. **Monorepo Build:** Vercel needs to build from root to resolve workspace dependencies
2. **Environment Variables:** Set all required vars in Vercel dashboard
3. **API URL:** Update `NEXT_PUBLIC_API_URL` to point to your deployed API
4. **Firebase Service Account:** Store as environment variable (JSON string)
5. **Secrets:** Never commit `.env` files or service account JSONs

## 🔄 Deployment Workflow

### First Deployment
```bash
# 1. Commit and push to GitHub
git add .
git commit -m "Setup for Vercel deployment"
git push

# 2. Connect to Vercel (via dashboard or CLI)
# 3. Configure environment variables
# 4. Deploy
```

### Subsequent Deployments
- **Automatic:** Push to `main` branch triggers deployment
- **Manual:** Use Vercel CLI: `vercel --prod`

## 📊 Monitoring

After deployment:
1. Check Vercel dashboard for build logs
2. Monitor function logs for errors
3. Test admin dashboard functionality
4. Verify API connections

## 🐛 Troubleshooting

### Build Fails: "Cannot find module"
- Ensure `transpilePackages` includes `@atelie/shared` in `next.config.js`
- Check that build command runs from root: `cd ../.. && pnpm build`

### Environment Variables Not Working
- Verify variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new variables

### API Connection Errors
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings in API server
- Ensure API is deployed and accessible

## 🔗 Useful Links

- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

