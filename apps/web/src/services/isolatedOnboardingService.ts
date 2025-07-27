import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { OnboardingData } from '@/components/onboarding/OnboardingWizard';
import { WorkoutPlanGenerator } from './workoutPlanGenerator';
import { DailyGoalService } from './dailyGoalService';

export interface IsolatedOnboardingProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  currentStep: number;
  completedSteps: number[];
  startedAt: Date | null;
  completedAt: Date | null;
  data: Partial<OnboardingData>;
  createdAt: Date;
  updatedAt: Date;
}

export class IsolatedOnboardingService {
  /**
   * Initialize onboarding for a user in their subcollection
   */
  static async initializeOnboarding(userId: string): Promise<void> {
    try {
      console.log(`🚀 Initializing isolated onboarding for user: ${userId}`);
      
      const onboardingRef = doc(db, 'users', userId, 'onboarding', 'current');
      
      await setDoc(onboardingRef, {
        status: 'not_started',
        currentStep: 0,
        completedSteps: [],
        startedAt: null,
        completedAt: null,
        data: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Isolated onboarding initialized');
    } catch (error) {
      console.error('❌ Failed to initialize isolated onboarding:', error);
      throw new Error(`Failed to initialize onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Start onboarding process
   */
  static async startOnboarding(userId: string): Promise<void> {
    try {
      console.log(`▶️ Starting onboarding for user: ${userId}`);
      
      const onboardingRef = doc(db, 'users', userId, 'onboarding', 'current');
      
      await updateDoc(onboardingRef, {
        status: 'in_progress',
        currentStep: 1,
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Onboarding started');
    } catch (error) {
      console.error('❌ Failed to start onboarding:', error);
      throw new Error(`Failed to start onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update onboarding progress
   */
  static async updateOnboardingProgress(
    userId: string, 
    step: number, 
    stepData: Partial<OnboardingData>
  ): Promise<void> {
    try {
      console.log(`📝 Updating onboarding progress for user ${userId}, step ${step}`);
      
      const onboardingRef = doc(db, 'users', userId, 'onboarding', 'current');
      const onboardingDoc = await getDoc(onboardingRef);
      
      if (!onboardingDoc.exists()) {
        await this.initializeOnboarding(userId);
      }
      
      const currentData = onboardingDoc.data();
      const existingData = currentData?.data || {};
      const completedSteps = currentData?.completedSteps || [];
      
      // Add step to completed steps if not already there
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }
      
      await updateDoc(onboardingRef, {
        currentStep: step,
        completedSteps: completedSteps,
        data: { ...existingData, ...stepData },
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Onboarding progress updated for step ${step}`);
    } catch (error) {
      console.error('❌ Failed to update onboarding progress:', error);
      throw new Error(`Failed to update progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Complete onboarding and generate workout plan
   */
  static async completeOnboarding(userId: string, finalData: OnboardingData): Promise<void> {
    try {
      console.log(`🎉 Completing onboarding for user: ${userId}`);
      console.log('📊 Onboarding data:', finalData);

      // Generate and store workout plan FIRST (before batch operations)
      console.log('🏋️ Generating workout plan...');
      const workoutPlan = await WorkoutPlanGenerator.generateWorkoutPlan(userId, finalData);
      console.log('✅ Workout plan generated:', workoutPlan.id, workoutPlan.title);

      // Generate daily goals based on the workout plan
      console.log('🎯 Generating daily goals...');
      try {
        await DailyGoalService.generateDailyGoals(userId, workoutPlan);
        console.log('✅ Daily goals generated for 4 weeks');
      } catch (goalError) {
        console.error('❌ Error generating daily goals:', goalError);
        // Continue with onboarding even if daily goals fail
        console.log('⚠️ Continuing onboarding without daily goals...');
      }

      // Now update onboarding status and references
      const batch = writeBatch(db);

      // Update onboarding status
      const onboardingRef = doc(db, 'users', userId, 'onboarding', 'current');
      batch.update(onboardingRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        data: finalData,
        updatedAt: serverTimestamp()
      });

      // Store workout plan reference in user's subcollection
      const workoutPlanRef = doc(db, 'users', userId, 'workout_plans', workoutPlan.id);
      batch.set(workoutPlanRef, {
        planId: workoutPlan.id,
        title: workoutPlan.title,
        description: workoutPlan.description,
        goal: workoutPlan.goal,
        fitnessLevel: workoutPlan.fitnessLevel,
        workoutsPerWeek: workoutPlan.workoutsPerWeek,
        duration: workoutPlan.duration,
        estimatedCaloriesPerWeek: workoutPlan.estimatedCaloriesPerWeek,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update user's main profile to reflect onboarding completion
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        onboardingCompleted: true,
        currentWorkoutPlanId: workoutPlan.id,
        updatedAt: serverTimestamp()
      });

      // Update user's progress stats (use set with merge to create if doesn't exist)
      const progressRef = doc(db, 'users', userId, 'progress', 'stats');
      batch.set(progressRef, {
        onboardingCompletedAt: serverTimestamp(),
        hasWorkoutPlan: true,
        totalWorkouts: 0,
        totalGoals: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        joinDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      await batch.commit();

      console.log('✅ Onboarding completed successfully with workout plan:', workoutPlan.id);
      console.log('📋 Plan details:', {
        title: workoutPlan.title,
        goal: workoutPlan.goal,
        workoutsPerWeek: workoutPlan.workoutsPerWeek,
        duration: workoutPlan.duration
      });

    } catch (error) {
      console.error('❌ Failed to complete onboarding:', error);
      console.error('Error details:', error);
      throw new Error(`Failed to complete onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user's onboarding progress
   */
  static async getOnboardingProgress(userId: string): Promise<IsolatedOnboardingProgress | null> {
    try {
      const onboardingRef = doc(db, 'users', userId, 'onboarding', 'current');
      const onboardingDoc = await getDoc(onboardingRef);
      
      if (!onboardingDoc.exists()) {
        return null;
      }
      
      const data = onboardingDoc.data();
      return {
        status: data.status,
        currentStep: data.currentStep,
        completedSteps: data.completedSteps || [],
        startedAt: data.startedAt?.toDate() || null,
        completedAt: data.completedAt?.toDate() || null,
        data: data.data || {},
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error('❌ Failed to get onboarding progress:', error);
      return null;
    }
  }

  /**
   * Reset onboarding for a user
   */
  static async resetOnboarding(userId: string): Promise<void> {
    try {
      console.log(`🔄 Resetting onboarding for user: ${userId}`);
      
      const batch = writeBatch(db);
      
      // Reset onboarding document
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
      
      // Update user's main profile
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        onboardingCompleted: false,
        currentWorkoutPlanId: null,
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();
      
      console.log('✅ Onboarding reset successfully');
    } catch (error) {
      console.error('❌ Failed to reset onboarding:', error);
      throw new Error(`Failed to reset onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user's workout plans from subcollection
   */
  static async getUserWorkoutPlans(userId: string): Promise<any[]> {
    try {
      const workoutPlansRef = collection(db, 'users', userId, 'workout_plans');
      const snapshot = await getDocs(workoutPlansRef);
      
      const plans: any[] = [];
      snapshot.forEach((doc) => {
        plans.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return plans.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
    } catch (error) {
      console.error('❌ Failed to get user workout plans:', error);
      return [];
    }
  }

  /**
   * Get user's active workout plan
   */
  static async getActiveWorkoutPlan(userId: string): Promise<any | null> {
    try {
      const plans = await this.getUserWorkoutPlans(userId);
      return plans.find(plan => plan.isActive) || plans[0] || null;
    } catch (error) {
      console.error('❌ Failed to get active workout plan:', error);
      return null;
    }
  }

  /**
   * Store workout session in user's subcollection
   */
  static async storeWorkoutSession(userId: string, sessionData: {
    workoutPlanId: string;
    exercises: any[];
    duration: number;
    caloriesBurned: number;
    completedAt: Date;
  }): Promise<void> {
    try {
      const sessionId = `session_${Date.now()}`;
      const sessionRef = doc(db, 'users', userId, 'workout_sessions', sessionId);
      
      await setDoc(sessionRef, {
        ...sessionData,
        id: sessionId,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Update progress stats
      const progressRef = doc(db, 'users', userId, 'progress', 'stats');
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        const currentStats = progressDoc.data();
        await updateDoc(progressRef, {
          totalWorkouts: (currentStats.totalWorkouts || 0) + 1,
          lastActivityDate: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      console.log('✅ Workout session stored in user subcollection');
    } catch (error) {
      console.error('❌ Failed to store workout session:', error);
      throw new Error(`Failed to store workout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user's workout sessions
   */
  static async getUserWorkoutSessions(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const sessionsRef = collection(db, 'users', userId, 'workout_sessions');
      const snapshot = await getDocs(sessionsRef);
      
      const sessions: any[] = [];
      snapshot.forEach((doc) => {
        sessions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return sessions
        .sort((a, b) => b.completedAt?.toDate() - a.completedAt?.toDate())
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Failed to get user workout sessions:', error);
      return [];
    }
  }
}
