import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserProgressionState {
  userId: string;
  currentWeek: number;
  completedWeeks: number[];
  totalWorkouts: number;
  totalGoalsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  weeklyCompletionRate: number;
  isNewUser: boolean;
  lastActivityDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyProgressData {
  weekNumber: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrentWeek: boolean;
  completionRate: number;
  workoutsCompleted: number;
  goalsCompleted: number;
  startedAt: Date | null;
  completedAt: Date | null;
}

export class UserProgressionService {
  private static readonly COLLECTION = 'userProgression';

  /**
   * Initialize a new user with zero progression state
   */
  static async initializeNewUser(userId: string): Promise<UserProgressionState> {
    try {
      const now = new Date();
      const initialState: UserProgressionState = {
        userId,
        currentWeek: 1,
        completedWeeks: [],
        totalWorkouts: 0,
        totalGoalsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyCompletionRate: 0,
        isNewUser: true,
        lastActivityDate: null,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(doc(db, this.COLLECTION, userId), {
        ...initialState,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        lastActivityDate: null
      });

      console.log('✅ New user progression initialized:', userId);
      return initialState;
    } catch (error) {
      console.error('❌ Error initializing user progression:', error);
      throw new Error('Failed to initialize user progression');
    }
  }

  /**
   * Get user progression state
   */
  static async getUserProgression(userId: string): Promise<UserProgressionState> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Initialize new user if no progression exists
        return await this.initializeNewUser(userId);
      }

      const data = docSnap.data();
      return {
        userId: data.userId,
        currentWeek: data.currentWeek || 1,
        completedWeeks: data.completedWeeks || [],
        totalWorkouts: data.totalWorkouts || 0,
        totalGoalsCompleted: data.totalGoalsCompleted || 0,
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0,
        weeklyCompletionRate: data.weeklyCompletionRate || 0,
        isNewUser: data.isNewUser ?? true,
        lastActivityDate: data.lastActivityDate?.toDate() || null,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error('❌ Error getting user progression:', error);
      throw new Error('Failed to get user progression');
    }
  }

  /**
   * Update user progression when they complete activities
   */
  static async updateProgression(
    userId: string, 
    updates: Partial<UserProgressionState>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        isNewUser: false // Mark as no longer new user
      });

      console.log('✅ User progression updated:', userId);
    } catch (error) {
      console.error('❌ Error updating user progression:', error);
      throw new Error('Failed to update user progression');
    }
  }

  /**
   * Complete a workout and update progression
   */
  static async completeWorkout(userId: string): Promise<UserProgressionState> {
    try {
      const currentState = await this.getUserProgression(userId);
      const now = new Date();
      
      // Calculate new streak
      const newStreak = this.calculateNewStreak(currentState.lastActivityDate, now);
      
      const updates: Partial<UserProgressionState> = {
        totalWorkouts: currentState.totalWorkouts + 1,
        currentStreak: newStreak,
        longestStreak: Math.max(currentState.longestStreak, newStreak),
        lastActivityDate: now,
        isNewUser: false
      };

      await this.updateProgression(userId, updates);
      
      return {
        ...currentState,
        ...updates
      };
    } catch (error) {
      console.error('❌ Error completing workout:', error);
      throw new Error('Failed to complete workout');
    }
  }

  /**
   * Complete a goal and update progression
   */
  static async completeGoal(userId: string): Promise<UserProgressionState> {
    try {
      const currentState = await this.getUserProgression(userId);
      
      const updates: Partial<UserProgressionState> = {
        totalGoalsCompleted: currentState.totalGoalsCompleted + 1,
        isNewUser: false
      };

      await this.updateProgression(userId, updates);
      
      return {
        ...currentState,
        ...updates
      };
    } catch (error) {
      console.error('❌ Error completing goal:', error);
      throw new Error('Failed to complete goal');
    }
  }

  /**
   * Complete a week and unlock the next one
   */
  static async completeWeek(userId: string, weekNumber: number): Promise<UserProgressionState> {
    try {
      const currentState = await this.getUserProgression(userId);
      
      if (!currentState.completedWeeks.includes(weekNumber)) {
        const updates: Partial<UserProgressionState> = {
          completedWeeks: [...currentState.completedWeeks, weekNumber],
          currentWeek: weekNumber + 1,
          isNewUser: false
        };

        await this.updateProgression(userId, updates);
        
        return {
          ...currentState,
          ...updates
        };
      }
      
      return currentState;
    } catch (error) {
      console.error('❌ Error completing week:', error);
      throw new Error('Failed to complete week');
    }
  }

  /**
   * Get weekly progress data for a specific week
   */
  static async getWeeklyProgress(userId: string, weekNumber: number): Promise<WeeklyProgressData> {
    try {
      const progression = await this.getUserProgression(userId);
      
      return {
        weekNumber,
        isUnlocked: weekNumber === 1 || progression.completedWeeks.includes(weekNumber - 1),
        isCompleted: progression.completedWeeks.includes(weekNumber),
        isCurrentWeek: progression.currentWeek === weekNumber,
        completionRate: progression.weeklyCompletionRate || 0,
        workoutsCompleted: 0, // Would be calculated from weekly data
        goalsCompleted: 0, // Would be calculated from weekly data
        startedAt: null, // Would be tracked separately
        completedAt: null // Would be tracked separately
      };
    } catch (error) {
      console.error('❌ Error getting weekly progress:', error);
      throw new Error('Failed to get weekly progress');
    }
  }

  /**
   * Reset user progression (for testing or user request)
   */
  static async resetProgression(userId: string): Promise<UserProgressionState> {
    try {
      await setDoc(doc(db, this.COLLECTION, userId), {
        userId,
        currentWeek: 1,
        completedWeeks: [],
        totalWorkouts: 0,
        totalGoalsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyCompletionRate: 0,
        isNewUser: true,
        lastActivityDate: null,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: serverTimestamp()
      });

      console.log('✅ User progression reset:', userId);
      return await this.getUserProgression(userId);
    } catch (error) {
      console.error('❌ Error resetting progression:', error);
      throw new Error('Failed to reset progression');
    }
  }

  /**
   * Calculate new streak based on last activity
   */
  private static calculateNewStreak(lastActivityDate: Date | null, currentDate: Date): number {
    if (!lastActivityDate) return 1;

    const daysDiff = Math.floor(
      (currentDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If activity was yesterday or today, continue streak
    if (daysDiff <= 1) {
      return 1; // This would be incremented by the caller
    }

    // If more than 1 day gap, reset streak
    return 1;
  }

  /**
   * Check if user is truly new (no activities completed)
   */
  static async isNewUser(userId: string): Promise<boolean> {
    try {
      const progression = await this.getUserProgression(userId);
      return progression.isNewUser && 
             progression.totalWorkouts === 0 && 
             progression.totalGoalsCompleted === 0;
    } catch (error) {
      console.error('❌ Error checking if user is new:', error);
      return true; // Default to new user on error
    }
  }
}
