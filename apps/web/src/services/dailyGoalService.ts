import { db } from '@/lib/firebase';
import { doc, setDoc, collection, serverTimestamp, writeBatch, getDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { WorkoutPlan } from '@/services/userWorkoutPlanService';
import { ProgressMilestoneService } from './progressMilestoneService';

export interface DailyGoal {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  dayOfWeek: string;
  workoutPlanId: string;
  
  // Goal details
  title: string;
  description: string;
  type: 'workout' | 'rest' | 'active-recovery';
  
  // Workout specific
  exercises?: Array<{
    name: string;
    sets: number;
    reps: string;
    muscle: string;
    duration?: number;
    restTime: number;
  }>;
  
  // Targets
  estimatedDuration: number; // minutes
  estimatedCalories: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Progress tracking
  isCompleted: boolean;
  completedAt?: Date;
  actualDuration?: number;
  actualCalories?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export class DailyGoalService {
  /**
   * Generate daily goals for the next 4 weeks based on workout plan
   */
  static async generateDailyGoals(userId: string, workoutPlan: WorkoutPlan): Promise<void> {
    try {
      console.log(`🎯 Generating daily goals for user: ${userId} with plan: ${workoutPlan.title}`);
      
      const batch = writeBatch(db);
      const today = new Date();
      const goals: DailyGoal[] = [];
      
      // Generate goals for the next 4 weeks (28 days)
      for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
        const goalDate = new Date(today);
        goalDate.setDate(today.getDate() + dayOffset);
        
        const dayOfWeek = goalDate.toLocaleDateString('en-US', { weekday: 'long' });
        const dateString = goalDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Find matching workout day in the plan
        const workoutDay = workoutPlan.weeklySchedule?.find(day => day.dayOfWeek === dayOfWeek);
        
        let dailyGoal: DailyGoal;
        
        if (workoutDay) {
          // Workout day
          dailyGoal = {
            id: `goal_${userId}_${dateString}`,
            userId,
            date: dateString,
            dayOfWeek,
            workoutPlanId: workoutPlan.id,
            title: workoutDay.name,
            description: `Complete your ${workoutDay.type} workout with ${workoutDay.exercises?.length || 0} exercises`,
            type: 'workout',
            exercises: workoutDay.exercises?.map(ex => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              muscle: ex.muscle,
              duration: ex.duration,
              restTime: ex.restTime
            })) || [],
            estimatedDuration: workoutDay.duration,
            estimatedCalories: workoutDay.totalCalories,
            difficulty: workoutPlan.fitnessLevel as 'beginner' | 'intermediate' | 'advanced',
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        } else {
          // Rest day or active recovery
          const isActiveRecovery = dayOffset % 7 === 6; // Sunday as active recovery
          
          dailyGoal = {
            id: `goal_${userId}_${dateString}`,
            userId,
            date: dateString,
            dayOfWeek,
            workoutPlanId: workoutPlan.id,
            title: isActiveRecovery ? 'Active Recovery Day' : 'Rest Day',
            description: isActiveRecovery 
              ? 'Light activity like walking, stretching, or yoga to aid recovery'
              : 'Rest and recovery day - focus on nutrition and hydration',
            type: isActiveRecovery ? 'active-recovery' : 'rest',
            estimatedDuration: isActiveRecovery ? 20 : 0,
            estimatedCalories: isActiveRecovery ? 50 : 0,
            difficulty: 'beginner',
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }
        
        goals.push(dailyGoal);
        
        // Add to batch
        const goalRef = doc(db, 'users', userId, 'daily_goals', dailyGoal.id);
        batch.set(goalRef, {
          ...dailyGoal,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Commit all goals at once
      await batch.commit();
      
      console.log(`✅ Generated ${goals.length} daily goals for 4 weeks`);
      console.log(`📊 Breakdown: ${goals.filter(g => g.type === 'workout').length} workout days, ${goals.filter(g => g.type === 'rest').length} rest days, ${goals.filter(g => g.type === 'active-recovery').length} active recovery days`);
      
    } catch (error) {
      console.error('❌ Error generating daily goals:', error);
      throw error;
    }
  }

  /**
   * Get today's goal for a user
   */
  static async getTodaysGoal(userId: string): Promise<DailyGoal | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const goalId = `goal_${userId}_${today}`;
      
      const goalRef = doc(db, 'users', userId, 'daily_goals', goalId);
      const goalDoc = await getDoc(goalRef);
      
      if (goalDoc.exists()) {
        const data = goalDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate()
        } as DailyGoal;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting today\'s goal:', error);
      return null;
    }
  }

  /**
   * Mark a daily goal as completed
   */
  static async completeGoal(userId: string, goalId: string, actualDuration?: number, actualCalories?: number): Promise<void> {
    try {
      const goalRef = doc(db, 'users', userId, 'daily_goals', goalId);

      await setDoc(goalRef, {
        isCompleted: true,
        completedAt: serverTimestamp(),
        actualDuration,
        actualCalories,
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log(`✅ Goal ${goalId} marked as completed`);

      // Record daily progress for milestone tracking
      await ProgressMilestoneService.recordDailyProgress(userId);

      // Track goal completion for progress stats
      try {
        const { ProgressTrackingService } = await import('./progressTrackingService');
        await ProgressTrackingService.trackGoalCompletion(userId, goalId);
      } catch (error) {
        console.warn('⚠️ Could not track goal completion in progress service:', error);
      }

    } catch (error) {
      console.error('❌ Error completing goal:', error);
      throw error;
    }
  }

  /**
   * Get weekly goals for a user
   */
  static async getWeeklyGoals(userId: string, startDate?: Date): Promise<DailyGoal[]> {
    try {
      const start = startDate || new Date();
      const goals: DailyGoal[] = [];
      
      // Get 7 days starting from startDate
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        const goalId = `goal_${userId}_${dateString}`;
        
        const goalRef = doc(db, 'users', userId, 'daily_goals', goalId);
        const goalDoc = await getDoc(goalRef);
        
        if (goalDoc.exists()) {
          const data = goalDoc.data();
          goals.push({
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            completedAt: data.completedAt?.toDate()
          } as DailyGoal);
        }
      }
      
      return goals.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('❌ Error getting weekly goals:', error);
      return [];
    }
  }

  /**
   * Get goal statistics for a user
   */
  static async getGoalStats(userId: string): Promise<{
    totalGoals: number;
    completedGoals: number;
    currentStreak: number;
    totalCaloriesBurned: number;
    totalWorkoutTime: number;
  }> {
    try {
      // This would typically use a more efficient query
      // For now, we'll return mock stats
      return {
        totalGoals: 28,
        completedGoals: 0,
        currentStreak: 0,
        totalCaloriesBurned: 0,
        totalWorkoutTime: 0
      };
    } catch (error) {
      console.error('❌ Error getting goal stats:', error);
      return {
        totalGoals: 0,
        completedGoals: 0,
        currentStreak: 0,
        totalCaloriesBurned: 0,
        totalWorkoutTime: 0
      };
    }
  }
}
