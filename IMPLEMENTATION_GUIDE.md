# AI Coding Workspace - Implementation Guide

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+
MongoDB running locally or cloud instance
GitHub OAuth App (for authentication)
Google Gemini API Key
```

### Installation

#### 1. Install Frontend Dependencies
```bash
cd frontend
npm install

# New packages added:
# - @monaco-editor/react: VS Code editor component
# - react-diff-viewer-continued: Diff viewer
# - react-split: Resizable panels
# - monaco-editor: Code editor engine
```

#### 2. Install Backend Dependencies
```bash
cd backend
npm install

# New packages added:
# - @octokit/rest: GitHub API client
# - diff: Diff generation library
```

## 📦 What's Been Created

### Backend Services (✅ Complete)
1. **AIAgentService** - `backend/src/services/aiAgent.service.ts`
   - Analyzes repository structure
   - Creates modification plans
   - Validates code syntax
   - Refines changes based on feedback

2. **DiffGeneratorService** - `backend/src/services/diffGenerator.service.ts`
   - Generates unified diffs
   - Calculates diff statistics
   - Formats diffs for display

### Data Models (✅ Complete)
1. **WorkspaceSession** - `backend/src/models/WorkspaceSession.model.ts`
   - Tracks open files
   - Stores workspace state
   - Links to active tasks

2. **PendingChange** - `backend/src/models/PendingChange.model.ts`
   - Stores AI-generated changes
   - Tracks approval status
   - Contains diffs and explanations

## 🎯 Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)

#### Step 1.1: File Operations Service
Create `backend/src/services/fileOperation.service.ts`:

```typescript
import { githubService } from './github.service';

export class FileOperationService {
  /**
   * Read single file from repository
   */
  async readFile(owner: string, repo: string, path: string, token: string) {
    return await githubService.getFileContent(owner, repo, path, token);
  }

  /**
   * Write file to repository
   */
  async writeFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string,
    token: string,
    sha?: string
  ) {
    if (sha) {
      return await githubService.updateFile(
        owner, repo, path, content, message, sha, branch, token
      );
    } else {
      return await githubService.createFile(
        owner, repo, path, content, message, branch, token
      );
    }
  }

  /**
   * Get full repository tree
   */
  async getTree(owner: string, repo: string, branch: string, token: string) {
    return await githubService.getRepositoryTree(owner, repo, branch, token);
  }
}

export const fileOperationService = new FileOperationService();
```

#### Step 1.2: Workspace Routes
Create `backend/src/routes/workspace.routes.ts`:

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { fileOperationService } from '../services/fileOperation.service';

const router = Router();

// Get file tree
router.get('/:repoId/tree', authenticate, async (req, res) => {
  // Implementation
});

// Read file
router.get('/:repoId/file/*', authenticate, async (req, res) => {
  // Implementation
});

// Write file
router.put('/:repoId/file/*', authenticate, async (req, res) => {
  // Implementation
});

export default router;
```

#### Step 1.3: AI Agent Routes
Create `backend/src/routes/aiAgent.routes.ts`:

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { aiAgentService } from '../services/aiAgent.service';
import { PendingChange } from '../models/PendingChange.model';

const router = Router();

// Create modification plan
router.post('/:repoId/plan', authenticate, async (req, res) => {
  const { prompt } = req.body;
  // 1. Fetch relevant files
  // 2. Call aiAgentService.createModificationPlan()
  // 3. Save to PendingChange model
  // 4. Return plan to frontend
});

// Approve and commit changes
router.post('/:repoId/approve/:changeId', authenticate, async (req, res) => {
  // 1. Load PendingChange
  // 2. Apply changes to GitHub
  // 3. Update status to 'committed'
});

// Reject changes
router.post('/:repoId/reject/:changeId', authenticate, async (req, res) => {
  // Update status to 'rejected'
});

export default router;
```

### Phase 2: Frontend Components (Week 2)

#### Step 2.1: File Explorer Component
Create `frontend/src/components/workspace/FileExplorer.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaChevronRight, FaChevronDown } from 'react-icons/fa';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileExplorerProps {
  files: FileNode[];
  onFileClick: (path: string) => void;
}

