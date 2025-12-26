# AI Coding Workspace - Architecture Document

## 🏗️ System Overview

This document outlines the architecture for transforming the GitHub Automation platform into a full-featured AI Coding Workspace similar to VS Code + GitHub Copilot Workspace.

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┬────────────────────────┬──────────────────┐  │
│  │   Sidebar    │    Main Editor Panel   │   AI Panel       │  │
│  │              │                        │                  │  │
│  │  File        │  Monaco Editor         │  Prompt Input    │  │
│  │  Explorer    │  (VS Code-like)        │                  │  │
│  │              │                        │  Agent Logs      │  │
│  │  Tree View   │  Tabs for open files   │                  │  │
│  │              │                        │  Action Buttons  │  │
│  │  Search      │  Syntax highlighting   │                  │  │
│  │              │                        │  Diff Preview    │  │
│  │              │  IntelliSense          │                  │  │
│  └──────────────┴────────────────────────┴──────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Diff Viewer Modal (Split View)                 │ │
│  │  Before (Original)  |  After (AI Modified)                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ API Calls
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  Auth Service    │  │  GitHub Service  │  │  AI Service  │ │
│  │  - OAuth Flow    │  │  - Fetch Repos   │  │  - Analyze   │ │
│  │  - JWT Tokens    │  │  - File Tree     │  │  - Modify    │ │
│  │                  │  │  - Read Files    │  │  - Verify    │ │
│  │                  │  │  - Commit/Push   │  │              │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              AI Agent (Agentic Workflow)                  │  │
│  │  1. Understand repo structure                             │  │
│  │  2. Identify affected files                               │  │
│  │  3. Create modification plan                              │  │
│  │  4. Generate safe, minimal changes                        │  │
│  │  5. Return diff format                                    │  │
│  │  6. Wait for approval                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                      ┌───────────────┐
                      │  GitHub API   │
                      │  - OAuth      │
                      │  - Repos      │
                      │  - Contents   │
                      │  - Commits    │
                      └───────────────┘
```

## 🗂️ Project Structure

```
GitHub Automation/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── errorHandler.ts
│   │   ├── models/
│   │   │   ├── User.model.ts
│   │   │   ├── Repository.model.ts
│   │   │   ├── CommitLog.model.ts
│   │   │   └── WorkspaceSession.model.ts        [NEW]
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── repository.routes.ts
│   │   │   ├── automation.routes.ts
│   │   │   └── workspace.routes.ts              [NEW]
│   │   ├── services/
│   │   │   ├── ai.service.ts
│   │   │   ├── github.service.ts
│   │   │   ├── aiAgent.service.ts               [NEW]
│   │   │   └── diffGenerator.service.ts         [NEW]
│   │   └── utils/
│   │       ├── logger.ts
│   │       ├── schedule.util.ts
│   │       └── codeAnalyzer.util.ts             [NEW]
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── repository/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── workspace/
│   │   │       └── [id]/
│   │   │           └── page.tsx                 [NEW]
│   │   ├── components/
│   │   │   ├── FileExplorer.tsx                 [NEW]
│   │   │   ├── CodeEditor.tsx                   [NEW]
│   │   │   ├── AIPanel.tsx                      [NEW]
│   │   │   ├── DiffViewer.tsx                   [NEW]
│   │   │   ├── ApprovalModal.tsx                [NEW]
│   │   │   └── AgentLogs.tsx                    [NEW]
│   │   ├── hooks/
│   │   │   ├── useWorkspace.ts                  [NEW]
│   │   │   └── useFileOperations.ts             [NEW]
│   │   └── types/
│   │       └── workspace.types.ts               [NEW]
│   ├── package.json
│   └── next.config.js
│
└── docs/
    ├── PROJECT_ARCHITECTURE.md                  [THIS FILE]
    ├── API_DOCUMENTATION.md                     [NEW]
    └── WORKSPACE_GUIDE.md                       [NEW]
```

## 🎨 Frontend Components

### 1. Workspace Page (`/workspace/[id]`)
Main IDE-like interface with 3-panel layout:

**Components:**
- `FileExplorer` - Left sidebar with tree view
- `CodeEditor` - Center panel with Monaco Editor
- `AIPanel` - Right panel for AI interaction

### 2. File Explorer Component
```typescript
Features:
- Tree view of repository structure
- Folder expand/collapse
- File selection
- Search functionality
- File icons based on type
- Right-click context menu
```

### 3. Code Editor Component
```typescript
Features:
- Monaco Editor integration
- Syntax highlighting (all major languages)
- IntelliSense
- Multiple tabs
- Line numbers
- Minimap
- Find & Replace
- Keyboard shortcuts (VS Code compatible)
```

### 4. AI Panel Component
```typescript
Features:
- Prompt input textarea
- "Ask AI" button
- Agent status display
- Step-by-step logs
- Modification preview
- Approve/Reject buttons
```

### 5. Diff Viewer Component
```typescript
Features:
- Side-by-side comparison
- Inline diff view option
- Syntax highlighting in diffs
- Line-by-line changes
- Add/remove highlighting
```

## 🔧 Backend Services

### 1. AI Agent Service
```typescript
class AIAgentService {
  // Main workflow
  async processModificationRequest(params): Promise<AgentResult>
  
