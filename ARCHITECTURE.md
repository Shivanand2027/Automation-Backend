# Architecture Documentation

## System Overview

The AI-Powered GitHub Automation Platform is built as a microservices-style application with three main components:

1. **Frontend** (Next.js)
2. **Backend** (Node.js/Express)
3. **Database** (MongoDB)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Landing Page │  │  Dashboard   │  │ Repo Details │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                     Next.js Frontend                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (JWT Auth)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY LAYER                         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Routes  │  │  Repo Routes │  │ Auto Routes  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                    Express.js Backend                            │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                     │
         ▼                    ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   GitHub     │    │   AI Service │    │  Scheduler   │
│   Service    │    │   (Gemini)   │    │  Service     │
└──────────────┘    └──────────────┘    └──────────────┘
         │                    │                     │
         │                    │                     │
         ▼                    │                     ▼
┌──────────────┐              │            ┌──────────────┐
│  GitHub API  │              │            │   Cron Job   │
└──────────────┘              │            └──────────────┘
                              │
                              ▼
                     ┌──────────────┐
                     │  Gemini API  │
                     └──────────────┘

                              │
                              ▼
         ┌───────────────────────────────────────┐
         │          DATA PERSISTENCE             │
         │                                       │
         │  ┌─────────┐  ┌─────────┐  ┌─────┐  │
         │  │  Users  │  │  Repos  │  │Logs │  │
         │  └─────────┘  └─────────┘  └─────┘  │
         │            MongoDB Atlas              │
         └───────────────────────────────────────┘
```

## Component Details

### 1. Frontend (Next.js 14)

**Technology Stack:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Axios for API calls

**Pages:**
- `/` - Landing page with feature showcase
- `/dashboard` - User dashboard with repository list
- `/repository/[id]` - Repository details and commit history

**Key Features:**
- Server-side rendering (SSR)
- Client-side routing
- Responsive design
- Real-time updates
- JWT token management

**Data Flow:**
```
User Action → API Call (Axios) → Backend → Response → State Update → UI Render
```

### 2. Backend (Node.js + Express)

**Technology Stack:**
- Node.js 18+
- Express.js
- TypeScript
- Mongoose (MongoDB ODM)
- JWT for authentication
- node-cron for scheduling

**Layers:**

#### A. Routes Layer
- `auth.routes.ts` - Authentication endpoints
- `repository.routes.ts` - Repository management
- `automation.routes.ts` - Automation controls

#### B. Service Layer
- `github.service.ts` - GitHub API interactions
- `ai.service.ts` - Gemini AI integration
- `scheduler.service.ts` - Automation scheduling

#### C. Middleware Layer
- `auth.middleware.ts` - JWT verification
- `errorHandler.ts` - Global error handling

#### D. Model Layer
- `User.model.ts` - User schema
- `Repository.model.ts` - Repository schema
- `CommitLog.model.ts` - Commit log schema

**Request Flow:**
```
Request → Middleware (Auth) → Route Handler → Service → Database → Response
```

### 3. Database (MongoDB)

**Schema Design:**

#### Users Collection
```javascript
{
  _id: ObjectId,
  githubId: String (unique),
  username: String,
  email: String,
  avatarUrl: String,
  accessToken: String (encrypted),
  createdAt: Date,
  updatedAt: Date
}
```

#### Repositories Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  githubRepoId: Number,
  name: String,
  fullName: String,
  description: String,
  owner: String,
  isPrivate: Boolean,
  defaultBranch: String,
  automationEnabled: Boolean,
  lastAutomationRun: Date,
  automationSchedule: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### CommitLogs Collection
```javascript
{
  _id: ObjectId,
  repositoryId: ObjectId (ref: Repository),
  commitSha: String,
  commitMessage: String,
  filesChanged: [String],
  aiAnalysis: String,
  status: String (success|failed),
  errorMessage: String,
  createdAt: Date
}
```

**Indexes:**
- Users: `githubId` (unique)
- Repositories: `userId + githubRepoId` (compound unique)
- CommitLogs: `repositoryId + createdAt` (compound)

## Data Flow Diagrams

### Authentication Flow

```
┌──────┐                   ┌──────────┐                 ┌────────┐
│Client│                   │ Backend  │                 │ GitHub │
└──┬───┘                   └────┬─────┘                 └───┬────┘
   │                            │                           │
   │ 1. Click "Login"           │                           │
   │──────────────────────────> │                           │
   │                            │                           │
   │ 2. Get OAuth URL           │                           │
   │ <────────────────────────  │                           │
   │                            │                           │
   │ 3. Redirect to GitHub      │                           │
   │ ──────────────────────────────────────────────────────>│
   │                            │                           │
   │ 4. User authorizes         │                           │
   │ <──────────────────────────────────────────────────────│
   │                            │                           │
   │ 5. Callback with code      │                           │
   │──────────────────────────> │                           │
   │                            │                           │
   │                            │ 6. Exchange code for token│
   │                            │──────────────────────────>│
   │                            │                           │
   │                            │ 7. Return access token    │
   │                            │<──────────────────────────│
   │                            │                           │
   │                            │ 8. Save user to DB        │
   │                            │                           │
   │ 9. Redirect with JWT       │                           │
   │ <────────────────────────  │                           │
