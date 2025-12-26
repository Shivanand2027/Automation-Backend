'use client';

import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface AgentLog {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: Date;
}

interface AIAgentPanelProps {
  onSubmitPrompt: (prompt: string) => Promise<void>;
  isProcessing: boolean;
  logs: AgentLog[];
}

export default function AIAgentPanel({
  onSubmitPrompt,
  isProcessing,
  logs,
}: AIAgentPanelProps) {
  const [prompt, setPrompt] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isProcessing) {
      await onSubmitPrompt(prompt.trim());
      setPrompt('');
      setUserHasScrolled(false); // Reset scroll flag after submitting
    }
  };

  // Only auto-scroll if user hasn't manually scrolled
  useEffect(() => {
    if (!userHasScrolled && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, userHasScrolled]);

  const handleScroll = () => {
    if (logsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setUserHasScrolled(!isAtBottom);
    }
  };

  const getLogIcon = (type: AgentLog['type']) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-400" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-400" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-400" />;
      default:
        return <FaRobot className="text-blue-400" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-700 flex items-center gap-2">
        <FaRobot className="text-blue-400" />
        <span className="font-semibold text-sm">AI AGENT</span>
        {isProcessing && (
          <FaSpinner className="text-blue-400 animate-spin ml-auto" />
        )}
      </div>

      {/* Logs */}
      <div 
        ref={logsContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-2"
      >
        {logs.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            <FaRobot className="text-4xl mx-auto mb-3 text-gray-600" />
            <p>No activity yet</p>
            <p className="text-xs mt-2">Enter a prompt below to start</p>
          </div>
        ) : (
          <>
            {logs.map((log, index) => (
              <div
                key={index}
                className="flex gap-2 p-2 bg-gray-750 rounded text-sm"
              >
                <div className="flex-shrink-0 mt-0.5">{getLogIcon(log.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-300 break-words">{log.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(log.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </>
        )}
      </div>

      {/* Prompt Input */}
      <div className="border-t border-gray-700 p-3">
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to change... (e.g., 'Add error handling to auth service', 'Create a new user profile component')"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded resize-none focus:outline-none focus:border-blue-500 text-sm"
            rows={4}
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-medium transition-colors"
          >
            {isProcessing ? (
              <>
                <FaSpinner className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaPaperPlane />
                Submit Prompt
              </>
            )}
          </button>
        </form>
        
        <div className="mt-3 text-xs text-gray-400 space-y-1">
          <p className="font-semibold text-gray-300">Examples:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-1">
            <li>Add input validation to the login form</li>
            <li>Create a new API endpoint for user settings</li>
            <li>Refactor the database connection code</li>
            <li>Add TypeScript types to utils folder</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
