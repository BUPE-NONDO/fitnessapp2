import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { ProgressMilestoneService, WeeklyMilestone } from '@/services/progressMilestoneService';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface WeeklyMilestoneTrackerProps {
  className?: string;
}

export function WeeklyMilestoneTracker({ className = '' }: WeeklyMilestoneTrackerProps) {
  const { user } = useUser();
  const [milestones, setMilestones] = useState<WeeklyMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekProgress, setCurrentWeekProgress] = useState({
    completionRate: 0,
    workoutsCompleted: 0,
    caloriesBurned: 0,
    daysRemaining: 0
  });

  useEffect(() => {
    if (user) {
      loadMilestones();
      calculateCurrentWeekProgress();
    }
  }, [user]);

  const loadMilestones = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const stats = await ProgressMilestoneService.getProgressStats(user.uid);
      setMilestones(stats.recentMilestones);
    } catch (error) {
      console.error('Failed to load milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentWeekProgress = async () => {
    if (!user) return;

    try {
      const stats = await ProgressMilestoneService.getProgressStats(user.uid);
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysRemaining = 7 - dayOfWeek;
      
      setCurrentWeekProgress({
        completionRate: stats.weeklyCompletionRate,
        workoutsCompleted: stats.totalWorkouts, // This would need to be filtered for current week
        caloriesBurned: stats.totalCaloriesBurned, // This would need to be filtered for current week
        daysRemaining
      });
    } catch (error) {
      console.error('Failed to calculate current week progress:', error);
    }
  };

  const getMilestoneIcon = (milestone: WeeklyMilestone) => {
    if (milestone.milestoneAchieved) {
      switch (milestone.milestoneType) {
        case 'consistency': return '🎯';
        case 'streak': return '🔥';
        case 'workouts': return '🏋️‍♂️';
        case 'calories': return '⚡';
        default: return '🏆';
      }
    }
    return '📅';
  };

  const getMilestoneColor = (milestone: WeeklyMilestone) => {
    if (milestone.milestoneAchieved) {
      switch (milestone.milestoneType) {
        case 'consistency': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
        case 'streak': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
        case 'workouts': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
        case 'calories': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
        default: return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      }
    }
    return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCurrentWeekTarget = () => {
    const { completionRate, daysRemaining } = currentWeekProgress;
    
    if (completionRate >= 80) {
      return {
        message: "Excellent week! You're crushing your goals! 🎉",
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
      };
    } else if (completionRate >= 60) {
      return {
        message: `Great progress! ${daysRemaining} days left to reach 80%`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
      };
    } else if (completionRate >= 40) {
      return {
        message: `Keep going! ${daysRemaining} days to improve your week`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
      };
    } else {
      return {
        message: `Let's turn this week around! ${daysRemaining} days remaining`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20'
      };
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentWeekTarget = getCurrentWeekTarget();

  // Weekly challenges with exercises
  const weeklyExerciseChallenges = [
    {
      id: 1,
      title: "Push-up Power Week",
      description: "Complete 100 push-ups this week",
      exercises: ["Push-ups: 3 sets of 10-15", "Incline push-ups: 2 sets of 8-12", "Wall push-ups: 2 sets of 15-20"],
      progress: 65,
      target: 100,
      icon: "💪",
      difficulty: "Beginner"
    },
    {
      id: 2,
      title: "Cardio Blast Challenge",
      description: "Burn 1000 calories through cardio",
      exercises: ["Jumping jacks: 3 sets of 30s", "High knees: 3 sets of 30s", "Burpees: 2 sets of 5-8"],
      progress: 750,
      target: 1000,
      icon: "🔥",
      difficulty: "Intermediate"
    },
    {
      id: 3,
      title: "Core Strength Week",
      description: "Hold planks for 10 minutes total",
      exercises: ["Plank hold: 3 sets of 30-60s", "Side planks: 2 sets of 20s each", "Mountain climbers: 3 sets of 20"],
      progress: 420,
      target: 600,
      icon: "⚡",
      difficulty: "Beginner"
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Weekly Challenges
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete exercises to unlock achievements
          </p>
        </div>
        <div className="text-2xl">🎯</div>
      </div>

      {/* Weekly Exercise Challenges */}
      <div className="space-y-4 mb-6">
        {weeklyExerciseChallenges.map((challenge) => (
          <div key={challenge.id} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{challenge.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {challenge.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {challenge.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {challenge.progress}/{challenge.target}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {challenge.difficulty}
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }}
              />
            </div>

            <div className="space-y-1">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Exercises to complete:</h5>
              {challenge.exercises.map((exercise, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>{exercise}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Current Week Progress Summary */}
      <div className={cn('p-4 rounded-lg mb-6', currentWeekTarget.bgColor)}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Overall Progress
          </h4>
          <span className={cn('font-bold', getProgressColor(currentWeekProgress.completionRate))}>
            {Math.round(currentWeekProgress.completionRate)}%
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(currentWeekProgress.completionRate, 100)}%` }}
          />
        </div>

        <p className={cn('text-sm font-medium', currentWeekTarget.color)}>
          {currentWeekTarget.message}
        </p>

        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {currentWeekProgress.workoutsCompleted}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Workouts
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {currentWeekProgress.caloriesBurned}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Calories
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {currentWeekProgress.daysRemaining}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Days Left
            </div>
          </div>
        </div>
      </div>

      {/* Recent Milestones */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Recent Weeks
        </h4>
        
        {milestones.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-gray-600 dark:text-gray-400">
              Complete your first week to see milestones!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.slice(0, 4).map((milestone, index) => (
              <div
                key={milestone.id}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg border transition-colors',
                  milestone.milestoneAchieved 
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-lg',
                    getMilestoneColor(milestone)
                  )}>
                    {getMilestoneIcon(milestone)}
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {milestone.milestoneDescription || 'Week Completed'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {milestone.weekStart.toLocaleDateString()} - {milestone.weekEnd.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={cn(
                    'text-lg font-bold',
                    getProgressColor(milestone.weeklyCompletionRate)
                  )}>
                    {Math.round(milestone.weeklyCompletionRate)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {milestone.workoutsCompleted} workouts
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Milestone Targets */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          Weekly Milestone Targets
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <span>🎯</span>
            <span className="text-gray-600 dark:text-gray-400">80% completion = Consistency Master</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🔥</span>
            <span className="text-gray-600 dark:text-gray-400">7+ day streak = Fire Keeper</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🏋️‍♂️</span>
            <span className="text-gray-600 dark:text-gray-400">4+ workouts = Workout Warrior</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>⚡</span>
            <span className="text-gray-600 dark:text-gray-400">1000+ calories = Calorie Crusher</span>
          </div>
        </div>
      </div>
    </div>
  );
}
