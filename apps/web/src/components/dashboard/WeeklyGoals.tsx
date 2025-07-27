import React from 'react';
import { useDailyGoals } from '@/hooks/useDailyGoals';

interface WeeklyGoalsProps {
  className?: string;
}

export function WeeklyGoals({ className = '' }: WeeklyGoalsProps) {
  const { weeklyGoals, isLoading, weeklyCompletionRate } = useDailyGoals();

  const getGoalIcon = (type: string, isCompleted: boolean) => {
    if (isCompleted) return '✅';
    
    switch (type) {
      case 'workout': return '🏋️‍♂️';
      case 'rest': return '😴';
      case 'active-recovery': return '🚶‍♂️';
      default: return '🎯';
    }
  };

  const getGoalColor = (type: string, isCompleted: boolean) => {
    if (isCompleted) return 'green';
    
    switch (type) {
      case 'workout': return 'blue';
      case 'rest': return 'gray';
      case 'active-recovery': return 'purple';
      default: return 'gray';
    }
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const isPast = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString < today;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No goals state
  if (weeklyGoals.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Weekly Goals
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Complete your onboarding to get your weekly fitness schedule.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            This Week's Goals
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(weeklyCompletionRate)}% completed
          </p>
        </div>
        
        {/* Progress Ring */}
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200 dark:text-gray-700"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-green-500"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${weeklyCompletionRate}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              {Math.round(weeklyCompletionRate)}%
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="grid grid-cols-7 gap-2">
        {weeklyGoals.map((goal, index) => {
          const goalColor = getGoalColor(goal.type, goal.isCompleted);
          const today = isToday(goal.date);
          const past = isPast(goal.date);
          
          return (
            <div
              key={goal.id}
              className={`
                relative p-3 rounded-lg text-center transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-md
                ${today ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' : ''}
                ${goal.isCompleted
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : past
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : goalColor === 'blue'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : goalColor === 'purple'
                        ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                        : 'bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800'
                }
              `}
            >
              {/* Day of Week */}
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {goal.dayOfWeek.slice(0, 3)}
              </div>
              
              {/* Date */}
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {new Date(goal.date).getDate()}
              </div>
              
              {/* Goal Icon */}
              <div className="text-lg mb-1">
                {getGoalIcon(goal.type, goal.isCompleted)}
              </div>
              
              {/* Goal Type */}
              <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                {goal.type === 'active-recovery' ? 'Recovery' : goal.type}
              </div>
              
              {/* Duration (if applicable) */}
              {goal.estimatedDuration > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {goal.estimatedDuration}min
                </div>
              )}
              
              {/* Today indicator */}
              {today && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weekly Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {weeklyGoals.filter(g => g.type === 'workout').length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Workouts</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {weeklyGoals.filter(g => g.isCompleted).length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {weeklyGoals.reduce((total, g) => total + (g.estimatedCalories || 0), 0)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Est. Calories</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex space-x-2">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
          View Full Schedule
        </button>
        <button className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
          Adjust Goals
        </button>
      </div>
    </div>
  );
}
