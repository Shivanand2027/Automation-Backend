# Vercel Deployment Guide

## Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Have a Vercel account (sign up at https://vercel.com)
3. MongoDB Atlas account for production database

## Deployment Steps

### 1. Prepare Environment Variables

You'll need to set these environment variables in Vercel:

**Backend Variables:**
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `GITHUB_TOKEN` - GitHub Personal Access Token
- `GEMINI_API_KEY` - Google Gemini API key
- `FRONTEND_URL` - Your Vercel frontend URL
- `NODE_ENV` - Set to "production"

**Frontend Variables:**
- `NEXT_PUBLIC_API_URL` - Your backend API URL

### 2. Deploy Backend

```bash
cd backend
vercel --prod
```

During deployment, Vercel will ask:
- Set up and deploy: Yes
- Which scope: Select your account
- Link to existing project: No
- Project name: automation-backend (or your choice)
- Directory: ./
- Override settings: No

After deployment, note the backend URL (e.g., `https://automation-backend.vercel.app`)

### 3. Deploy Frontend

```bash
cd ../frontend
vercel --prod
```

Same process as backend. Note the frontend URL.

### 4. Update Environment Variables

**In Vercel Dashboard (for backend):**
1. Go to your backend project
2. Settings → Environment Variables
3. Add all backend variables listed above
4. Set `FRONTEND_URL` to your frontend Vercel URL

**In Vercel Dashboard (for frontend):**
1. Go to your frontend project
2. Settings → Environment Variables
3. Set `NEXT_PUBLIC_API_URL` to your backend Vercel URL

### 5. Redeploy with Environment Variables

```bash
# Backend
cd backend
vercel --prod

# Frontend
cd ../frontend
vercel --prod
```

## Alternative: Deploy Entire Project at Once

You can also deploy from the root directory:

```bash
cd "c:\Users\shiva\OneDrive\Desktop\GitHub Automation"
vercel --prod
```

This will use the root `vercel.json` configuration.

## Important Notes

### MongoDB Atlas Setup
Since Vercel is serverless, you need MongoDB Atlas (not local MongoDB):

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Whitelist Vercel IPs (or allow from anywhere: 0.0.0.0/0)

### Scheduler Considerations
⚠️ **Important**: Vercel serverless functions have limitations:
- Maximum execution time: 10 seconds (Hobby), 60 seconds (Pro)
- Functions are stateless and don't persist between requests
- The scheduler won't work the same way on Vercel

**Solutions:**
1. **Use Vercel Cron Jobs**: Configure cron jobs in `vercel.json`
2. **Use External Scheduler**: Services like GitHub Actions, AWS EventBridge, or Vercel Cron
3. **Keep Backend Separate**: Deploy backend on Heroku/Railway/Render for persistent processes

### Recommended Architecture for Production

**Option 1: Hybrid Approach**
- Frontend on Vercel
- Backend on Railway/Render (for persistent scheduler)

**Option 2: Vercel Cron**
- Both on Vercel
- Use Vercel Cron for scheduled tasks

## Vercel Cron Configuration

Add to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/automation/run-scheduled",
      "schedule": "0 * * * *"
    }
  ]
}
```

## GitHub Integration

Link your GitHub repository to Vercel for automatic deployments:

1. Go to Vercel Dashboard
2. Import Project
3. Connect GitHub repository
4. Configure settings
5. Every push to main will auto-deploy

## Testing Deployment

After deployment, test your endpoints:

```bash
# Test backend
curl https://your-backend.vercel.app/health

# Test frontend
curl https://your-frontend.vercel.app
```

## Troubleshooting

### Build Errors
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation works locally

### Database Connection Issues
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas
- Ensure connection string is in environment variables

### CORS Errors
- Update `FRONTEND_URL` in backend environment variables
- Verify CORS configuration in `index.ts`

### Function Timeout
- Reduce processing time in endpoints
- Use background jobs for long tasks
- Consider upgrading Vercel plan

## Monitoring

- View logs in Vercel Dashboard
- Set up error tracking (Sentry, LogRocket)
- Monitor function execution times

## Cost Considerations

**Vercel Free Tier:**
- 100 GB bandwidth
- Unlimited websites
- Serverless function execution limits

**Recommended for Production:**
- Vercel Pro ($20/month) for better limits
- MongoDB Atlas M0 (free tier) or M10 ($0.08/hour)

## Next Steps

1. Set up CI/CD with GitHub Actions
2. Configure domain name
3. Set up monitoring and alerts
4. Implement proper logging
5. Add performance monitoring
