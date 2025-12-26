# Setup Instructions

Follow these step-by-step instructions to set up the AI-Powered GitHub Automation Platform.

## 📋 Prerequisites

Before starting, ensure you have:

- [x] Node.js (v18 or higher) - [Download](https://nodejs.org/)
- [x] npm or yarn package manager
- [x] MongoDB (local or Atlas account) - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [x] Git installed
- [x] GitHub account
- [x] Google Cloud account (for Gemini API)

## ⚙️ Step-by-Step Setup

### Step 1: Install Node.js and npm

**Check if already installed:**
```bash
node --version  # Should be v18 or higher
npm --version
```

**If not installed:**
- Windows: Download from [nodejs.org](https://nodejs.org/)
- Mac: `brew install node`
- Linux: `sudo apt install nodejs npm`

### Step 2: Install MongoDB

**Option A: Local Installation**

**Windows:**
1. Download from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and run as a service
3. Or manually: `mongod --dbpath C:\data\db`

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (free tier available)
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/`

### Step 3: Clone and Install Project

```bash
# Navigate to your projects directory
cd Desktop

# Clone the repository (or use your existing folder)
cd "GitHub Automation"

# Install all dependencies
npm install
npm run install:all
```

This will install:
- Root dependencies
- Backend dependencies
- Frontend dependencies

### Step 4: Set Up GitHub OAuth App

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/developers
   - Click "OAuth Apps" → "New OAuth App"

2. **Fill in the details:**
   ```
   Application name: GitHub Automation Platform
   Homepage URL: http://localhost:3000
   Application description: AI-powered GitHub automation
   Authorization callback URL: http://localhost:3001/api/auth/github/callback
   ```

3. **Save the credentials:**
   - Copy the **Client ID**
   - Generate and copy the **Client Secret**
   - Keep these safe!

### Step 5: Get Google Gemini API Key

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with Google account

2. **Create API Key**
   - Click "Create API Key"
   - Copy the key immediately
   - Store it securely

3. **Enable billing** (if needed)
   - Gemini API may require billing enabled
   - Free tier available for testing

### Step 6: Configure Environment Variables

1. **Copy example files:**
   ```bash
   # Copy root environment file
   copy .env.example .env

   # Copy frontend environment file
   copy frontend\.env.local.example frontend\.env.local
   ```

2. **Edit `.env` file:**
   ```env
   # GitHub OAuth Configuration
   GITHUB_CLIENT_ID=paste_your_client_id_here
   GITHUB_CLIENT_SECRET=paste_your_client_secret_here
   GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback

   # Google Gemini API
   GEMINI_API_KEY=paste_your_gemini_key_here

   # MongoDB
   # For local: mongodb://localhost:27017/github-automation
   # For Atlas: mongodb+srv://username:password@cluster.mongodb.net/github-automation
   MONGODB_URI=mongodb://localhost:27017/github-automation

   # JWT Secret (generate below)
   JWT_SECRET=paste_generated_secret_here

   # Application Settings
   NODE_ENV=development
   PORT=3001
   FRONTEND_URL=http://localhost:3000

   # Automation Schedule (daily at midnight)
   AUTOMATION_CRON_SCHEDULE=0 0 * * *
   ```

3. **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy the output and paste it as `JWT_SECRET` in `.env`

4. **Edit `frontend/.env.local`:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

### Step 7: Verify Installation

```bash
# Check all installations
node --version          # Should show v18+
npm --version          # Should show 9+
mongod --version       # Should show MongoDB version (if local)

# Verify dependencies installed
cd backend
npm list              # Should show all packages

cd ../frontend
npm list              # Should show all packages
```

### Step 8: Start the Application

**Option A: Start everything together (Recommended)**
```bash
# From root directory
npm run dev
```

**Option B: Start separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (new terminal)
cd frontend
npm run dev
```

You should see:
```
Backend: Server running on port 3001
Frontend: Ready on http://localhost:3000
```

### Step 9: Test the Application

1. **Open browser:**
   - Visit: http://localhost:3000

2. **Test authentication:**
   - Click "Login with GitHub"
   - Authorize the app
   - You should be redirected to dashboard

3. **Connect a repository:**
   - Click "Add Repository"
   - Select a repository
   - Click "Connect"

4. **Enable automation:**
   - Toggle automation on
   - Or click "Trigger Now" for immediate test

### Step 10: Verify Everything Works

**Check Backend:**
```bash
# Health check
curl http://localhost:3001/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

**Check Database:**
```bash
# If using local MongoDB
mongosh github-automation

# In MongoDB shell:
show collections  # Should show: users, repositories, commitlogs
db.users.find()   # Should show your user after login
```

**Check Logs:**
```bash
# Backend logs are in backend/logs/
# View recent logs:
type backend\logs\combined.log  # Windows
cat backend/logs/combined.log   # Mac/Linux
```

## 🔧 Troubleshooting Common Issues

### Issue: Port already in use

```bash
# Windows - Kill process on port
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Issue: MongoDB connection failed

**Check if MongoDB is running:**
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl status mongodb
```

**If using Atlas:**
- Verify connection string is correct
- Check username/password
- Ensure IP is whitelisted (or use 0.0.0.0/0 for testing)

### Issue: GitHub OAuth error

**Verify:**
1. Client ID and Secret are correct
2. Callback URL matches exactly: `http://localhost:3001/api/auth/github/callback`
3. OAuth app is not in "suspended" state
4. Frontend URL in backend .env is correct

### Issue: Gemini API error

**Check:**
1. API key is valid and active
2. Billing is enabled (if required)
3. API quota not exceeded
4. No typos in key

### Issue: npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s /q node_modules  # Windows
rm -rf node_modules       # Mac/Linux

npm install
```

### Issue: TypeScript errors

```bash
# Rebuild TypeScript
cd backend
npm run build

cd ../frontend
npm run build
```

## 📁 Project Structure Verification

After setup, your structure should look like:

```
GitHub Automation/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── logs/
│   ├── node_modules/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx
│   │       ├── dashboard/
│   │       └── repository/
│   ├── node_modules/
│   ├── package.json
│   └── next.config.js
├── node_modules/
├── .env
├── .gitignore
├── package.json
└── README.md
```

## 🎯 Next Steps

After successful setup:

1. **Read the documentation:**
   - [README.md](README.md) - Project overview
   - [API.md](API.md) - API documentation
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

2. **Test the features:**
   - Connect a test repository
   - Enable automation
   - Trigger manual automation
   - Check commit history

3. **Customize settings:**
   - Adjust automation schedule in .env
   - Modify AI prompts in ai.service.ts
   - Update frontend styling

4. **Prepare for production:**
   - Read [DEPLOYMENT.md](DEPLOYMENT.md)
   - Set up production databases
   - Configure production OAuth app
   - Get SSL certificates

## 🆘 Getting Help

If you encounter issues:

1. Check the [QUICKSTART.md](QUICKSTART.md)
2. Review error logs in `backend/logs/`
3. Search existing GitHub issues
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (Node version, OS)
   - Logs

## ✅ Setup Checklist

- [ ] Node.js installed (v18+)
- [ ] MongoDB running (local or Atlas)
- [ ] GitHub OAuth app created
- [ ] Gemini API key obtained
- [ ] Dependencies installed (`npm run install:all`)
- [ ] Environment variables configured
- [ ] JWT secret generated
- [ ] Backend starts without errors
- [ ] Frontend accessible at http://localhost:3000
- [ ] Successfully logged in with GitHub
- [ ] Repository connected
- [ ] Automation triggered

## 🎉 Success!

If all steps are complete, you now have a fully functional AI-Powered GitHub Automation Platform!

Visit http://localhost:3000 and start automating your repositories with AI.

---

**Need help?** Open an issue or check the documentation files in the root directory.
