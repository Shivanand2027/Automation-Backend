# Frontend Deployment Guide - Vercel

## Prerequisites
- Backend already deployed (e.g., on Render)
- GitHub account
- Vercel account (sign up at https://vercel.com)

## Deployment Steps

### 1. Prepare Your Repository
Make sure your code is pushed to GitHub:
```bash
cd frontend
git add .
git commit -m "Prepare frontend for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add: `NEXT_PUBLIC_API_URL` = `YOUR_BACKEND_URL`
   - Example: `https://your-backend.onrender.com`

6. Click "Deploy"

#### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to frontend directory:
```bash
cd frontend
```

3. Login to Vercel:
```bash
vercel login
```

4. Deploy:
```bash
vercel
```

5. Follow the prompts:
   - Set up and deploy? Yes
   - Which scope? Select your account
   - Link to existing project? No
   - What's your project's name? github-automation-frontend
   - In which directory is your code located? ./
   - Want to override the settings? No

6. Set environment variable:
```bash
vercel env add NEXT_PUBLIC_API_URL
```
Enter your backend URL when prompted.

7. Deploy to production:
```bash
vercel --prod
```

### 3. Update Backend CORS Settings

After deployment, update your backend to allow requests from your Vercel domain:

1. Update backend `.env`:
```env
FRONTEND_URL=https://your-frontend.vercel.app
```

2. If deployed on Render, update environment variables:
   - Go to Render Dashboard
   - Select your backend service
   - Go to "Environment"
   - Update `FRONTEND_URL` with your Vercel URL
   - Click "Save Changes"

### 4. Verify Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Check browser console for any errors
3. Test API connectivity
4. Test authentication flow

## Environment Variables

Required environment variables for Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-backend.onrender.com` |

## Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

## Custom Domain (Optional)

1. Go to your project on Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for SSL certificate to be issued

## Troubleshooting

### Build Fails
```bash
# Check build locally
cd frontend
npm run build
```

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend CORS settings
- Verify backend is running

### Environment Variables Not Working
- Environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- Redeploy after adding/changing environment variables

### 404 on Routes
- Next.js handles routing automatically
- Ensure `vercel.json` is configured correctly

## Monitoring

View logs in Vercel Dashboard:
1. Go to your project
2. Click "Deployments"
3. Select a deployment
4. View "Runtime Logs" or "Build Logs"

## Rollback

If needed, rollback to a previous deployment:
1. Go to "Deployments"
2. Find the working deployment
3. Click "..." → "Promote to Production"

## Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel remove [deployment-url]
```

## Next Steps

1. ✅ Backend deployed
2. ✅ Frontend deployed
3. Update GitHub OAuth callback URLs
4. Test full application flow
5. Set up custom domain (optional)
6. Configure monitoring and alerts

## Support

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- GitHub Issues: https://github.com/your-repo/issues
