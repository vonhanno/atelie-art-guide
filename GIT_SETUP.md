# Git Setup Guide

## Quick Start

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `atelie-ai-art-agent`
3. **Don't** initialize with README, .gitignore, or license (we already have these)
4. Copy the repository URL

### 2. Connect Local Repository to GitHub

```bash
# Make sure you're in the project root
cd "/Users/vonhanno/ATELIE/AI ART AGENT "

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/atelie-ai-art-agent.git

# Verify remote
git remote -v
```

### 3. Create Initial Commit

```bash
# Check what will be committed
git status

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Atelie AI Art Agent Platform

- Monorepo setup with Turborepo + PNPM
- Admin dashboard (Next.js 15)
- API server (Fastify)
- Worker (BullMQ)
- Firebase Firestore integration
- AI artwork analysis pipeline"

# Push to GitHub
git branch -M main
git push -u origin main
```

### 4. Verify on GitHub

- Go to your GitHub repository
- Verify all files are uploaded
- Check that `.env` and service account files are **NOT** included (they're in `.gitignore`)

## 🔒 Important: Never Commit Secrets

The `.gitignore` file is configured to exclude:
- ✅ `.env` files
- ✅ Firebase service account JSONs (`*-firebase-adminsdk-*.json`)
- ✅ `node_modules/`
- ✅ Build artifacts
- ✅ Vercel config (`.vercel/`)

**Always verify before committing:**
```bash
git status
# Make sure no .env or service account files appear
```

## 📝 Common Git Commands

```bash
# Check status
git status

# Add specific files
git add <file>

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature/your-feature-name

# Switch branches
git checkout main

# View commit history
git log --oneline
```

## 🚀 Next Steps

After pushing to GitHub:
1. Connect to Vercel (see `DEPLOYMENT.md`)
2. Set up environment variables in Vercel
3. Deploy!

