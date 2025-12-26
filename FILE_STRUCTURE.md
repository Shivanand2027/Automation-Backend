# File Structure Reference

Complete file tree of the AI-Powered GitHub Automation Platform

## 📁 Root Directory

```
GitHub Automation/
│
├── 📁 backend/                          # Backend Node.js application
│   ├── 📁 src/                         # Source code
│   │   ├── 📄 index.ts                # Server entry point
│   │   │
│   │   ├── 📁 models/                 # Database models
│   │   │   ├── 📄 User.model.ts       # User schema
│   │   │   ├── 📄 Repository.model.ts # Repository schema
│   │   │   └── 📄 CommitLog.model.ts  # Commit log schema
│   │   │
│   │   ├── 📁 routes/                 # API routes
│   │   │   ├── 📄 auth.routes.ts      # Authentication endpoints
│   │   │   ├── 📄 repository.routes.ts # Repository endpoints
│   │   │   └── 📄 automation.routes.ts # Automation endpoints
│   │   │
│   │   ├── 📁 services/               # Business logic
│   │   │   ├── 📄 github.service.ts   # GitHub API integration
│   │   │   ├── 📄 ai.service.ts       # Gemini AI integration
│   │   │   └── 📄 scheduler.service.ts # Cron job scheduler
│   │   │
│   │   ├── 📁 middleware/             # Express middleware
│   │   │   ├── 📄 auth.middleware.ts  # JWT authentication
│   │   │   └── 📄 errorHandler.ts     # Global error handler
│   │   │
│   │   └── 📁 utils/                  # Utilities
│   │       └── 📄 logger.ts           # Winston logger
│   │
│   ├── 📁 logs/                        # Log files (auto-generated)
│   │   ├── 📄 combined.log            # All logs
│   │   └── 📄 error.log               # Error logs only
│   │
│   ├── 📁 dist/                        # Compiled JavaScript (auto-generated)
│   ├── 📁 node_modules/                # Dependencies (auto-generated)
│   │
│   ├── 📄 package.json                # Backend dependencies
│   ├── 📄 tsconfig.json               # TypeScript configuration
│   └── 📄 .gitignore                  # Git ignore rules
│
├── 📁 frontend/                        # Frontend Next.js application
│   ├── 📁 src/                        # Source code
│   │   └── 📁 app/                    # Next.js 14 App Router
│   │       ├── 📄 layout.tsx          # Root layout
│   │       ├── 📄 page.tsx            # Landing page
│   │       ├── 📄 globals.css         # Global styles
│   │       │
│   │       ├── 📁 dashboard/          # Dashboard page
│   │       │   └── 📄 page.tsx        # Dashboard component
│   │       │
│   │       └── 📁 repository/         # Repository details
│   │           └── 📁 [id]/           # Dynamic route
│   │               └── 📄 page.tsx    # Repository detail page
│   │
│   ├── 📁 public/                     # Static files
│   ├── 📁 .next/                      # Next.js build (auto-generated)
│   ├── 📁 node_modules/               # Dependencies (auto-generated)
│   │
│   ├── 📄 package.json                # Frontend dependencies
│   ├── 📄 tsconfig.json               # TypeScript configuration
│   ├── 📄 next.config.js              # Next.js configuration
│   ├── 📄 tailwind.config.js          # Tailwind CSS configuration
│   ├── 📄 postcss.config.js           # PostCSS configuration
│   ├── 📄 .env.local.example          # Environment template
│   └── 📄 .gitignore                  # Git ignore rules
│
├── 📁 node_modules/                    # Root dependencies (auto-generated)
│
├── 📄 package.json                     # Root workspace configuration
├── 📄 .env.example                     # Environment variables template
├── 📄 .gitignore                       # Git ignore rules
│
├── 📚 Documentation Files
├── 📄 README.md                        # Main project documentation
├── 📄 START_HERE.md                    # Getting started guide
├── 📄 QUICKSTART.md                    # 5-minute quick start
├── 📄 SETUP.md                         # Detailed setup instructions
├── 📄 API.md                           # API reference
├── 📄 ARCHITECTURE.md                  # System architecture
├── 📄 DEPLOYMENT.md                    # Production deployment guide
├── 📄 SECURITY.md                      # Security best practices
├── 📄 CONTRIBUTING.md                  # Contribution guidelines
├── 📄 DEVELOPER_GUIDE.md               # Developer reference
├── 📄 PROJECT_SUMMARY.md               # Project overview
├── 📄 FILE_STRUCTURE.md                # This file
└── 📄 LICENSE                          # MIT License
```

## 📊 File Count by Category

### Source Code Files
```
Backend:     13 files
Frontend:     9 files
Total:       22 files
```

### Configuration Files
```
TypeScript:   2 files
Next.js:      3 files
Package:      3 files
Environment:  2 files
Total:       10 files
```

### Documentation Files
```
Main docs:   12 files
```

### Total Project Files
```
Source + Config + Docs: 44 files
Plus auto-generated:    node_modules/, dist/, .next/, logs/
```

## 🎯 Key Files Explained

### Backend

**index.ts** (Entry Point)
- Initializes Express server
- Connects to MongoDB
- Sets up routes and middleware
- Starts scheduler
- Handles errors

**Models** (Database Schemas)
- `User.model.ts` - User account data
- `Repository.model.ts` - Connected repositories
- `CommitLog.model.ts` - Automation history

