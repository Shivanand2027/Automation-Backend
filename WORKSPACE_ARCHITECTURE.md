# AI Coding Workspace - Architecture Document

## 🎯 Project Vision
Transform the GitHub Automation platform into a full-featured, VS Code-like browser-based IDE with Agentic AI capabilities for intelligent code modification.

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │   File     │  │   Code Editor    │  │   AI Agent       │   │
│  │  Explorer  │  │  (Monaco Editor) │  │   Panel          │   │
│  │   Tree     │  │                  │  │                  │   │
│  │            │  │  - Syntax       │  │  - Prompt Input  │   │
│  │ - Folders  │  │    Highlighting │  │  - Agent Logs    │   │
│  │ - Files    │  │  - Autocomplete │  │  - Change Plan   │   │
│  │ - Context  │  │  - Line Numbers │  │  - Approval UI   │   │
│  │   Menu     │  │  - Multi-tab    │  │                  │   │
│  └────────────┘  └──────────────────┘  └──────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Diff Viewer Modal                         │    │
│  │  - Side-by-side comparison                            │    │
│  │  - Inline diff view                                   │    │
│  │  - Accept/Reject changes                              │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↕ REST API
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  File Service    │  │  AI Agent        │  │  GitHub      │ │
│  │                  │  │  Service         │  │  Service     │ │
│  │ - Read files     │  │                  │  │              │ │
│  │ - Write files    │  │ - Code analysis  │  │ - OAuth      │ │
│  │ - Tree structure │  │ - Plan creation  │  │ - Read repo  │ │
│  │ - File search    │  │ - Code mods      │  │ - Commit     │ │
│  │ - Validation     │  │ - Diff gen       │  │ - Push       │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Database (MongoDB)                          │  │
│  │  - User sessions                                         │  │
│  │  - Pending changes (awaiting approval)                   │  │
│  │  - AI interaction logs                                   │  │
│  │  - Workspace state                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐                        │
│  │  GitHub API    │  │  Google Gemini │                        │
│  │  - REST API    │  │  - AI Agent    │                        │
│  │  - GraphQL     │  │  - Code Gen    │                        │
│  └────────────────┘  └────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
github-automation/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.model.ts
│   │   │   ├── Repository.model.ts
│   │   │   ├── CommitLog.model.ts
│   │   │   ├── WorkspaceSession.model.ts          [NEW]
│   │   │   └── PendingChange.model.ts             [NEW]
│   │   │
│   │   ├── services/
│   │   │   ├── ai.service.ts
│   │   │   ├── aiAgent.service.ts                 [NEW]
│   │   │   ├── github.service.ts
│   │   │   ├── fileOperation.service.ts           [NEW]
│   │   │   ├── diffGenerator.service.ts           [NEW]
│   │   │   └── scheduler.service.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── repository.routes.ts
│   │   │   ├── automation.routes.ts
│   │   │   ├── workspace.routes.ts                [NEW]
│   │   │   ├── file.routes.ts                     [NEW]
│   │   │   └── aiAgent.routes.ts                  [NEW]
│   │   │
│   │   └── index.ts
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── repository/[id]/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── workspace/[repoId]/               [NEW]
│   │   │   │   └── page.tsx                      [NEW - Main IDE]
│   │   │   │
│   │   │   └── page.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── workspace/                        [NEW]
│   │   │   │   ├── FileExplorer.tsx             [NEW]
│   │   │   │   ├── CodeEditor.tsx               [NEW]
│   │   │   │   ├── AIAgentPanel.tsx             [NEW]
│   │   │   │   ├── DiffViewer.tsx               [NEW]
│   │   │   │   ├── ApprovalModal.tsx            [NEW]
│   │   │   │   └── WorkspaceLayout.tsx          [NEW]
│   │   │   │
│   │   │   └── ui/
│   │   │
│   │   └── lib/
│   │       └── monaco.ts                         [NEW]
│   │
│   └── package.json
│
└── docs/
    ├── WORKSPACE_ARCHITECTURE.md                 [THIS FILE]
    ├── AI_AGENT_PROMPTS.md                       [NEW]
    └── WORKSPACE_USER_GUIDE.md                   [NEW]
