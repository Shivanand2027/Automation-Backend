# AI-Powered GitHub Code Automation Platform

An intelligent automation platform that uses AI to analyze GitHub repositories and automatically make meaningful improvements through scheduled commits. Built for educational purposes with a focus on security and ethical practices.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.3.3-blue)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Educational Purpose](#educational-purpose)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This platform enables developers to connect their GitHub repositories and leverage AI (Google Gemini) to automatically generate meaningful improvements. The system analyzes repository content, suggests enhancements, and commits changes on a scheduled basis.

**Important:** This project is designed for educational and learning purposes. It demonstrates:
- GitHub OAuth integration
- AI-powered code analysis
- Automated repository management
- Secure API development
- Modern full-stack architecture

## ✨ Features

### Core Functionality
- 🔐 **GitHub OAuth Authentication** - Secure login with GitHub accounts
- 🤖 **AI-Powered Analysis** - Google Gemini analyzes repository content
- 📅 **Automated Scheduling** - Daily automated commits using cron jobs
- 📊 **Repository Dashboard** - Monitor automation status and history
- 🔄 **Two-Way GitHub Sync** - Fetch and push repository content
- 📝 **Commit History** - Track all automated changes

### AI Improvements
The AI system can automatically:
- Improve README documentation
- Add inline code comments
- Enhance function documentation
- Create/update CONTRIBUTING.md
- Add CODE_OF_CONDUCT.md
- Update CHANGELOG.md
- Add usage examples

### Security Features
- Environment variable management
- Secure token storage
- JWT-based authentication
- API key protection
- Input validation

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │ ◄─────► │   Backend    │ ◄─────► │   MongoDB   │
│  (Next.js)  │         │  (Express)   │         │  Database   │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              ├─────► GitHub API
                              │
                              └─────► Gemini AI
```

### Components

1. **Frontend (Next.js 14)**
   - Landing page
   - User dashboard
   - Repository management
   - Commit history viewer

2. **Backend (Node.js + Express)**
   - REST API
   - Authentication service
   - GitHub integration
   - AI service
   - Scheduler service

3. **Database (MongoDB)**
   - User data
   - Repository metadata
   - Commit logs

4. **External Services**
   - GitHub API (OAuth & Repository operations)
   - Google Gemini AI (Code analysis)

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Mongoose** - MongoDB ODM
- **node-cron** - Job scheduling
- **JWT** - Authentication tokens

### AI & APIs
- **Google Gemini AI** - Code analysis and suggestions
- **GitHub REST API** - Repository operations
- **GitHub OAuth** - User authentication

### Database
- **MongoDB** - NoSQL database for flexibility

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (v6 or higher)
- **Git**

You'll also need:
- A **GitHub account**
- A **Google Cloud account** (for Gemini API)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/github-automation-platform.git
cd github-automation-platform
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 3. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod --dbpath /path/to/your/data
```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string

### 4. Configure GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name:** GitHub Automation Platform
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3001/api/auth/github/callback`
4. Save the **Client ID** and **Client Secret**

### 5. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Save the API key securely

### 6. Configure Environment Variables

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/github-automation

# JWT Secret (generate a random string)
JWT_SECRET=your_secure_random_string_here

# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Automation Schedule (cron format)
AUTOMATION_CRON_SCHEDULE=0 0 * * *
```

Create `frontend/.env.local`:

```bash
cp frontend/.env.local.example frontend/.env.local
```

Edit with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 7. Generate JWT Secret

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🎮 Usage

### Development Mode

Start both frontend and backend:

```bash
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

Access the application:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

### Production Build

```bash
# Build both projects
npm run build

# Start production servers
npm start
```

## 📖 How to Use

### 1. Login with GitHub
- Visit http://localhost:3000
- Click "Login with GitHub"
- Authorize the application

### 2. Connect a Repository
- Click "Add Repository" on the dashboard
- Select a repository from your GitHub account
- Click "Connect"

### 3. Enable Automation
- Toggle automation on for the connected repository
- The system will analyze and commit changes daily

### 4. Manual Trigger (Optional)
- Click "Trigger Now" to immediately run automation
- View commit history on the repository details page

## 📡 API Documentation

### Authentication Endpoints

#### `GET /api/auth/github`
Initiate GitHub OAuth flow

**Response:**
```json
{
  "url": "https://github.com/login/oauth/authorize?..."
}
```

#### `GET /api/auth/github/callback`
OAuth callback endpoint

**Query Parameters:**
- `code`: Authorization code from GitHub

#### `GET /api/auth/me`
Get current user information

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "user_id",
  "username": "github_username",
  "email": "user@example.com",
  "avatarUrl": "https://...",
  "githubId": "12345"
}
```

### Repository Endpoints

#### `GET /api/repositories`
Get all user's GitHub repositories

**Headers:**
- `Authorization: Bearer <token>`

#### `GET /api/repositories/connected`
Get connected repositories

#### `POST /api/repositories/connect`
Connect a repository

**Body:**
```json
{
  "githubRepoId": 123456,
  "name": "repo-name",
  "fullName": "username/repo-name",
  "description": "Repository description",
  "owner": "username",
  "isPrivate": false,
  "defaultBranch": "main"
}
```

#### `GET /api/repositories/:id`
Get repository details

#### `GET /api/repositories/:id/commits`
Get repository commit history

#### `DELETE /api/repositories/:id`
Disconnect a repository

### Automation Endpoints

#### `POST /api/automation/:id/enable`
Enable automation for a repository

#### `POST /api/automation/:id/disable`
Disable automation for a repository

#### `POST /api/automation/:id/trigger`
Manually trigger automation

#### `GET /api/automation/:id/status`
Get automation status

## 🔒 Security

### Best Practices Implemented

1. **Environment Variables**
   - All sensitive data stored in environment variables
   - Never committed to version control
   - Separate configs for development/production

2. **Token Security**
   - JWT tokens for authentication
   - Short-lived access tokens
   - Secure token storage

3. **API Security**
   - Authentication middleware
   - Input validation
   - Error handling
   - Rate limiting (recommended for production)

4. **GitHub OAuth**
   - Secure OAuth flow
   - Minimal required scopes
   - Token refresh mechanism

5. **Database Security**
   - Connection string in environment variables
   - Mongoose schema validation
   - Indexed queries for performance

### Security Recommendations for Production

- Enable HTTPS/SSL
- Implement rate limiting
- Add request validation middleware
- Set up CORS properly
- Use helmet.js for HTTP headers
- Implement logging and monitoring
- Regular dependency updates
- Security audits

## 🎓 Educational Purpose

### This Project Demonstrates

1. **Full-Stack Development**
   - Modern React with Next.js
   - RESTful API design
   - Database modeling

2. **Authentication & Authorization**
   - OAuth 2.0 flow
   - JWT tokens
   - Secure session management

3. **External API Integration**
   - GitHub API
   - AI services (Gemini)
   - Webhook handling

4. **DevOps Concepts**
   - Cron jobs and scheduling
   - Background processing
   - Environment management

5. **AI Integration**
   - Natural language processing
   - Code analysis
   - Automated decision making

### Ethical Considerations

**This platform should NOT be used for:**
- Artificially inflating GitHub contribution graphs
- Creating fake or meaningless commits
- Bypassing GitHub's policies
- Any deceptive practices

**This platform SHOULD be used for:**
- Learning AI integration
- Understanding automation
- Exploring GitHub API
- Educational projects
- Personal repository maintenance

## 🛡️ Commit Philosophy

All automated commits are:
- **Meaningful:** Real improvements to documentation or code
- **Transparent:** Clear commit messages
- **Valuable:** Add educational or practical value
- **Authentic:** No empty or fake commits

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Ensure MongoDB is running
mongod --dbpath /path/to/data

# Or check MongoDB Atlas connection string
```

**GitHub OAuth Error**
- Verify callback URL matches GitHub app settings
- Check client ID and secret
- Ensure app is not in development mode on GitHub

**Gemini API Error**
- Verify API key is correct
- Check API quota and limits
- Ensure billing is enabled on Google Cloud

**Port Already in Use**
```bash
# Kill process on port 3000 or 3001
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

## 📚 Project Structure

```
github-automation-platform/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Server entry point
│   │   ├── models/               # Database models
│   │   ├── routes/               # API routes
│   │   ├── services/             # Business logic
│   │   ├── middleware/           # Express middleware
│   │   └── utils/                # Utilities
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx          # Landing page
│   │       ├── dashboard/        # Dashboard page
│   │       └── repository/       # Repository details
│   ├── package.json
│   └── next.config.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

Built for educational purposes as a college project.

## 🙏 Acknowledgments

- GitHub API documentation
- Google Gemini AI
- Next.js team
- Express.js community
- MongoDB team

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Disclaimer:** This platform is intended for educational purposes. Users are responsible for ensuring their use complies with GitHub's Terms of Service and community guidelines. The platform should not be used to artificially inflate contribution statistics or engage in deceptive practices.

**Remember:** Quality over quantity. Meaningful contributions matter more than commit counts.
# Automation-Backend
