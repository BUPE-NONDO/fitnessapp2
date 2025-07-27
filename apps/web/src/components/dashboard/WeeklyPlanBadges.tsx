import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { useUserProgression } from '@/hooks/useUserProgression';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface WeeklyPlanBadgesProps {
  className?: string;
  onWeekSelect?: (week: WeekPlan) => void;
  onWeekComplete?: (week: WeekPlan) => void;
}

interface WeekPlan {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  workoutsPerWeek: number;
  estimatedDuration: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrentWeek: boolean;
  completionRate: number;
  exercises: string[];
  focusAreas: string[];
  requiredPreviousWeeks: number[];
}

export function WeeklyPlanBadges({
  className = '',
  onWeekSelect,
  onWeekComplete
}: WeeklyPlanBadgesProps) {
  const { user } = useUser();
  const { weeklyGoals, weeklyCompletionRate } = useDailyGoals();
  const {
    progression,
    isWeekUnlocked,
    isWeekCompleted,
    isCurrentWeek,
    completeWeek
  } = useUserProgression();
  const [weeklyPlans, setWeeklyPlans] = useState<WeekPlan[]>([]);
  const [showWeekDetails, setShowWeekDetails] = useState<WeekPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && progression) {
      loadWeeklyPlans();
    }
  }, [user, progression, weeklyCompletionRate]);

  const loadWeeklyPlans = async () => {
    try {
      // Generate plans based on actual user progression
      const plans: WeekPlan[] = [
        {
          id: 'week-1',
          weekNumber: 1,
          title: 'Foundation Week',
          description: 'Build basic fitness habits and learn proper form',
          difficulty: 'beginner',
          workoutsPerWeek: 3,
          estimatedDuration: 20,
          isUnlocked: isWeekUnlocked(1),
          isCompleted: isWeekCompleted(1),
          isCurrentWeek: isCurrentWeek(1),
          completionRate: isWeekCompleted(1) ? 100 : (isCurrentWeek(1) ? weeklyCompletionRate : 0),
          exercises: ['Push-ups', 'Squats', 'Plank', 'Walking'],
          focusAreas: ['Form', 'Consistency'],
          requiredPreviousWeeks: []
        },
        {
          id: 'week-2',
          weekNumber: 2,
          title: 'Strength Building',
          description: 'Increase intensity and add resistance exercises',
          difficulty: 'beginner',
          workoutsPerWeek: 4,
          estimatedDuration: 25,
          isUnlocked: isWeekUnlocked(2),
          isCompleted: isWeekCompleted(2),
          isCurrentWeek: isCurrentWeek(2),
          completionRate: isWeekCompleted(2) ? 100 : (isCurrentWeek(2) ? weeklyCompletionRate : 0),
          exercises: ['Modified Push-ups', 'Lunges', 'Side Plank', 'Jogging'],
          focusAreas: ['Strength', 'Endurance'],
          requiredPreviousWeeks: [1]
        },
        {
          id: 'week-3',
          weekNumber: 3,
          title: 'Cardio Focus',
          description: 'Improve cardiovascular fitness and stamina',
          difficulty: 'intermediate',
          workoutsPerWeek: 4,
          estimatedDuration: 30,
          isUnlocked: isWeekUnlocked(3),
          isCompleted: isWeekCompleted(3),
          isCurrentWeek: isCurrentWeek(3),
          completionRate: isWeekCompleted(3) ? 100 : (isCurrentWeek(3) ? weeklyCompletionRate : 0),
          exercises: ['Burpees', 'Mountain Climbers', 'Jump Squats', 'Running'],
          focusAreas: ['Cardio', 'Fat Burn'],
          requiredPreviousWeeks: [1, 2]
        },
        {
          id: 'week-4',
          weekNumber: 4,
          title: 'Power Week',
          description: 'High-intensity workouts for maximum results',
          difficulty: 'intermediate',
          workoutsPerWeek: 5,
          estimatedDuration: 35,
          isUnlocked: isWeekUnlocked(4),
          isCompleted: isWeekCompleted(4),
          isCurrentWeek: isCurrentWeek(4),
          completionRate: isWeekCompleted(4) ? 100 : (isCurrentWeek(4) ? weeklyCompletionRate : 0),
          exercises: ['Advanced Push-ups', 'Jump Lunges', 'Plank Variations', 'HIIT'],
          focusAreas: ['Power', 'Intensity'],
          requiredPreviousWeeks: [1, 2, 3]
        }
      ];

      setWeeklyPlans(plans);
      setCurrentWeek(2); // Mock current week
      setLoading(false);
    } catch (error) {
      console.error('Failed to load weekly plans:', error);
      setLoading(false);
    }
  };

  // Click handlers
  const handleWeekClick = (plan: WeekPlan) => {
    if (!plan.isUnlocked) return;

    if (plan.isCurrentWeek || plan.isCompleted) {
      setShowWeekDetails(plan);
      onWeekSelect?.(plan);
    }
  };

  const handleStartWeek = (plan: WeekPlan) => {
    if (plan.isUnlocked && !plan.isCompleted) {
      // Mark as current week and start
      setCurrentWeek(plan.weekNumber);
      onWeekSelect?.(plan);
    }
  };

  const handleCompleteWeek = async (plan: WeekPlan) => {
    if (plan.isCurrentWeek && plan.completionRate >= 80) {
      try {
        // Use progression service to complete week
        await completeWeek(plan.weekNumber);

        // Reload plans to reflect new state
        await loadWeeklyPlans();

        onWeekComplete?.(plan);
      } catch (error) {
        console.error('Failed to complete week:', error);
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'from-green-500 to-emerald-600';
      case 'intermediate': return 'from-blue-500 to-indigo-600';
      case 'advanced': return 'from-purple-500 to-violet-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getBadgeStyle = (plan: WeekPlan) => {
    if (!plan.isUnlocked) {
      return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60';
    }
    if (plan.isCompleted) {
      return 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 text-white shadow-lg';
    }
    if (plan.isCurrentWeek) {
      return `bg-gradient-to-br ${getDifficultyColor(plan.difficulty)} border-blue-400 text-white shadow-xl ring-2 ring-blue-300 ring-offset-2`;
    }
    return 'bg-white dark:bg-blue-900/50 border-blue-200 dark:border-blue-700 hover:shadow-lg';
  };

  const getProgressColor = (plan: WeekPlan) => {
    if (plan.isCompleted) return 'bg-green-500';
    if (plan.isCurrentWeek) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-blue-900/50 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-blue-700 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-blue-200 dark:bg-blue-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-blue-200 dark:bg-blue-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-blue-900/50 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-blue-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Weekly Training Plan
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete each week to unlock the next level
          </p>
        </div>
        <div className="text-2xl">🏆</div>
      </div>

      {/* Weekly Plan Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {weeklyPlans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => handleWeekClick(plan)}
            className={cn(
              'relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105',
              getBadgeStyle(plan),
              !plan.isUnlocked && 'cursor-not-allowed opacity-60'
            )}
          >
            {/* Week Number Badge */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
              {plan.weekNumber}
            </div>

            {/* Lock/Check Icon */}
            <div className="text-center mb-3">
              {!plan.isUnlocked ? (
                <Icon name="lock" size={24} className="text-gray-400 mx-auto" />
              ) : plan.isCompleted ? (
                <Icon name="check_circle" size={24} className="text-white mx-auto" />
              ) : plan.isCurrentWeek ? (
                <Icon name="play_circle" size={24} className="text-white mx-auto" />
              ) : (
                <Icon name="fitness_center" size={24} className="text-blue-600 dark:text-blue-400 mx-auto" />
              )}
            </div>

            {/* Plan Info */}
            <div className="text-center">
              <h4 className={cn(
                'font-semibold text-sm mb-1',
                plan.isUnlocked && (plan.isCompleted || plan.isCurrentWeek) 
                  ? 'text-white' 
                  : 'text-gray-900 dark:text-white'
              )}>
                {plan.title}
              </h4>
              
              <p className={cn(
                'text-xs mb-2',
                plan.isUnlocked && (plan.isCompleted || plan.isCurrentWeek)
                  ? 'text-white/80'
                  : 'text-gray-600 dark:text-gray-400'
              )}>
                {plan.workoutsPerWeek} workouts • {plan.estimatedDuration}min
              </p>

              {/* Progress Bar */}
              {plan.isUnlocked && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className={cn('h-2 rounded-full transition-all duration-300', getProgressColor(plan))}
                    style={{ width: `${plan.completionRate}%` }}
                  ></div>
                </div>
              )}

              {/* Difficulty Badge */}
              <span className={cn(
                'inline-block px-2 py-1 rounded-full text-xs font-medium',
                plan.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                plan.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
              )}>
                {plan.difficulty}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Current Week Details */}
      {weeklyPlans.find(p => p.isCurrentWeek) && (
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Current Week: {weeklyPlans.find(p => p.isCurrentWeek)?.title}
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            {weeklyPlans.find(p => p.isCurrentWeek)?.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {weeklyPlans.find(p => p.isCurrentWeek)?.focusAreas.map((area, index) => (
              <span key={index} className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                {area}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Progress: {weeklyPlans.find(p => p.isCurrentWeek)?.completionRate}%
            </span>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Continue Week
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
