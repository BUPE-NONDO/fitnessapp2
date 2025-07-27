import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DailyGoalService, DailyGoal } from '@/services/dailyGoalService';
import { ProgressMilestoneService } from '@/services/progressMilestoneService';

export function useDailyGoals() {
  const { user } = useAuth();
  const [todaysGoal, setTodaysGoal] = useState<DailyGoal | null>(null);
  const [weeklyGoals, setWeeklyGoals] = useState<DailyGoal[]>([]);
  const [goalStats, setGoalStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    currentStreak: 0,
    totalCaloriesBurned: 0,
    totalWorkoutTime: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch today's goal
   */
  const fetchTodaysGoal = useCallback(async () => {
    if (!user) {
      setTodaysGoal(null);
      return;
    }

    try {
      console.log('🎯 Fetching today\'s goal...');
      const goal = await DailyGoalService.getTodaysGoal(user.uid);
      setTodaysGoal(goal);
      
      if (goal) {
        console.log('✅ Today\'s goal loaded:', goal.title);
      } else {
        console.log('❌ No goal found for today');
      }
    } catch (err) {
      console.error('❌ Error fetching today\'s goal:', err);
      setError('Failed to load today\'s goal');
    }
  }, [user]);

  /**
   * Fetch weekly goals
   */
  const fetchWeeklyGoals = useCallback(async () => {
    if (!user) {
      setWeeklyGoals([]);
      return;
    }

    try {
      console.log('📅 Fetching weekly goals...');
      const goals = await DailyGoalService.getWeeklyGoals(user.uid);
      setWeeklyGoals(goals);
      console.log(`✅ Loaded ${goals.length} weekly goals`);
    } catch (err) {
      console.error('❌ Error fetching weekly goals:', err);
      setError('Failed to load weekly goals');
    }
  }, [user]);

  /**
   * Fetch goal statistics
   */
  const fetchGoalStats = useCallback(async () => {
    if (!user) {
      setGoalStats({
        totalGoals: 0,
        completedGoals: 0,
        currentStreak: 0,
        totalCaloriesBurned: 0,
        totalWorkoutTime: 0
      });
      return;
    }

    try {
      console.log('📊 Fetching goal stats...');

      // Get enhanced progress stats
      const progressStats = await ProgressMilestoneService.getProgressStats(user.uid);

      // Convert to legacy format for compatibility
      const stats = {
        totalGoals: progressStats.totalGoalsCompleted,
        completedGoals: progressStats.totalGoalsCompleted,
        currentStreak: progressStats.currentStreak,
        totalCaloriesBurned: progressStats.totalCaloriesBurned,
        totalWorkoutTime: progressStats.averageWorkoutDuration * progressStats.totalWorkouts
      };

      setGoalStats(stats);
      console.log('✅ Enhanced goal stats loaded:', stats);
    } catch (err) {
      console.error('❌ Error fetching goal stats:', err);
      setError('Failed to load goal statistics');
    }
  }, [user]);

  /**
   * Complete a goal
   */
  const completeGoal = useCallback(async (goalId: string, actualDuration?: number, actualCalories?: number) => {
    if (!user) return;

    try {
      console.log(`🎯 Completing goal: ${goalId}`);
      await DailyGoalService.completeGoal(user.uid, goalId, actualDuration, actualCalories);
      
      // Refresh data
      await Promise.all([
        fetchTodaysGoal(),
        fetchWeeklyGoals(),
        fetchGoalStats()
      ]);
      
      console.log('✅ Goal completed and data refreshed');
    } catch (err) {
      console.error('❌ Error completing goal:', err);
      setError('Failed to complete goal');
      throw err;
    }
  }, [user, fetchTodaysGoal, fetchWeeklyGoals, fetchGoalStats]);

  /**
   * Refresh all goal data
   */
  const refreshGoals = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await Promise.all([
        fetchTodaysGoal(),
        fetchWeeklyGoals(),
        fetchGoalStats()
      ]);
    } catch (err) {
      console.error('❌ Error refreshing goals:', err);
      setError('Failed to refresh goals');
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchTodaysGoal, fetchWeeklyGoals, fetchGoalStats]);

  /**
   * Force refresh all data (for after onboarding completion)
   */
  const forceRefresh = useCallback(async () => {
    console.log('🔄 Force refreshing daily goals data...');
    await refreshGoals();
  }, [refreshGoals]);

  // Load initial data when user changes
  useEffect(() => {
    if (user) {
      refreshGoals();
    } else {
      setTodaysGoal(null);
      setWeeklyGoals([]);
      setGoalStats({
        totalGoals: 0,
        completedGoals: 0,
        currentStreak: 0,
        totalCaloriesBurned: 0,
        totalWorkoutTime: 0
      });
      setIsLoading(false);
      setError(null);
    }
  }, [user, refreshGoals]);

  // Check for onboarding completion flag and refresh data
  useEffect(() => {
    const checkOnboardingCompletion = async () => {
      const justCompleted = localStorage.getItem('onboarding-just-completed');
      if (justCompleted === 'true') {
        console.log('🎉 Onboarding just completed, refreshing daily goals...');

        // Clear the flag
        localStorage.removeItem('onboarding-just-completed');

        // Wait a moment for Firebase to propagate the data
        setTimeout(async () => {
          await forceRefresh();
        }, 2000);
      }
    };

    if (user) {
      checkOnboardingCompletion();
    }
  }, [user, forceRefresh]);

  return {
    // Data
    todaysGoal,
    weeklyGoals,
    goalStats,
    
    // States
    isLoading,
    error,
    
    // Actions
    completeGoal,
    refreshGoals,
    forceRefresh,
    
    // Computed values
    hasTodaysGoal: todaysGoal !== null,
    isTodaysGoalCompleted: todaysGoal?.isCompleted || false,
    weeklyCompletionRate: weeklyGoals.length > 0 
      ? (weeklyGoals.filter(g => g.isCompleted).length / weeklyGoals.length) * 100 
      : 0,
    upcomingGoals: weeklyGoals.filter(g => !g.isCompleted && new Date(g.date) > new Date()),
  };
}
