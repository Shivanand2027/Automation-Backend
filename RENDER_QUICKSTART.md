# Quick Start - Deploy to Render in 10 Minutes

## ⚡ Fastest Way to Deploy

### Prerequisites (2 minutes)
1. ✅ Render account - https://render.com (free, use GitHub login)
2. ✅ MongoDB Atlas - https://mongodb.com/cloud/atlas (free M0 cluster)
3. ✅ Code pushed to GitHub

### Step 1: Push to GitHub (1 minute)
```bash
cd "c:\Users\shiva\OneDrive\Desktop\GitHub Automation"
git add .
git commit -m "Add Render configuration"
git push origin main
```

### Step 2: Deploy with Blueprint (2 minutes)
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render detects `render.yaml` automatically
5. Click **"Apply"**

### Step 3: Set Environment Variables (5 minutes)

**Backend Service** (github-automation-backend):
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
GITHUB_TOKEN=ghp_your_token
GEMINI_API_KEY=your_key
FRONTEND_URL=https://github-automation-frontend.onrender.com
```

**Frontend Service** (github-automation-frontend):
```
NEXT_PUBLIC_API_URL=https://github-automation-backend.onrender.com
```

### Step 4: Verify (1 minute)
- Check logs for both services
- Visit your frontend URL
- Done! 🎉

## Need Help?

See detailed guide: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

## Getting API Keys

**GitHub Token**: GitHub → Settings → Developer settings → Personal access tokens → Generate (select: repo, workflow, read:user)

**Gemini Key**: https://makersuite.google.com/app/apikey

**MongoDB**: https://cloud.mongodb.com → Create cluster → Connect → Get connection string
