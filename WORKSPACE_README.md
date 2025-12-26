# 🚀 AI Workspace Feature

## Overview
The AI Workspace is a **VS Code-like browser-based IDE** built directly into your GitHub Automation platform. It allows you to browse repository files, edit code with syntax highlighting, and use an AI agent to make intelligent code modifications with a review-and-approve workflow.

## ✨ Features

### 1. **File Explorer**
- 📁 Hierarchical tree view of your repository
- 🔍 Expand/collapse folders
- 🎨 File type icons (JS, TS, Python, HTML, CSS, etc.)
- 📂 Click to open files in the editor

### 2. **Code Editor (Monaco)**
- 💻 Powered by VS Code's Monaco Editor
- 🎨 Syntax highlighting for 30+ languages
- 🔢 Line numbers, minimap, and IntelliSense
- 📑 Multi-tab support for multiple files
- 💾 Auto-save on close (modified files)
- ⌨️ Full keyboard shortcuts (Ctrl+S, Ctrl+F, etc.)

### 3. **AI Agent Panel**
- 🤖 Natural language prompts for code changes
- 📊 Real-time activity logs
- ⚡ Smart code analysis and planning
- 🎯 Context-aware modifications

### 4. **Diff Viewer**
- 👀 Side-by-side comparison (before/after)
- ✅ Approve or reject changes
- 📝 View AI's modification plan
- ⚠️ Risk level indicator (Low/Medium/High)
- 🔄 Review multiple file changes

## 🎯 How to Use

### Opening the Workspace
1. Go to your **Dashboard**
2. Find a connected repository
3. Click **"🚀 Open in Workspace"**
4. The workspace will load your repository files

### Editing Files
1. **Click a file** in the explorer (left panel)
2. **Edit** in the Monaco editor (center panel)
3. **Close tab** to auto-save changes
4. **Switch tabs** to work on multiple files

### Using the AI Agent
1. **Enter a prompt** in the AI Agent panel (right panel):
   - Example: *"Add error handling to the login function"*
   - Example: *"Create a new user profile component"*
   - Example: *"Refactor the database connection code"*
2. **Click Submit** - The AI will analyze your repository
3. **Review the Diff** - A modal shows proposed changes
4. **Approve or Reject**:
   - ✅ **Approve** → Changes are committed to GitHub
   - ❌ **Reject** → Changes are discarded

## 🔧 Technical Stack

### Frontend
- **Next.js 14** (React App Router)
- **Monaco Editor** (`@monaco-editor/react`)
- **react-split** (Resizable panels)
- **react-diff-viewer-continued** (Diff visualization)
- **Tailwind CSS** (Styling)
- **React Icons** (UI icons)

### Backend
- **Express.js** (REST API)
- **TypeScript** (Type safety)
- **Google Gemini AI** (Code analysis and generation)
- **Octokit** (GitHub REST API)
- **diff library** (Unified diff generation)
- **MongoDB** (Session and change tracking)

## 📦 Data Models

### WorkspaceSession
Tracks your active IDE session:
```typescript
{
  userId: ObjectId,
  repositoryId: ObjectId,
  currentBranch: string,
  openFiles: [{ path, lastAccessed }],
  lastActivity: Date,
  activeAgentTask: ObjectId | null
}
```

### PendingChange
Stores AI-generated changes awaiting approval:
```typescript
{
  workspaceSessionId: ObjectId,
  userId: ObjectId,
  repositoryId: ObjectId,
  aiPrompt: string,
  agentPlan: string,
  changes: [{
    path: string,
    oldContent: string,
    newContent: string,
    operation: 'create' | 'modify' | 'delete',
    diff: string
  }],
  commitMessage: string,
  riskLevel: 'low' | 'medium' | 'high',
  status: 'pending' | 'approved' | 'rejected' | 'committed'
}
```

## 🛣️ API Endpoints

