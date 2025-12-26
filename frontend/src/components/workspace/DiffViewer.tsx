'use client';

import { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

interface FileChange {
  path: string;
  oldContent: string;
  newContent: string;
  operation: 'create' | 'modify' | 'delete';
  diff: string;
}

interface DiffViewerProps {
  changes: FileChange[];
  agentPlan: string;
  commitMessage: string;
  riskLevel: 'low' | 'medium' | 'high';
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}

export default function DiffViewer({
  changes,
  agentPlan,
  commitMessage,
  riskLevel,
  onApprove,
  onReject,
  isProcessing,
}: DiffViewerProps) {
  const [selectedFile, setSelectedFile] = useState(0);

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskIcon = () => {
    if (riskLevel === 'high' || riskLevel === 'medium') {
      return <FaExclamationTriangle className="text-yellow-400" />;
    }
    return null;
  };

  const currentChange = changes[selectedFile];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white">Review Changes</h2>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded text-xs font-semibold text-white ${getRiskColor()}`}>
                {riskLevel.toUpperCase()} RISK
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-300 mb-3">{commitMessage}</p>
          
          {/* Agent Plan */}
          <div className="bg-gray-900 p-3 rounded text-sm">
            <div className="font-semibold text-blue-400 mb-1">Agent Plan:</div>
            <div className="text-gray-300 whitespace-pre-wrap">{agentPlan}</div>
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex gap-2 px-4 py-2 bg-gray-750 border-b border-gray-700 overflow-x-auto">
          {changes.map((change, index) => (
            <button
              key={index}
              onClick={() => setSelectedFile(index)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                selectedFile === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className={`mr-2 ${
                change.operation === 'create' ? 'text-green-400' : 
                change.operation === 'delete' ? 'text-red-400' : 
                'text-yellow-400'
              }`}>
                {change.operation === 'create' ? '+' : 
                 change.operation === 'delete' ? '-' : 
                 '~'}
              </span>
              {change.path}
            </button>
          ))}
        </div>

        {/* Diff Content */}
        <div className="flex-1 overflow-auto">
          {currentChange && (
            <div className="h-full">
              <ReactDiffViewer
                oldValue={currentChange.oldContent}
                newValue={currentChange.newContent}
                splitView={true}
                compareMethod={DiffMethod.WORDS}
                leftTitle={`${currentChange.path} (Original)`}
                rightTitle={`${currentChange.path} (Modified)`}
                styles={{
                  variables: {
                    dark: {
                      diffViewerBackground: '#1e1e1e',
                      diffViewerColor: '#e0e0e0',
                      addedBackground: '#1a3d1a',
                      addedColor: '#b3ffb3',
                      removedBackground: '#4a1616',
                      removedColor: '#ffb3b3',
                      wordAddedBackground: '#2d5a2d',
                      wordRemovedBackground: '#6e2828',
                      addedGutterBackground: '#1a3d1a',
                      removedGutterBackground: '#4a1616',
                      gutterBackground: '#2d2d2d',
                      gutterBackgroundDark: '#262626',
                      highlightBackground: '#3d3d3d',
                      highlightGutterBackground: '#353535',
                    },
                  },
                  line: {
                    fontSize: '13px',
                    fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
                  },
                }}
                useDarkTheme={true}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-700 flex items-center justify-between bg-gray-750">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            {getRiskIcon()}
            <span>
              {changes.length} file{changes.length !== 1 ? 's' : ''} will be modified
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onReject}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
            >
              <FaTimes />
              Reject
            </button>
            <button
              onClick={onApprove}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
            >
              <FaCheck />
              {isProcessing ? 'Committing...' : 'Approve & Commit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