```

## 🔧 Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Code Editor:** Monaco Editor (VS Code engine)
- **Diff Viewer:** react-diff-viewer-continued
- **File Tree:** react-folder-tree or custom component
- **State Management:** React Context + useState/useReducer
- **Styling:** Tailwind CSS
- **Icons:** React Icons

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **AI Provider:** Google Gemini 2.0
- **GitHub Integration:** Octokit (@octokit/rest)
- **Authentication:** JWT + GitHub OAuth

## 🎨 User Interface Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: [Logo] [Repo Name] [Branch] [Save] [Commit] [Back]    │
├────────┬───────────────────────────────────┬────────────────────┤
│        │                                   │                    │
│  File  │        Code Editor               │   AI Agent Panel   │
│ Explor │  ┌──────────────────────────┐    │  ┌──────────────┐ │
│  Tree  │  │ file.ts                 ×│    │  │ Prompt Input │ │
│        │  ├──────────────────────────┤    │  └──────────────┘ │
│ src/   │  │  1 import { ...          │    │                    │
│ ├─comp │  │  2 export function...    │    │  Agent Status:     │
│ │ ├─Btn│  │  3                       │    │  ⚡ Ready          │
│ │ └─Inp│  │  4 async function get... │    │                    │
│ ├─pages│  │  5   const data = ...    │    │  Recent Actions:   │
│ │ ├─hom│  │  6   return data;        │    │  ✓ Analyzed code   │
│ │ └─abo│  │  7 }                     │    │  ✓ Created plan    │
│ └─util │  └──────────────────────────┘    │  ⏳ Waiting...     │
│        │                                   │                    │
│ README │  [Tabs: file1 | file2 | +]       │  [View Diff]      │
│ pkg.json                                   │  [Apply Changes]   │
│        │                                   │  [Reject]          │
└────────┴───────────────────────────────────┴────────────────────┘
```

## 🤖 AI Agent Workflow

### Phase 1: Understanding
```
User Input: "Add input validation to the login form"
         ↓
Agent analyzes:
  1. Current file structure
  2. Finds login form component
  3. Identifies validation libraries used
  4. Reviews existing validation patterns
         ↓
Agent creates PLAN
```

### Phase 2: Planning
```
Plan Output:
┌─────────────────────────────────────────┐
│ MODIFICATION PLAN                       │
├─────────────────────────────────────────┤
│ Goal: Add input validation to login     │
│                                         │
│ Files to modify:                        │
│  1. src/components/LoginForm.tsx        │
│  2. src/utils/validation.ts (create)   │
│                                         │
│ Changes:                                │
│  - Add email validation                 │
│  - Add password strength check          │
│  - Add error message display            │
│  - Create reusable validators           │
│                                         │
│ Dependencies: None                      │
│ Estimated risk: Low                     │
└─────────────────────────────────────────┘
```

### Phase 3: Execution
```
Agent generates:
  1. Modified code for each file
  2. Diff output (before vs after)
  3. Explanation of changes
  4. Suggested commit message
         ↓
Present to user for approval
```

### Phase 4: Approval
```
User reviews:
  - Diff viewer shows changes
  - User can edit if needed
  - User approves or rejects
         ↓
If approved → Commit to GitHub
If rejected → Discard changes
```

## 📡 API Endpoints

### Workspace Endpoints
```
GET    /api/workspace/:repoId/tree
       - Get complete file/folder structure

GET    /api/workspace/:repoId/file/:path
       - Read file contents

PUT    /api/workspace/:repoId/file/:path
       - Write file contents

POST   /api/workspace/:repoId/create
       - Create new file/folder

DELETE /api/workspace/:repoId/file/:path
       - Delete file

GET    /api/workspace/:repoId/search?q=query
       - Search files by name or content
```

### AI Agent Endpoints
```
POST   /api/agent/:repoId/analyze
       - Analyze repository structure

POST   /api/agent/:repoId/plan
       - Create modification plan from prompt

POST   /api/agent/:repoId/execute
       - Execute plan and generate diffs

POST   /api/agent/:repoId/approve
       - Approve and commit changes

POST   /api/agent/:repoId/reject
       - Reject pending changes

GET    /api/agent/:repoId/status
       - Get agent status and logs
```

### File Operations
```
POST   /api/files/:repoId/diff
       - Generate diff between two versions

POST   /api/files/:repoId/commit
       - Commit changes to GitHub

GET    /api/files/:repoId/history/:path
       - Get file commit history
```

## 🔐 Security Model

### Token Management
```
1. GitHub OAuth token stored in JWT
2. Refresh token for long sessions
3. Token encryption at rest
4. Per-request token validation
5. Automatic token refresh before expiry
```

### Code Safety
```
1. Validate all file paths (prevent directory traversal)
2. Sanitize file contents
3. Limit file size (10MB max)
4. Rate limit AI requests
5. Validate commit messages
6. Prevent force pushes
```

### Change Approval
```
1. Never auto-commit without approval
2. Show complete diff before commit
3. Allow user to edit AI-generated code
4. Validate syntax before commit
5. Ensure meaningful commit messages
```

