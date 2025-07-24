import { useState, useEffect, useCallback } from 'react';
import { useUser } from './useUser';
import { useAuth } from './useAuth';
import { onboardingService } from '@/services/onboardingService';
import { OnboardingData } from '@/components/onboarding/OnboardingWizard';

interface UsePostLoginOnboardingReturn {
  // Status
  shouldShowOnboarding: boolean;
  isOnboardingOpen: boolean;
  isNewUser: boolean;
  isFirstLogin: boolean;
  
  // Actions
  startOnboarding: () => void;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  skipOnboarding: () => Promise<void>;
  closeOnboarding: () => void;
  
  // State
  isLoading: boolean;
  error: string | null;
}

const FIRST_LOGIN_KEY = 'fitness-app-first-login-check';
const ONBOARDING_SHOWN_KEY = 'fitness-app-onboarding-shown';

export function usePostLoginOnboarding(): UsePostLoginOnboardingReturn {
  const { user, userProfile, updateProfile, loading: userLoading } = useUser();
  const { justLoggedIn, clearJustLoggedIn } = useAuth();
  
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [hasCheckedFirstLogin, setHasCheckedFirstLogin] = useState(false);

  // Check if user is new (created recently) - extended to 7 days for better onboarding coverage
  const isNewUser = userProfile ?
    (new Date().getTime() - userProfile.createdAt.getTime()) < (7 * 24 * 60 * 60 * 1000) : // 7 days
    false;

  // Check if onboarding is completed
  const isOnboardingCompleted = onboardingService.checkOnboardingStatus(userProfile);

  // Check if this is a fresh signup (user created within last 5 minutes)
  const isFreshSignup = userProfile ?
    (new Date().getTime() - userProfile.createdAt.getTime()) < (5 * 60 * 1000) : // 5 minutes
    false;

  // Determine if onboarding should be shown - more aggressive triggering for new users
  const shouldShowOnboarding = !userLoading &&
    userProfile &&
    !isOnboardingCompleted &&
    (isNewUser || !userProfile.onboardingCompleted || isFreshSignup) && // Show for new users, incomplete onboarding, or fresh signups
    !sessionStorage.getItem(ONBOARDING_SHOWN_KEY);

  // Check for first login after authentication
  useEffect(() => {
    if (!user || userLoading || hasCheckedFirstLogin) return;

    const checkFirstLogin = () => {
      const lastLoginCheck = localStorage.getItem(`${FIRST_LOGIN_KEY}-${user.uid}`);
      const now = new Date().getTime();
      
      // If no previous login check or it's been more than 1 hour, consider it a new session
      if (!lastLoginCheck || (now - parseInt(lastLoginCheck)) > (60 * 60 * 1000)) {
        setIsFirstLogin(true);
        localStorage.setItem(`${FIRST_LOGIN_KEY}-${user.uid}`, now.toString());
      }
      
      setHasCheckedFirstLogin(true);
    };

    checkFirstLogin();
  }, [user, userLoading, hasCheckedFirstLogin]);

  // Auto-trigger onboarding for new users on login
  useEffect(() => {
    if (shouldShowOnboarding && justLoggedIn && !isOnboardingOpen) {
      console.log('🎯 Auto-triggering onboarding for new user after login', {
        isNewUser,
        isFreshSignup,
        onboardingCompleted: userProfile?.onboardingCompleted,
        userCreatedAt: userProfile?.createdAt,
        timeSinceCreation: userProfile ? new Date().getTime() - userProfile.createdAt.getTime() : 0
      });

      // For immediate onboarding, skip login transition
      sessionStorage.setItem('skip-login-transition', 'true');

      // Very short delay for immediate onboarding trigger
      const timer = setTimeout(() => {
        setIsOnboardingOpen(true);
        // Mark that onboarding has been shown this session
        sessionStorage.setItem(ONBOARDING_SHOWN_KEY, 'true');
        // Clear the just logged in flag
        clearJustLoggedIn();
      }, 300); // Very short delay for immediate trigger

      return () => clearTimeout(timer);
    }
  }, [shouldShowOnboarding, justLoggedIn, isOnboardingOpen, clearJustLoggedIn, isNewUser, userProfile]);

  const startOnboarding = useCallback(() => {
    setIsOnboardingOpen(true);
    setError(null);
    sessionStorage.setItem(ONBOARDING_SHOWN_KEY, 'true');
  }, []);

  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    if (!user) {
      throw new Error('No user signed in');
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🎉 Completing post-login onboarding');

      // Save onboarding data to Firestore
      await onboardingService.completeOnboarding(user.uid, data);
      
      // Update local user profile
      await updateProfile({
        onboardingCompleted: true,
        onboardingData: {
          ageRange: data.ageRange,
          gender: data.gender,
          bodyType: data.bodyType,
          primaryGoal: data.primaryGoal,
          currentWeight: data.currentWeight,
          targetWeight: data.targetWeight,
          height: data.height,
          weightUnit: data.weightUnit,
          heightUnit: data.heightUnit,
          fitnessLevel: data.fitnessLevel,
          workoutEnvironment: data.workoutEnvironment,
          availableTime: data.availableTime,
          equipmentAccess: data.equipmentAccess,
          workoutDaysPerWeek: data.workoutDaysPerWeek,
          selectedPlan: data.selectedPlan,
          completedAt: new Date(),
        },
      });

      setIsOnboardingOpen(false);
      
      // Clear session storage
      sessionStorage.removeItem(ONBOARDING_SHOWN_KEY);
      
      console.log('✅ Post-login onboarding completed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete onboarding';
      setError(errorMessage);
      console.error('❌ Error completing post-login onboarding:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, updateProfile]);

  const skipOnboarding = useCallback(async () => {
    if (!user) {
      throw new Error('No user signed in');
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('⏭️ Skipping post-login onboarding');

      // Mark onboarding as completed without detailed data
      await updateProfile({
        onboardingCompleted: true,
      });

      setIsOnboardingOpen(false);
      
      // Clear session storage
      sessionStorage.removeItem(ONBOARDING_SHOWN_KEY);
      
      console.log('✅ Post-login onboarding skipped');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to skip onboarding';
      setError(errorMessage);
      console.error('❌ Error skipping post-login onboarding:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, updateProfile]);

  const closeOnboarding = useCallback(() => {
    setIsOnboardingOpen(false);
    setError(null);
    // Don't clear session storage here - user might want to see it again
  }, []);

  return {
    // Status
    shouldShowOnboarding,
    isOnboardingOpen,
    isNewUser,
    isFirstLogin,
    
    // Actions
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    closeOnboarding,
    
    // State
    isLoading,
    error,
  };
}

export default usePostLoginOnboarding;
