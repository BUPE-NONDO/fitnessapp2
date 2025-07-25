import React, { useState, useEffect } from 'react';
import { DailyGoal } from '@fitness-app/shared';
import { Icon, ProgressIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface DailyProgressTrackerProps {
  goals: DailyGoal[];
  onUpdateGoal: (goalId: string, progress: number) => void;
  onCompleteGoal: (goalId: string) => void;
  className?: string;
}

export function DailyProgressTracker({ 
  goals, 
  onUpdateGoal, 
  onCompleteGoal,
  className = '' 
}: DailyProgressTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todayGoals, setTodayGoals] = useState<DailyGoal[]>([]);

  useEffect(() => {
    // Filter goals for selected date
    const dateGoals = goals.filter(goal => 
      goal.date.toDateString() === selectedDate.toDateString()
    );
    setTodayGoals(dateGoals);
  }, [goals, selectedDate]);

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'workout': return 'dumbbell';
      case 'steps': return 'activity';
      case 'water': return 'heart'; // Using heart as water icon placeholder
      case 'sleep': return 'timer';
      case 'meditation': return 'sparkles';
      default: return 'target';
    }
  };

  const getGoalColor = (type: string) => {
    switch (type) {
      case 'workout': return 'text-blue-600';
      case 'steps': return 'text-green-600';
      case 'water': return 'text-cyan-600';
      case 'sleep': return 'text-purple-600';
      case 'meditation': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const completedGoals = todayGoals.filter(goal => goal.completed).length;
  const totalGoals = todayGoals.length;
  const overallProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Daily Progress
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="calendar" className="text-blue-500" />
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Today's Overview
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {completedGoals}/{totalGoals}
            </span>
            <Icon name="target" className="text-blue-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {todayGoals.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Icon name="target" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No goals for this day
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Set some daily goals to track your progress!
            </p>
          </div>
        ) : (
          todayGoals.map((goal) => {
            const progress = getProgressPercentage(goal.current, goal.target);
            const isCompleted = goal.completed;
            
            return (
              <div
                key={goal.id}
                className={cn(
                  'bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 transition-all duration-300',
                  isCompleted 
                    ? 'border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center',
                      isCompleted 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    )}>
                      <ProgressIcon 
                        name={getGoalIcon(goal.type) as any}
                        progress={progress}
                        size={24}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                        {goal.type.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {goal.current} / {goal.target} {goal.unit}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Progress Circle */}
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                          className={cn(
                            'transition-all duration-500',
                            isCompleted ? 'text-green-500' : 'text-blue-500'
                          )}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Complete Button */}
                    {!isCompleted && progress >= 100 && (
                      <button
                        onClick={() => onCompleteGoal(goal.id)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        Complete
                      </button>
                    )}
                    
                    {/* Completed Indicator */}
                    {isCompleted && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <Icon name="check_circle" size={24} />
                        <span className="font-medium">Completed!</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={cn(
                        'h-2 rounded-full transition-all duration-500',
                        isCompleted 
                          ? 'bg-green-500' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['workout', 'steps', 'water', 'meditation'].map((type) => (
            <button
              key={type}
              className="flex flex-col items-center space-y-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <Icon name={getGoalIcon(type) as any} size={24} className={getGoalColor(type)} />
              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                Add {type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DailyProgressTracker;
