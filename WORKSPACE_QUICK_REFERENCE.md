# 🎯 AI Workspace - Quick Reference

## 🚀 Opening the Workspace
1. Dashboard → Select Repository → Click "🚀 Open in Workspace"
2. Direct URL: `http://localhost:3000/workspace/[REPO_ID]`

## 🎨 Interface Layout

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Dashboard    owner/repo-name (branch)        │
├──────────┬──────────────────────────┬───────────────────┤
│          │                          │                   │
│  FILE    │      CODE EDITOR         │   AI AGENT        │
│ EXPLORER │     (Monaco)             │   PANEL           │
│          │                          │                   │
│  📁 src  │  Tab1  Tab2  Tab3  ×     │  🤖 Prompt        │
│  ├─ 📄   │  ┌──────────────────┐    │  ┌─────────────┐ │
│  ├─ 📄   │  │ Your code here   │    │  │ Enter       │ │
│  └─ 📁   │  │ with syntax      │    │  │ prompt...   │ │
│          │  │ highlighting     │    │  └─────────────┘ │
│          │  └──────────────────┘    │  [Submit]       │
│          │                          │                   │
│          │                          │  📊 Activity Log  │
│          │                          │  • Analysis...    │
└──────────┴──────────────────────────┴───────────────────┘
```

## 🔧 File Explorer (Left Panel)

### Actions
- **Click folder** → Expand/collapse
- **Click file** → Open in editor
- **Blue highlight** → Currently active file

### Icons
- 📁 Folder (closed)
- 📂 Folder (open)
- 📄 Generic file
- 🟨 JavaScript/JSX
- 🔷 TypeScript/TSX/React
- 🐍 Python
- 🟧 HTML
- 🔵 CSS/SCSS

## 💻 Code Editor (Center Panel)

### Features
- **Multi-tab editing** - Open multiple files at once
- **Syntax highlighting** - Automatic language detection
- **Line numbers** - Easy navigation
- **Minimap** - Quick file overview
- **IntelliSense** - Code completion
- **Undo/Redo** - Ctrl+Z / Ctrl+Y

### Tab Actions
- **Click tab** → Switch to that file
- **Click ×** → Close tab (auto-saves changes)
- **Blue dot** → File has unsaved changes

### Keyboard Shortcuts
- `Ctrl + S` → Save current file
- `Ctrl + F` → Find in file
- `Ctrl + H` → Find and replace
- `Ctrl + Z` → Undo
- `Ctrl + Y` → Redo
- `Ctrl + /` → Toggle comment
- `Tab` → Indent
- `Shift + Tab` → Outdent

## 🤖 AI Agent Panel (Right Panel)

### Prompt Input
1. Type your request in the textarea
2. Click "Submit Prompt" or press Ctrl+Enter
3. Wait for AI to analyze repository
4. Review changes in diff viewer
5. Approve or reject

### Activity Log
- 🤖 **Info** (blue) - General updates
- ✅ **Success** (green) - Completed actions
- ⚠️ **Warning** (yellow) - Cautions
- ❌ **Error** (red) - Failed operations

### Example Prompts

#### Simple Changes
```
Add error handling to the login function
```

```
Fix the indentation in auth.service.ts
```

```
Add JSDoc comments to all exported functions
```

#### Medium Changes
```
Create a new user profile component with form validation
```

```
Refactor the database queries to use async/await
```

```
Add input validation to all API endpoints
```

#### Advanced Changes
```
Implement unit tests for the authentication service with Jest
```

```
Refactor this code to follow SOLID principles and add TypeScript types
```

```
Create a new feature: user settings page with dark mode toggle
```

## 📊 Diff Viewer (Modal)

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  Review Changes                        [RISK: LOW]       │
│  Commit: Add error handling to auth                      │
│  Agent Plan: Will add try-catch blocks to...             │
├─────────────────────────────────────────────────────────┤
│  [Tab: file1.ts]  [Tab: file2.ts]  [Tab: file3.ts]      │
├──────────────────────────┬──────────────────────────────┤
│  BEFORE (Original)       │  AFTER (Modified)            │
│  ┌──────────────────────┐│┌──────────────────────────┐ │
│  │ - Old code           ││││ + New code               │ │
│  │ - Removed lines      ││││ + Added lines            │ │
│  │   Unchanged lines    ││││   Unchanged lines        │ │
│  └──────────────────────┘│└──────────────────────────┘ │
├──────────────────────────┴──────────────────────────────┤
│  2 files will be modified                [Reject] [✓ Approve] │
└─────────────────────────────────────────────────────────┘
```

