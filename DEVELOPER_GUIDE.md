# Developer Reference Guide

Quick reference for developers working on this project.

## 📂 Project Structure

```
GitHub Automation/
├── backend/src/
│   ├── index.ts              # Server entry point
│   ├── models/               # MongoDB schemas
│   │   ├── User.model.ts
│   │   ├── Repository.model.ts
│   │   └── CommitLog.model.ts
│   ├── routes/               # API routes
│   │   ├── auth.routes.ts
│   │   ├── repository.routes.ts
│   │   └── automation.routes.ts
│   ├── services/             # Business logic
│   │   ├── github.service.ts
│   │   ├── ai.service.ts
│   │   └── scheduler.service.ts
│   ├── middleware/           # Express middleware
│   │   ├── auth.middleware.ts
│   │   └── errorHandler.ts
│   └── utils/
│       └── logger.ts
├── frontend/src/app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/page.tsx    # Dashboard
│   └── repository/[id]/page.tsx
└── Documentation files...
```

## 🔑 Environment Variables

### Backend (.env)
```env
# Required
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_CALLBACK_URL
GEMINI_API_KEY
MONGODB_URI
JWT_SECRET

# Optional
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
AUTOMATION_CRON_SCHEDULE=0 0 * * *
```

### Frontend (frontend/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🚀 Commands

### Root
```bash
npm run dev              # Start both frontend and backend
npm run install:all      # Install all dependencies
npm run build           # Build both projects
npm start               # Start production servers
```

### Backend
```bash
cd backend
npm run dev             # Development with nodemon
npm run build          # Compile TypeScript
npm start              # Start production server
npm run lint           # Run ESLint
```

### Frontend
```bash
cd frontend
npm run dev            # Development server
npm run build         # Production build
npm start             # Start production server
npm run lint          # Run ESLint
```

## 📡 API Endpoints

### Authentication
```
GET  /api/auth/github          # Get OAuth URL
GET  /api/auth/github/callback # OAuth callback
GET  /api/auth/me              # Get current user
POST /api/auth/logout          # Logout
```

### Repositories
```
GET    /api/repositories              # Get all repos
GET    /api/repositories/connected    # Get connected repos
POST   /api/repositories/connect      # Connect repo
GET    /api/repositories/:id          # Get repo details
GET    /api/repositories/:id/commits  # Get commit logs
DELETE /api/repositories/:id          # Disconnect repo
```

### Automation
```
POST /api/automation/:id/enable   # Enable automation
POST /api/automation/:id/disable  # Disable automation
POST /api/automation/:id/trigger  # Manual trigger
GET  /api/automation/:id/status   # Get status
PUT  /api/automation/:id/schedule # Update schedule
```

### Health
```
GET /health                      # Health check
```

## 🗄️ Database Models

### User
```typescript
{
  githubId: string (unique)
  username: string
  email: string
  avatarUrl: string
  accessToken: string
  createdAt: Date
  updatedAt: Date
}
```

### Repository
```typescript
{
  userId: ObjectId
  githubRepoId: number
  name: string
  fullName: string
  description: string
  owner: string
  isPrivate: boolean
  defaultBranch: string
  automationEnabled: boolean
  lastAutomationRun: Date | null
  automationSchedule: string
  createdAt: Date
  updatedAt: Date
}
```

### CommitLog
```typescript
{
  repositoryId: ObjectId
  commitSha: string
  commitMessage: string
  filesChanged: string[]
  aiAnalysis: string
  status: 'success' | 'failed'
  errorMessage?: string
  createdAt: Date
}
```

## 🔧 Common Tasks

### Add New API Endpoint

1. Create route handler in `backend/src/routes/`
2. Add service logic in `backend/src/services/`
3. Update types if needed
4. Add authentication middleware if required
5. Test endpoint
6. Update API.md documentation

### Add New Page

1. Create page in `frontend/src/app/`
2. Add to navigation if needed
3. Create components in same folder
4. Add API calls
5. Style with Tailwind
6. Test responsiveness

### Modify AI Behavior

Edit `backend/src/services/ai.service.ts`:
```typescript
async analyzeRepository(data) {
  const prompt = `Your custom prompt...`;
  // Modify logic
}
```

### Change Automation Schedule

Update in `.env`:
```env
# Cron format: minute hour day month weekday
AUTOMATION_CRON_SCHEDULE=0 2 * * *  # 2 AM daily
```

### Add New Database Model

1. Create model file in `backend/src/models/`
2. Define schema with Mongoose
3. Export model
4. Import in routes
5. Add indexes if needed

## 🐛 Debugging

