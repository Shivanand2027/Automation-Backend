'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaGithub, FaRobot, FaCheck, FaTimes } from 'react-icons/fa';

export default function RepositoryPage() {
  const router = useRouter();
  const params = useParams();
  const [repository, setRepository] = useState<any>(null);
  const [commits, setCommits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduledTime, setScheduledTime] = useState('00:00');
  const [timezone, setTimezone] = useState('UTC');
  const [updating, setUpdating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [executingPrompt, setExecutingPrompt] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchRepository(token);
    fetchCommits(token);
  }, [params.id]);

  const fetchRepository = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/repositories/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRepository(data);
        setScheduledTime(data.scheduledTime || '00:00');
        setTimezone(data.timezone || 'UTC');
      }
    } catch (error) {
      console.error('Error fetching repository:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommits = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/repositories/${params.id}/commits`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCommits(data);
      }
    } catch (error) {
      console.error('Error fetching commits:', error);
    }
  };

  const updateSchedule = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/api/automation/${params.id}/daily-schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduledTime,
          timezone,
        }),
      });

      if (response.ok) {
        alert('Schedule updated successfully!');
        fetchRepository(token);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update schedule'}`);
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Failed to update schedule');
    } finally {
      setUpdating(false);
    }
  };

  const toggleAutomation = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const endpoint = repository.automationEnabled ? 'disable' : 'enable';
      const response = await fetch(`${API_URL}/api/automation/${params.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchRepository(token);
      } else {
        alert('Failed to toggle automation');
      }
    } catch (error) {
      console.error('Error toggling automation:', error);
      alert('Failed to toggle automation');
    }
  };

  const triggerManual = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/automation/${params.id}/trigger`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Automation triggered! Check back in a few moments for the commit.');
      } else {
        alert('Failed to trigger automation');
      }
    } catch (error) {
      console.error('Error triggering automation:', error);
      alert('Failed to trigger automation');
    }
  };

  const executeCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    setExecutingPrompt(true);
    try {
      const response = await fetch(`${API_URL}/api/automation/${params.id}/custom-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: customPrompt }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Success! ${result.summary}\n\nFiles changed: ${result.filesChanged.join(', ')}`);
        setCustomPrompt('');
        setShowPromptModal(false);
        fetchRepository(token);
        fetchCommits(token);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to execute prompt'}\n${error.details || ''}`);
      }
    } catch (error) {
      console.error('Error executing custom prompt:', error);
      alert('Failed to execute custom prompt');
    } finally {
      setExecutingPrompt(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Repository not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaArrowLeft className="text-xl" />
              </Link>
              <FaRobot className="text-purple-400 text-2xl" />
              <span className="text-white font-bold text-xl">Repository Details</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Repository Info */}
        <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-10 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{repository.name}</h1>
              <p className="text-gray-400">{repository.fullName}</p>
              {repository.description && (
                <p className="text-gray-300 mt-2">{repository.description}</p>
              )}
            </div>
            <div className={`px-4 py-2 rounded-full ${
              repository.automationEnabled
                ? 'bg-green-500 bg-opacity-20 text-green-400'
                : 'bg-gray-500 bg-opacity-20 text-gray-400'
            }`}>
              {repository.automationEnabled ? 'Active' : 'Paused'}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white bg-opacity-5 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Default Branch</div>
              <div className="text-white font-semibold">{repository.defaultBranch}</div>
            </div>
            <div className="bg-white bg-opacity-5 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Last Automation</div>
              <div className="text-white font-semibold">
                {repository.lastAutomationRun
                  ? new Date(repository.lastAutomationRun).toLocaleString()
                  : 'Never'}
              </div>
            </div>
            <div className="bg-white bg-opacity-5 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Total Commits</div>
              <div className="text-white font-semibold">{commits.length}</div>
            </div>
          </div>
        </div>

        {/* Schedule Settings */}
        <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-10 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Daily Schedule</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Scheduled Time (24-hour format)
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-gray-400 text-xs mt-1">
                Current: {scheduledTime} {timezone}
              </p>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Europe/Berlin">Berlin</option>
                <option value="Asia/Dubai">Dubai</option>
                <option value="Asia/Kolkata">India Standard Time</option>
                <option value="Asia/Shanghai">Beijing/Shanghai</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Australia/Sydney">Sydney</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={updateSchedule}
              disabled={updating}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : 'Update Schedule'}
            </button>

            <button
              onClick={toggleAutomation}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                repository.automationEnabled
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {repository.automationEnabled ? 'Disable Automation' : 'Enable Automation'}
            </button>

            <button
              onClick={triggerManual}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Trigger Now
            </button>

            <button
              onClick={() => setShowPromptModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              🤖 Custom AI Prompt
            </button>
          </div>
        </div>

        {/* Custom Prompt Modal */}
        {showPromptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-purple-500 border-opacity-30">
              <h3 className="text-2xl font-bold text-white mb-4">Custom AI Prompt</h3>
              <p className="text-gray-300 mb-4">
                Tell the AI what you want to create or change in your repository. 
                It will analyze ALL files and make the necessary changes.
              </p>
              
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Your Instruction
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Example: Create a calculator in HTML with CSS styling and JavaScript functionality"
                  className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                  disabled={executingPrompt}
                />
              </div>

              <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-4 mb-4">
                <p className="text-blue-300 text-sm">
                  <strong>💡 Examples:</strong><br/>
                  • "Create a calculator in HTML with CSS styling"<br/>
                  • "Add comprehensive JSDoc comments to all JavaScript files"<br/>
                  • "Create a contact form with validation"<br/>
                  • "Improve the README with installation instructions and examples"<br/>
                  • "Add error handling to all API calls"
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={executeCustomPrompt}
                  disabled={executingPrompt || !customPrompt.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {executingPrompt ? '🔄 Analyzing & Executing...' : '✨ Execute Prompt'}
                </button>
                <button
                  onClick={() => {
                    setShowPromptModal(false);
                    setCustomPrompt('');
                  }}
                  disabled={executingPrompt}
                  className="px-6 py-3 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Commit History */}
        <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-10">
          <h2 className="text-2xl font-bold text-white mb-6">Automation History</h2>

          {commits.length === 0 ? (
            <div className="text-center py-12">
              <FaRobot className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No automation history yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Enable automation to start seeing commits here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {commits.map((commit) => (
                <div
                  key={commit._id}
                  className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {commit.status === 'success' ? (
                        <div className="bg-green-500 bg-opacity-20 p-2 rounded-full">
                          <FaCheck className="text-green-400" />
                        </div>
                      ) : (
                        <div className="bg-red-500 bg-opacity-20 p-2 rounded-full">
                          <FaTimes className="text-red-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-white font-semibold">{commit.commitMessage}</div>
                        <div className="text-gray-400 text-sm">
                          {new Date(commit.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <a
                      href={`https://github.com/${repository.fullName}/commit/${commit.commitSha}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <FaGithub className="text-xl" />
                    </a>
                  </div>

                  {commit.aiAnalysis && (
                    <div className="bg-white bg-opacity-5 rounded p-3 mb-2">
                      <div className="text-gray-400 text-sm mb-1">AI Analysis:</div>
                      <div className="text-gray-300 text-sm">{commit.aiAnalysis}</div>
                    </div>
                  )}

                  {commit.filesChanged.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-gray-400 text-sm">Files:</span>
                      {commit.filesChanged.map((file: string, index: number) => (
                        <span
                          key={index}
                          className="text-purple-400 text-sm bg-purple-500 bg-opacity-10 px-2 py-1 rounded"
                        >
                          {file}
                        </span>
                      ))}
                    </div>
                  )}

                  {commit.status === 'failed' && commit.errorMessage && (
                    <div className="mt-2 text-red-400 text-sm">
                      Error: {commit.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
