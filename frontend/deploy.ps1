# Frontend Vercel Deployment Script

Write-Host "🚀 Deploying Frontend to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Check if in frontend directory
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ Error: Not in frontend directory" -ForegroundColor Red
    exit 1
}

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-Not $vercelInstalled) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Login to Vercel
Write-Host "🔐 Logging into Vercel..." -ForegroundColor Yellow
vercel login

# Deploy
Write-Host "🚀 Deploying..." -ForegroundColor Yellow
vercel --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Don't forget to:" -ForegroundColor Yellow
Write-Host "1. Update NEXT_PUBLIC_API_URL environment variable in Vercel dashboard"
Write-Host "2. Update FRONTEND_URL in your backend environment variables"
Write-Host "3. Update GitHub OAuth callback URLs"