  // Individual steps
  async analyzeRepository(repoData): Promise<Analysis>
  async identifyAffectedFiles(prompt, structure): Promise<string[]>
  async generateModificationPlan(prompt, files): Promise<Plan>
  async applyChanges(plan, files): Promise<Changes>
  async verifyChanges(changes): Promise<ValidationResult>
  async generateDiff(before, after): Promise<Diff>
}
```

### 2. Diff Generator Service
```typescript
class DiffGeneratorService {
  generateUnifiedDiff(original, modified, filename): string
  generateSplitDiff(original, modified): DiffLine[]
  highlightChanges(diff): HighlightedDiff
}
```

### 3. Enhanced GitHub Service
```typescript
class GitHubService {
  // Existing methods +
  async getFullFileTree(owner, repo, branch): Promise<FileNode[]>
  async readFileContent(owner, repo, path, ref): Promise<string>
  async commitMultipleFiles(owner, repo, changes[], message): Promise<Commit>
  async createBranch(owner, repo, branch, from): Promise<Branch>
}
```

## 🔌 API Routes

### Workspace Routes (`/api/workspace`)

```
GET    /api/workspace/:repoId/tree
       → Get full repository file tree

GET    /api/workspace/:repoId/file?path=<path>
       → Read specific file content

POST   /api/workspace/:repoId/ai-modify
       Body: { prompt: string, files: string[] }
       → Request AI modification

POST   /api/workspace/:repoId/commit
       Body: { changes: Change[], message: string }
       → Commit approved changes

GET    /api/workspace/:repoId/sessions
       → Get workspace sessions

POST   /api/workspace/:repoId/session
       → Create new workspace session
```

## 🤖 AI Agent Workflow

### Step 1: Understanding Phase
```
Input: User prompt + Repository structure
Process:
  1. Parse prompt intent
  2. Identify affected modules
  3. Load relevant files
  4. Understand dependencies
Output: Scope analysis
```

### Step 2: Planning Phase
```
Input: Scope analysis + File contents
Process:
  1. Determine required changes
  2. Identify new files needed
  3. Check for breaking changes
  4. Create modification plan
Output: Detailed plan with file list
```

### Step 3: Execution Phase
```
Input: Modification plan
Process:
  1. Generate new code
  2. Apply minimal changes
  3. Preserve formatting
  4. Maintain imports
  5. Verify syntax
Output: Modified file contents
```

### Step 4: Verification Phase
```
Input: Original + Modified files
Process:
  1. Syntax validation
  2. Import checking
  3. Type checking (if TS)
  4. Generate diffs
Output: Validated changes + Diffs
```

### Step 5: Approval Phase
```
Input: Diffs + Plan summary
Process:
  1. Present to user
  2. Show detailed diffs
  3. Await approval
Output: Approved changes ready for commit
```

## 📊 Data Models

### WorkspaceSession Model
```typescript
{
  _id: ObjectId
  userId: ObjectId
  repositoryId: ObjectId
  openFiles: string[]              // Currently open file paths
  modifiedFiles: Map<string, {     // Unsaved changes
    original: string
    modified: string
    saved: boolean
  }>
  aiHistory: [{
    prompt: string
    timestamp: Date
    changes: Change[]
    status: 'pending' | 'approved' | 'rejected'
  }]
  createdAt: Date
  lastActivity: Date
}
```

### Change Model
```typescript
{
  action: 'create' | 'update' | 'delete'
  filePath: string
  originalContent: string
  newContent: string
  diff: string
  reason: string
}
```

## 🔐 Security Considerations

1. **File Access**
   - Validate all file paths
   - Prevent directory traversal
   - Check file size limits

2. **AI Safety**
   - Validate generated code
   - Block malicious patterns
   - Rate limiting on AI requests

3. **Commit Safety**
   - Always require approval
   - Log all commits
   - Support rollback

4. **Token Security**
   - Encrypt stored tokens
   - Use short-lived sessions
   - Implement token rotation

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Install Monaco Editor
- [ ] Create workspace page layout
- [ ] Build file explorer component
- [ ] Integrate Monaco Editor
- [ ] API routes for file operations

### Phase 2: AI Integration (Week 2)
- [ ] AI Agent service
- [ ] Diff generator
- [ ] AI panel component
- [ ] Agent logs display

### Phase 3: Diff & Approval (Week 3)
- [ ] Diff viewer component
- [ ] Approval workflow
- [ ] Commit integration
- [ ] Session management

### Phase 4: Polish & Features (Week 4)
- [ ] Search functionality
- [ ] Keyboard shortcuts
- [ ] Dark/light themes
- [ ] Performance optimization
- [ ] Error handling
- [ ] Testing

## 📈 Performance Optimization

1. **File Loading**
   - Lazy load file tree
   - Cache file contents
   - Virtualized tree view

2. **Editor Performance**
   - Load files on demand
   - Limit simultaneous tabs
   - Efficient diff calculation

3. **AI Processing**
   - Queue AI requests
   - Batch file analysis
   - Progress indicators

## 🎯 Success Metrics

1. **Functionality**
   - ✅ Edit any file in repository
   - ✅ AI understands context
   - ✅ Accurate diff generation
   - ✅ Safe commit workflow

2. **User Experience**
   - < 2s file load time
   - < 5s AI response time
   - Smooth editor performance
   - Intuitive UI

3. **Quality**
   - No fake commits
   - Meaningful changes only
   - Proper error handling
   - Clear user feedback

---

**Next Steps:** Begin implementation with Phase 1 components.
