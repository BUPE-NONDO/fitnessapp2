import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { UserFlowService, UserFlowState } from '@/services/userFlowService';
import { IsolatedOnboardingService } from '@/services/isolatedOnboardingService';
import { ExerciseDatabase } from '@/services/exerciseDatabase';
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding';
import { Dashboard } from '@/components/Dashboard';

interface UserFlowManagerProps {
  children?: React.ReactNode;
}

export function UserFlowManager({ children }: UserFlowManagerProps) {
  const { user, userProfile, isLoading: userLoading } = useUser();
  const [flowState, setFlowState] = useState<UserFlowState | null>(null);
  const [isLoadingFlow, setIsLoadingFlow] = useState(true);

  // Load user flow state
  useEffect(() => {
    const loadFlowState = async () => {
      if (!user) {
        setFlowState(null);
        setIsLoadingFlow(false);
        return;
      }

      try {
        setIsLoadingFlow(true);
        const state = await UserFlowService.getUserFlowState(user.uid);
        setFlowState(state);
        console.log('📊 User flow state loaded:', state);
      } catch (error) {
        console.error('❌ Failed to load flow state:', error);
        // Set safe defaults
        setFlowState({
          isNewUser: true,
          needsOnboarding: true,
          hasCompletedOnboarding: false,
          hasWorkoutPlan: false,
          currentStep: 'onboarding'
        });
      } finally {
        setIsLoadingFlow(false);
      }
    };

    loadFlowState();
  }, [user, userProfile?.onboardingCompleted]);

  // Handle onboarding completion
  const handleOnboardingComplete = async (data: any) => {
    if (!user) return;

    try {
      console.log('🎉 Onboarding completed, processing completion...');

      // Initialize exercise database if needed
      try {
        await ExerciseDatabase.initializeExerciseDatabase();
      } catch (error) {
        console.warn('⚠️ Exercise database already initialized or failed to initialize:', error);
      }

      // Complete onboarding and update user flow state
      // UserFlowService.completeOnboardingStep handles both isolated service and user profile updates
      console.log('🔄 Updating user flow state and completing onboarding...');
      await UserFlowService.completeOnboardingStep(user.uid, data);

      // Update local flow state to reflect completion
      setFlowState(prev => prev ? {
        ...prev,
        needsOnboarding: false,
        hasCompletedOnboarding: true,
        hasWorkoutPlan: true,
        currentStep: 'dashboard'
      } : null);

      console.log('✅ Onboarding completion processed, moving to dashboard');
    } catch (error) {
      console.error('❌ Failed to handle onboarding completion:', error);
      throw error; // Re-throw to let the UI handle the error
    }
  };

  // Handle onboarding skip
  const handleOnboardingSkip = async () => {
    if (!user) return;

    try {
      console.log('⏭️ Onboarding skipped, processing skip...');

      // Update user flow state to mark onboarding as completed (skipped)
      await UserFlowService.completeOnboardingStep(user.uid, { skipped: true });

      // Update local flow state
      setFlowState(prev => prev ? {
        ...prev,
        needsOnboarding: false,
        hasCompletedOnboarding: true,
        hasWorkoutPlan: false,
        currentStep: 'dashboard'
      } : null);

      console.log('✅ Onboarding skip processed, moving to dashboard');
    } catch (error) {
      console.error('❌ Failed to handle onboarding skip:', error);
      throw error; // Re-throw to let the UI handle the error
    }
  };

  // Loading state
  if (userLoading || isLoadingFlow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your fitness journey...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return children || (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Welcome to FitnessApp</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Please sign in to start your fitness journey</p>
        </div>
      </div>
    );
  }

  // No flow state (error case)
  if (!flowState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Flow State Error</h1>
          <p className="text-red-500 dark:text-red-300 mb-4">Unable to determine user flow state</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show onboarding if needed
  if (flowState.needsOnboarding && flowState.currentStep === 'onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <WelcomeOnboarding
          isOpen={true}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
          onClose={() => {}} // Can't close during flow
          isLoading={false}
        />
      </div>
    );
  }

  // Show dashboard if onboarding is complete
  if (flowState.hasCompletedOnboarding && flowState.currentStep === 'dashboard') {
    return <Dashboard />;
  }

  // Fallback to dashboard
  return <Dashboard />;
}

// Flow state indicator component for debugging (disabled for production)
export function FlowStateIndicator() {
  // Debug component disabled for production
  return null;
}
