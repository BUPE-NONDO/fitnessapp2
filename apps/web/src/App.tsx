import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { useOnboarding } from '@/hooks/useOnboarding';
import { LoginForm } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';
import { TRPCProvider } from '@/components/TRPCProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { RequireAuth } from '@/components/RequireAuth';
import { AchievementManager, CelebrationTrigger } from '@/components/AchievementManager';
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding';

import { LoginSuccessTransition } from '@/components/LoginSuccessTransition';
import { SplashScreen } from '@/components/SplashScreen';
import { OnboardingCelebration } from '@/components/celebrations/AchievementCelebration';
import { AdminApp } from '@/components/admin/AdminApp';
import { ThemeToggle } from '@/contexts/ThemeContext';


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TRPCProvider>
          <AppContent />
        </TRPCProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user, loading, justLoggedIn, clearJustLoggedIn } = useAuth();
  const { userProfile } = useUser();
  const [isSignUp, setIsSignUp] = useState(false);

  // Force fresh start - clear any cached data on app load
  React.useEffect(() => {
    // Clear localStorage to ensure fresh experience
    localStorage.removeItem('onboarding-progress');
    localStorage.removeItem('user-preferences');
    localStorage.removeItem('workout-plan');
    localStorage.removeItem('was-signup');
    sessionStorage.clear();
    console.log('🧹 Cleared cached data for fresh start');
  }, []);
  const [showLoginTransition, setShowLoginTransition] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showPostSignupOnboarding, setShowPostSignupOnboarding] = useState(false);
  const [showOnboardingCelebration, setShowOnboardingCelebration] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<'app' | 'admin'>('app');

  // Onboarding state
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    completeOnboarding,
    skipOnboarding,
    isLoading: onboardingLoading,
  } = useOnboarding();

  const closeOnboarding = () => setIsOnboardingOpen(false);

  // Handle post-signup onboarding for new users
  React.useEffect(() => {
    if (justLoggedIn && user && userProfile) {
      // Check if this is a new user (just signed up)
      const isNewUser = !userProfile.onboardingCompleted;
      const wasSignUp = sessionStorage.getItem('was-signup') === 'true';

      if (isNewUser && wasSignUp) {
        // Clear the signup flag
        sessionStorage.removeItem('was-signup');
        // Show post-signup onboarding instead of regular onboarding
        setShowPostSignupOnboarding(true);
        clearJustLoggedIn();
      } else if (justLoggedIn && !isOnboardingOpen) {
        // Regular login - show transition
        setShowLoginTransition(true);
      }
    }
  }, [justLoggedIn, user, userProfile, isOnboardingOpen, clearJustLoggedIn]);

  const handleLoginTransitionComplete = () => {
    setShowLoginTransition(false);
    clearJustLoggedIn();
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handlePostSignupOnboardingComplete = () => {
    setShowPostSignupOnboarding(false);
    setShowOnboardingCelebration(true);
    // Mark onboarding as completed in user profile
    // This would typically update the user profile via API
  };

  const handlePostSignupOnboardingSkip = () => {
    setShowPostSignupOnboarding(false);
    // Still mark as completed but without celebration
  };

  const handleOnboardingCelebrationClose = () => {
    setShowOnboardingCelebration(false);
  };

  // Check for admin route
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setCurrentRoute('admin');
    } else {
      setCurrentRoute('app');
    }
  }, []);

  // Handle route changes
  const handleRouteChange = (route: 'app' | 'admin') => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route === 'admin' ? '/admin' : '/');
  };

  // Show splash screen on initial load
  if (showSplash) {
    return (
      <SplashScreen
        isVisible={showSplash}
        onComplete={handleSplashComplete}
        minDisplayTime={2500}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show admin app if on admin route
  if (currentRoute === 'admin') {
    return <AdminApp />;
  }

  if (user) {
    return (
      <RequireAuth>
        <Dashboard />
        <AchievementManager />
        <CelebrationTrigger />

        {/* Login Success Transition */}
        <LoginSuccessTransition
          isVisible={showLoginTransition}
          onComplete={handleLoginTransitionComplete}
        />

        {/* Post-Login Onboarding */}
        <WelcomeOnboarding
          isOpen={isOnboardingOpen}
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
          onClose={closeOnboarding}
          isLoading={onboardingLoading}
        />



        {/* Onboarding Completion Celebration */}
        <OnboardingCelebration
          isVisible={showOnboardingCelebration}
          onClose={handleOnboardingCelebrationClose}
          userName={userProfile?.displayName}
        />
      </RequireAuth>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-primary-100 dark:from-gray-900 dark:to-purple-900/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Circle decorations */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-primary-300/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100/10 to-primary-200/10 rounded-full blur-3xl"></div>
      <div className="w-full max-w-md">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <ThemeToggle size="md" />
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏋️‍♂️</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">FitnessApp</h1>
          <p className="text-gray-600 dark:text-gray-400">Your personal fitness tracking companion</p>
        </div>

        <LoginForm
          isSignUp={isSignUp}
          onToggleMode={() => setIsSignUp(!isSignUp)}
        />

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🔥 Powered by Firebase • Built with React & TypeScript
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
