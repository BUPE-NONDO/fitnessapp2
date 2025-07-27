import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface WeeklyGoalCollectionProps {
  className?: string;
  onGoalComplete?: (goal: any) => void;
  onWeekComplete?: (weekData: any) => void;
}

interface WeeklyReward {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
}

export function WeeklyGoalCollection({ 
  className = '', 
  onGoalComplete,
  onWeekComplete 
}: WeeklyGoalCollectionProps) {
  const { user } = useUser();
  const { weeklyGoals, weeklyCompletionRate, completeGoal } = useDailyGoals();
  const [showRewards, setShowRewards] = useState(false);
  const [weeklyRewards, setWeeklyRewards] = useState<WeeklyReward[]>([]);
  const [currentWeekProgress, setCurrentWeekProgress] = useState(0);

  useEffect(() => {
    if (weeklyGoals.length > 0) {
      calculateWeekProgress();
      generateWeeklyRewards();
    }
  }, [weeklyGoals]);

  const calculateWeekProgress = () => {
    const completedGoals = weeklyGoals.filter(goal => goal.isCompleted).length;
    const progress = (completedGoals / weeklyGoals.length) * 100;
    setCurrentWeekProgress(progress);

    // Check if week is complete
    if (progress >= 80 && progress < 100) {
      // Week almost complete - show encouragement
    } else if (progress === 100) {
      // Week complete - trigger rewards
      handleWeekComplete();
    }
  };

  const generateWeeklyRewards = () => {
    // Only generate rewards if user has some progress (not completely new)
    const hasProgress = weeklyGoals.some(goal => goal.isCompleted) || weeklyCompletionRate > 0;

    if (!hasProgress) {
      setWeeklyRewards([]);
      return;
    }

    const rewards: WeeklyReward[] = [
      {
        id: 'consistency-bronze',
        title: 'Consistency Champion',
        description: 'Complete 5 days this week',
        icon: '🥉',
        rarity: 'common',
        points: 50,
        unlocked: weeklyCompletionRate >= 70
      },
      {
        id: 'consistency-silver',
        title: 'Weekly Warrior',
        description: 'Complete 6 days this week',
        icon: '🥈',
        rarity: 'rare',
        points: 100,
        unlocked: weeklyCompletionRate >= 85
      },
      {
        id: 'consistency-gold',
        title: 'Perfect Week',
        description: 'Complete all 7 days',
        icon: '🥇',
        rarity: 'epic',
        points: 200,
        unlocked: weeklyCompletionRate >= 100
      },
      {
        id: 'streak-master',
        title: 'Streak Master',
        description: 'Maintain streak for full week',
        icon: '🔥',
        rarity: 'legendary',
        points: 300,
        unlocked: weeklyCompletionRate >= 100 && currentWeekProgress >= 100
      }
    ];
    setWeeklyRewards(rewards);
  };

  const handleGoalClick = async (goal: any) => {
    if (!goal.isCompleted) {
      try {
        await completeGoal(goal.id);
        onGoalComplete?.(goal);
      } catch (error) {
        console.error('Failed to complete goal:', error);
      }
    }
  };

  const handleWeekComplete = () => {
    const weekData = {
      completionRate: weeklyCompletionRate,
      goalsCompleted: weeklyGoals.filter(g => g.isCompleted).length,
      totalGoals: weeklyGoals.length,
      rewards: weeklyRewards.filter(r => r.unlocked)
    };
    
    setShowRewards(true);
    onWeekComplete?.(weekData);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'rare': return 'from-blue-400 to-blue-500';
      case 'epic': return 'from-purple-400 to-purple-500';
      case 'legendary': return 'from-yellow-400 to-yellow-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'workout': return 'fitness_center';
      case 'rest': return 'hotel';
      case 'active-recovery': return 'directions_walk';
      default: return 'flag';
    }
  };

  const getGoalTypeColor = (type: string, isCompleted: boolean) => {
    if (isCompleted) return 'from-green-400 to-green-500';
    
    switch (type) {
      case 'workout': return 'from-blue-400 to-blue-500';
      case 'rest': return 'from-purple-400 to-purple-500';
      case 'active-recovery': return 'from-teal-400 to-teal-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Weekly Goals Collection
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Complete goals to unlock rewards
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(currentWeekProgress)}%
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Week Progress</span>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {weeklyGoals.filter(g => g.isCompleted).length} / {weeklyGoals.length} goals
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${currentWeekProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Daily Goals Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weeklyGoals.map((goal, index) => (
          <div
            key={goal.id}
            onClick={() => handleGoalClick(goal)}
            className={cn(
              'relative p-3 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105',
              `bg-gradient-to-br ${getGoalTypeColor(goal.type, goal.isCompleted)}`,
              goal.isCompleted ? 'shadow-lg' : 'opacity-75 hover:opacity-100'
            )}
          >
            {/* Day */}
            <div className="text-xs font-bold text-white text-center mb-1">
              {goal.dayOfWeek.slice(0, 3)}
            </div>
            
            {/* Icon */}
            <div className="flex justify-center mb-1">
              <Icon 
                name={goal.isCompleted ? 'check_circle' : getGoalTypeIcon(goal.type)} 
                size={16} 
                className="text-white" 
              />
            </div>
            
            {/* Type */}
            <div className="text-xs text-white text-center font-medium">
              {goal.type === 'active-recovery' ? 'Recovery' : goal.type}
            </div>

            {/* Completion indicator */}
            {goal.isCompleted && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <Icon name="check" size={10} className="text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Weekly Rewards Preview */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-900 dark:text-white">Weekly Rewards</h4>
          <button
            onClick={() => setShowRewards(!showRewards)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {showRewards ? 'Hide' : 'Show'} Rewards
          </button>
        </div>
        
        {showRewards && (
          <div className="grid grid-cols-2 gap-3">
            {weeklyRewards.map((reward) => (
              <div
                key={reward.id}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all duration-200',
                  reward.unlocked
                    ? `bg-gradient-to-br ${getRarityColor(reward.rarity)} text-white border-transparent shadow-lg`
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-60'
                )}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">{reward.icon}</div>
                  <div className="text-xs font-bold mb-1">{reward.title}</div>
                  <div className="text-xs opacity-90">{reward.points} pts</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
