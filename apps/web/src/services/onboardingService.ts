import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OnboardingData } from '@/components/onboarding/OnboardingWizard';
import { UserProfile } from '@/hooks/useUser';

export interface OnboardingServiceInterface {
  saveOnboardingData(userId: string, onboardingData: OnboardingData): Promise<void>;
  completeOnboarding(userId: string, onboardingData: OnboardingData): Promise<void>;
  checkOnboardingStatus(userProfile: UserProfile | null): boolean;
  shouldTriggerOnboarding(userProfile: UserProfile | null, hasGoals: boolean): boolean;
}

class OnboardingService implements OnboardingServiceInterface {
  /**
   * Save onboarding data to user profile in Firestore
   */
  async saveOnboardingData(userId: string, onboardingData: OnboardingData): Promise<void> {
    try {
      console.log('💾 Saving onboarding data for user:', userId);
      
      const userDocRef = doc(db, 'users', userId);
      
      // Convert OnboardingData to the format expected by UserProfile
      const onboardingDataForProfile = {
        ageRange: onboardingData.ageRange,
        gender: onboardingData.gender,
        bodyType: onboardingData.bodyType,
        primaryGoal: onboardingData.primaryGoal,
        currentWeight: onboardingData.currentWeight,
        targetWeight: onboardingData.targetWeight,
        height: onboardingData.height,
        weightUnit: onboardingData.weightUnit,
        heightUnit: onboardingData.heightUnit,
        fitnessLevel: onboardingData.fitnessLevel,
        workoutEnvironment: onboardingData.workoutEnvironment,
        availableTime: onboardingData.availableTime,
        equipmentAccess: onboardingData.equipmentAccess,
        workoutDaysPerWeek: onboardingData.workoutDaysPerWeek,
        selectedPlan: onboardingData.selectedPlan,
        completedAt: onboardingData.completedAt ? Timestamp.fromDate(onboardingData.completedAt) : undefined,
      };

      await updateDoc(userDocRef, {
        onboardingData: onboardingDataForProfile,
        updatedAt: Timestamp.now(),
      });

      console.log('✅ Onboarding data saved successfully');
    } catch (error) {
      console.error('❌ Error saving onboarding data:', error);
      throw new Error(`Failed to save onboarding data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mark onboarding as completed and save final data
   */
  async completeOnboarding(userId: string, onboardingData: OnboardingData): Promise<void> {
    try {
      console.log('🎉 Completing onboarding for user:', userId);
      
      const userDocRef = doc(db, 'users', userId);
      
      // Convert OnboardingData to the format expected by UserProfile
      const onboardingDataForProfile = {
        ageRange: onboardingData.ageRange,
        gender: onboardingData.gender,
        bodyType: onboardingData.bodyType,
        primaryGoal: onboardingData.primaryGoal,
        currentWeight: onboardingData.currentWeight,
        targetWeight: onboardingData.targetWeight,
        height: onboardingData.height,
        weightUnit: onboardingData.weightUnit,
        heightUnit: onboardingData.heightUnit,
        fitnessLevel: onboardingData.fitnessLevel,
        workoutEnvironment: onboardingData.workoutEnvironment,
        availableTime: onboardingData.availableTime,
        equipmentAccess: onboardingData.equipmentAccess,
        workoutDaysPerWeek: onboardingData.workoutDaysPerWeek,
        selectedPlan: onboardingData.selectedPlan,
        completedAt: Timestamp.now(),
      };

      await updateDoc(userDocRef, {
        onboardingCompleted: true,
        onboardingData: onboardingDataForProfile,
        updatedAt: Timestamp.now(),
      });

      // Clear localStorage onboarding progress
      localStorage.removeItem('fitness-app-onboarding-progress');

      console.log('✅ Onboarding completed successfully');
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      throw new Error(`Failed to complete onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if user has completed onboarding
   */
  checkOnboardingStatus(userProfile: UserProfile | null): boolean {
    if (!userProfile) {
      return false;
    }
    
    return userProfile.onboardingCompleted === true;
  }

  /**
   * Determine if onboarding should be triggered
   * Triggers when user creates their first goal and hasn't completed onboarding
   */
  shouldTriggerOnboarding(userProfile: UserProfile | null, hasGoals: boolean): boolean {
    if (!userProfile) {
      return false;
    }

    // Don't trigger if already completed
    if (this.checkOnboardingStatus(userProfile)) {
      return false;
    }

    // Don't trigger if user already has goals (existing user)
    if (hasGoals || (userProfile.stats && userProfile.stats.totalGoals > 0)) {
      return false;
    }

    return true;
  }

  /**
   * Get onboarding progress from localStorage
   */
  getOnboardingProgress(): OnboardingData | null {
    try {
      const saved = localStorage.getItem('fitness-app-onboarding-progress');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error reading onboarding progress:', error);
      return null;
    }
  }

  /**
   * Clear onboarding progress from localStorage
   */
  clearOnboardingProgress(): void {
    localStorage.removeItem('fitness-app-onboarding-progress');
  }

  /**
   * Create initial goals based on onboarding data
   */
  generateInitialGoalsFromOnboarding(onboardingData: OnboardingData): Array<{
    title: string;
    description: string;
    metric: 'count' | 'duration' | 'distance' | 'weight';
    target: number;
    frequency: 'daily' | 'weekly' | 'monthly';
  }> {
    const goals = [];

    // Generate goals based on primary goal
    switch (onboardingData.primaryGoal) {
      case 'lose-weight':
        goals.push({
          title: 'Daily Cardio Workout',
          description: 'Burn calories with cardio exercises',
          metric: 'duration' as const,
          target: 30,
          frequency: 'daily' as const,
        });
        break;

      case 'gain-muscle':
        goals.push({
          title: 'Strength Training Sessions',
          description: 'Build muscle with resistance training',
          metric: 'count' as const,
          target: 3,
          frequency: 'weekly' as const,
        });
        break;

      case 'increase-endurance':
        goals.push({
          title: 'Running Distance',
          description: 'Improve cardiovascular endurance',
          metric: 'distance' as const,
          target: 5,
          frequency: 'weekly' as const,
        });
        break;

      case 'improve-flexibility':
        goals.push({
          title: 'Daily Stretching',
          description: 'Improve flexibility and mobility',
          metric: 'duration' as const,
          target: 15,
          frequency: 'daily' as const,
        });
        break;

      default:
        goals.push({
          title: 'Daily Exercise',
          description: 'Stay active with daily movement',
          metric: 'duration' as const,
          target: 30,
          frequency: 'daily' as const,
        });
    }

    // Add a step goal for everyone
    goals.push({
      title: 'Daily Steps',
      description: 'Track your daily walking activity',
      metric: 'count' as const,
      target: 8000,
      frequency: 'daily' as const,
    });

    return goals;
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService();
export default onboardingService;