### Workspace Routes (`/api/workspace/:repoId`)
- `GET /tree` - Get file tree structure
- `GET /file/:path` - Read file content
- `PUT /file/:path` - Write file content
- `GET /session` - Get current session
- `PUT /session` - Update session state

### AI Agent Routes (`/api/agent/:repoId`)
- `POST /plan` - Create modification plan from prompt
- `POST /approve/:changeId` - Approve and commit changes
- `POST /reject/:changeId` - Reject changes
- `GET /pending` - Get pending changes

## 🎨 UI Components

### FileExplorer.tsx
- Recursive tree rendering
- Expand/collapse state management
- File/folder icons
- Current file highlighting

### CodeEditor.tsx
- Monaco editor integration
- Tab management
- Syntax highlighting
- Modified indicator
- Auto-save on close

### AIAgentPanel.tsx
- Prompt input textarea
- Activity log display
- Processing state
- Example prompts

### DiffViewer.tsx
- Side-by-side diff view
- Multi-file tab navigation
- Approve/reject buttons
- Risk level badge
- Agent plan display

## 🚀 Example Workflows

### Workflow 1: Add Error Handling
1. Open repository in workspace
2. Browse to `auth.service.ts`
3. Submit prompt: *"Add try-catch error handling to all async functions"*
4. Review generated diffs
5. Approve → Changes committed automatically

### Workflow 2: Create New Feature
1. Open repository in workspace
2. Submit prompt: *"Create a new user profile page component with form validation"*
3. AI generates new files and modifications
4. Review all changes in diff viewer
5. Approve → New files created and committed

### Workflow 3: Refactor Code
1. Open repository in workspace
2. Browse to messy code file
3. Submit prompt: *"Refactor this code to use TypeScript interfaces and clean up the logic"*
4. Review refactored code
5. Approve → Cleaner code committed

## 🔒 Security Features
- ✅ JWT authentication for all requests
- ✅ User can only access their own repositories
- ✅ Repository permissions verified via GitHub API
- ✅ Risk level assessment for AI changes
- ✅ Manual approval required before commits
- ✅ Audit trail in PendingChange model

## 📊 AI Agent Capabilities

### What the AI Can Do:
- ✅ Analyze entire repository structure
- ✅ Understand code context and dependencies
- ✅ Generate new files
- ✅ Modify existing files
- ✅ Delete obsolete files
- ✅ Create unified diffs
- ✅ Write meaningful commit messages
- ✅ Assess risk level of changes

### AI Workflow:
1. **Analyze** - Scans repository and understands structure
2. **Plan** - Creates detailed modification plan
3. **Generate** - Produces code changes with diffs
4. **Wait** - Pauses for human approval
5. **Commit** - Applies approved changes to GitHub

## 🎯 Performance Optimizations
- Lazy loading of file content (only when opened)
- Incremental file tree loading
- Monaco editor's virtual scrolling
- Diff calculation on backend
- Session state persistence
- Optimistic UI updates

## 🐛 Troubleshooting

### Monaco Editor Not Loading
- Check console for errors
- Verify `@monaco-editor/react` installed
- Clear browser cache

### Files Not Showing
- Verify repository is connected
- Check GitHub token permissions
- Review backend logs for API errors

### AI Agent Not Responding
- Verify Gemini API key is set
- Check backend logs for AI service errors
- Ensure repository has readable files

### Diff Viewer Issues
- Verify `react-diff-viewer-continued` installed
- Check pending changes in database
- Review API response structure

## 📚 Future Enhancements
- [ ] Terminal integration
- [ ] Git operations (branch, merge, pull)
- [ ] Real-time collaboration
- [ ] Code search and replace
- [ ] Integrated debugging
- [ ] Extension marketplace
- [ ] Custom themes
- [ ] Keyboard shortcuts customization

## 🤝 Contributing
This workspace feature is built to be extensible. Contributions are welcome for:
- New editor features
- AI capabilities
- UI improvements
- Performance optimizations

---

**Built with ❤️ using VS Code's Monaco Editor and Google Gemini AI**