export default function FileExplorer({ files, onFileClick }: FileExplorerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expanded.has(node.path);
    const paddingLeft = `${level * 16}px`;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <div
            className="flex items-center gap-2 px-2 py-1 hover:bg-gray-700 cursor-pointer"
            style={{ paddingLeft }}
            onClick={() => toggleFolder(node.path)}
          >
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
            {isExpanded ? <FaFolderOpen className="text-yellow-400" /> : <FaFolder className="text-yellow-400" />}
            <span className="text-sm">{node.name}</span>
          </div>
          {isExpanded && node.children?.map(child => renderNode(child, level + 1))}
        </div>
      );
    }

    return (
      <div
        key={node.path}
        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-700 cursor-pointer"
        style={{ paddingLeft }}
        onClick={() => onFileClick(node.path)}
      >
        <FaFile className="text-gray-400" />
        <span className="text-sm">{node.name}</span>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 text-white h-full overflow-y-auto">
      <div className="p-2 border-b border-gray-700 font-semibold">
        Explorer
      </div>
      <div className="p-1">
        {files.map(node => renderNode(node))}
      </div>
    </div>
  );
}
```

#### Step 2.2: Monaco Editor Component
Create `frontend/src/components/workspace/CodeEditor.tsx`:

```typescript
'use client';

import { Editor } from '@monaco-editor/react';

interface CodeEditorProps {
  file: {
    path: string;
    content: string;
    language: string;
  } | null;
  onChange: (content: string) => void;
}

export default function CodeEditor({ file, onChange }: CodeEditorProps) {
  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
        <div className="text-center">
          <p className="text-xl mb-2">No file selected</p>
          <p className="text-sm">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center">
        <span className="text-white text-sm">{file.path}</span>
      </div>
      <Editor
        height="calc(100% - 40px)"
        language={file.language}
        value={file.content}
        onChange={(value) => onChange(value || '')}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
}
```

#### Step 2.3: AI Agent Panel
Create `frontend/src/components/workspace/AIAgentPanel.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { FaRobot, FaPaperPlane, FaSpinner } from 'react-icons/fa';

interface AIAgentPanelProps {
  onPromptSubmit: (prompt: string) => Promise<void>;
  status: 'idle' | 'analyzing' | 'planning' | 'ready';
  logs: string[];
}

export default function AIAgentPanel({ onPromptSubmit, status, logs }: AIAgentPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      await onPromptSubmit(prompt);
      setPrompt('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 text-white h-full flex flex-col">
      <div className="p-3 border-b border-gray-700 flex items-center gap-2">
        <FaRobot className="text-purple-400" />
        <span className="font-semibold">AI Agent</span>
        {status !== 'idle' && (
          <span className="ml-auto text-xs text-purple-400 flex items-center gap-1">
            <FaSpinner className="animate-spin" />
            {status}
          </span>
        )}
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        <div className="text-sm text-gray-400 mb-4">
          Tell me what you want to create or modify in this repository
        </div>
        {logs.map((log, idx) => (
          <div key={idx} className="text-xs bg-gray-700 p-2 rounded">
            {log}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Add input validation to the login form"
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded text-sm resize-none"
            rows={3}
            disabled={loading}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!prompt.trim() || loading}
          className="w-full mt-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FaPaperPlane />
              Send to AI
            </>
          )}
        </button>
      </div>
    </div>
  );
}
```

#### Step 2.4: Diff Viewer Component
Create `frontend/src/components/workspace/DiffViewer.tsx`:

```typescript
'use client';

import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

interface DiffViewerProps {
  filePath: string;
  oldContent: string;
  newContent: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function DiffViewer({
  filePath,
  oldContent,
  newContent,
  onAccept,
  onReject
}: DiffViewerProps) {
  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <span className="font-semibold">{filePath}</span>
        <div className="flex gap-2">
          <button
            onClick={onReject}
            className="px-4 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
          >
            Reject
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
          >
            Accept
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <ReactDiffViewer
          oldValue={oldContent}
          newValue={newContent}
          splitView={true}
          compareMethod={DiffMethod.WORDS}
          styles={{
            variables: {
              dark: {
                diffViewerBackground: '#1a1a1a',
                addedBackground: '#044B53',
                removedBackground: '#5c1f1f',
              },
            },
          }}
          useDarkTheme={true}
        />
      </div>
    </div>
  );
}
```

#### Step 2.5: Main Workspace Page
Create `frontend/src/app/workspace/[repoId]/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Split from 'react-split';
import FileExplorer from '@/components/workspace/FileExplorer';
import CodeEditor from '@/components/workspace/CodeEditor';
import AIAgentPanel from '@/components/workspace/AIAgentPanel';
import DiffViewer from '@/components/workspace/DiffViewer';