### Risk Levels
- 🟢 **LOW** - Minor changes, low impact
- 🟡 **MEDIUM** - Moderate changes, some risk
- 🔴 **HIGH** - Major changes, high impact

### Actions
- **Reject** → Discard all changes
- **Approve & Commit** → Commit changes to GitHub

### Color Coding
- 🔴 **Red** - Deleted lines
- 🟢 **Green** - Added lines
- ⚪ **White** - Unchanged lines

## 🔄 Workflow Examples

### Example 1: Edit a File Manually
1. Click file in explorer → Opens in editor
2. Make changes → Blue dot appears on tab
3. Close tab → Auto-saves to GitHub
4. Done!

### Example 2: Use AI to Modify Code
1. Click "Open in Workspace"
2. Type prompt: "Add error handling to login"
3. Click Submit → AI analyzes
4. Review diff viewer → See before/after
5. Click Approve → Changes committed
6. Done!

### Example 3: Create New Feature with AI
1. Open workspace
2. Type prompt: "Create new user settings page"
3. Submit → AI generates multiple files
4. Review all changes in diff tabs
5. Approve → New feature created
6. Done!

## 💡 Tips & Tricks

### For Better AI Results
✅ **Be specific** - "Add error handling to login function" > "Improve code"
✅ **Mention files** - "In auth.service.ts, add validation"
✅ **Provide context** - "Create a React component with TypeScript"
✅ **One task at a time** - Don't combine multiple unrelated changes

### For Faster Workflow
✅ **Use keyboard shortcuts** - Ctrl+S, Ctrl+F, etc.
✅ **Keep relevant files open** - Use tabs for quick switching
✅ **Review AI plans** - Read the modification plan before approving
✅ **Start small** - Test with minor changes first

### For Safety
✅ **Always review diffs** - Check what the AI is changing
✅ **Check risk level** - Be cautious with HIGH risk changes
✅ **Test after commits** - Verify changes work as expected
✅ **Use version control** - GitHub keeps all versions

## 🐛 Common Issues

### Files Not Loading
**Problem**: Explorer is empty or files won't open
**Solution**:
1. Check backend console for errors
2. Verify GitHub token has read permissions
3. Try refreshing the page
4. Check repository is properly connected

### Monaco Editor Not Working
**Problem**: Editor not rendering or syntax highlighting missing
**Solution**:
1. Clear browser cache
2. Check console for Monaco errors
3. Verify @monaco-editor/react is installed
4. Try a different browser

### AI Not Responding
**Problem**: Submit button clicked but nothing happens
**Solution**:
1. Check backend has Gemini API key
2. Verify internet connection
3. Check backend console for AI service errors
4. Try a simpler prompt first

### Changes Not Committing
**Problem**: Approved changes but not appearing on GitHub
**Solution**:
1. Check GitHub token has write permissions
2. Verify branch is not protected
3. Check backend logs for commit errors
4. Ensure repository is not archived

## 📚 API Reference (For Developers)

### Workspace Endpoints
```
GET  /api/workspace/:repoId/tree           - Get file tree
GET  /api/workspace/:repoId/file/:path     - Read file
PUT  /api/workspace/:repoId/file/:path     - Write file
GET  /api/workspace/:repoId/session        - Get session
PUT  /api/workspace/:repoId/session        - Update session
```

### AI Agent Endpoints
```
POST /api/agent/:repoId/plan               - Create AI plan
POST /api/agent/:repoId/approve/:changeId  - Approve changes
POST /api/agent/:repoId/reject/:changeId   - Reject changes
GET  /api/agent/:repoId/pending            - Get pending changes
```

## 🎯 Success Metrics

### You'll Know It's Working When:
✅ File tree loads in left panel
✅ Files open in Monaco editor
✅ Syntax highlighting appears
✅ Tabs show when multiple files open
✅ AI prompts generate diff viewers
✅ Approved changes appear on GitHub
✅ Activity log shows real-time updates

## 🚀 Performance Tips

### For Large Repositories
- Only open files you need
- Close unused tabs
- Use AI for specific files/directories
- Consider breaking large changes into smaller ones

### For Better AI Performance
- Be specific about which files to modify
- Provide context about the codebase
- Use smaller, focused prompts
- Review and iterate on changes

## 📞 Need Help?

### Documentation Files
- `WORKSPACE_README.md` - Feature overview
- `WORKSPACE_ARCHITECTURE.md` - Technical details
- `IMPLEMENTATION_GUIDE.md` - Code examples
- `WORKSPACE_SETUP_COMPLETE.md` - Setup guide

### Check Status
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- MongoDB: mongodb://localhost:27017

---

**Happy coding with AI! 🚀**

*Pro tip: Start with simple prompts like "Add comments to this file" to get familiar with the workflow!*