**Routes** (API Endpoints)
- `auth.routes.ts` - Login, logout, user info
- `repository.routes.ts` - Repo CRUD operations
- `automation.routes.ts` - Automation controls

**Services** (Business Logic)
- `github.service.ts` - GitHub API calls
- `ai.service.ts` - Gemini AI integration
- `scheduler.service.ts` - Cron job automation

**Middleware**
- `auth.middleware.ts` - JWT verification
- `errorHandler.ts` - Error handling

**Utils**
- `logger.ts` - Winston logging setup

### Frontend

**page.tsx** (Landing Page)
- Hero section
- Feature showcase
- Call to action
- Educational notice

**dashboard/page.tsx** (Dashboard)
- Repository list
- Connect repositories
- Enable/disable automation
- Status overview

**repository/[id]/page.tsx** (Details)
- Repository information
- Commit history
- Automation status
- GitHub links

**layout.tsx** (Root Layout)
- App structure
- Global metadata
- Font configuration

**globals.css** (Global Styles)
- Tailwind directives
- Custom CSS
- Theme variables

### Configuration

**.env.example** (Environment Template)
- All required environment variables
- Example values
- Comments for each variable

**tsconfig.json** (TypeScript Config)
- Compiler options
- Type checking rules
- Module resolution

**next.config.js** (Next.js Config)
- Build settings
- Environment variables
- Optimization rules

**tailwind.config.js** (Tailwind Config)
- Color palette
- Custom utilities
- Content paths

### Documentation

**README.md** - Main documentation with:
- Project overview
- Features list
- Installation guide
- Usage instructions
- API reference

**SETUP.md** - Step-by-step setup:
- Prerequisites
- Installation steps
- Configuration
- Troubleshooting

**API.md** - Complete API docs:
- All endpoints
- Request/response examples
- Authentication
- Error codes

**ARCHITECTURE.md** - System design:
- Component diagrams
- Data flow
- Database schema
- Security architecture

## 📁 Auto-Generated Directories

These are created automatically and should not be committed:

```
backend/node_modules/     # Backend dependencies
backend/dist/             # Compiled TypeScript
backend/logs/             # Application logs

frontend/node_modules/    # Frontend dependencies
frontend/.next/           # Next.js build output

node_modules/             # Root dependencies
```

## 🔒 Protected Files

Never commit these files:

```
.env                      # Environment variables (root)
frontend/.env.local       # Frontend environment
backend/logs/*.log        # Log files
```

## 📝 File Naming Conventions

### Backend
```
*.model.ts       # Database models
*.service.ts     # Business logic services
*.routes.ts      # API route handlers
*.middleware.ts  # Express middleware
```

### Frontend
```
page.tsx         # Next.js page components
layout.tsx       # Layout components
globals.css      # Global styles
```

### Documentation
```
*.md             # Markdown documentation
UPPERCASE.md     # Important documentation
```

## 🎨 Code Organization

### Backend Structure
```
Models      → Define data structure
Routes      → Handle HTTP requests
Services    → Implement business logic
Middleware  → Process requests/responses
Utils       → Helper functions
```

### Frontend Structure
```
app/        → Pages and layouts
pages       → Each folder = route
components  → Reusable UI components (future)
```

## 📊 Lines of Code Estimate

```
Backend:     ~1,500 lines
Frontend:    ~1,200 lines
Config:      ~300 lines
Docs:        ~3,000 lines
Total:       ~6,000 lines
```

## 🔍 Finding Files Quickly

### Common Tasks

**Add new API endpoint:**
```
→ backend/src/routes/
```

**Create new page:**
```
→ frontend/src/app/
```

**Modify AI behavior:**
```
→ backend/src/services/ai.service.ts
```

**Update database schema:**
```
→ backend/src/models/
```

**Change UI styling:**
```
→ frontend/src/app/globals.css
→ frontend/tailwind.config.js
```

**View logs:**
```
→ backend/logs/combined.log
```

**Update documentation:**
```
→ *.md files in root
```

## 🚀 Build Output

When you run `npm run build`:

### Backend
```
backend/dist/
├── index.js
├── models/
├── routes/
├── services/
└── ...
```

### Frontend
```
frontend/.next/
├── server/
├── static/
└── ...
```

## 📦 Package Structure

```
Root package.json
├── Manages workspaces
├── Shared scripts
└── Development dependencies

Backend package.json
├── Express & TypeScript
├── MongoDB & Mongoose
├── GitHub & AI libraries
└── Utility packages

Frontend package.json
├── Next.js & React
├── Tailwind CSS
└── Icon libraries
```

## 🎯 Important Locations

```
Entry Points:
→ backend/src/index.ts
→ frontend/src/app/page.tsx

Configuration:
→ .env (root)
→ frontend/.env.local

Logs:
→ backend/logs/

Documentation:
→ All *.md files in root

Dependencies:
→ package.json files
```

## 📋 File Checklist

Before starting development:

- [ ] All source files present
- [ ] Configuration files in place
- [ ] Documentation readable
- [ ] .gitignore configured
- [ ] Environment templates created
- [ ] Dependencies installable
- [ ] No syntax errors

---

**Note:** This structure follows industry best practices for:
- Separation of concerns
- Modularity
- Scalability
- Maintainability
- Type safety

For detailed information about each file's contents, see the respective documentation files.
