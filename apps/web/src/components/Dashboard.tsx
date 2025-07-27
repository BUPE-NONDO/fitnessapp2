import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { AdminAuthService } from '@/services/adminAuthService';
import { ProgressDashboard } from './dashboard/ProgressDashboard';
import { NewDashboard } from './dashboard/NewDashboard';
import { OnboardingWizard } from './onboarding/OnboardingWizard';
import { CompleteDataReset } from './admin/CompleteDataReset';

export function Dashboard() {
  const { user, logout } = useAuth();
  const {
    isOnboardingRequired,
    isOnboardingOpen,
    setIsOnboardingOpen,
    completeOnboarding,
    triggerOnboarding,
  } = useOnboarding();



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
  if (isOnboardingOpen || isOnboardingRequired) {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        onExit={handleOnboardingExit}
      />
    );
  }

  return <NewDashboard />;
}
