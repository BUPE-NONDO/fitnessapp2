import { useState } from 'react';
import { LogEntry, Goal, CreateLogEntry } from '@fitness-app/shared';
import { useGoals, useCreateLog } from '@/hooks/useTRPC';
import { ActivityLogForm } from './ActivityLogForm';
import { ActivityLogEntry } from './ActivityLogEntry';
import { achievementService } from '@/services/achievementService';
import { useUser } from '@/hooks/useUser';

export function ActivityLogsList() {
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<string>('all');
  const { user } = useUser();

  const { data: goalsResponse, isLoading: goalsLoading } = useGoals();
  const createLogMutation = useCreateLog();

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
    {
      id: '1',
      userId: 'user1',
      goalId: '1',
      date: new Date('2024-01-15'),
      value: 45,
      notes: 'Great workout! Felt strong today.',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      userId: 'user1',
      goalId: '1',
      date: new Date('2024-01-14'),
      value: 52,
      notes: 'Exceeded my goal! 💪',
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14'),
    },
    {
      id: '3',
      userId: 'user1',
      goalId: '2',
      date: new Date('2024-01-13'),
      value: 5.2,
      notes: 'Morning run in the park. Beautiful weather!',
      createdAt: new Date('2024-01-13'),
      updatedAt: new Date('2024-01-13'),
    },
    {
      id: '4',
      userId: 'user1',
      goalId: '2',
      date: new Date('2024-01-10'),
      value: 8.5,
      notes: 'Long run today. Feeling accomplished.',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
    {
      id: '5',
      userId: 'user1',
      goalId: '3',
      date: new Date('2024-01-01'),
      value: 1.2,
      notes: 'Good start to the month!',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  const goals = goalsResponse?.data || mockGoals;
  const logs = mockLogs;

  // Filter logs based on selected goal
  const filteredLogs = selectedGoalFilter === 'all' 
    ? logs 
    : logs.filter(log => log.goalId === selectedGoalFilter);

  // Sort logs by date (newest first)
  const sortedLogs = [...filteredLogs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleCreateLog = async (logData: CreateLogEntry) => {
    try {
      console.log('Creating log with data:', logData);
      const result = await createLogMutation.mutateAsync(logData);
      console.log('Log created successfully:', result);
      setShowForm(false);

      // Check for achievements after logging an activity
      if (user) {
        setTimeout(() => {
          achievementService.checkForNewAchievements(user.uid);
        }, 1000); // Small delay to ensure log is saved
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Show user-friendly error message
      alert(`Failed to log activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditLog = (log: LogEntry) => {
    setEditingLog(log);
    setShowForm(true);
  };

  const handleUpdateLog = async (logData: CreateLogEntry) => {
    if (!editingLog) return;
    
    try {
      console.log('Activity updated:', { id: editingLog.id, ...logData });
      setShowForm(false);
      setEditingLog(null);
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (window.confirm('Are you sure you want to delete this activity log?')) {
      try {
        console.log('Activity deleted:', logId);
      } catch (error) {
        console.error('Failed to delete activity:', error);
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingLog(null);
  };

  if (showForm) {
    return (
      <ActivityLogForm
        goals={goals.filter(g => g.isActive)}
        onSubmit={editingLog ? handleUpdateLog : handleCreateLog}
        onCancel={handleCancelForm}
        isLoading={createLogMutation.isLoading}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
          <p className="text-gray-600 mt-1">
            Track your daily activities and monitor your progress
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
          disabled={goals.filter(g => g.isActive).length === 0}
        >
          + Log Activity
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <label htmlFor="goalFilter" className="text-sm font-medium text-gray-700">
          Filter by Goal:
        </label>
        <select
          id="goalFilter"
          value={selectedGoalFilter}
          onChange={(e) => setSelectedGoalFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="all">All Goals</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
        <div className="text-sm text-gray-500">
          Showing {sortedLogs.length} {sortedLogs.length === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      {/* Loading State */}
      {goalsLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activities...</p>
        </div>
      )}

      {/* No Active Goals */}
      {!goalsLoading && goals.filter(g => g.isActive).length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Active Goals
          </h3>
          <p className="text-gray-600 mb-6">
            You need to create at least one active goal before logging activities.
          </p>
          <button
            onClick={() => window.location.hash = '#goals'}
            className="btn btn-primary"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Activity Logs */}
      {!goalsLoading && goals.filter(g => g.isActive).length > 0 && (
        <>
          {sortedLogs.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Activities Logged Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start logging your activities to track your progress towards your goals!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                Log Your First Activity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedLogs.map((log) => {
                const goal = goals.find(g => g.id === log.goalId);
                return (
                  <ActivityLogEntry
                    key={log.id}
                    logEntry={log}
                    goal={goal}
                    onEdit={handleEditLog}
                    onDelete={handleDeleteLog}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Quick Stats */}
      {!goalsLoading && sortedLogs.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Activity Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sortedLogs.length}</div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sortedLogs.filter(log => {
                  const goal = goals.find(g => g.id === log.goalId);
                  return goal && log.value >= goal.target;
                }).length}
              </div>
              <div className="text-sm text-gray-600">Goals Achieved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(sortedLogs.map(log => log.goalId)).size}
              </div>
              <div className="text-sm text-gray-600">Goals Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {sortedLogs.filter(log => 
                  new Date(log.date).toDateString() === new Date().toDateString()
                ).length}
              </div>
              <div className="text-sm text-gray-600">Today's Entries</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
