'use client';

import { useState } from 'react';
import {
  FaFolder,
  FaFolderOpen,
  FaFile,
  FaChevronRight,
  FaChevronDown,
  FaJs,
  FaPython,
  FaHtml5,
  FaCss3,
  FaReact,
} from 'react-icons/fa';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  size?: number;
}

interface FileExplorerProps {
  files: FileNode[];
  onFileClick: (path: string) => void;
  currentFile?: string | null;
}

export default function FileExplorer({
  files,
  onFileClick,
  currentFile,
}: FileExplorerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['']));

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'js':
      case 'jsx':
        return <FaJs className="text-yellow-400" />;
      case 'ts':
      case 'tsx':
        return <FaReact className="text-blue-400" />;
      case 'py':
        return <FaPython className="text-blue-500" />;
      case 'html':
        return <FaHtml5 className="text-orange-500" />;
      case 'css':
      case 'scss':
        return <FaCss3 className="text-blue-400" />;
      default:
        return <FaFile className="text-gray-400" />;
    }
  };

  const renderNode = (node: FileNode, level: number = 0): JSX.Element => {
    const isExpanded = expanded.has(node.path);
    const paddingLeft = `${level * 16 + 8}px`;
    const isCurrentFile = currentFile === node.path;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <div
            className={`flex items-center gap-2 px-2 py-1.5 hover:bg-gray-700 cursor-pointer transition-colors ${
              isExpanded ? 'bg-gray-750' : ''
            }`}
            style={{ paddingLeft }}
            onClick={() => toggleFolder(node.path)}
          >
            {isExpanded ? (
              <FaChevronDown className="text-xs text-gray-400" />
            ) : (
              <FaChevronRight className="text-xs text-gray-400" />
            )}
            {isExpanded ? (
              <FaFolderOpen className="text-yellow-500" />
            ) : (
              <FaFolder className="text-yellow-500" />
            )}
            <span className="text-sm text-white">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child) => renderNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={node.path}
        className={`flex items-center gap-2 px-2 py-1.5 hover:bg-gray-700 cursor-pointer transition-colors ${
          isCurrentFile ? 'bg-blue-600' : ''
        }`}
        style={{ paddingLeft }}
        onClick={() => onFileClick(node.path)}
      >
        <span className="w-4" />
        {getFileIcon(node.name)}
        <span className={`text-sm ${isCurrentFile ? 'text-white font-semibold' : 'text-gray-300'}`}>
          {node.name}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 text-white h-full overflow-y-auto">
      <div className="sticky top-0 bg-gray-800 p-3 border-b border-gray-700 font-semibold text-sm">
        EXPLORER
      </div>
      <div className="py-1">
        {files.length > 0 ? (
          files.map((node) => renderNode(node))
        ) : (
          <div className="p-4 text-center text-gray-400 text-sm">
            No files found
          </div>
        )}
      </div>
    </div>
  );
}
