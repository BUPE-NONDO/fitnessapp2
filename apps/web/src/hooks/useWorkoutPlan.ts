import { useState, useCallback, useEffect } from 'react';
import { useUser } from './useUser';
import { WorkoutPlanGenerator, WorkoutPlan } from '@/services/workoutPlanGenerator';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface UseWorkoutPlanReturn {
  // Current workout plan
  currentPlan: WorkoutPlan | null;
  
  // Loading states
  isLoading: boolean;
  isGenerating: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  generateNewPlan: (onboardingData: any) => Promise<WorkoutPlan>;
  loadUserPlan: () => Promise<void>;
  updateProgress: (completedWorkout: boolean) => Promise<void>;
  
  // Plan details
  todaysWorkout: any | null;
  weeklySchedule: any[] | null;
  progressStats: any | null;
}

export function useWorkoutPlan(): UseWorkoutPlanReturn {
  const { user, userProfile } = useUser();
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate a new workout plan for the user
   */
  const generateNewPlan = useCallback(async (onboardingData: any): Promise<WorkoutPlan> => {
    if (!user) {
      throw new Error('No user signed in');
    }

    try {
      setIsGenerating(true);
      setError(null);

      console.log('🏋️ Generating new workout plan...');
      const plan = await WorkoutPlanGenerator.generateWorkoutPlan(user.uid, onboardingData);
      
      setCurrentPlan(plan);
      console.log('✅ Workout plan generated successfully');
      
      return plan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate workout plan';
      setError(errorMessage);
      console.error('❌ Error generating workout plan:', err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [user]);

  /**
   * Load the user's current workout plan
   */
  const loadUserPlan = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // First check if user has a plan ID in their profile
      if (userProfile?.workoutPlan?.id) {
        const planRef = doc(db, 'workout_plans', userProfile.workoutPlan.id);
        const planDoc = await getDoc(planRef);
        
        if (planDoc.exists()) {
          const plan = planDoc.data() as WorkoutPlan;
          setCurrentPlan(plan);
          console.log('✅ Loaded workout plan from profile');
          return;
        }
      }

      // If no plan in profile, look for user's most recent plan
      const plansRef = collection(db, 'workout_plans');
      const q = query(
        plansRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const planDoc = querySnapshot.docs[0];
        const plan = planDoc.data() as WorkoutPlan;
        setCurrentPlan(plan);
        console.log('✅ Loaded most recent workout plan');
      } else {
        console.log('ℹ️ No workout plan found for user');
        setCurrentPlan(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load workout plan';
      setError(errorMessage);
      console.error('❌ Error loading workout plan:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, userProfile]);

  /**
   * Update workout progress
   */
  const updateProgress = useCallback(async (completedWorkout: boolean) => {
    if (!user || !currentPlan) {
      return;
    }

    try {
      await WorkoutPlanGenerator.updateProgress(user.uid, currentPlan.id, completedWorkout);
      
      // Reload the plan to get updated progress
      await loadUserPlan();
      
      console.log('✅ Workout progress updated');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update progress';
      setError(errorMessage);
      console.error('❌ Error updating progress:', err);
    }
  }, [user, currentPlan, loadUserPlan]);

  /**
   * Get today's workout
   */
  const getTodaysWorkout = useCallback(() => {
    if (!currentPlan) return null;

    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const todayWorkout = currentPlan.weeklySchedule.find(day => {
      const dayMap = {
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
        'Thursday': 4, 'Friday': 5, 'Saturday': 6
      };
      return dayMap[day.dayOfWeek as keyof typeof dayMap] === today;
    });

    return todayWorkout || null;
  }, [currentPlan]);

  /**
   * Get progress statistics
   */
  const getProgressStats = useCallback(() => {
    if (!currentPlan) return null;

    const progress = currentPlan.progressTracking;
    const completionPercentage = Math.round(
      (progress.completedWorkouts / progress.totalWorkouts) * 100
    );

    return {
      currentWeek: progress.currentWeek,
      completedWorkouts: progress.completedWorkouts,
      totalWorkouts: progress.totalWorkouts,
      completionPercentage,
      estimatedCaloriesPerWeek: currentPlan.estimatedCaloriesPerWeek,
      startDate: progress.startDate,
      lastUpdated: progress.lastUpdated,
    };
  }, [currentPlan]);

  // Load user's plan when user changes
  useEffect(() => {
    if (user && !currentPlan) {
      loadUserPlan();
    }
  }, [user, currentPlan, loadUserPlan]);

  return {
    // Current workout plan
    currentPlan,
    
    // Loading states
    isLoading,
    isGenerating,
    
    // Error state
    error,
    
    // Actions
    generateNewPlan,
    loadUserPlan,
    updateProgress,
    
    // Plan details
    todaysWorkout: getTodaysWorkout(),
    weeklySchedule: currentPlan?.weeklySchedule || null,
    progressStats: getProgressStats(),
  };
}

export default useWorkoutPlan;
