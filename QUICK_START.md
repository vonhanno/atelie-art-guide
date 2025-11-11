# 🚀 Quick Start: Git & Vercel Setup

## Step 1: Git Repository Setup

```bash
# 1. Create a new repository on GitHub (don't initialize with files)
#    https://github.com/new
#    Name: atelie-ai-art-agent

# 2. Connect local repo to GitHub
git remote add origin https://github.com/YOUR_USERNAME/atelie-ai-art-agent.git

# 3. Create initial commit
git commit -m "Initial commit: Atelie AI Art Agent Platform"

# 4. Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Vercel Deployment

### Via Dashboard (Easiest)

1. **Go to Vercel:** https://vercel.com/dashboard
2. **Click:** "Add New Project"
3. **Import:** Your GitHub repository
4. **Configure:**
   - Framework: **Next.js**
   - Root Directory: **`apps/admin`**
   - Build Command: **`cd ../.. && pnpm build --filter=@atelie/admin`**
   - Install Command: **`cd ../.. && pnpm install`**
   - Output Directory: **`.next`**

5. **Add Environment Variables:**
   ```
   FIREBASE_PROJECT_ID=atelie-art-agent
   FIREBASE_SERVICE_ACCOUNT=<your-json-string>
   ALGOLIA_APP_ID=<your-app-id>
   ALGOLIA_API_KEY=<your-api-key>
   ALGOLIA_INDEX_NAME=artworks
   OPENAI_API_KEY=sk-...
   AI_PROVIDER=openai
   NEXT_PUBLIC_API_URL=https://your-api-url.com
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   REDIS_URL=redis://your-redis-url
   ```

6. **Deploy!**

### Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from admin directory
cd apps/admin
vercel

# Follow prompts, then:
vercel --prod
```

## Step 3: Verify Deployment

1. Check Vercel dashboard for build status
2. Visit your deployed URL
3. Test admin dashboard functionality

## 📚 Full Documentation

- **Git Setup:** See `GIT_SETUP.md`
- **Vercel Deployment:** See `DEPLOYMENT.md`
- **Firebase Setup:** See `FIREBASE_SETUP.md`
- **Production:** See `PRODUCTION_DEPLOYMENT.md`

## ✅ Checklist

- [ ] Git repository created on GitHub
- [ ] Local repo connected and pushed
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] First deployment successful
- [ ] Admin dashboard accessible
- [ ] API connection working

## 🆘 Troubleshooting

**Build fails?**
- Check build logs in Vercel
- Verify monorepo build commands
- Ensure all dependencies are in `package.json`

**Environment variables not working?**
- Verify variable names match exactly
- Check for typos
- Redeploy after adding variables

**API connection errors?**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on API server
- Ensure API is deployed and accessible

