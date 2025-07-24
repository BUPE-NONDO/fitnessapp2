import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'welcome' | 'goal' | 'streak' | 'achievement' | 'milestone';
  earned: boolean;
  earnedDate?: Date;
  requirement?: string;
}

interface BadgeSystemProps {
  className?: string;
}

export function BadgeSystem({ className = '' }: BadgeSystemProps) {
  const { userProfile } = useUser();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (userProfile) {
      const userBadges = generateUserBadges(userProfile);
      setBadges(userBadges);
    }
  }, [userProfile]);

  const generateUserBadges = (user: any): Badge[] => {
    const allBadges: Badge[] = [
      // Welcome Badges
      {
        id: 'welcome',
        name: 'Welcome Warrior',
        description: 'Completed your fitness profile setup',
        icon: '🎯',
        color: 'bg-blue-500',
        category: 'welcome',
        earned: !!user.onboardingCompleted,
        earnedDate: user.onboardingCompleted ? user.createdAt : undefined
      },
      {
        id: 'first-goal',
        name: 'Goal Setter',
        description: 'Created your first fitness goal',
        icon: '🎯',
        color: 'bg-green-500',
        category: 'goal',
        earned: user.stats?.totalGoals > 0,
        requirement: 'Create your first goal'
      },

      // Goal-specific badges
      {
        id: 'fat-burner',
        name: 'Fat Burner',
        description: 'Ready to torch calories and lose weight',
        icon: '🔥',
        color: 'bg-red-500',
        category: 'goal',
        earned: user.onboardingData?.primaryGoal === 'lose-weight',
        earnedDate: user.onboardingData?.completedAt
      },
      {
        id: 'muscle-builder',
        name: 'Muscle Builder',
        description: 'Ready to build strength and muscle',
        icon: '💪',
        color: 'bg-green-600',
        category: 'goal',
        earned: user.onboardingData?.primaryGoal === 'gain-muscle',
        earnedDate: user.onboardingData?.completedAt
      },
      {
        id: 'body-sculptor',
        name: 'Body Sculptor',
        description: 'Ready to tone and sculpt your physique',
        icon: '✨',
        color: 'bg-purple-500',
        category: 'goal',
        earned: user.onboardingData?.primaryGoal === 'tone-body',
        earnedDate: user.onboardingData?.completedAt
      },
      {
        id: 'endurance-athlete',
        name: 'Endurance Athlete',
        description: 'Ready to boost stamina and endurance',
        icon: '🏃',
        color: 'bg-orange-500',
        category: 'goal',
        earned: user.onboardingData?.primaryGoal === 'increase-endurance',
        earnedDate: user.onboardingData?.completedAt
      },

      // Fitness level badges
      {
        id: 'fresh-start',
        name: 'Fresh Start',
        description: 'Beginning your fitness journey',
        icon: '🌱',
        color: 'bg-green-400',
        category: 'welcome',
        earned: user.onboardingData?.fitnessLevel === 'beginner',
        earnedDate: user.onboardingData?.completedAt
      },
      {
        id: 'level-up',
        name: 'Level Up',
        description: 'Taking your fitness to the next level',
        icon: '⬆️',
        color: 'bg-blue-400',
        category: 'welcome',
        earned: user.onboardingData?.fitnessLevel === 'intermediate',
        earnedDate: user.onboardingData?.completedAt
      },
      {
        id: 'elite-performer',
        name: 'Elite Performer',
        description: 'Advanced athlete ready for challenges',
        icon: '🏆',
        color: 'bg-yellow-500',
        category: 'welcome',
        earned: user.onboardingData?.fitnessLevel === 'advanced',
        earnedDate: user.onboardingData?.completedAt
      },

      // Streak badges
      {
        id: 'consistent',
        name: 'Consistent',
        description: 'Maintained a 7-day streak',
        icon: '📅',
        color: 'bg-indigo-500',
        category: 'streak',
        earned: user.stats?.streakDays >= 7,
        requirement: 'Maintain a 7-day streak'
      },
      {
        id: 'dedicated',
        name: 'Dedicated',
        description: 'Maintained a 30-day streak',
        icon: '🔥',
        color: 'bg-red-600',
        category: 'streak',
        earned: user.stats?.streakDays >= 30,
        requirement: 'Maintain a 30-day streak'
      },

      // Achievement badges
      {
        id: 'goal-crusher',
        name: 'Goal Crusher',
        description: 'Completed 5 fitness goals',
        icon: '🎯',
        color: 'bg-purple-600',
        category: 'achievement',
        earned: user.stats?.totalGoals >= 5,
        requirement: 'Complete 5 goals'
      },
      {
        id: 'workout-warrior',
        name: 'Workout Warrior',
        description: 'Logged 50 workouts',
        icon: '⚔️',
        color: 'bg-gray-700',
        category: 'achievement',
        earned: user.stats?.totalLogs >= 50,
        requirement: 'Log 50 workouts'
      }
    ];

    return allBadges;
  };

  const categories = [
    { id: 'all', name: 'All Badges', icon: '🏆' },
    { id: 'welcome', name: 'Welcome', icon: '👋' },
    { id: 'goal', name: 'Goals', icon: '🎯' },
    { id: 'streak', name: 'Streaks', icon: '🔥' },
    { id: 'achievement', name: 'Achievements', icon: '⭐' },
    { id: 'milestone', name: 'Milestones', icon: '🏁' }
  ];

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory);

  const earnedBadges = badges.filter(badge => badge.earned);
  const totalBadges = badges.length;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🏆 Badge Collection
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {earnedBadges.length} of {totalBadges} badges earned
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round((earnedBadges.length / totalBadges) * 100)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${(earnedBadges.length / totalBadges) * 100}%` }}
        ></div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className={`relative rounded-xl p-4 border-2 transition-all duration-200 ${
              badge.earned
                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
            }`}
          >
            {badge.earned && (
              <div className="absolute -top-2 -right-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            <div className={`w-16 h-16 ${badge.color} rounded-full flex items-center justify-center text-3xl mx-auto mb-3 ${
              !badge.earned ? 'grayscale' : ''
            }`}>
              {badge.icon}
            </div>

            <h3 className={`font-bold text-center mb-2 ${
              badge.earned ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {badge.name}
            </h3>

            <p className={`text-sm text-center mb-3 ${
              badge.earned ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
            }`}>
              {badge.description}
            </p>

            {badge.earned && badge.earnedDate && (
              <div className="text-xs text-center text-green-600 dark:text-green-400">
                Earned {badge.earnedDate.toLocaleDateString()}
              </div>
            )}

            {!badge.earned && badge.requirement && (
              <div className="text-xs text-center text-gray-500 dark:text-gray-400 italic">
                {badge.requirement}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-gray-500 dark:text-gray-400">
            No badges in this category yet. Keep working towards your goals!
          </p>
        </div>
      )}
    </div>
  );
}
