#!/bin/bash

# Frontend Vercel Deployment Script

echo "🚀 Deploying Frontend to Vercel..."
echo ""

# Check if in frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in frontend directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔐 Logging into Vercel..."
vercel login

# Deploy
echo "🚀 Deploying..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  Don't forget to:"
echo "1. Update NEXT_PUBLIC_API_URL environment variable in Vercel dashboard"
echo "2. Update FRONTEND_URL in your backend environment variables"
echo "3. Update GitHub OAuth callback URLs"
