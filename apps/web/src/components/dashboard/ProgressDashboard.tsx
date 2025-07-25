import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ProgressTrackingService, ProgressStats } from '@/services/progressTrackingService';
import { Icon } from '@/components/ui/Icon';
import { DailyProgressTracker } from '@/components/progress/DailyProgressTracker';
import { WeeklyProgressTracker } from '@/components/progress/WeeklyProgressTracker';
import { EnhancedBadgeSystem } from '@/components/badges/EnhancedBadgeSystem';
import { WorkoutPlanDisplay } from './WorkoutPlanDisplay';
import { cn } from '@/lib/utils';

interface ProgressDashboardProps {
  className?: string;
}

interface DashboardStats {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  totalGoalsCompleted: number;
  weeklyProgress: number;
  monthlyProgress: number;
  todayProgress: number;
  upcomingMilestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: 'streak' | 'workouts' | 'goals' | 'consistency';
  icon: string;
  color: string;
}

export function ProgressDashboard({ className = '' }: ProgressDashboardProps) {
  const { user, userProfile } = useUser();
  const { restartOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'weekly' | 'badges'>('overview');
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalWorkouts: 0,
    totalGoalsCompleted: 0,
    weeklyProgress: 0,
    monthlyProgress: 0,
    todayProgress: 0,
    upcomingMilestones: [],
  });

  useEffect(() => {
    loadProgressStats();
  }, [user, userProfile]);

  const loadProgressStats = async () => {
    if (!user || !userProfile) return;

    try {
      setLoading(true);
      const realStats = await ProgressTrackingService.calculateProgressStats(user.uid, userProfile);
      setProgressStats(realStats);

      // Calculate dynamic milestones based on real progress
      const upcomingMilestones = generateMilestones(realStats);

      // Calculate today's progress based on check-ins and workouts
      const todayProgress = calculateTodayProgress(realStats);

      // Calculate weekly and monthly progress
      const weeklyProgress = calculateWeeklyProgress(realStats);
      const monthlyProgress = calculateMonthlyProgress(realStats);

      setStats({
        currentStreak: realStats.currentStreak,
        longestStreak: realStats.longestStreak,
        totalWorkouts: realStats.totalWorkouts,
        totalGoalsCompleted: realStats.completedGoals,
        weeklyProgress,
        monthlyProgress,
        todayProgress,
        upcomingMilestones,
      });
    } catch (error) {
      console.error('Failed to load progress stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestartOnboarding = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Are you sure you want to restart your onboarding? This will reset your current plan and preferences. You can create a new personalized plan based on updated goals.'
    );

    if (confirmed) {
      try {
        await restartOnboarding();
      } catch (error) {
        console.error('Failed to restart onboarding:', error);
        alert('Failed to restart onboarding. Please try again.');
      }
    }
  };

  const generateMilestones = (stats: ProgressStats): Milestone[] => {
    const milestones: Milestone[] = [];

    // Streak milestones
    const nextStreakTarget = getNextMilestone(stats.currentStreak, [7, 14, 30, 50, 100]);
    if (nextStreakTarget) {
      milestones.push({
        id: 'streak',
        title: `${nextStreakTarget}-Day Streak`,
        description: `Complete ${nextStreakTarget} consecutive days`,
        target: nextStreakTarget,
        current: stats.currentStreak,
        type: 'streak',
        icon: 'flame',
        color: 'text-orange-500',
      });
    }

    // Workout milestones
    const nextWorkoutTarget = getNextMilestone(stats.totalWorkouts, [10, 25, 50, 100, 250]);
    if (nextWorkoutTarget) {
      milestones.push({
        id: 'workouts',
        title: `${nextWorkoutTarget} Workouts`,
        description: `Log ${nextWorkoutTarget} total workouts`,
        target: nextWorkoutTarget,
        current: stats.totalWorkouts,
        type: 'workouts',
        icon: 'dumbbell',
        color: 'text-blue-500',
      });
    }

    // Goal milestones
    const nextGoalTarget = getNextMilestone(stats.completedGoals, [5, 10, 25, 50, 100]);
    if (nextGoalTarget) {
      milestones.push({
        id: 'goals',
        title: `${nextGoalTarget} Goals`,
        description: `Complete ${nextGoalTarget} fitness goals`,
        target: nextGoalTarget,
        current: stats.completedGoals,
        type: 'goals',
        icon: 'target',
        color: 'text-green-500',
      });
    }

    return milestones.slice(0, 3); // Show top 3 milestones
  };

  const getNextMilestone = (current: number, targets: number[]): number | null => {
    return targets.find(target => target > current) || null;
  };

  const calculateTodayProgress = (stats: ProgressStats): number => {
    // Base progress on check-ins and workouts today
    const hasCheckedInToday = stats.checkInsThisWeek > 0; // Simplified
    const hasWorkedOutToday = stats.workoutsThisWeek > 0; // Simplified

    let progress = 0;
    if (hasCheckedInToday) progress += 50;
    if (hasWorkedOutToday) progress += 50;

    return Math.min(progress, 100);
  };

  const calculateWeeklyProgress = (stats: ProgressStats): number => {
    // Calculate based on workout frequency and goals
    const expectedWorkouts = 3; // Default expectation
    const actualWorkouts = stats.workoutsThisWeek;
    return Math.min((actualWorkouts / expectedWorkouts) * 100, 100);
  };

  const calculateMonthlyProgress = (stats: ProgressStats): number => {
    // Calculate based on monthly goals and consistency
    const expectedWorkouts = 12; // Default monthly expectation
    const actualWorkouts = stats.workoutsThisMonth;
    return Math.min((actualWorkouts / expectedWorkouts) * 100, 100);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'home' },
    { id: 'daily', name: 'Daily', icon: 'calendar' },
    { id: 'weekly', name: 'Weekly', icon: 'bar_chart' },
    { id: 'badges', name: 'Badges', icon: 'trophy' },
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-500';
    if (progress >= 70) return 'text-blue-500';
    if (progress >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const renderOverview = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 bg-blue-400 rounded w-64 mb-2"></div>
                <div className="h-4 bg-blue-300 rounded w-48"></div>
              </div>
              <div className="text-right">
                <div className="h-8 bg-blue-400 rounded w-16 mb-1"></div>
                <div className="h-4 bg-blue-300 rounded w-24"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const getWelcomeMessage = () => {
      if (!progressStats?.onboardingCompleted) {
        return {
          title: `Welcome, ${userProfile?.displayName || 'Fitness Warrior'}! 🎯`,
          subtitle: 'Complete your setup to get a personalized fitness plan.',
          gradient: 'from-orange-500 to-red-600'
        };
      }

      if (progressStats.daysSinceLastActivity > 7) {
        return {
          title: `Welcome back, ${userProfile?.displayName || 'Fitness Warrior'}! 💪`,
          subtitle: 'Ready to get back on track? Let\'s make today count!',
          gradient: 'from-green-500 to-blue-600'
        };
      }

      if (progressStats.currentStreak > 0) {
        return {
          title: `Amazing streak, ${userProfile?.displayName || 'Fitness Warrior'}! 🔥`,
          subtitle: `You're on a ${progressStats.currentStreak}-day streak. Keep it going!`,
          gradient: 'from-blue-500 to-purple-600'
        };
      }

      return {
        title: `Welcome back, ${userProfile?.displayName || 'Fitness Warrior'}! 👋`,
        subtitle: 'You\'re doing great! Keep up the momentum.',
        gradient: 'from-blue-500 to-purple-600'
      };
    };

    const welcomeMessage = getWelcomeMessage();

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className={`bg-gradient-to-r from-purple-500 to-primary-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-circle-lg`}>
          {/* Circle decorations */}
          <div className="absolute top-2 right-2 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-2 left-2 w-16 h-16 bg-white/20 rounded-full"></div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {welcomeMessage.title}
              </h2>
              <p className="text-blue-100">
                {welcomeMessage.subtitle}
              </p>
              {progressStats?.onboardingCompleted && progressStats.daysSinceOnboarding > 0 && (
                <p className="text-blue-200 text-sm mt-2">
                  Day {progressStats.daysSinceOnboarding} of your fitness journey
                </p>
              )}
              {progressStats?.onboardingCompleted && (
                <div className="mt-3 space-x-2">
                  <button
                    onClick={handleRestartOnboarding}
                    disabled={onboardingLoading}
                    className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-4 rounded-full transition-colors shadow-circle"
                  >
                    {onboardingLoading ? '🔄 Restarting...' : '🔄 Restart Onboarding'}
                  </button>
                  <button
                    onClick={() => window.location.href = '/settings'}
                    className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-2 px-4 rounded-full transition-colors shadow-circle"
                  >
                    ⚙️ Settings
                  </button>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.todayProgress}%</div>
              <div className="text-blue-100">Today's Progress</div>
              {progressStats?.isActiveUser && (
                <div className="text-green-200 text-sm mt-1">🟢 Active</div>
              )}
            </div>
          </div>
        </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-circle border border-gray-200 dark:border-gray-700 hover:shadow-circle-lg transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center shadow-circle">
              <Icon name="flame" size={24} className="text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.currentStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Day Streak
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-circle border border-gray-200 dark:border-gray-700 hover:shadow-circle-lg transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center shadow-circle">
              <Icon name="dumbbell" size={24} className="text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalWorkouts}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Workouts
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-circle border border-gray-200 dark:border-gray-700 hover:shadow-circle-lg transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center shadow-circle">
              <Icon name="target" size={24} className="text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalGoalsCompleted}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Goals Met
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Icon name="trending_up" size={24} className="text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.weeklyProgress}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Weekly Goal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Plan Section */}
      <WorkoutPlanDisplay />

      {/* Progress Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-circle border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Progress
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">This Week</span>
              <span className={cn('font-bold', getProgressColor(stats.weeklyProgress))}>
                {stats.weeklyProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.weeklyProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Monthly Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-circle border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Progress
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">This Month</span>
              <span className={cn('font-bold', getProgressColor(stats.monthlyProgress))}>
                {stats.monthlyProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.monthlyProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upcoming Milestones
        </h3>
        <div className="space-y-4">
          {stats.upcomingMilestones.map((milestone) => {
            const progress = (milestone.current / milestone.target) * 100;
            
            return (
              <div key={milestone.id} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Icon name={milestone.icon as any} size={20} className={milestone.color} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {milestone.title}
                    </h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {milestone.current}/{milestone.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Progress Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <Icon name="trending_up" className="text-green-500" />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Level {Math.floor(stats.totalWorkouts / 10) + 1}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200',
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            <Icon name={tab.icon as any} size={18} />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'daily' && (
          <DailyProgressTracker
            goals={[]} // Would be populated from API
            onUpdateGoal={() => {}}
            onCompleteGoal={() => {}}
          />
        )}
        {activeTab === 'weekly' && (
          <WeeklyProgressTracker
            weeklyGoals={[]} // Would be populated from API
            dailyGoals={[]} // Would be populated from API
            onUpdateGoal={() => {}}
          />
        )}
        {activeTab === 'badges' && (
          <EnhancedBadgeSystem showProgress={true} />
        )}
      </div>
    </div>
  );
}

export default ProgressDashboard;
