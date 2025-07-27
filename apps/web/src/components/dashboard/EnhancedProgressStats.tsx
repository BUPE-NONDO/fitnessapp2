import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { ProgressMilestoneService, ProgressStats, WeeklyMilestone } from '@/services/progressMilestoneService';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface EnhancedProgressStatsProps {
  className?: string;
}

export function EnhancedProgressStats({ className = '' }: EnhancedProgressStatsProps) {
  const { user } = useUser();
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<WeeklyMilestone | null>(null);

  useEffect(() => {
    if (user) {
      loadProgressStats();
    }
  }, [user]);

  const loadProgressStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const stats = await ProgressMilestoneService.getProgressStats(user.uid);
      setProgressStats(stats);
    } catch (error) {
      console.error('Failed to load progress stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!progressStats) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Start Your Fitness Journey
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your first goal to see your progress stats!
          </p>
        </div>
      </div>
    );
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
    if (streak >= 14) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
    if (streak >= 7) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    if (streak >= 3) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const stats = [
    {
      label: 'Current Streak',
      value: `${progressStats.currentStreak} days`,
      icon: '🔥',
      color: getStreakColor(progressStats.currentStreak),
      description: progressStats.currentStreak > 0 ? 'Keep it going!' : 'Start today!'
    },
    {
      label: 'Weekly Progress',
      value: `${Math.round(progressStats.weeklyCompletionRate)}%`,
      icon: '📊',
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      description: 'This week\'s completion'
    },
    {
      label: 'Total Workouts',
      value: progressStats.totalWorkouts,
      icon: '🏋️‍♂️',
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
      description: 'Workouts completed'
    },
    {
      label: 'Calories Burned',
      value: progressStats.totalCaloriesBurned.toLocaleString(),
      icon: '🔥',
      color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      description: 'Total calories'
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Progress Overview
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your fitness journey at a glance
          </p>
        </div>
        <div className="text-2xl">🎯</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={cn('text-center p-4 rounded-lg', stat.color)}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-xl font-bold mb-1 text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">
              {stat.label}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {stat.description}
            </div>
          </div>
        ))}
      </div>

      {/* Next Milestone */}
      {progressStats.nextMilestoneTarget && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Next Milestone
            </h4>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {progressStats.nextMilestoneTarget.current} / {progressStats.nextMilestoneTarget.target}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {progressStats.nextMilestoneTarget.description}
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min((progressStats.nextMilestoneTarget.current / progressStats.nextMilestoneTarget.target) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Recent Milestones */}
      {progressStats.recentMilestones.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Recent Achievements
          </h4>
          <div className="space-y-2">
            {progressStats.recentMilestones.slice(0, 3).map((milestone, index) => (
              <div
                key={milestone.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                  milestone.milestoneAchieved 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-gray-50 dark:bg-gray-700'
                )}
                onClick={() => setSelectedMilestone(milestone)}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                    milestone.milestoneAchieved 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                  )}>
                    {milestone.milestoneAchieved ? '🏆' : '📅'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Week of {milestone.weekStart.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {milestone.milestoneDescription || `${Math.round(milestone.weeklyCompletionRate)}% completion`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    'text-sm font-bold',
                    getProgressColor(milestone.weeklyCompletionRate)
                  )}>
                    {Math.round(milestone.weeklyCompletionRate)}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {milestone.workoutsCompleted} workouts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestone Detail Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedMilestone(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Week Details
              </h3>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {selectedMilestone.milestoneAchieved ? '🏆' : '📊'}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {selectedMilestone.milestoneDescription || 'Week Completed'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedMilestone.weekStart.toLocaleDateString()} - {selectedMilestone.weekEnd.toLocaleDateString()}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {Math.round(selectedMilestone.weeklyCompletionRate)}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Completion Rate
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedMilestone.workoutsCompleted}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Workouts
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedMilestone.totalCaloriesBurned}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Calories
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {Math.round(selectedMilestone.totalExerciseTime / 60)}h
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Exercise Time
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
