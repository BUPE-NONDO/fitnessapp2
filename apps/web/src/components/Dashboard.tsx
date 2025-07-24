import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHealthCheck, useGoals } from '@/hooks/useTRPC';
import { GoalsList } from './GoalsList';
import { ActivityLogsList } from './ActivityLogsList';
import { ProgressDashboard } from './ProgressDashboard';
import { UserProfile } from './UserProfile';
import { BadgeManager } from './BadgeDisplay';

export function Dashboard() {
  const { user, logout } = useAuth();
  const healthCheck = useHealthCheck();
  const goals = useGoals();
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'logs' | 'badges' | 'profile'>('overview'); // Start with overview tab

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                🏋️‍♂️ FitnessApp
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user?.displayName || user?.email}!
              </span>
              <button
                onClick={logout}
                className="btn btn-secondary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'goals'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎯 Goals
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📝 Activity Log
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'badges'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏆 Badges
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👤 Profile
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <ProgressDashboard />
        )}

        {activeTab === 'goals' && (
          <GoalsList />
        )}

        {activeTab === 'logs' && (
          <ActivityLogsList />
        )}

        {activeTab === 'badges' && (
          <BadgeManager />
        )}

        {activeTab === 'profile' && (
          <UserProfile />
        )}
      </main>
    </div>
  );
}