### Backend Logs
```bash
# View logs
type backend\logs\combined.log  # Windows
cat backend/logs/combined.log   # Mac/Linux

# Watch logs in real-time
tail -f backend/logs/combined.log
```

### Check Database
```bash
# MongoDB shell
mongosh github-automation

# List collections
show collections

# Query users
db.users.find().pretty()

# Query repositories
db.repositories.find().pretty()

# Query logs
db.commitlogs.find().sort({createdAt: -1}).limit(10)
```

### Debug API Requests
```bash
# Test with curl
curl -X GET http://localhost:3001/health

# With authentication
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Debug
```javascript
// In browser console
localStorage.getItem('token')  // Check token
console.log(process.env)       // Check env vars
```

## 🎨 Styling Guide

### Tailwind Classes
```jsx
// Containers
className="max-w-7xl mx-auto px-4 py-8"

// Cards
className="bg-white bg-opacity-5 rounded-xl p-6 border border-white border-opacity-10"

// Buttons
className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"

// Text
className="text-3xl font-bold text-white"
```

### Color Scheme
- Primary: Purple (`purple-600`)
- Secondary: Pink (`pink-600`)
- Success: Green (`green-500`)
- Error: Red (`red-500`)
- Background: Slate gradient

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with GitHub
- [ ] Connect repository
- [ ] Enable automation
- [ ] Trigger manual automation
- [ ] View commit history
- [ ] Disable automation
- [ ] Disconnect repository
- [ ] Logout

### API Testing with curl
```bash
# Health check
curl http://localhost:3001/health

# Get OAuth URL
curl http://localhost:3001/api/auth/github

# Get user (with token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/auth/me
```

## 📦 Dependencies Management

### Update Dependencies
```bash
# Check outdated
npm outdated

# Update all
npm update

# Update specific
npm update package-name

# Security audit
npm audit
npm audit fix
```

### Add New Dependency
```bash
# Backend
cd backend
npm install package-name

# Frontend
cd frontend
npm install package-name
```

## 🔐 Security Checklist

- [ ] No secrets in code
- [ ] .env in .gitignore
- [ ] JWT secret is random
- [ ] HTTPS in production
- [ ] Input validation enabled
- [ ] Error messages sanitized
- [ ] Dependencies updated
- [ ] Security audit passed

## 🚢 Deployment Checklist

- [ ] Environment variables set
- [ ] Database connection tested
- [ ] GitHub OAuth configured
- [ ] Gemini API tested
- [ ] Build succeeds
- [ ] Health endpoint works
- [ ] Frontend loads
- [ ] Authentication works
- [ ] API requests work
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] SSL certificate installed

## 🔍 Troubleshooting

### Backend won't start
1. Check MongoDB is running
2. Verify .env file exists
3. Check port availability
4. View logs for errors

### Frontend won't start
1. Check backend is running
2. Verify .env.local
3. Clear .next folder
4. Reinstall dependencies

### OAuth fails
1. Verify callback URL
2. Check client ID/secret
3. Ensure app not suspended
4. Check frontend URL in backend

### Automation not working
1. Check cron schedule format
2. Verify repo is connected
3. Check automation enabled
4. View backend logs
5. Test Gemini API key

## 📚 Useful Links

- [MongoDB Docs](https://docs.mongodb.com/)
- [Express Guide](https://expressjs.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [GitHub API](https://docs.github.com/rest)
- [Gemini AI](https://ai.google.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 💡 Tips

1. **Use TypeScript:** Strong typing prevents bugs
2. **Log everything:** Use logger for debugging
3. **Test locally:** Always test before deploying
4. **Keep dependencies updated:** Regular updates
5. **Follow conventions:** Consistent code style
6. **Document changes:** Update docs with features
7. **Git workflow:** Use branches for features
8. **Error handling:** Always catch and log errors

## 🎯 Quick Fixes

### Clear all data
```javascript
// In MongoDB shell
db.users.deleteMany({})
db.repositories.deleteMany({})
db.commitlogs.deleteMany({})
```

### Reset development
```bash
# Stop servers
# Delete node_modules
# Delete .env
# Reinstall and reconfigure
```

### Force rebuild
```bash
# Backend
cd backend
rmdir /s /q dist
npm run build

# Frontend
cd frontend
rmdir /s /q .next
npm run build
```

## 📝 Commit Message Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Maintenance tasks
```

## 🎓 Learning Path

1. Understand the architecture
2. Explore the codebase
3. Read the API documentation
4. Test each endpoint
5. Modify small features
6. Add new features
7. Deploy to production

---

**Remember:** Code quality over quantity. Write clean, maintainable code!