```

### Automation Flow

```
┌─────────┐         ┌─────────┐         ┌────────┐         ┌─────────┐
│Scheduler│         │ Backend │         │ GitHub │         │ Gemini  │
└────┬────┘         └────┬────┘         └───┬────┘         └────┬────┘
     │                   │                   │                   │
     │ 1. Cron triggers  │                   │                   │
     │─────────────────> │                   │                   │
     │                   │                   │                   │
     │                   │ 2. Fetch repos    │                   │
     │                   │ with automation   │                   │
     │                   │ enabled           │                   │
     │                   │                   │                   │
     │                   │ 3. Get repo data  │                   │
     │                   │ ─────────────────>│                   │
     │                   │                   │                   │
     │                   │ 4. Return content │                   │
     │                   │ <─────────────────│                   │
     │                   │                   │                   │
     │                   │ 5. Analyze with AI│                   │
     │                   │ ──────────────────────────────────────>│
     │                   │                   │                   │
     │                   │ 6. Return improvement suggestion      │
     │                   │ <──────────────────────────────────────│
     │                   │                   │                   │
     │                   │ 7. Commit changes │                   │
     │                   │ ─────────────────>│                   │
     │                   │                   │                   │
     │                   │ 8. Confirm commit │                   │
     │                   │ <─────────────────│                   │
     │                   │                   │                   │
     │                   │ 9. Log to DB      │                   │
     │                   │                   │                   │
```

## Security Architecture

### Authentication Layer
```
Client Request
    │
    ├─> JWT Token in Header
    │
    ├─> Middleware: Verify Token
    │       │
    │       ├─> Valid → Continue
    │       └─> Invalid → 401 Unauthorized
    │
    └─> Protected Route Handler
```

### Data Protection
- All sensitive data in environment variables
- GitHub tokens encrypted in database
- JWT tokens with expiration
- HTTPS in production
- CORS configured for frontend only

## Scalability Considerations

### Horizontal Scaling
- Stateless backend servers
- Load balancer distribution
- Shared session store (Redis)
- CDN for static assets

### Database Scaling
- MongoDB replica sets
- Sharding for large datasets
- Indexing for query performance
- Connection pooling

### Caching Strategy
- API response caching
- Database query caching
- CDN for frontend assets
- Redis for session data

## Performance Optimizations

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Static page generation
- Client-side caching

### Backend
- Connection pooling
- Query optimization
- Async operations
- Batch processing
- Rate limiting

### Database
- Indexed queries
- Projection (select only needed fields)
- Aggregation pipeline
- Connection pooling

## Monitoring & Logging

### Application Logs
- Winston logger
- Different log levels (error, warn, info, debug)
- File-based logging
- Console output in development

### Metrics to Monitor
- API response times
- Error rates
- Database query performance
- Active users
- Automation success rate

## Error Handling Strategy

```
Error Occurs
    │
    ├─> Service Layer: Try-Catch
    │       │
    │       └─> Log Error
    │
    ├─> Middleware: Error Handler
    │       │
    │       ├─> Format Error
    │       └─> Send Response
    │
    └─> Client: Display Error Message
```

## Testing Strategy (Recommended)

### Unit Tests
- Service functions
- Utility functions
- Model validation

### Integration Tests
- API endpoints
- Database operations
- External API calls

### End-to-End Tests
- User flows
- Authentication
- Repository operations

## Future Enhancements

1. **Real-time Updates**
   - WebSocket integration
   - Live commit notifications

2. **Advanced AI Features**
   - Code review suggestions
   - Bug detection
   - Security scanning

3. **Multi-user Collaboration**
   - Team workspaces
   - Shared repositories
   - Permission management

4. **Analytics Dashboard**
   - Commit statistics
   - AI improvement metrics
   - Repository health scores

5. **Mobile Application**
   - React Native app
   - Push notifications
   - Mobile-optimized UI

## Conclusion

This architecture provides a solid foundation for a scalable, secure, and maintainable application. The modular design allows for easy updates and feature additions while maintaining code quality and performance.
