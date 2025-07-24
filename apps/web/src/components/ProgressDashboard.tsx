import { useState } from 'react';
import { Goal, LogEntry } from '@fitness-app/shared';
import { useGoals } from '@/hooks/useTRPC';
import { ProgressCharts } from './ProgressCharts';
import { StatisticsSummary } from './StatisticsSummary';

export function ProgressDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'charts' | 'stats'>('overview');
  
  const { data: goalsResponse, isLoading: goalsLoading, isError } = useGoals();

  // Mock goals and logs data for now since we're using mock tRPC
  const mockGoals: Goal[] = [
    {
      id: '1',
      userId: 'user1',
      title: 'Daily Push-ups',
      description: 'Build upper body strength with daily push-ups',
      metric: 'count',
      target: 50,
      frequency: 'daily',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      userId: 'user1',
      title: 'Weekly Running',
      description: 'Improve cardiovascular health',
      metric: 'distance',
      target: 10,
      frequency: 'weekly',
      isActive: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: '3',
      userId: 'user1',
      title: 'Monthly Weight Loss',
      description: 'Lose weight gradually and sustainably',
      metric: 'weight',
      target: 2,
      frequency: 'monthly',
      isActive: true,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
  ];

  const mockLogs: LogEntry[] = [
    // Recent activities for better demo
    {
      id: '1',
      userId: 'user1',
      goalId: '1',
      date: new Date(),
      value: 55,
      notes: 'Exceeded my goal today! 💪',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      userId: 'user1',
      goalId: '1',
      date: new Date(Date.now() - 86400000), // Yesterday
      value: 48,
      notes: 'Almost there!',
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      id: '3',
      userId: 'user1',
      goalId: '1',
      date: new Date(Date.now() - 2 * 86400000), // 2 days ago
      value: 52,
      notes: 'Great workout!',
      createdAt: new Date(Date.now() - 2 * 86400000),
      updatedAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      id: '4',
      userId: 'user1',
      goalId: '2',
      date: new Date(Date.now() - 86400000),
      value: 12,
      notes: 'Long run today. Feeling accomplished.',
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      id: '5',
      userId: 'user1',
      goalId: '2',
      date: new Date(Date.now() - 3 * 86400000),
      value: 8.5,
      notes: 'Morning run in the park.',
      createdAt: new Date(Date.now() - 3 * 86400000),
      updatedAt: new Date(Date.now() - 3 * 86400000),
    },
    {
      id: '6',
      userId: 'user1',
      goalId: '3',
      date: new Date(Date.now() - 5 * 86400000),
      value: 2.2,
      notes: 'Exceeded monthly goal!',
      createdAt: new Date(Date.now() - 5 * 86400000),
      updatedAt: new Date(Date.now() - 5 * 86400000),
    },
    // Additional activities for better trends
    {
      id: '7',
      userId: 'user1',
      goalId: '1',
      date: new Date(Date.now() - 4 * 86400000),
      value: 45,
      notes: 'Good session',
      createdAt: new Date(Date.now() - 4 * 86400000),
      updatedAt: new Date(Date.now() - 4 * 86400000),
    },
    {
      id: '8',
      userId: 'user1',
      goalId: '1',
      date: new Date(Date.now() - 5 * 86400000),
      value: 50,
      notes: 'Hit the target!',
      createdAt: new Date(Date.now() - 5 * 86400000),
      updatedAt: new Date(Date.now() - 5 * 86400000),
    },
  ];

  const goals = goalsResponse?.data || mockGoals;
  const logs = mockLogs;

  // Quick stats for header
  const totalGoals = goals.length;
  const activeGoals = goals.filter(g => g.isActive).length;
  const totalLogs = logs.length;
  const achievements = logs.filter(log => {
    const goal = goals.find(g => g.id === log.goalId);
    return goal && log.value >= goal.target;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Progress Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Track your fitness journey with comprehensive analytics and insights
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex space-x-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-blue-600">{totalGoals}</div>
            <div className="text-gray-600">Goals</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-600">{totalLogs}</div>
            <div className="text-gray-600">Activities</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-yellow-600">{achievements}</div>
            <div className="text-gray-600">Achievements</div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveView('overview')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeView === 'overview'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveView('charts')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeView === 'charts'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📈 Charts
        </button>
        <button
          onClick={() => setActiveView('stats')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeView === 'stats'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 Statistics
        </button>
      </div>

      {/* Loading State */}
      {goalsLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading progress data...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="card bg-red-50 border-red-200">
          <div className="text-center py-8">
            <div className="text-red-600 text-4xl mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Failed to Load Progress Data
            </h3>
            <p className="text-red-700">
              There was an error loading your progress data. Please try again later.
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {!goalsLoading && !isError && (
        <>
          {/* No Data State */}
          {goals.length === 0 && logs.length === 0 && (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Progress Data Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create some goals and start logging activities to see your progress analytics!
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.location.hash = '#goals'}
                  className="btn btn-primary"
                >
                  Create Goals
                </button>
                <button
                  onClick={() => window.location.hash = '#logs'}
                  className="btn btn-secondary"
                >
                  Log Activities
                </button>
              </div>
            </div>
          )}

          {/* Dashboard Views */}
          {(goals.length > 0 || logs.length > 0) && (
            <>
              {activeView === 'overview' && (
                <div className="space-y-6">
                  <StatisticsSummary goals={goals} logs={logs} />
                  <ProgressCharts goals={goals} logs={logs} />
                </div>
              )}

              {activeView === 'charts' && (
                <ProgressCharts goals={goals} logs={logs} />
              )}

              {activeView === 'stats' && (
                <StatisticsSummary goals={goals} logs={logs} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
