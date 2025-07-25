import React, { useState, useEffect } from 'react';
import { WeeklyGoal, DailyGoal } from '@fitness-app/shared';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface WeeklyProgressTrackerProps {
  weeklyGoals: WeeklyGoal[];
  dailyGoals: DailyGoal[];
  onUpdateGoal: (goalId: string, progress: number) => void;
  className?: string;
}

export function WeeklyProgressTracker({ 
  weeklyGoals, 
  dailyGoals,
  onUpdateGoal,
  className = '' 
}: WeeklyProgressTrackerProps) {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [weekData, setWeekData] = useState<{
    goals: WeeklyGoal[];
    dailyProgress: { [key: string]: number };
    weekDays: Date[];
  }>({
    goals: [],
    dailyProgress: {},
    weekDays: []
  });

  useEffect(() => {
    const weekStart = getWeekStart(selectedWeek);
    const weekEnd = getWeekEnd(weekStart);
    const weekDays = getWeekDays(weekStart);
    
    // Filter weekly goals for selected week
    const currentWeekGoals = weeklyGoals.filter(goal => 
      goal.weekStart.getTime() === weekStart.getTime()
    );
    
    // Calculate daily progress for the week
    const dailyProgress: { [key: string]: number } = {};
    weekDays.forEach(day => {
      const dayGoals = dailyGoals.filter(goal => 
        goal.date.toDateString() === day.toDateString()
      );
      const completedGoals = dayGoals.filter(goal => goal.completed).length;
      dailyProgress[day.toDateString()] = dayGoals.length > 0 ? (completedGoals / dayGoals.length) * 100 : 0;
    });
    
    setWeekData({
      goals: currentWeekGoals,
      dailyProgress,
      weekDays
    });
  }, [weeklyGoals, dailyGoals, selectedWeek]);

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  const getWeekDays = (weekStart: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'workouts': return 'dumbbell';
      case 'active_days': return 'calendar';
      case 'total_duration': return 'timer';
      case 'weight_loss': return 'trending_down';
      default: return 'target';
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };

  const completedGoals = weekData.goals.filter(goal => goal.completed).length;
  const totalGoals = weekData.goals.length;
  const weekStart = getWeekStart(selectedWeek);
  const weekEnd = getWeekEnd(weekStart);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Weekly Progress
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const prevWeek = new Date(selectedWeek);
              prevWeek.setDate(selectedWeek.getDate() - 7);
              setSelectedWeek(prevWeek);
            }}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Icon name="chevron_left" size={20} />
          </button>
          <button
            onClick={() => setSelectedWeek(new Date())}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            This Week
          </button>
          <button
            onClick={() => {
              const nextWeek = new Date(selectedWeek);
              nextWeek.setDate(selectedWeek.getDate() + 7);
              setSelectedWeek(nextWeek);
            }}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Icon name="chevron_right" size={20} />
          </button>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Week Overview
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {completedGoals}/{totalGoals}
            </span>
            <Icon name="target" className="text-blue-500" />
          </div>
        </div>

        {/* Daily Progress Chart */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Daily Completion</h4>
          <div className="grid grid-cols-7 gap-2">
            {weekData.weekDays.map((day, index) => {
              const progress = weekData.dailyProgress[day.toDateString()] || 0;
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div key={index} className="text-center">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={cn(
                    'w-full h-20 rounded-lg flex flex-col items-center justify-center transition-all duration-300',
                    isToday 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'bg-gray-50 dark:bg-gray-700'
                  )}>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {Math.round(progress)}%
                    </div>
                    <div className="w-8 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                      <div 
                        className="h-1 bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Weekly Goals
        </h3>
        
        {weekData.goals.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Icon name="target" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No weekly goals set
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Set some weekly goals to track your progress!
            </p>
          </div>
        ) : (
          weekData.goals.map((goal) => {
            const progress = getProgressPercentage(goal.current, goal.target);
            const isCompleted = goal.completed;
            
            return (
              <div
                key={goal.id}
                className={cn(
                  'bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 transition-all duration-300',
                  isCompleted 
                    ? 'border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
                    : 'border-gray-200 dark:border-gray-700'
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
                      <Icon 
                        name={getGoalIcon(goal.type) as any}
                        size={24}
                        className={isCompleted ? 'text-green-600' : 'text-gray-600'}
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
                  
                  <div className="flex items-center space-x-4">
                    {/* Progress Bar */}
                    <div className="w-32">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {Math.round(progress)}%
                        </span>
                      </div>
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
                    
                    {/* Status */}
                    {isCompleted ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <Icon name="check_circle" size={24} />
                        <span className="font-medium">Completed!</span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {goal.target - goal.current} {goal.unit} to go
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Icon name="flame" size={24} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Streak</h4>
              <p className="text-2xl font-bold text-blue-600">7 days</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Icon name="activity" size={24} className="text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Active Days</h4>
              <p className="text-2xl font-bold text-green-600">5/7</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Icon name="trophy" size={24} className="text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Goals Met</h4>
              <p className="text-2xl font-bold text-purple-600">{completedGoals}/{totalGoals}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklyProgressTracker;
