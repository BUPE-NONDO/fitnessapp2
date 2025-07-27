import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { 
  UserProgressionService, 
  UserProgressionState, 
  WeeklyProgressData 
} from '@/services/userProgressionService';

export function useUserProgression() {
  const { user } = useUser();
  const [progression, setProgression] = useState<UserProgressionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user progression
  const loadProgression = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const userProgression = await UserProgressionService.getUserProgression(user.uid);
      setProgression(userProgression);
    } catch (err: any) {
      setError(err.message || 'Failed to load progression');
      console.error('Error loading progression:', err);
    } finally {
      setLoading(false);
    }
  };

  // Complete a workout
  const completeWorkout = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const updatedProgression = await UserProgressionService.completeWorkout(user.uid);
      setProgression(updatedProgression);
      return updatedProgression;
    } catch (err: any) {
      setError(err.message || 'Failed to complete workout');
      throw err;
    }
  };

  // Complete a goal
  const completeGoal = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const updatedProgression = await UserProgressionService.completeGoal(user.uid);
      setProgression(updatedProgression);
      return updatedProgression;
    } catch (err: any) {
      setError(err.message || 'Failed to complete goal');
      throw err;
    }
  };

  // Complete a week
  const completeWeek = async (weekNumber: number) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const updatedProgression = await UserProgressionService.completeWeek(user.uid, weekNumber);
      setProgression(updatedProgression);
      return updatedProgression;
    } catch (err: any) {
      setError(err.message || 'Failed to complete week');
      throw err;
    }
  };

  // Get weekly progress for a specific week
  const getWeeklyProgress = async (weekNumber: number): Promise<WeeklyProgressData | null> => {
    if (!user) return null;

    try {
      setError(null);
      return await UserProgressionService.getWeeklyProgress(user.uid, weekNumber);
    } catch (err: any) {
      setError(err.message || 'Failed to get weekly progress');
      return null;
    }
  };

  // Reset progression (for testing or user request)
  const resetProgression = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const resetState = await UserProgressionService.resetProgression(user.uid);
      setProgression(resetState);
      return resetState;
    } catch (err: any) {
      setError(err.message || 'Failed to reset progression');
      throw err;
    }
  };

  // Check if user is new
  const isNewUser = async (): Promise<boolean> => {
    if (!user) return true;

    try {
      return await UserProgressionService.isNewUser(user.uid);
    } catch (err: any) {
      console.error('Error checking if user is new:', err);
      return true;
    }
  };

  // Helper functions
  const isWeekUnlocked = (weekNumber: number): boolean => {
    if (!progression) return weekNumber === 1;
    return weekNumber === 1 || progression.completedWeeks.includes(weekNumber - 1);
  };

  const isWeekCompleted = (weekNumber: number): boolean => {
    if (!progression) return false;
    return progression.completedWeeks.includes(weekNumber);
  };

  const isCurrentWeek = (weekNumber: number): boolean => {
    if (!progression) return weekNumber === 1;
    return progression.currentWeek === weekNumber;
  };

  const getProgressPercentage = (): number => {
    if (!progression) return 0;
    
    // Calculate overall progress based on completed activities
    const totalActivities = progression.totalWorkouts + progression.totalGoalsCompleted;
    if (totalActivities === 0) return 0;
    
    // Simple progress calculation - could be more sophisticated
    return Math.min((totalActivities / 10) * 100, 100); // Assume 10 activities = 100%
  };

  const getStreakStatus = (): { 
    current: number; 
    longest: number; 
    isActive: boolean; 
    daysUntilMilestone: number;
  } => {
    if (!progression) {
      return { current: 0, longest: 0, isActive: false, daysUntilMilestone: 1 };
    }

    const milestones = [7, 14, 30, 50, 100];
    const nextMilestone = milestones.find(m => m > progression.currentStreak) || 365;
    
    return {
      current: progression.currentStreak,
      longest: progression.longestStreak,
      isActive: progression.currentStreak > 0,
      daysUntilMilestone: nextMilestone - progression.currentStreak
    };
  };

  // Load progression when user changes
  useEffect(() => {
    if (user) {
      loadProgression();
    } else {
      setProgression(null);
    }
  }, [user]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    progression,
    loading,
    error,
    loadProgression,
    completeWorkout,
    completeGoal,
    completeWeek,
    getWeeklyProgress,
    resetProgression,
    isNewUser,
    // Helper functions
    isWeekUnlocked,
    isWeekCompleted,
    isCurrentWeek,
    getProgressPercentage,
    getStreakStatus
  };
}
