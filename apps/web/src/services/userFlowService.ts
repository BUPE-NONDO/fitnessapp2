import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { IsolatedOnboardingService } from './isolatedOnboardingService';

export interface UserFlowState {
  isNewUser: boolean;
  needsOnboarding: boolean;
  hasCompletedOnboarding: boolean;
  hasWorkoutPlan: boolean;
  currentStep: 'signup' | 'onboarding' | 'dashboard';
}

export class UserFlowService {
  /**
   * Initialize a completely fresh user with isolated data bucket
   */
  static async initializeFreshUser(userId: string, userProfile: {
    email: string;
    displayName: string;
    photoURL?: string | null;
  }): Promise<void> {
    try {
      console.log(`🆕 Initializing completely fresh user: ${userId}`);
      
      const batch = writeBatch(db);

      // 1. Create main user document with minimal data
      const userRef = doc(db, 'users', userId);
      batch.set(userRef, {
        uid: userId,
        email: userProfile.email,
        displayName: userProfile.displayName,
        photoURL: userProfile.photoURL || null,
        isNewUser: true,
        onboardingCompleted: false,
        dataInitialized: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Initialize onboarding subcollection
      const onboardingRef = doc(db, 'users', userId, 'onboarding', 'current');
      batch.set(onboardingRef, {
        status: 'not_started',
        currentStep: 0,
        completedSteps: [],
        startedAt: null,
        completedAt: null,
        data: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 3. Initialize progress subcollection
      const progressRef = doc(db, 'users', userId, 'progress', 'stats');
      batch.set(progressRef, {
        totalWorkouts: 0,
        totalGoals: 0,
        totalCheckIns: 0,
        totalBadges: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyGoalProgress: 0,
        monthlyGoalProgress: 0,
        lastActivityDate: null,
        joinDate: serverTimestamp(),
        onboardingCompletedAt: null,
        hasWorkoutPlan: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 4. Initialize achievements subcollection
      const achievementsRef = doc(db, 'users', userId, 'achievements', 'summary');
      batch.set(achievementsRef, {
        totalBadges: 0,
        earnedBadges: [],
        milestones: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 5. Initialize preferences subcollection
      const preferencesRef = doc(db, 'users', userId, 'preferences', 'settings');
      batch.set(preferencesRef, {
        theme: 'light',
        notifications: true,
        units: 'metric',
        language: 'en',
        emailUpdates: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      
      console.log('✅ Fresh user initialized with complete isolated data bucket');
      
    } catch (error) {
      console.error('❌ Failed to initialize fresh user:', error);
      throw new Error(`Failed to initialize fresh user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the current flow state for a user
   */
  static async getUserFlowState(userId: string): Promise<UserFlowState> {
    try {
      console.log(`🔍 Checking flow state for user: ${userId}`);
      
      // Check main user document
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return {
          isNewUser: true,
          needsOnboarding: true,
          hasCompletedOnboarding: false,
          hasWorkoutPlan: false,
          currentStep: 'signup'
        };
      }

      const userData = userDoc.data();
      
      // Check onboarding status
      const onboardingProgress = await IsolatedOnboardingService.getOnboardingProgress(userId);
      const hasCompletedOnboarding = userData.onboardingCompleted || onboardingProgress?.status === 'completed';
      
      // Check if user has workout plans
      const workoutPlans = await IsolatedOnboardingService.getUserWorkoutPlans(userId);
      const hasWorkoutPlan = workoutPlans.length > 0;
      
      // Determine current step
      let currentStep: 'signup' | 'onboarding' | 'dashboard';
      if (!hasCompletedOnboarding) {
        currentStep = 'onboarding';
      } else {
        currentStep = 'dashboard';
      }
      
      const flowState: UserFlowState = {
        isNewUser: userData.isNewUser || false,
        needsOnboarding: !hasCompletedOnboarding,
        hasCompletedOnboarding,
        hasWorkoutPlan,
        currentStep
      };
      
      console.log('📊 User flow state:', flowState);
      return flowState;
      
    } catch (error) {
      console.error('❌ Failed to get user flow state:', error);
      // Return safe defaults
      return {
        isNewUser: true,
        needsOnboarding: true,
        hasCompletedOnboarding: false,
        hasWorkoutPlan: false,
        currentStep: 'signup'
      };
    }
  }

  /**
   * Complete the onboarding step and move to dashboard
   */
  static async completeOnboardingStep(userId: string, onboardingData: any): Promise<void> {
    try {
      console.log(`🎉 Completing onboarding step for user: ${userId}`);
      
      // Complete onboarding using isolated service
      await IsolatedOnboardingService.completeOnboarding(userId, onboardingData);
      
      // Update user's main profile
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        onboardingCompleted: true,
        isNewUser: false,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ Onboarding step completed, user ready for dashboard');
      
    } catch (error) {
      console.error('❌ Failed to complete onboarding step:', error);
      throw new Error(`Failed to complete onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify user has a complete data bucket
   */
  static async verifyUserDataBucket(userId: string): Promise<{
    isComplete: boolean;
    missingComponents: string[];
  }> {
    try {
      console.log(`🔍 Verifying data bucket for user: ${userId}`);
      
      const missingComponents: string[] = [];
      
      // Check main user document
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        missingComponents.push('main_user_document');
      }
      
      // Check required subcollections
      const requiredSubcollections = [
        'onboarding/current',
        'progress/stats',
        'achievements/summary',
        'preferences/settings'
      ];
      
      for (const subcollectionPath of requiredSubcollections) {
        const [subcollection, docId] = subcollectionPath.split('/');
        const docRef = doc(db, 'users', userId, subcollection, docId);
        const docSnapshot = await getDoc(docRef);
        
        if (!docSnapshot.exists()) {
          missingComponents.push(subcollectionPath);
        }
      }
      
      const isComplete = missingComponents.length === 0;
      
      console.log(`${isComplete ? '✅' : '❌'} Data bucket verification:`, {
        isComplete,
        missingComponents
      });
      
      return { isComplete, missingComponents };
      
    } catch (error) {
      console.error('❌ Failed to verify user data bucket:', error);
      return {
        isComplete: false,
        missingComponents: ['verification_failed']
      };
    }
  }

  /**
   * Get user's workout plan for dashboard display
   */
  static async getUserDashboardData(userId: string): Promise<{
    workoutPlan: any | null;
    progressStats: any | null;
    todaysWorkout: any | null;
  }> {
    try {
      console.log(`📊 Getting dashboard data for user: ${userId}`);
      
      // Get active workout plan
      const workoutPlan = await IsolatedOnboardingService.getActiveWorkoutPlan(userId);
      
      // Get progress stats
      const progressRef = doc(db, 'users', userId, 'progress', 'stats');
      const progressDoc = await getDoc(progressRef);
      const progressStats = progressDoc.exists() ? progressDoc.data() : null;
      
      // Get today's workout (simplified for now)
      const todaysWorkout = workoutPlan ? {
        name: `${workoutPlan.goal} Workout`,
        duration: '45 minutes',
        exercises: 5,
        calories: Math.round(workoutPlan.estimatedCaloriesPerWeek / workoutPlan.workoutsPerWeek)
      } : null;
      
      console.log('📋 Dashboard data retrieved:', {
        hasWorkoutPlan: !!workoutPlan,
        hasProgressStats: !!progressStats,
        hasTodaysWorkout: !!todaysWorkout
      });
      
      return {
        workoutPlan,
        progressStats,
        todaysWorkout
      };
      
    } catch (error) {
      console.error('❌ Failed to get dashboard data:', error);
      return {
        workoutPlan: null,
        progressStats: null,
        todaysWorkout: null
      };
    }
  }
}
