# Render Deployment Guide

## Why Render?

Render is perfect for this project because:
- ✅ **Persistent processes** - Your automation scheduler will work perfectly
- ✅ **Free tier available** - Host both frontend and backend for free
- ✅ **Easy MongoDB integration** - Works great with MongoDB Atlas
- ✅ **Auto-deploy from GitHub** - Push code, automatic deployment
- ✅ **HTTPS by default** - Free SSL certificates
- ✅ **No cold starts** - Unlike serverless, your app stays warm

## Prerequisites

1. **Render Account**: Sign up at https://render.com (free)
2. **MongoDB Atlas**: Free cluster at https://mongodb.com/cloud/atlas
3. **GitHub**: Your code pushed to GitHub repository
4. **API Keys**: GitHub token, Gemini API key

## Quick Deployment (Recommended)

### Option 1: Deploy via render.yaml (Easiest)

1. **Push to GitHub**:
```bash
cd "c:\Users\shiva\OneDrive\Desktop\GitHub Automation"
git add .
git commit -m "Add Render configuration"
git push origin main
```

2. **Deploy on Render**:
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml` and create both services
   - Click "Apply" to deploy

3. **Set Environment Variables**:
   After deployment, go to each service and add:
   
   **Backend Service**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: (auto-generated or set your own)
   - `GITHUB_TOKEN`: Your GitHub personal access token
   - `GEMINI_API_KEY`: Your Gemini API key
   - `FRONTEND_URL`: Your frontend Render URL (e.g., `https://github-automation-frontend.onrender.com`)

   **Frontend Service**:
   - `NEXT_PUBLIC_API_URL`: Your backend Render URL (e.g., `https://github-automation-backend.onrender.com`)

4. **Redeploy** both services after setting environment variables

---

### Option 2: Manual Deployment (Step by Step)

## Step 1: Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0 tier)
3. Create database user:
   - Database Access → Add New User
   - Username: `admin`, Password: (secure password)
4. Whitelist all IPs:
   - Network Access → Add IP Address
   - Enter: `0.0.0.0/0` (allows Render to connect)
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

## Step 2: Deploy Backend

1. **Go to Render Dashboard**:
   - https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**:
   - Select "Build and deploy from a Git repository"
   - Connect your GitHub account
   - Select your repository

3. **Configure Backend**:
   ```
   Name: github-automation-backend
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free
   ```

4. **Advanced Settings → Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://admin:password@cluster.mongodb.net/github-automation
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   GITHUB_TOKEN=ghp_your_github_token
   GEMINI_API_KEY=your_gemini_api_key
   FRONTEND_URL=https://github-automation-frontend.onrender.com
   ```

5. **Create Web Service** and wait for deployment (5-10 minutes)

6. **Note your backend URL**: `https://github-automation-backend.onrender.com`

## Step 3: Deploy Frontend

1. **New Web Service**:
   - Click "New +" → "Web Service"
   - Select same repository

2. **Configure Frontend**:
   ```
   Name: github-automation-frontend
   Region: Same as backend
   Branch: main
   Root Directory: frontend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free
   ```

3. **Environment Variables**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://github-automation-backend.onrender.com
   ```

4. **Create Web Service**

5. **Update Backend FRONTEND_URL**:
   - Go back to backend service
   - Settings → Environment Variables
   - Update `FRONTEND_URL` with your actual frontend URL
   - Click "Save Changes" (triggers redeploy)

## Step 4: Verify Deployment

1. **Check Backend Health**:
   ```
   curl https://your-backend.onrender.com/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Check Frontend**:
   Visit: `https://your-frontend.onrender.com`

3. **Check Logs**:
   - Go to each service dashboard
   - Click "Logs" tab
   - Verify no errors
   - Should see "MongoDB connected successfully"
   - Should see "Enhanced automation scheduler initialized"

## Environment Variables Reference

### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Server
NODE_ENV=production
PORT=10000

# Authentication
JWT_SECRET=minimum-32-character-secret-key-for-jwt

# GitHub Integration
GITHUB_TOKEN=ghp_yourgithubtokenhere

# AI Service
GEMINI_API_KEY=your-gemini-api-key-here

# CORS
FRONTEND_URL=https://your-frontend.onrender.com
```

### Frontend (.env)
```bash
# API Connection
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

## Getting API Keys

