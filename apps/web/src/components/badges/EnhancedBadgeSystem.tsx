import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { BadgeIcon, Icon } from '@/components/ui/Icon';
import { Badge as BadgeDefinition, ProgressMilestone } from '@fitness-app/shared';
import { cn } from '@/lib/utils';

interface EnhancedBadge extends BadgeDefinition {
  earned: boolean;
  earnedDate?: Date;
  progress?: number; // 0-100
  requirement?: string;
}

interface BadgeSystemProps {
  className?: string;
  showProgress?: boolean;
  category?: string;
}

export function EnhancedBadgeSystem({ 
  className = '', 
  showProgress = true,
  category = 'all' 
}: BadgeSystemProps) {
  const { userProfile } = useUser();
  const [badges, setBadges] = useState<EnhancedBadge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(category);
  const [earnedCount, setEarnedCount] = useState(0);

  useEffect(() => {
    if (userProfile) {
      const userBadges = generateEnhancedBadges(userProfile);
      setBadges(userBadges);
      setEarnedCount(userBadges.filter(b => b.earned).length);
    }
  }, [userProfile]);

  const generateEnhancedBadges = (user: any): EnhancedBadge[] => {
    const allBadges: EnhancedBadge[] = [
      // Onboarding Badges
      {
        id: 'welcome-warrior',
        name: 'Welcome Warrior',
        description: 'Completed your fitness profile setup',
        icon: 'rocket',
        iconColor: '#3B82F6',
        category: 'onboarding',
        requirements: { type: 'onboarding_complete' },
        rarity: 'common',
        points: 10,
        order: 1,
        isActive: true,
        earned: !!user.onboardingCompleted,
        earnedDate: user.onboardingCompleted ? user.createdAt : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'goal-setter',
        name: 'Goal Setter',
        description: 'Created your first fitness goal',
        icon: 'target',
        iconColor: '#10B981',
        category: 'onboarding',
        requirements: { type: 'goal_created', count: 1 },
        rarity: 'common',
        points: 15,
        order: 2,
        isActive: true,
        earned: user.stats?.totalGoals > 0,
        requirement: 'Create your first goal',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'first-step',
        name: 'First Step',
        description: 'Logged your first workout',
        icon: 'activity',
        iconColor: '#F59E0B',
        category: 'onboarding',
        requirements: { type: 'activity_logged', count: 1 },
        rarity: 'common',
        points: 20,
        order: 3,
        isActive: true,
        earned: user.stats?.totalLogs > 0,
        requirement: 'Log your first workout',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Progress Badges
      {
        id: 'streak-starter',
        name: 'Streak Starter',
        description: 'Maintained a 3-day workout streak',
        icon: 'flame',
        iconColor: '#EF4444',
        category: 'progress',
        requirements: { type: 'streak', days: 3 },
        rarity: 'common',
        points: 25,
        order: 4,
        isActive: true,
        earned: user.progressStats?.currentStreak >= 3,
        progress: user.progressStats?.currentStreak ? Math.min(100, (user.progressStats.currentStreak / 3) * 100) : 0,
        requirement: 'Maintain a 3-day streak',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'week-warrior',
        name: 'Week Warrior',
        description: 'Completed 7 consecutive days of activity',
        icon: 'crown',
        iconColor: '#8B5CF6',
        category: 'progress',
        requirements: { type: 'streak', days: 7 },
        rarity: 'rare',
        points: 50,
        order: 5,
        isActive: true,
        earned: user.progressStats?.currentStreak >= 7,
        progress: user.progressStats?.currentStreak ? Math.min(100, (user.progressStats.currentStreak / 7) * 100) : 0,
        requirement: 'Maintain a 7-day streak',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Achievement Badges
      {
        id: 'goal-crusher',
        name: 'Goal Crusher',
        description: 'Completed 5 fitness goals',
        icon: 'trophy',
        iconColor: '#F59E0B',
        category: 'achievement',
        requirements: { type: 'goal_achieved', count: 5 },
        rarity: 'epic',
        points: 100,
        order: 6,
        isActive: true,
        earned: user.stats?.totalGoalsCompleted >= 5,
        progress: user.stats?.totalGoalsCompleted ? Math.min(100, (user.stats.totalGoalsCompleted / 5) * 100) : 0,
        requirement: 'Complete 5 goals',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'workout-warrior',
        name: 'Workout Warrior',
        description: 'Logged 50 workouts',
        icon: 'dumbbell',
        iconColor: '#6B7280',
        category: 'achievement',
        requirements: { type: 'activity_logged', count: 50 },
        rarity: 'epic',
        points: 150,
        order: 7,
        isActive: true,
        earned: user.stats?.totalLogs >= 50,
        progress: user.stats?.totalLogs ? Math.min(100, (user.stats.totalLogs / 50) * 100) : 0,
        requirement: 'Log 50 workouts',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Milestone Badges
      {
        id: 'consistency-king',
        name: 'Consistency King',
        description: 'Maintained 80% weekly consistency for a month',
        icon: 'medal',
        iconColor: '#DC2626',
        category: 'milestone',
        requirements: { type: 'consistency', percentage: 80, days: 30 },
        rarity: 'legendary',
        points: 200,
        order: 8,
        isActive: true,
        earned: false, // This would need more complex calculation
        progress: 0,
        requirement: 'Maintain 80% consistency for 30 days',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return allBadges;
  };

  const categories = [
    { id: 'all', name: 'All Badges', icon: 'hexagon' },
    { id: 'onboarding', name: 'Getting Started', icon: 'rocket' },
    { id: 'progress', name: 'Progress', icon: 'trending_up' },
    { id: 'achievement', name: 'Achievements', icon: 'trophy' },
    { id: 'milestone', name: 'Milestones', icon: 'crown' },
  ];

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory);

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Badge Collection
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {earnedCount} of {badges.length} badges earned
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="trophy" className="text-yellow-500" />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {badges.reduce((total, badge) => total + (badge.earned ? badge.points : 0), 0)} pts
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(earnedCount / badges.length) * 100}%` }}
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
              selectedCategory === cat.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <Icon name={cat.icon as any} size={16} />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className={cn(
              'relative rounded-xl p-6 border-2 transition-all duration-300 hover:scale-105',
              badge.earned
                ? 'border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-75'
            )}
          >
            {/* Rarity Indicator */}
            <div className={cn(
              'absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r',
              getRarityGradient(badge.rarity)
            )} />

            {/* Badge Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                badge.earned 
                  ? 'bg-white dark:bg-gray-800 shadow-lg' 
                  : 'bg-gray-200 dark:bg-gray-700'
              )}>
                <BadgeIcon 
                  name={badge.icon as any} 
                  rarity={badge.rarity}
                  size="lg"
                />
              </div>
            </div>

            {/* Badge Info */}
            <div className="text-center space-y-2">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {badge.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {badge.description}
              </p>
              
              {/* Progress Bar for Unearned Badges */}
              {!badge.earned && showProgress && badge.progress !== undefined && (
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(badge.progress)}% complete
                  </p>
                </div>
              )}

              {/* Requirement */}
              {!badge.earned && badge.requirement && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  {badge.requirement}
                </p>
              )}

              {/* Points */}
              <div className="flex items-center justify-center space-x-1">
                <Icon name="star" size={14} className="text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {badge.points} pts
                </span>
              </div>
            </div>

            {/* Earned Indicator */}
            {badge.earned && (
              <div className="absolute -top-2 -right-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Icon name="check_circle" size={20} className="text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EnhancedBadgeSystem;
