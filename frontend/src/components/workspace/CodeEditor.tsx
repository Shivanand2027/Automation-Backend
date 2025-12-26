'use client';

import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { FaTimes, FaCircle } from 'react-icons/fa';

interface OpenFile {
  path: string;
  content: string;
  language: string;
  modified: boolean;
}

interface CodeEditorProps {
  files: OpenFile[];
  activeFile: string | null;
  onFileChange: (path: string, content: string) => void;
  onFileClose: (path: string) => void;
  onTabChange: (path: string) => void;
}

export default function CodeEditor({
  files,
  activeFile,
  onFileChange,
  onFileClose,
  onTabChange,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const currentFile = files.find((f) => f.path === activeFile);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Configure Monaco theme
    monaco.editor.defineTheme('vs-dark-custom', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
      },
    });
    monaco.editor.setTheme('vs-dark-custom');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      onFileChange(activeFile, value);
    }
  };

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Tabs */}
      <div className="flex items-center bg-[#2d2d2d] border-b border-gray-700 overflow-x-auto">
        {files.length === 0 ? (
          <div className="px-4 py-2 text-sm text-gray-400">No file open</div>
        ) : (
          files.map((file) => (
            <div
              key={file.path}
              className={`flex items-center gap-2 px-4 py-2 border-r border-gray-700 cursor-pointer hover:bg-[#37373d] transition-colors ${
                file.path === activeFile ? 'bg-[#1e1e1e]' : ''
              }`}
              onClick={() => onTabChange(file.path)}
            >
              <span className="text-sm text-white whitespace-nowrap">
                {getFileName(file.path)}
              </span>
              {file.modified && (
                <FaCircle className="text-xs text-blue-400" />
              )}
              <button
                className="ml-2 hover:bg-gray-600 rounded p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileClose(file.path);
                }}
              >
                <FaTimes className="text-xs text-gray-400 hover:text-white" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Editor */}
      {currentFile ? (
        <Editor
          height="100%"
          defaultLanguage={currentFile.language}
          language={currentFile.language}
          value={currentFile.content}
          theme="vs-dark-custom"
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
            minimap: { enabled: true },
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            quickSuggestions: true,
          }}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">No file selected</h2>
            <p className="text-sm">Select a file from the explorer to start editing</p>
          </div>
        </div>
      )}
    </div>
  );
}