### GitHub Personal Access Token
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Select scopes:
   - ✅ `repo` (Full control of repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `read:user` (Read user profile)
5. Copy token (starts with `ghp_`)

### Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Copy key

## Auto-Deploy from GitHub

Render automatically deploys on Git push:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Render automatically detects and deploys!
```

## Free Tier Limits

### Render Free Tier:
- 750 hours/month (enough for one service 24/7)
- Services spin down after 15 minutes of inactivity
- Cold start: ~30 seconds to wake up
- 512 MB RAM
- Shared CPU

### Tips for Free Tier:
- Keep backend running continuously (scheduler needs it)
- Frontend can spin down (Next.js handles this well)
- Use cron-job.org to ping your backend every 14 minutes to keep it awake

## Keeping Your Backend Alive (Free Tier)

Since free tier services sleep after 15 minutes of inactivity:

**Option 1: External Ping Service**
1. Go to https://cron-job.org (free)
2. Create account
3. Create new cron job:
   - URL: `https://your-backend.onrender.com/health`
   - Interval: Every 14 minutes
   - This keeps backend awake 24/7

**Option 2: Upgrade to Paid Plan**
- $7/month per service
- No sleep, always running
- Better for production

## Troubleshooting

### Build Fails

**Error**: "Cannot find module"
```bash
# Solution: Check package.json dependencies
cd backend  # or frontend
npm install
npm run build  # Test locally first
```

**Error**: TypeScript compilation errors
```bash
# Solution: Fix TypeScript errors locally
npm run build
# Fix all errors, then push to GitHub
```

### Database Connection Failed

**Error**: "MongoServerError: Authentication failed"
- Check MongoDB Atlas username/password
- Ensure password has no special characters (or URL encode them)
- Verify connection string format

**Error**: "Network timeout"
- Go to MongoDB Atlas → Network Access
- Add IP: `0.0.0.0/0` to allow all connections
- Wait 2-3 minutes for changes to propagate

### Service Won't Start

**Check Logs**:
1. Go to service in Render dashboard
2. Click "Logs" tab
3. Look for error messages

**Common Issues**:
- Missing environment variables
- Wrong `Start Command`
- Port conflicts (use `PORT` env var)

### CORS Errors

**Error**: "CORS policy blocked"
- Verify `FRONTEND_URL` in backend matches your frontend URL exactly
- Include protocol: `https://`
- No trailing slash
- Redeploy backend after changing

### Scheduler Not Working

**Check Logs** for:
```
Enhanced automation scheduler initialized
Found X repositories with automation enabled
Successfully scheduled repo-name
```

If not appearing:
- Verify MongoDB connection
- Check if repositories have `automationEnabled: true`
- Ensure scheduler initialization code runs

## Monitoring

### View Logs
```bash
# In Render Dashboard:
# 1. Select service
# 2. Click "Logs" tab
# 3. View real-time logs
```

### Set Up Alerts
1. Service Settings → Notifications
2. Add email for deployment failures
3. Add webhook for Slack/Discord

### Monitor Performance
- Dashboard shows CPU/Memory usage
- Check response times in logs
- Monitor MongoDB Atlas metrics

## Custom Domain (Optional)

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Render:
   - Service → Settings → Custom Domains
   - Add your domain
3. Update DNS records:
   - Add CNAME record pointing to Render URL
4. SSL certificate auto-generated

## Cost Optimization

### Free Tier Strategy:
- Backend: Always on (use ping service)
- Frontend: Can sleep (fast cold starts)
- MongoDB Atlas: M0 free tier (512 MB)
- **Total cost**: $0/month

### Production Strategy:
- Backend: Starter ($7/month) - always on
- Frontend: Starter ($7/month) - always on
- MongoDB Atlas: M10 ($0.08/hour ≈ $57/month)
- **Total cost**: ~$71/month

### Recommended for You:
Start with free tier, use cron-job.org ping service. Upgrade when you get users.

## Next Steps

1. ✅ Deploy to Render
2. ⚙️ Test all features
3. 📧 Set up email notifications
4. 📊 Add analytics (optional)
5. 🔒 Review security settings
6. 📱 Test mobile responsiveness
7. 🚀 Share with users!

## Support

- **Render Docs**: https://render.com/docs
- **Community**: https://community.render.com
- **Status**: https://status.render.com

## Quick Commands Reference

```bash
# Deploy updates
git add .
git commit -m "Update message"
git push origin main

# View logs (in Render dashboard)
# Service → Logs

# Restart service (in Render dashboard)
# Service → Manual Deploy → Deploy latest commit

# Check environment variables
# Service → Settings → Environment Variables
```

---

## 🎉 You're Ready to Deploy!

Follow Option 1 (Blueprint) for fastest deployment, or Option 2 (Manual) for more control.

Need help? Check logs first, they show most issues clearly!
