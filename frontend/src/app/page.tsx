'use client';

import Link from 'next/link';
import { FaGithub, FaRobot, FaCode, FaShieldAlt, FaClock } from 'react-icons/fa';

export default function HomePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleLogin = () => {
    // Directly redirect to backend OAuth endpoint
    window.location.href = `${API_URL}/api/auth/github`;
  };

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
            <button
              onClick={handleLogin}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              <FaGithub className="text-xl" />
              <span>Login with GitHub</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI-Powered GitHub
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {' '}Code Automation
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Let AI analyze your repositories and automatically make meaningful improvements
            through scheduled commits. Built for educational purposes with GitHub best practices.
          </p>
          <button
            onClick={handleLogin}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Free
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <FeatureCard
            icon={<FaGithub className="text-4xl text-purple-400" />}
            title="GitHub Integration"
            description="Seamlessly connect with your GitHub repositories using OAuth authentication"
          />
          <FeatureCard
            icon={<FaRobot className="text-4xl text-pink-400" />}
            title="AI-Powered Analysis"
            description="Google Gemini AI analyzes your code and suggests meaningful improvements"
          />
          <FeatureCard
            icon={<FaClock className="text-4xl text-blue-400" />}
            title="Automated Scheduling"
            description="Daily automated commits with smart scheduling to maintain consistency"
          />
          <FeatureCard
            icon={<FaShieldAlt className="text-4xl text-green-400" />}
            title="Secure & Ethical"
            description="Built with security best practices and ethical automation in mind"
          />
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Connect Repository"
              description="Login with GitHub and select repositories you want to automate"
            />
            <StepCard
              number="2"
              title="Enable Automation"
              description="AI analyzes your code, documentation, and suggests improvements"
            />
            <StepCard
              number="3"
              title="Automated Improvements"
              description="Daily meaningful commits enhance your codebase automatically"
            />
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-20 bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-10">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Meaningful Improvements
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ImprovementCard
              icon={<FaCode />}
              title="Documentation"
              items={['Improve README clarity', 'Add usage examples', 'Update installation guides']}
            />
            <ImprovementCard
              icon={<FaCode />}
              title="Code Quality"
              items={['Add inline comments', 'Improve function docs', 'Refactor code snippets']}
            />
            <ImprovementCard
              icon={<FaCode />}
              title="Project Files"
              items={['Add CONTRIBUTING.md', 'Update CHANGELOG', 'Add CODE_OF_CONDUCT']}
            />
          </div>
        </div>

        {/* Educational Notice */}
        <div className="mt-20 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-300 mb-2">
            Educational & Ethical Use
          </h3>
          <p className="text-gray-300">
            This platform is designed for educational purposes and performs AI-assisted automated
            commits for learning and experimentation. All changes are meaningful and follow GitHub
            best practices. This tool should not be used to artificially inflate contribution
            statistics.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black bg-opacity-30 backdrop-blur-sm border-t border-white border-opacity-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-400">
            Built for educational purposes. Open source and transparent.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-10 hover:border-purple-500 transition-colors">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: any) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function ImprovementCard({ icon, title, items }: any) {
  return (
    <div className="bg-white bg-opacity-5 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="text-purple-400 text-2xl">{icon}</div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item: string, index: number) => (
          <li key={index} className="text-gray-400 flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