## 🎯 Key Features

### 1. File Explorer
- Tree view of entire repository
- Expand/collapse folders
- Click to open files
- Right-click context menu
- Search/filter files
- Create/rename/delete files

### 2. Code Editor (Monaco)
- Full VS Code editing experience
- Syntax highlighting for 100+ languages
- Intelligent autocomplete
- Multi-cursor editing
- Find & replace
- Multi-tab support
- Keyboard shortcuts

### 3. AI Agent
- Natural language understanding
- Repository-aware suggestions
- Planning before execution
- Explanation of changes
- Multiple file modifications
- Dependency awareness
- Safe, minimal changes

### 4. Diff Viewer
- Side-by-side comparison
- Inline diff view
- Syntax-highlighted diffs
- Line-by-line changes
- Accept/reject hunks
- File-level approval

### 5. Commit Workflow
- Review all changes
- Edit commit message
- Select files to commit
- Push to GitHub
- View commit status
- Link to GitHub commit

## 📊 Data Models

### WorkspaceSession
```typescript
{
  userId: ObjectId,
  repositoryId: ObjectId,
  currentBranch: string,
  openFiles: [{ path: string, content: string, modified: boolean }],
  lastActivity: Date,
  activeAgentTask: ObjectId | null
}
```

### PendingChange
```typescript
{
  workspaceSessionId: ObjectId,
  filePath: string,
  originalContent: string,
  modifiedContent: string,
  diff: string,
  aiPrompt: string,
  agentPlan: string,
  status: 'pending' | 'approved' | 'rejected',
  createdAt: Date
}
```

### AgentLog
```typescript
{
  workspaceSessionId: ObjectId,
  action: string,
  prompt: string,
  plan: string,
  filesModified: [string],
  success: boolean,
  errorMessage: string | null,
  timestamp: Date
}
```

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- ✅ Install Monaco Editor
- ✅ Create workspace page layout
- ✅ Implement file tree structure
- ✅ Basic file read/write API

### Phase 2: Editor Integration (Week 2)
- ✅ Monaco Editor component
- ✅ Multi-tab support
- ✅ Syntax highlighting
- ✅ Save functionality

### Phase 3: AI Agent (Week 3)
- ✅ AI Agent service
- ✅ Repository analysis
- ✅ Plan generation
- ✅ Code modification logic

### Phase 4: Diff & Approval (Week 4)
- ✅ Diff viewer component
- ✅ Approval workflow
- ✅ Commit integration
- ✅ Error handling

### Phase 5: Polish & Testing (Week 5)
- ✅ UI/UX improvements
- ✅ Performance optimization
- ✅ Security audit
- ✅ User testing

## 💡 AI Agent Prompting Strategy

### System Prompt
```
You are a professional software engineer AI agent integrated into a VS Code-like
IDE. Your role is to help users modify their code safely and intelligently.

RULES:
1. Always analyze the full context before making changes
2. Create a clear plan before modifying code
3. Make minimal, targeted changes
4. Preserve existing code style and patterns
5. Explain your reasoning
6. Never delete unrelated code
7. Validate syntax and imports
8. Generate meaningful commit messages

OUTPUT FORMAT:
{
  "plan": "Step-by-step modification plan",
  "changes": [
    {
      "file": "path/to/file",
      "action": "create|update|delete",
      "reason": "Why this change is needed",
      "originalContent": "...",
      "modifiedContent": "...",
      "diff": "unified diff format"
    }
  ],
  "commitMessage": "Clear, conventional commit message",
  "risk": "low|medium|high",
  "explanation": "Overall summary of changes"
}
```

## 📚 User Experience Flow

### 1. Select Repository
```
Dashboard → Click "Open in Workspace" → Workspace IDE loads
```

### 2. Browse Files
```
File Explorer → Click file → Opens in editor → Edit code
```

### 3. AI-Assisted Coding
```
Type prompt → Agent analyzes → Shows plan → Generates code →
User reviews diff → Approves → Commits to GitHub
```

### 4. Manual Editing
```
Edit code → Save → View changes → Commit manually
```

## ⚡ Performance Considerations

- Lazy-load file contents (don't load entire repo)
- Cache file tree structure
- Debounce AI requests
- Implement virtual scrolling for large files
- Use web workers for diff calculation
- Optimize Monaco Editor bundle size

## 🔮 Future Enhancements

- Real-time collaboration (multiple users)
- Git branch management UI
- Pull request creation
- Code review comments
- Terminal integration
- Debugging support
- Extensions/plugins system
- Workspace templates

---

**Status:** Architecture Approved ✅  
**Next Step:** Begin Phase 1 Implementation
