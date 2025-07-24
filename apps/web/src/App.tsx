import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';
import { TRPCProvider } from '@/components/TRPCProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { RequireAuth } from '@/components/RequireAuth';
import { AchievementManager, CelebrationTrigger } from '@/components/AchievementManager';
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding';
import { LoginSuccessTransition } from '@/components/LoginSuccessTransition';
import { SplashScreen } from '@/components/SplashScreen';
import { usePostLoginOnboarding } from '@/hooks/usePostLoginOnboarding';

function App() {
  return (
    <AuthProvider>
      <TRPCProvider>
        <AppContent />
      </TRPCProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading, justLoggedIn, clearJustLoggedIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showLoginTransition, setShowLoginTransition] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const {
    isOnboardingOpen,
    completeOnboarding,
    skipOnboarding,
    closeOnboarding,
    isLoading: onboardingLoading,
  } = usePostLoginOnboarding();

  // Show login success transition for new logins
  React.useEffect(() => {
    if (justLoggedIn && user && !isOnboardingOpen) {
      setShowLoginTransition(true);
    }
  }, [justLoggedIn, user, isOnboardingOpen]);

  const handleLoginTransitionComplete = () => {
    setShowLoginTransition(false);
    clearJustLoggedIn();
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
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
      </RequireAuth>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏋️‍♂️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FitnessApp</h1>
          <p className="text-gray-600">Your personal fitness tracking companion</p>
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