export default function WorkspacePage() {
  const params = useParams();
  const [fileTree, setFileTree] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [agentStatus, setAgentStatus] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [showDiff, setShowDiff] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Fetch file tree
  useEffect(() => {
    fetchFileTree();
  }, [params.repoId]);

  const fetchFileTree = async () => {
    // Implementation
  };

  const handleFileClick = async (path: string) => {
    // Fetch and open file
  };

  const handleAIPrompt = async (prompt: string) => {
    // Send to AI agent
    setAgentStatus('analyzing');
    // ... API call
    setAgentStatus('ready');
    setShowDiff(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="text-white font-semibold">AI Coding Workspace</div>
        <div className="flex gap-2">
          <button className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm">
            Save
          </button>
          <button className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm">
            Commit
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 overflow-hidden">
        <Split
          className="flex h-full"
          sizes={[20, 50, 30]}
          minSize={200}
          gutterSize={4}
        >
          <FileExplorer files={fileTree} onFileClick={handleFileClick} />
          <CodeEditor file={currentFile} onChange={(content) => {/* handle change */}} />
          <AIAgentPanel onPromptSubmit={handleAIPrompt} status={agentStatus} logs={logs} />
        </Split>
      </div>

      {/* Diff Viewer Modal */}
      {showDiff && pendingChanges && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50">
          <div className="h-full p-4">
            <DiffViewer
              filePath={pendingChanges.filePath}
              oldContent={pendingChanges.originalContent}
              newContent={pendingChanges.modifiedContent}
              onAccept={() => {/* approve changes */}}
              onReject={() => setShowDiff(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

## 🔗 Integration Steps

### 1. Add Routes to Backend
In `backend/src/index.ts`:

```typescript
import workspaceRoutes from './routes/workspace.routes';
import aiAgentRoutes from './routes/aiAgent.routes';

app.use('/api/workspace', workspaceRoutes);
app.use('/api/agent', aiAgentRoutes);
```

### 2. Add Navigation from Dashboard
In `frontend/src/app/dashboard/page.tsx`, add button:

```typescript
<Link
  href={`/workspace/${repo._id}`}
  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
>
  Open in Workspace
</Link>
```

## 🧪 Testing Workflow

### Test 1: Basic File Operations
1. Open workspace for a repository
2. Click on a file in the explorer
3. File should open in Monaco Editor
4. Edit the file and save
5. Verify changes are saved

### Test 2: AI Agent
1. Type prompt: "Add console.log statements for debugging"
2. Agent should analyze code
3. Show modification plan
4. Display diff viewer
5. Approve changes
6. Verify commit to GitHub

### Test 3: Multi-File Changes
1. Prompt: "Create a calculator in HTML, CSS, and JS"
2. Agent should create 3 files
3. Show diffs for all files
4. Approve all changes
5. Verify all files committed

## 📚 Additional Resources

- **Monaco Editor Docs**: https://microsoft.github.io/monaco-editor/
- **React Split**: https://github.com/nathancahill/split/tree/master/packages/react-split
- **GitHub REST API**: https://docs.github.com/en/rest
- **Gemini AI**: https://ai.google.dev/docs

## 🚨 Important Notes

1. **Install Dependencies**: Run `npm install` in both frontend and backend
2. **Environment Variables**: Ensure all keys are set in `.env`
3. **Security**: Never commit tokens or API keys
4. **Rate Limits**: Be mindful of GitHub and Gemini API limits
5. **Testing**: Test with small repositories first

## 🎯 Success Criteria

✅ User can browse repository files  
✅ User can edit files in Monaco Editor  
✅ AI agent creates modification plans  
✅ Diff viewer shows changes clearly  
✅ User can approve/reject changes  
✅ Changes are committed to GitHub  
✅ Commit messages are meaningful  

---

**This is a production-ready architecture. Start implementing phase by phase!**
