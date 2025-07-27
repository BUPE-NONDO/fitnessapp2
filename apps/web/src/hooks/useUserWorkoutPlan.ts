import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserWorkoutPlanService, WorkoutPlan } from '@/services/userWorkoutPlanService';

export function useUserWorkoutPlan() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [allPlans, setAllPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasWorkoutPlan, setHasWorkoutPlan] = useState(false);

  /**
   * Fetch the user's current workout plan
   */
  const fetchCurrentPlan = useCallback(async () => {
    if (!user) {
      setCurrentPlan(null);
      setHasWorkoutPlan(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Fetching current workout plan...');
      const plan = await UserWorkoutPlanService.getCurrentWorkoutPlan(user.uid);
      
      setCurrentPlan(plan);
      setHasWorkoutPlan(plan !== null);
      
      if (plan) {
        console.log('✅ Current workout plan loaded:', plan.title);
      } else {
        console.log('❌ No current workout plan found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workout plan';
      setError(errorMessage);
      console.error('❌ Error fetching current workout plan:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Fetch all workout plans for the user
   */
  const fetchAllPlans = useCallback(async () => {
    if (!user) {
      setAllPlans([]);
      return;
    }

    try {
      console.log('🔍 Fetching all workout plans...');
      const plans = await UserWorkoutPlanService.getAllWorkoutPlans(user.uid);
      setAllPlans(plans);
      console.log(`✅ Loaded ${plans.length} workout plans`);
    } catch (err) {
      console.error('❌ Error fetching all workout plans:', err);
    }
  }, [user]);

  /**
   * Refresh workout plan data
   */
  const refreshPlans = useCallback(async () => {
    await Promise.all([
      fetchCurrentPlan(),
      fetchAllPlans()
    ]);
  }, [fetchCurrentPlan, fetchAllPlans]);

  /**
   * Get a specific workout plan by ID
   */
  const getPlanById = useCallback(async (planId: string): Promise<WorkoutPlan | null> => {
    if (!user) return null;

    try {
      return await UserWorkoutPlanService.getWorkoutPlanById(user.uid, planId);
    } catch (err) {
      console.error('❌ Error fetching plan by ID:', err);
      return null;
    }
  }, [user]);

  // Load initial data when user changes
  useEffect(() => {
    if (user) {
      fetchCurrentPlan();
      fetchAllPlans();
    } else {
      setCurrentPlan(null);
      setAllPlans([]);
      setHasWorkoutPlan(false);
      setIsLoading(false);
      setError(null);
    }
  }, [user, fetchCurrentPlan, fetchAllPlans]);

  return {
    // Current plan data
    currentPlan,
    hasWorkoutPlan,
    
    // All plans data
    allPlans,
    
    // Loading states
    isLoading,
    error,
    
    // Actions
    refreshPlans,
    getPlanById,
    
    // Computed values
    planCount: allPlans.length,
    isFirstTime: !hasWorkoutPlan && allPlans.length === 0,
  };
}
