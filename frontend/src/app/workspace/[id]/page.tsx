'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Split from 'react-split';
import FileExplorer from '@/components/workspace/FileExplorer';
import CodeEditor from '@/components/workspace/CodeEditor';
import AIAgentPanel from '@/components/workspace/AIAgentPanel';
import DiffViewer from '@/components/workspace/DiffViewer';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  size?: number;
}

interface OpenFile {
  path: string;
  content: string;
  language: string;
  modified: boolean;
  originalContent: string;
}

interface AgentLog {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: Date;
}

interface PendingChange {
  _id: string;
  aiPrompt: string;
  agentPlan: string;
  changes: Array<{
    path: string;
    oldContent: string;
    newContent: string;
    operation: 'create' | 'modify' | 'delete';
    diff: string;
  }>;
  commitMessage: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'committed';
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const repoId = params.id as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [isProcessingAgent, setIsProcessingAgent] = useState(false);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [repository, setRepository] = useState<any>(null);

  // Load repository details
  useEffect(() => {
    const loadRepository = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/repositories/${repoId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setRepository(data);
        } else {
          addLog('error', 'Failed to load repository details');
        }
      } catch (error) {
        console.error('Error loading repository:', error);
        addLog('error', 'Error loading repository details');
      }
    };

    loadRepository();
  }, [repoId]);

  // Load file tree
  useEffect(() => {
    const loadFileTree = async () => {
      setIsLoadingTree(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${API_URL}/api/workspace/${repoId}/tree`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setFileTree(data.tree);
          addLog('success', `Loaded ${data.fileCount} files from repository`);
        } else {
          const error = await response.json();
          addLog('error', `Failed to load file tree: ${error.message}`);
        }
      } catch (error) {
        console.error('Error loading file tree:', error);
        addLog('error', 'Failed to connect to server');
      } finally {
        setIsLoadingTree(false);
      }
    };

    loadFileTree();
  }, [repoId]);

  const addLog = (type: AgentLog['type'], message: string) => {
    setAgentLogs((prev) => [
      ...prev,
      { type, message, timestamp: new Date() },
    ]);
  };

  const handleFileClick = async (path: string) => {
    // Check if file is already open
    const existingFile = openFiles.find((f) => f.path === path);
    if (existingFile) {
      setActiveFile(path);
      return;
    }

    // Load file content
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/workspace/${repoId}/file/${encodeURIComponent(path)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newFile: OpenFile = {
          path: data.path,
          content: data.content,
          language: data.language,
          modified: false,
          originalContent: data.content,
        };
        setOpenFiles((prev) => [...prev, newFile]);
        setActiveFile(data.path);
        addLog('info', `Opened ${path}`);
      } else {
        const error = await response.json();
        addLog('error', `Failed to open ${path}: ${error.message}`);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      addLog('error', `Failed to load ${path}`);
    }
  };

  const handleFileChange = (path: string, content: string) => {
    setOpenFiles((prev) =>
      prev.map((file) =>
        file.path === path
          ? {
              ...file,
              content,
              modified: content !== file.originalContent,
            }
          : file
      )
    );
  };

  const handleFileClose = async (path: string) => {
    const file = openFiles.find((f) => f.path === path);
    
    // Save if modified
    if (file?.modified) {
      try {
        const token = localStorage.getItem('token');
        await fetch(
          `${API_URL}/api/workspace/${repoId}/file/${encodeURIComponent(path)}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: file.content,
              message: `Update ${path}`,
            }),
          }
        );
        addLog('success', `Saved ${path}`);
      } catch (error) {
        console.error('Error saving file:', error);
        addLog('error', `Failed to save ${path}`);
      }
    }

    setOpenFiles((prev) => prev.filter((f) => f.path !== path));
    if (activeFile === path) {
      const remainingFiles = openFiles.filter((f) => f.path !== path);
      setActiveFile(remainingFiles.length > 0 ? remainingFiles[0].path : null);
    }
  };

  const handleTabChange = (path: string) => {
    setActiveFile(path);
  };

  const handleSubmitPrompt = async (prompt: string) => {
    setIsProcessingAgent(true);
    addLog('info', `Analyzing prompt: "${prompt}"`);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/agent/${repoId}/plan`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPendingChange(data.pendingChange);
        setShowDiffViewer(true);
        addLog('success', `AI Agent created a plan with ${data.pendingChange.changes.length} file changes`);
      } else {
        const error = await response.json();
        addLog('error', `AI Agent failed: ${error.message || error.error || 'Unknown error'}`);
        console.error('AI Agent error details:', error);
      }
    } catch (error: any) {
      console.error('Error submitting prompt:', error);
      addLog('error', `Failed to connect to AI Agent: ${error.message || 'Network error'}`);
    } finally {
      setIsProcessingAgent(false);
    }
  };

  const handleApproveDiff = async () => {
    if (!pendingChange) return;

    setIsProcessingAgent(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/agent/${repoId}/approve/${pendingChange._id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        addLog('success', `Changes committed successfully`);
        setShowDiffViewer(false);
        setPendingChange(null);
        
        // Reload file tree and refresh open files
        const treeResponse = await fetch(
          `${API_URL}/api/workspace/${repoId}/tree`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        if (treeResponse.ok) {
          const treeData = await treeResponse.json();
          setFileTree(treeData.tree);
        }
      } else {
        const error = await response.json();
        addLog('error', `Failed to commit changes: ${error.message}`);
      }
    } catch (error) {
      console.error('Error approving changes:', error);
      addLog('error', 'Failed to commit changes');
    } finally {
      setIsProcessingAgent(false);
    }
  };

  const handleRejectDiff = async () => {
    if (!pendingChange) return;

    setIsProcessingAgent(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${API_URL}/api/agent/${repoId}/reject/${pendingChange._id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      addLog('info', 'Changes rejected');
      setShowDiffViewer(false);
      setPendingChange(null);
    } catch (error) {
      console.error('Error rejecting changes:', error);
      addLog('error', 'Failed to reject changes');
    } finally {
      setIsProcessingAgent(false);
    }
  };

  if (isLoadingTree) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <FaSpinner className="text-4xl text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <FaArrowLeft />
          <span className="text-sm">Back to Dashboard</span>
        </button>
        {repository && (
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm font-semibold">{repository.owner}/{repository.name}</span>
            <span className="text-xs text-gray-400">({repository.branch})</span>
          </div>
        )}
      </div>

      {/* Main Workspace */}
      <Split
        className="flex-1 flex"
        sizes={[20, 50, 30]}
        minSize={[200, 400, 250]}
        gutterSize={8}
        gutterStyle={() => ({
          backgroundColor: '#374151',
          cursor: 'col-resize',
        })}
      >
        {/* File Explorer */}
        <div className="h-full overflow-hidden">
          <FileExplorer
            files={fileTree}
            onFileClick={handleFileClick}
            currentFile={activeFile}
          />
        </div>

        {/* Code Editor */}
        <div className="h-full overflow-hidden">
          <CodeEditor
            files={openFiles}
            activeFile={activeFile}
            onFileChange={handleFileChange}
            onFileClose={handleFileClose}
            onTabChange={handleTabChange}
          />
        </div>

        {/* AI Agent Panel */}
        <div className="h-full overflow-hidden">
          <AIAgentPanel
            onSubmitPrompt={handleSubmitPrompt}
            isProcessing={isProcessingAgent}
            logs={agentLogs}
          />
        </div>
      </Split>

      {/* Diff Viewer Modal */}
      {showDiffViewer && pendingChange && (
        <DiffViewer
          changes={pendingChange.changes}
          agentPlan={pendingChange.agentPlan}
          commitMessage={pendingChange.commitMessage}
          riskLevel={pendingChange.riskLevel}
          onApprove={handleApproveDiff}
          onReject={handleRejectDiff}
          isProcessing={isProcessingAgent}
        />
      )}
    </div>
  );
}
