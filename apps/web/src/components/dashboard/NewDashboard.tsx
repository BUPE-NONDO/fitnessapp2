import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useCalendar } from '@/hooks/useCalendar';
import { Icon } from '@/components/ui/Icon';
import { cn, getTimeGreeting } from '@/lib/utils';
import { WorkoutPlanDisplay } from './WorkoutPlanDisplay';
import { WeeklyPlanBadges } from './WeeklyPlanBadges';
import { WeeklyGoalCollection } from './WeeklyGoalCollection';
import { EnhancedBadgeSystem } from '@/components/badges/EnhancedBadgeSystem';
import { ThemeToggle } from '@/contexts/ThemeContext';
import { Calendar } from '@/components/ui/Calendar';
import { EventScheduler } from '@/components/ui/EventScheduler';

import { ProgressTrackingService, ProgressStats } from '@/services/progressTrackingService';
import { UserProgressionService } from '@/services/userProgressionService';
import { OnboardingWizard } from '../onboarding/OnboardingWizard';
import { SettingsPage } from '@/components/settings/SettingsPage';

interface NewDashboardProps {
  className?: string;
}

export function NewDashboard({ className = '' }: NewDashboardProps) {
  const { user, userProfile } = useUser();
  const { logout } = useAuth();
  const {
    isOnboardingRequired,
    isOnboardingOpen,
    setIsOnboardingOpen,
    completeOnboarding,
    triggerOnboarding,
  } = useOnboarding();
  const [activeTab, setActiveTab] = useState<'overview' | 'badges'>('overview');
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const {
    events,
    getUpcomingEvents,
    createEvent,
    createAchievementCelebration,
    createWorkoutReminder
  } = useCalendar();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEventScheduler, setShowEventScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (user) {
      loadProgressStats();
    }
  }, [user]);

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCalendar) {
          closeCalendar();
        }
        if (showEventScheduler) {
          setShowEventScheduler(false);
          setSelectedDate(undefined);
        }
        if (showSettings) {
          setShowSettings(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showCalendar, showEventScheduler]);

  const loadProgressStats = async () => {
    try {
      setLoading(true);

      // Check if user is new and initialize progression
      const isNewUser = await UserProgressionService.isNewUser(user!.uid);

      if (isNewUser) {
        // Initialize new user with zero stats
        await UserProgressionService.initializeNewUser(user!.uid);
        setProgressStats(ProgressTrackingService.getFreshUserProgressStats());
      } else {
        // Load existing stats for returning users
        const stats = await ProgressTrackingService.getProgressStats(user!.uid);
        setProgressStats(stats);
      }
    } catch (error) {
      console.error('Failed to load progress stats:', error);
      // Fallback to fresh stats on error
      setProgressStats(ProgressTrackingService.getFreshUserProgressStats());
    } finally {
      setLoading(false);
    }
  };

  const refreshProgressStats = async () => {
    if (user) {
      await loadProgressStats();
    }
  };

  const handleOnboardingComplete = async (onboardingData: any) => {
    try {
      await completeOnboarding(onboardingData);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  // Calendar event handlers
  const handleCalendarDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowEventScheduler(true);
  };

  const handleAddEvent = (date: Date) => {
    setSelectedDate(date);
    setShowEventScheduler(true);
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      await createEvent(eventData);
      setShowEventScheduler(false);
      setSelectedDate(undefined);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleAchievementClick = async () => {
    // Create an achievement celebration event for today
    try {
      await createAchievementCelebration('New Achievement Unlocked!');
      setShowCalendar(true);
    } catch (error) {
      console.error('Failed to create achievement event:', error);
    }
  };

  const handleScheduleClick = () => {
    setShowCalendar(true);
  };

  const handleOnboardingExit = () => {
    setIsOnboardingOpen(false);
  };

  const handleStartWorkout = () => {
    // Navigate to workout session or show workout modal
    // Implementation handled by WorkoutPlanDisplay component
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleViewProgress = () => {
    setActiveTab('badges');
  };

  // Additional click handlers for dashboard elements
  const handleStreakClick = () => {
    // Show streak details and history
    setActiveTab('badges');
  };

  // Close calendar modal
  const closeCalendar = () => {
    setShowCalendar(false);
    setSelectedDate(undefined);
  };

  const handleWorkoutsClick = () => {
    // Show workout history and analytics
    console.log('Navigate to workout history');
  };

  const handleGoalsClick = () => {
    // Show goals management
    console.log('Navigate to goals management');
  };

  const handleProgressClick = () => {
    // Show detailed progress analytics
    setActiveTab('badges');
  };

  const handleActivityClick = (day: string) => {
    // Show activity details for specific day
    console.log(`Show activity for ${day}`);
  };

  const handleWeekSelect = (week: any) => {
    // Handle week selection from badges
    console.log('Week selected:', week);
  };

  const handleWeekComplete = (week: any) => {
    // Handle week completion
    console.log('Week completed:', week);
    // Could trigger celebration animation
  };

  // Show onboarding wizard if required or manually triggered
  if (isOnboardingOpen || isOnboardingRequired) {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        onExit={handleOnboardingExit}
      />
    );
  }

  return (
    <div className={cn('h-screen w-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden fixed inset-0', className)}>
      {/* Top Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between flex-shrink-0">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              FitnessApp
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your Personal Fitness Journey
            </p>
          </div>
        </div>

        {/* User Info and Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle size="md" />

          {/* Onboarding Trigger for New Users */}
          {isOnboardingRequired && (
            <button
              type="button"
              onClick={triggerOnboarding}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Complete Setup
            </button>
          )}

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active Member</p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="flex flex-1 min-h-0">
        {/* Simple Left Sidebar - Settings Only */}
        <div className="w-16 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-6 h-full">
          {/* Settings Button */}
          <button
            type="button"
            onClick={handleSettings}
            className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Profile Settings"
          >
            <Icon name="settings" size={20} />
          </button>
        </div>


      {/* Main Content */}
      <div className="flex-1 flex h-full">
        {/* Dashboard Content */}
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">{getTimeGreeting()}</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Welcome Back{userProfile?.displayName ? `, ${userProfile.displayName}` : ''} 🎉
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === 'overview'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('badges');
                  handleAchievementClick();
                }}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === 'badges'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                Achievements
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
            {activeTab === 'overview' && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Streak Card */}
                  <div
                    onClick={handleStreakClick}
                    className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl p-4 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon name="local_fire_department" size={20} className="text-white" />
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">Streak</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{progressStats?.currentStreak || 0}</div>
                    <div className="text-xs text-white/80">Days in a row</div>
                  </div>

                  {/* Workouts Card */}
                  <div
                    onClick={handleWorkoutsClick}
                    className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-4 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon name="fitness_center" size={20} className="text-white" />
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">Workouts</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{progressStats?.totalWorkouts || 0}</div>
                    <div className="text-xs text-white/80">Completed</div>
                  </div>

                  {/* Goals Card */}
                  <div
                    onClick={handleGoalsClick}
                    className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl p-4 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon name="emoji_events" size={20} className="text-white" />
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">Goals</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{progressStats?.totalGoalsCompleted || 0}</div>
                    <div className="text-xs text-white/80">Achieved</div>
                  </div>

                  {/* Progress Card */}
                  <div
                    onClick={handleProgressClick}
                    className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-4 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon name="trending_up" size={20} className="text-white" />
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">Progress</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{progressStats?.weeklyProgress || 0}%</div>
                    <div className="text-xs text-white/80">This week</div>
                  </div>
                </div>

                {/* Workout Plan Section */}
                <WorkoutPlanDisplay onWorkoutComplete={refreshProgressStats} />

                {/* Weekly Plan Badges */}
                <WeeklyPlanBadges
                  onWeekSelect={handleWeekSelect}
                  onWeekComplete={handleWeekComplete}
                />

                {/* Activity & Progress Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weekly Activity Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Activity</h3>
                      <span className="text-sm text-gray-500">Last 7 days</span>
                    </div>
                    <div className="h-48 flex items-end justify-between space-x-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                        const height = Math.random() * 100 + 20; // Random height for demo
                        const isToday = index === new Date().getDay() - 1;
                        return (
                          <div
                            key={day}
                            onClick={() => handleActivityClick(day)}
                            className="flex flex-col items-center space-y-2 flex-1 cursor-pointer group"
                          >
                            <div
                              className={`w-full rounded-t transition-all duration-300 ${
                                isToday ? 'bg-blue-500 group-hover:bg-blue-600' : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-blue-400 dark:group-hover:bg-blue-500'
                              }`}
                              style={{ height: `${height}px` }}
                            ></div>
                            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progress Overview */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progress Overview</h3>
                      <span className="text-sm text-gray-500">This week</span>
                    </div>
                    <div className="flex items-center justify-center mb-4">
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
                            stroke="#f97316"
                            strokeWidth="2"
                            strokeDasharray={`${progressStats?.weeklyProgress || 0}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {progressStats?.weeklyProgress || 0}%
                            </div>
                            <div className="text-xs text-gray-500">Complete</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                          <span className="text-gray-600 dark:text-gray-400">Workouts</span>
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {progressStats?.totalWorkouts || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600 dark:text-gray-400">Streak</span>
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {progressStats?.currentStreak || 0} days
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                          <span className="text-gray-600 dark:text-gray-400">Goals</span>
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {progressStats?.totalGoalsCompleted || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'badges' && (
              <div className="space-y-6">
                <WeeklyGoalCollection
                  onGoalComplete={(goal) => console.log('Goal completed:', goal)}
                  onWeekComplete={(weekData) => console.log('Week completed:', weekData)}
                />
                <EnhancedBadgeSystem showProgress={true} />
              </div>
            )}
          </div>

        </div>

        {/* User Profile & Analytics Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 shadow-sm border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
          <div className="p-6 flex-1 overflow-y-auto space-y-6">

            {/* User Profile Section */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 dark:text-blue-400 text-xl font-semibold">
                  {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.displayName || 'Thomas Fletcher'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'Fitness Enthusiast'}</p>
            </div>

            {/* Profile Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userProfile?.weight || '75'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Weight</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userProfile?.height || '6.5'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Height</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userProfile?.age || '25'}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Age</div>
              </div>
            </div>

            {/* Your Goals */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Your Goals</h4>
              <div className="space-y-4">
                {/* Running Goal */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Icon name="directions_run" size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Running</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">5km weekly</div>
                    </div>
                  </div>
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="3"
                        strokeDasharray="75, 100"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">75%</span>
                    </div>
                  </div>
                </div>

                {/* Sleeping Goal */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Icon name="bedtime" size={16} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Sleeping</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">8h/night</div>
                    </div>
                  </div>
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
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
                        strokeDasharray="60, 100"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">60%</span>
                    </div>
                  </div>
                </div>

                {/* Weight Loss Goal */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <Icon name="local_fire_department" size={16} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Weight Loss</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">2kg/month</div>
                    </div>
                  </div>
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="3"
                        strokeDasharray="60, 100"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">60%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Progress */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Progress</h4>
              <div className="text-center">
                <div className="relative w-32 h-16 mx-auto mb-4">
                  <svg className="w-32 h-16" viewBox="0 0 100 50">
                    {/* Background arc */}
                    <path
                      d="M 10 40 A 30 30 0 0 1 90 40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    {/* Progress arc */}
                    <path
                      d={`M 10 40 A 30 30 0 0 1 ${10 + (80 * 0.8)} 40`}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(progressStats?.monthlyProgress || 0) * 0.8}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center mt-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {progressStats?.monthlyProgress || 0}%
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You have achieved {progressStats?.monthlyProgress || 0}% of your goals this month
                </p>
              </div>
            </div>

            {/* Scheduled */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Scheduled</h4>
                <button
                  onClick={handleScheduleClick}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  View Calendar
                </button>
              </div>
              <div className="space-y-3">
                {getUpcomingEvents().length > 0 ? (
                  getUpcomingEvents().map((event) => (
                    <div key={event.id} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          event.type === 'workout' && "bg-blue-100 dark:bg-blue-900/30",
                          event.type === 'achievement' && "bg-yellow-100 dark:bg-yellow-900/30",
                          event.type === 'goal' && "bg-green-100 dark:bg-green-900/30",
                          event.type === 'reminder' && "bg-purple-100 dark:bg-purple-900/30"
                        )}>
                          <Icon
                            name={
                              event.type === 'workout' ? 'fitness_center' :
                              event.type === 'achievement' ? 'emoji_events' :
                              event.type === 'goal' ? 'flag' : 'notifications'
                            }
                            size={16}
                            className={cn(
                              event.type === 'workout' && "text-blue-600 dark:text-blue-400",
                              event.type === 'achievement' && "text-yellow-600 dark:text-yellow-400",
                              event.type === 'goal' && "text-green-600 dark:text-green-400",
                              event.type === 'reminder' && "text-purple-600 dark:text-purple-400"
                            )}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {event.time ? `${event.time} • ` : ''}{event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Icon name="event" size={32} className="text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No upcoming events</p>
                    <button
                      onClick={handleScheduleClick}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      Schedule your first event
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeCalendar}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Fitness Calendar
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Press ESC to close
                </span>
                <button
                  onClick={closeCalendar}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Close calendar"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <Calendar
                events={events}
                onDateSelect={handleCalendarDateSelect}
                onAddEvent={handleAddEvent}
                selectedDate={selectedDate}
                showAddButton={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Event Scheduler Modal */}
      <EventScheduler
        isOpen={showEventScheduler}
        onClose={() => {
          setShowEventScheduler(false);
          setSelectedDate(undefined);
        }}
        onSave={handleSaveEvent}
        selectedDate={selectedDate}
      />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Icon name="close" size={24} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <SettingsPage />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewDashboard;
