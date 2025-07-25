import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHealthCheck, useGoals } from '@/hooks/useTRPC';
import { useOnboarding } from '@/hooks/useOnboarding';
import { AdminAuthService } from '@/services/adminAuthService';
import { GoalsList } from './GoalsList';
import { ActivityLogsList } from './ActivityLogsList';
import { ProgressDashboard } from './dashboard/ProgressDashboard';
import { UserProfile } from './UserProfile';
import { BadgeSystem } from './BadgeSystem';
import { OnboardingWizard } from './onboarding/OnboardingWizard';
import { WorkoutRoutineComponent } from './workout/WorkoutRoutine';
import { DailyCheckIn } from './workout/DailyCheckIn';
import { WorkoutPlanDebug } from './debug/WorkoutPlanDebug';
import { CompleteDataReset } from './admin/CompleteDataReset';
import { Icon } from './ui/Icon';
import { ThemeToggle } from '@/contexts/ThemeContext';
import Container from './ui/Container';
import Button from './ui/Button';
import { cn, getTypography } from '@/styles/design-system';

export function Dashboard() {
  const { user, logout } = useAuth();
  const healthCheck = useHealthCheck();
  const goals = useGoals();
  const {
    isOnboardingRequired,
    isOnboardingOpen,
    setIsOnboardingOpen,
    completeOnboarding,
    triggerOnboarding,
  } = useOnboarding();

  const [activeTab, setActiveTab] = useState<'overview' | 'workout' | 'checkin' | 'goals' | 'logs' | 'badges' | 'profile' | 'debug'>('overview'); // Start with overview tab
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email) {
        const adminStatus = await AdminAuthService.isAdminEmail(user.email);
        setIsAdmin(adminStatus);
      }
    };
    checkAdminStatus();
  }, [user]);

  const handleOnboardingComplete = async (onboardingData: any) => {
    try {
      await completeOnboarding(onboardingData);
      console.log('🎉 Onboarding completed from dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const handleOnboardingExit = () => {
    setIsOnboardingOpen(false);
  };

  // Show onboarding wizard if required or manually triggered
  if (isOnboardingOpen) {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        onExit={handleOnboardingExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <Container>
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <h1 className={cn(getTypography('h4'), 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent')}>
                FitnessApp
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                    {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className={getTypography('body')}>
                  Welcome, {user?.displayName || user?.email?.split('@')[0] || 'User'}!
                </span>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle size="md" />

              {/* Admin Access Button */}
              {isAdmin && (
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-400 rounded-lg transition-colors duration-200"
                  title="Access Admin Portal"
                >
                  <Icon name="shield" size={16} />
                  <span className="hidden sm:inline text-sm font-medium">Admin</span>
                </button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={logout}
                rightIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                }
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <Container>
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'workout', label: 'Workout', icon: '🏋️' },
              { id: 'checkin', label: 'Check-in', icon: '✅' },
              { id: 'goals', label: 'Goals', icon: '🎯' },
              { id: 'logs', label: 'Activity Logs', icon: '📝' },
              { id: 'badges', label: 'Achievements', icon: '🏆' },
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'debug', label: 'Debug', icon: '🧪' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center space-x-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                )}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </Container>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Container className="py-8">
          <div className="space-y-6">
            {/* Welcome Banner for New Users */}
            {isOnboardingRequired && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">🎯</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Complete Your Personalized Setup
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Take our 1-minute quiz to get a personalized fitness plan tailored just for you!
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={triggerOnboarding}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl"
                  >
                    🚀 Start Quiz
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'overview' && <ProgressDashboard />}
            {activeTab === 'workout' && <WorkoutRoutineComponent />}
            {activeTab === 'checkin' && <DailyCheckIn />}
            {activeTab === 'goals' && <GoalsList />}
            {activeTab === 'logs' && <ActivityLogsList />}
            {activeTab === 'badges' && <BadgeSystem />}
            {activeTab === 'profile' && <UserProfile />}
            {activeTab === 'debug' && (
              <div className="space-y-8">
                <WorkoutPlanDebug />
                <CompleteDataReset />
              </div>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
