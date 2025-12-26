# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js (should be 18+)
node --version

# Check npm
npm --version

# Check MongoDB (if using local)
mongod --version
```

## Quick Setup

### 1. Install Dependencies (2 minutes)

```bash
npm run install:all
```

### 2. Configure Environment (2 minutes)

```bash
# Copy environment files
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
```

### 3. Set Up Services (1 minute)

**MongoDB:**
- Local: Start MongoDB service
- Cloud: Get MongoDB Atlas connection string

**GitHub OAuth:**
1. Go to https://github.com/settings/developers
2. Create New OAuth App
3. Callback URL: `http://localhost:3001/api/auth/github/callback`

**Gemini API:**
1. Visit https://makersuite.google.com/app/apikey
2. Create API key

### 4. Update .env File

```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GEMINI_API_KEY=your_gemini_key_here
MONGODB_URI=mongodb://localhost:27017/github-automation
JWT_SECRET=run_this_command_to_generate
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Start Development (30 seconds)

```bash
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## First Time Usage

1. Click "Login with GitHub"
2. Authorize the app
3. Add a repository
4. Enable automation
5. Watch the magic happen!

## Need Help?

- Check [README.md](README.md) for detailed docs
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Open an issue on GitHub

## Next Steps

- Read the [Architecture Documentation](README.md#architecture)
- Explore the [API Documentation](README.md#api-documentation)
- Set up for [Production Deployment](DEPLOYMENT.md)

---

That's it! You're ready to automate your GitHub repositories with AI! 🚀
