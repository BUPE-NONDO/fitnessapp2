import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { GoalProgressChart } from './GoalProgressChart';
import { GoalAnalytics } from './GoalAnalytics';
import { format } from '@/utils/chartUtils';

interface GoalDetailsProps {
  goalId: string;
  onClose: () => void;
  onEdit?: (goal: any) => void;
  onDelete?: (goalId: string) => void;
}

interface LogTimelineEntry {
  id: string;
  date: Date;
  value: number;
  notes?: string;
  percentage: number;
  isTarget: boolean;
  isPersonalBest: boolean;
}

export function GoalDetails({ goalId, onClose, onEdit, onDelete }: GoalDetailsProps) {
  const { user } = useUser();
  const [goal, setGoal] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [timelineLogs, setTimelineLogs] = useState<LogTimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [newLogValue, setNewLogValue] = useState('');
  const [newLogNotes, setNewLogNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'analytics'>('overview');

  useEffect(() => {
    if (goalId && user) {
      loadGoalDetails();
    }
  }, [goalId, user]);

  const loadGoalDetails = async () => {
    try {
      setLoading(true);
      // In a real app, these would be API calls
      // For now, using mock data
      const mockGoal = {
        id: goalId,
        title: 'Morning Run',
        description: 'Start each day with a 5km run to build cardiovascular endurance',
        metric: 'distance',
        target: 5,
        frequency: 'daily',
        isActive: true,
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date()
      };

      const mockLogs = [
        { id: '1', goalId, date: new Date('2024-07-20'), value: 5.2, notes: 'Great morning run!' },
        { id: '2', goalId, date: new Date('2024-07-19'), value: 4.8, notes: 'Felt a bit tired' },
        { id: '3', goalId, date: new Date('2024-07-18'), value: 5.5, notes: 'New personal best!' },
        { id: '4', goalId, date: new Date('2024-07-17'), value: 5.0, notes: 'Perfect target hit' },
        { id: '5', goalId, date: new Date('2024-07-16'), value: 4.2, notes: 'Short run today' },
        { id: '6', goalId, date: new Date('2024-07-15'), value: 6.0, notes: 'Feeling strong!' },
        { id: '7', goalId, date: new Date('2024-07-14'), value: 5.1, notes: 'Steady pace' }
      ];

      setGoal(mockGoal);
      setLogs(mockLogs);

      // Process timeline data
      const personalBest = Math.max(...mockLogs.map(log => log.value));
      const timeline = mockLogs.map(log => ({
        id: log.id,
        date: log.date,
        value: log.value,
        notes: log.notes,
        percentage: (log.value / mockGoal.target) * 100,
        isTarget: log.value >= mockGoal.target,
        isPersonalBest: log.value === personalBest
      })).sort((a, b) => b.date.getTime() - a.date.getTime());

      setTimelineLogs(timeline);
    } catch (error) {
      console.error('Error loading goal details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async () => {
    if (!newLogValue || !user) return;

    try {
      const value = parseFloat(newLogValue);
      const newLog = {
        id: Date.now().toString(),
        goalId,
        date: new Date(),
        value,
        notes: newLogNotes,
        userId: user.uid
      };

      // In a real app, this would be an API call
      console.log('Adding log:', newLog);
      
      // Update local state
      setLogs(prev => [newLog, ...prev]);
      
      // Reset form
      setNewLogValue('');
      setNewLogNotes('');
      setShowAddLog(false);
      
      // Reload timeline
      await loadGoalDetails();
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  const handleDeleteGoal = async () => {
    if (!goal) return;

    try {
      // In a real app, this would be an API call
      console.log('Deleting goal:', goal.id);
      onDelete?.(goal.id);
      onClose();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'count': return 'times';
      case 'duration': return 'minutes';
      case 'distance': return 'km';
      case 'weight': return 'kg';
      default: return metric;
    }
  };

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'duration':
        return value >= 60 ? `${Math.floor(value / 60)}h ${value % 60}m` : `${value}m`;
      case 'distance':
        return `${value.toFixed(1)} km`;
      case 'weight':
        return `${value.toFixed(1)} kg`;
      default:
        return value.toString();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Goal Not Found</h3>
          <p className="text-gray-600 mb-4">The requested goal could not be loaded.</p>
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    totalLogs: logs.length,
    averageValue: logs.length > 0 ? logs.reduce((sum, log) => sum + log.value, 0) / logs.length : 0,
    bestValue: logs.length > 0 ? Math.max(...logs.map(log => log.value)) : 0,
    targetHits: timelineLogs.filter(log => log.isTarget).length,
    completionRate: logs.length > 0 ? (timelineLogs.filter(log => log.isTarget).length / logs.length) * 100 : 0,
    currentStreak: calculateCurrentStreak(timelineLogs),
    daysSinceCreated: Math.ceil((new Date().getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{goal.title}</h2>
            <p className="text-gray-600 mt-1">{goal.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>Target: {formatValue(goal.target, goal.metric)}</span>
              <span>•</span>
              <span className="capitalize">{goal.frequency}</span>
              <span>•</span>
              <span>Created {format(goal.createdAt, 'MMM dd, yyyy')}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddLog(true)}
              className="btn btn-primary btn-sm"
            >
              Add Log
            </button>
            <button
              onClick={() => onEdit?.(goal)}
              className="btn btn-secondary btn-sm"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-danger btn-sm"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
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
              onClick={() => setActiveTab('timeline')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timeline'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📅 Timeline
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📈 Analytics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalLogs}</div>
                <div className="text-sm text-gray-600">Total Logs</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatValue(stats.averageValue, goal.metric)}
                </div>
                <div className="text-sm text-gray-600">Average</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatValue(stats.bestValue, goal.metric)}
                </div>
                <div className="text-sm text-gray-600">Personal Best</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.targetHits}</div>
                <div className="text-sm text-gray-600">Target Hits</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{Math.round(stats.completionRate)}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.currentStreak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
            </div>

                {/* Progress Chart */}
                <div>
                  <GoalProgressChart
                    goal={goal}
                    logs={logs}
                    daysCount={30}
                    showTarget={true}
                  />
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
              {timelineLogs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Activities Yet</h4>
                  <p className="text-gray-600 mb-4">Start logging your activities to see your progress!</p>
                  <button
                    onClick={() => setShowAddLog(true)}
                    className="btn btn-primary"
                  >
                    Add First Log
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {timelineLogs.map((log, index) => (
                    <div key={log.id} className="flex items-start space-x-4">
                      {/* Timeline Line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          log.isPersonalBest
                            ? 'bg-purple-500 border-purple-500'
                            : log.isTarget
                              ? 'bg-green-500 border-green-500'
                              : 'bg-gray-300 border-gray-300'
                        }`}>
                          {log.isPersonalBest && (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-white text-xs">★</span>
                            </div>
                          )}
                        </div>
                        {index < timelineLogs.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                        )}
                      </div>

                      {/* Log Content */}
                      <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">
                              {format(log.date, 'EEEE, MMM dd')}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              log.isPersonalBest
                                ? 'bg-purple-100 text-purple-800'
                                : log.isTarget
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {log.isPersonalBest ? 'Personal Best!' : log.isTarget ? 'Target Hit!' : 'Below Target'}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatValue(log.value, goal.metric)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {Math.round(log.percentage)}% of target
                            </div>
                          </div>
                        </div>

                        {log.notes && (
                          <div className="text-sm text-gray-600 bg-gray-50 rounded p-2 mt-2">
                            "{log.notes}"
                          </div>
                        )}

                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                log.isPersonalBest
                                  ? 'bg-purple-500'
                                  : log.isTarget
                                    ? 'bg-green-500'
                                    : 'bg-gray-400'
                              }`}
                              style={{ width: `${Math.min(100, log.percentage)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <GoalAnalytics goal={goal} logs={logs} />
            )}
          </div>
        </div>

        {/* Add Log Modal */}
        {showAddLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Activity Log</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value ({getMetricLabel(goal.metric)})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLogValue}
                    onChange={(e) => setNewLogValue(e.target.value)}
                    className="input w-full"
                    placeholder={`Enter ${goal.metric} value`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={newLogNotes}
                    onChange={(e) => setNewLogNotes(e.target.value)}
                    className="input w-full h-20 resize-none"
                    placeholder="How did it go? Any notes about this activity..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddLog(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLog}
                  disabled={!newLogValue}
                  className="btn btn-primary"
                >
                  Add Log
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Goal</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{goal.title}"? This action cannot be undone and will also delete all associated activity logs.
                </p>

                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteGoal}
                    className="btn btn-danger"
                  >
                    Delete Goal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function calculateCurrentStreak(logs: LogTimelineEntry[]): number {
  let streak = 0;
  const sortedLogs = logs.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  for (const log of sortedLogs) {
    if (log.isTarget) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
