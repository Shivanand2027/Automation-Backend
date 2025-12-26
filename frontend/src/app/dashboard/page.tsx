'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaGithub, FaRobot, FaPlus, FaClock, FaCheck, FaTimes } from 'react-icons/fa';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [connectedRepos, setConnectedRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRepo, setShowAddRepo] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const token = searchParams.get('token') || localStorage.getItem('token');
    
    if (!token) {
      router.push('/');
      return;
    }

    localStorage.setItem('token', token);
    fetchUserData(token);
    fetchConnectedRepos(token);
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectedRepos = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/repositories/connected`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConnectedRepos(data);
      }
    } catch (error) {
      console.error('Error fetching connected repos:', error);
    }
  };

  const fetchAllRepos = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/repositories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRepositories(data);
        setShowAddRepo(true);
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };

  const connectRepository = async (repo: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/repositories/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          githubRepoId: repo.id,
          name: repo.name,
          fullName: repo.fullName,
          description: repo.description,
          owner: repo.owner,
          isPrivate: repo.private,
          defaultBranch: repo.defaultBranch,
        }),
      });

      if (response.ok) {
        fetchConnectedRepos(token);
        setShowAddRepo(false);
        setRepositories([]);
      }
    } catch (error) {
      console.error('Error connecting repository:', error);
    }
  };

  const toggleAutomation = async (repoId: string, currentStatus: boolean) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const action = currentStatus ? 'disable' : 'enable';
      const response = await fetch(`${API_URL}/api/automation/${repoId}/${action}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchConnectedRepos(token);
      }
    } catch (error) {
      console.error('Error toggling automation:', error);
    }
  };

  const triggerAutomation = async (repoId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/automation/${repoId}/trigger`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Automation triggered! Changes will be committed shortly.');
      }
    } catch (error) {
      console.error('Error triggering automation:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FaRobot className="text-purple-400 text-2xl" />
              <span className="text-white font-bold text-xl">GitHub Automation</span>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-white">{user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Your Repositories</h1>
          <button
            onClick={fetchAllRepos}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaPlus />
            <span>Add Repository</span>
          </button>
        </div>

        {/* Connected Repositories */}
        {connectedRepos.length === 0 ? (
          <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-12 text-center border border-white border-opacity-10">
            <FaGithub className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No repositories connected</h2>
            <p className="text-gray-400 mb-6">
              Connect your first repository to start automating improvements
            </p>
            <button
              onClick={fetchAllRepos}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Connect Repository
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {connectedRepos.map((repo) => (
              <div
                key={repo._id}
                className="bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-10 hover:border-purple-500 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{repo.name}</h3>
                    <p className="text-gray-400 text-sm">{repo.fullName}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    repo.automationEnabled
                      ? 'bg-green-500 bg-opacity-20 text-green-400'
                      : 'bg-gray-500 bg-opacity-20 text-gray-400'
                  }`}>
                    {repo.automationEnabled ? 'Active' : 'Paused'}
                  </div>
                </div>

                {repo.description && (
                  <p className="text-gray-400 text-sm mb-4">{repo.description}</p>
                )}

                <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
                  <FaClock />
                  <span>
                    Last run: {repo.lastAutomationRun
                      ? new Date(repo.lastAutomationRun).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleAutomation(repo._id, repo.automationEnabled)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        repo.automationEnabled
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {repo.automationEnabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => triggerAutomation(repo._id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Trigger Now
                    </button>
                    <Link
                      href={`/repository/${repo._id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center"
                    >
                      View
                    </Link>
                  </div>
                  <Link
                    href={`/workspace/${repo._id}`}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-center font-semibold"
                  >
                    🚀 Open in Workspace
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Repository Modal */}
        {showAddRepo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto m-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Select Repository</h2>
                <button
                  onClick={() => {
                    setShowAddRepo(false);
                    setRepositories([]);
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {repositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="bg-white bg-opacity-5 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-white font-semibold">{repo.fullName}</h3>
                      {repo.description && (
                        <p className="text-gray-400 text-sm mt-1">{repo.description}</p>
                      )}
                    </div>
                    {repo.connected ? (
                      <div className="flex items-center space-x-2 text-green-400">
                        <FaCheck />
                        <span>Connected</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => connectRepository(repo)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
