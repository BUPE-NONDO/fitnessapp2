import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ProgressTrackingService, ProgressStats } from '@/services/progressTrackingService';
import { Icon } from '@/components/ui/Icon';
import { EnhancedBadgeSystem } from '@/components/badges/EnhancedBadgeSystem';
import { WorkoutPlanDisplay } from './WorkoutPlanDisplay';
import { TodaysGoal } from './TodaysGoal';
import { WeeklyGoals } from './WeeklyGoals';
import { EnhancedProgressStats } from './EnhancedProgressStats';
import { WeeklyMilestoneTracker } from './WeeklyMilestoneTracker';
import { WeeklyPlanBadges } from './WeeklyPlanBadges';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'badges'>('overview');
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
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

  // Check for onboarding completion and show welcome message
  useEffect(() => {
    const checkOnboardingCompletion = () => {
      const justCompleted = localStorage.getItem('onboarding-just-completed');
      if (justCompleted === 'true') {
        setShowWelcomeMessage(true);
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowWelcomeMessage(false);
        }, 5000);
      }
    };

    checkOnboardingCompletion();
  }, []);

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
    // For new users, return 0 until they set goals
    if (stats.totalWorkouts === 0 && stats.totalGoals === 0) return 0;

    // Calculate based on user's actual goal completion rate
    return stats.goalCompletionRate || 0;
  };

  const calculateMonthlyProgress = (stats: ProgressStats): number => {
    // For new users, return 0 until they have activity
    if (stats.totalWorkouts === 0 && stats.totalGoals === 0) return 0;

    // Calculate based on monthly consistency
    const daysInMonth = new Date().getDate();
    const activeDays = Math.min(stats.checkInsThisMonth, daysInMonth);
    return Math.min((activeDays / daysInMonth) * 100, 100);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'home' },
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
        {/* Professional Welcome Section */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-800 dark:via-blue-800 dark:to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-700 hover:shadow-2xl transition-all duration-300">
          {/* Subtle geometric patterns */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon name="trending_up" size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {welcomeMessage.title}
                  </h2>
                  <p className="text-blue-100 font-medium">
                    {welcomeMessage.subtitle}
                  </p>
                </div>
              </div>

              {progressStats?.onboardingCompleted && progressStats.daysSinceOnboarding > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white/20">
                  <p className="text-blue-100 text-sm font-medium">
                    📅 Day {progressStats.daysSinceOnboarding} of your professional fitness journey
                  </p>
                </div>
              )}

              {progressStats?.onboardingCompleted && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleRestartOnboarding}
                    disabled={onboardingLoading}
                    className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 border border-white/30 backdrop-blur-sm"
                  >
                    <Icon name="refresh" size={16} className="mr-2" />
                    {onboardingLoading ? 'Restarting...' : 'Restart Setup'}
                  </button>
                  <button
                    onClick={() => window.location.href = '/settings'}
                    className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-lg transition-all duration-200 border border-white/30 backdrop-blur-sm"
                  >
                    <Icon name="settings" size={16} className="mr-2" />
                    Settings
                  </button>
                </div>
              )}
            </div>

            <div className="text-right ml-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-sm font-medium text-blue-100 uppercase tracking-wide mb-1">
                  Today's Progress
                </div>
                <div className="text-4xl font-bold mb-1">{stats.todayProgress}%</div>
                <div className="flex items-center justify-center space-x-2">
                  {progressStats?.isActiveUser && (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-200 text-xs font-medium uppercase tracking-wide">Active</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Plan Section - Top Priority Position */}
        <WorkoutPlanDisplay className="mb-8" />

          {/* Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Activity Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity</h3>
                <select className="text-sm text-gray-500 bg-transparent border-none">
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div className="h-48 flex items-end justify-between space-x-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-8 rounded-t ${index === 4 ? 'bg-orange-500 h-32' : 'bg-gray-200 dark:bg-gray-700 h-16'}`}
                    ></div>
                    <span className="text-xs text-gray-500">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Circle */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progress</h3>
                <select className="text-sm text-gray-500 bg-transparent border-none">
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray="75, 100"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">40hrs</div>
                      <div className="text-xs text-gray-500">This week</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Cardio</span>
                  <span className="text-gray-900 dark:text-white">12 hrs</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Stretching</span>
                  <span className="text-gray-900 dark:text-white">10 hrs</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Treadmill</span>
                  <span className="text-gray-900 dark:text-white">8 hrs</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Strength</span>
                  <span className="text-gray-900 dark:text-white">10 hrs</span>
                </div>
              </div>
            </div>
          </div>



        {/* Weekly Plan Badges Section */}
        <WeeklyPlanBadges className="mb-8" />

        {/* Daily Goals Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <TodaysGoal />
          <WeeklyGoals />
        </div>

        {/* Enhanced Progress Stats */}
        <EnhancedProgressStats className="mb-8" />
        </div>

        {/* Profile Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 shadow-sm border-l border-gray-200 dark:border-gray-700 p-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Thomas Fletcher</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">@fitnessguru</p>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">75</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Weight</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">6.5</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Height</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">25</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Age</div>
            </div>
          </div>

          {/* Your Goals */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Your Goals</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Icon name="directions_run" size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Running</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">5km daily</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">75%</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Icon name="bedtime" size={16} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Sleeping</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">8h daily</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">60%</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Icon name="monitor_weight" size={16} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Weight Loss</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">2kg monthly</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">50%</div>
              </div>
            </div>
          </div>

          {/* Monthly Progress */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Progress</h4>
            <div className="relative">
              <div className="w-24 h-24 mx-auto">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="3"
                    strokeDasharray="80, 100"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">80%</div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                You have achieved 80% of your monthly targets
              </p>
            </div>
          </div>

          {/* Scheduled */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Scheduled</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Icon name="self_improvement" size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Training - Yoga Class</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Today</div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">10 Mar</div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <Icon name="pool" size={16} className="text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Training - Swimming</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Tomorrow</div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">11 Mar</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressDashboard;
