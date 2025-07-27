import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';

export interface DailyProgress {
  id: string;
  userId: string;
  date: Date;
  goalsCompleted: number;
  totalGoals: number;
  completionRate: number;
  workoutCompleted: boolean;
  caloriesBurned: number;
  exerciseDuration: number; // in minutes
  streak: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyMilestone {
  id: string;
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  totalGoalsCompleted: number;
  totalGoals: number;
  weeklyCompletionRate: number;
  workoutsCompleted: number;
  totalCaloriesBurned: number;
  totalExerciseTime: number;
  streakAtWeekEnd: number;
  milestoneAchieved: boolean;
  milestoneType?: 'consistency' | 'streak' | 'calories' | 'workouts';
  milestoneDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressStats {
  currentStreak: number;
  longestStreak: number;
  totalGoalsCompleted: number;
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
  totalCaloriesBurned: number;
  totalWorkouts: number;
  averageWorkoutDuration: number;
  recentMilestones: WeeklyMilestone[];
  nextMilestoneTarget: {
    type: string;
    target: number;
    current: number;
    description: string;
  } | null;
}

export class ProgressMilestoneService {
  /**
   * Record daily progress when a goal is completed
   */
  static async recordDailyProgress(userId: string): Promise<void> {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Get today's goals and completion status
      const dailyGoalsRef = collection(db, 'users', userId, 'daily_goals');
      const todayGoalsQuery = query(
        dailyGoalsRef,
        where('date', '>=', new Date(todayStr)),
        where('date', '<', new Date(today.getTime() + 24 * 60 * 60 * 1000))
      );
      
      const todayGoalsSnapshot = await getDocs(todayGoalsQuery);
      const todayGoals = todayGoalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalGoals = todayGoals.length;
      const completedGoals = todayGoals.filter(goal => goal.isCompleted).length;
      const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
      
      const workoutGoal = todayGoals.find(goal => goal.type === 'workout');
      const workoutCompleted = workoutGoal?.isCompleted || false;
      const caloriesBurned = workoutGoal?.actualCalories || 0;
      const exerciseDuration = workoutGoal?.actualDuration || 0;
      
      // Calculate current streak
      const streak = await this.calculateCurrentStreak(userId, today);
      
      // Save daily progress
      const progressRef = doc(db, 'users', userId, 'daily_progress', todayStr);
      const progressData: Omit<DailyProgress, 'id'> = {
        userId,
        date: today,
        goalsCompleted: completedGoals,
        totalGoals,
        completionRate,
        workoutCompleted,
        caloriesBurned,
        exerciseDuration,
        streak,
        createdAt: today,
        updatedAt: today
      };
      
      await setDoc(progressRef, {
        ...progressData,
        date: Timestamp.fromDate(progressData.date),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log(`✅ Daily progress recorded for ${todayStr}`);
      
      // Check if we need to create a weekly milestone
      if (today.getDay() === 0) { // Sunday - end of week
        await this.createWeeklyMilestone(userId, today);
      }
      
    } catch (error) {
      console.error('❌ Error recording daily progress:', error);
      throw error;
    }
  }

  /**
   * Calculate current streak
   */
  static async calculateCurrentStreak(userId: string, currentDate: Date): Promise<number> {
    try {
      const progressRef = collection(db, 'users', userId, 'daily_progress');
      const progressQuery = query(
        progressRef,
        orderBy('date', 'desc'),
        limit(30) // Check last 30 days
      );
      
      const progressSnapshot = await getDocs(progressQuery);
      const progressDocs = progressSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
      
      let streak = 0;
      const today = new Date(currentDate.toISOString().split('T')[0]);
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        const dayProgress = progressDocs.find(p => 
          p.date.toISOString().split('T')[0] === checkDateStr
        );
        
        if (dayProgress && dayProgress.completionRate >= 50) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('❌ Error calculating streak:', error);
      return 0;
    }
  }

  /**
   * Create weekly milestone
   */
  static async createWeeklyMilestone(userId: string, weekEndDate: Date): Promise<void> {
    try {
      const weekStart = new Date(weekEndDate);
      weekStart.setDate(weekEndDate.getDate() - 6);
      
      // Get week's progress
      const progressRef = collection(db, 'users', userId, 'daily_progress');
      const weekQuery = query(
        progressRef,
        where('date', '>=', Timestamp.fromDate(weekStart)),
        where('date', '<=', Timestamp.fromDate(weekEndDate))
      );
      
      const weekSnapshot = await getDocs(weekQuery);
      const weekProgress = weekSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
      
      // Calculate weekly stats
      const totalGoals = weekProgress.reduce((sum, day) => sum + day.totalGoals, 0);
      const totalCompleted = weekProgress.reduce((sum, day) => sum + day.goalsCompleted, 0);
      const weeklyCompletionRate = totalGoals > 0 ? (totalCompleted / totalGoals) * 100 : 0;
      const workoutsCompleted = weekProgress.filter(day => day.workoutCompleted).length;
      const totalCaloriesBurned = weekProgress.reduce((sum, day) => sum + day.caloriesBurned, 0);
      const totalExerciseTime = weekProgress.reduce((sum, day) => sum + day.exerciseDuration, 0);
      const streakAtWeekEnd = weekProgress[weekProgress.length - 1]?.streak || 0;
      
      // Determine milestone achievement
      let milestoneAchieved = false;
      let milestoneType: WeeklyMilestone['milestoneType'];
      let milestoneDescription = '';
      
      if (weeklyCompletionRate >= 80) {
        milestoneAchieved = true;
        milestoneType = 'consistency';
        milestoneDescription = 'Excellent consistency! 80%+ completion rate';
      } else if (streakAtWeekEnd >= 7) {
        milestoneAchieved = true;
        milestoneType = 'streak';
        milestoneDescription = `Amazing ${streakAtWeekEnd}-day streak!`;
      } else if (workoutsCompleted >= 4) {
        milestoneAchieved = true;
        milestoneType = 'workouts';
        milestoneDescription = `Great job! ${workoutsCompleted} workouts this week`;
      } else if (totalCaloriesBurned >= 1000) {
        milestoneAchieved = true;
        milestoneType = 'calories';
        milestoneDescription = `Burned ${totalCaloriesBurned} calories this week!`;
      }
      
      // Save weekly milestone
      const milestoneId = `${weekStart.toISOString().split('T')[0]}_${weekEndDate.toISOString().split('T')[0]}`;
      const milestoneRef = doc(db, 'users', userId, 'weekly_milestones', milestoneId);
      
      const milestoneData: Omit<WeeklyMilestone, 'id'> = {
        userId,
        weekStart,
        weekEnd: weekEndDate,
        totalGoalsCompleted: totalCompleted,
        totalGoals,
        weeklyCompletionRate,
        workoutsCompleted,
        totalCaloriesBurned,
        totalExerciseTime,
        streakAtWeekEnd,
        milestoneAchieved,
        milestoneType,
        milestoneDescription,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(milestoneRef, {
        ...milestoneData,
        weekStart: Timestamp.fromDate(milestoneData.weekStart),
        weekEnd: Timestamp.fromDate(milestoneData.weekEnd),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Weekly milestone created: ${milestoneDescription || 'Week completed'}`);
      
    } catch (error) {
      console.error('❌ Error creating weekly milestone:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive progress stats
   */
  static async getProgressStats(userId: string): Promise<ProgressStats> {
    try {
      // Get recent daily progress
      const progressRef = collection(db, 'users', userId, 'daily_progress');
      const recentProgressQuery = query(
        progressRef,
        orderBy('date', 'desc'),
        limit(30)
      );
      
      const progressSnapshot = await getDocs(recentProgressQuery);
      const recentProgress = progressSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
      
      // Get recent milestones
      const milestonesRef = collection(db, 'users', userId, 'weekly_milestones');
      const milestonesQuery = query(
        milestonesRef,
        orderBy('weekEnd', 'desc'),
        limit(4)
      );
      
      const milestonesSnapshot = await getDocs(milestonesQuery);
      const recentMilestones = milestonesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        weekStart: doc.data().weekStart.toDate(),
        weekEnd: doc.data().weekEnd.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as WeeklyMilestone[];
      
      // Calculate stats
      const currentStreak = recentProgress[0]?.streak || 0;
      const longestStreak = Math.max(...recentProgress.map(p => p.streak), 0);
      const totalGoalsCompleted = recentProgress.reduce((sum, p) => sum + p.goalsCompleted, 0);
      const totalCaloriesBurned = recentProgress.reduce((sum, p) => sum + p.caloriesBurned, 0);
      const totalWorkouts = recentProgress.filter(p => p.workoutCompleted).length;
      const totalExerciseTime = recentProgress.reduce((sum, p) => sum + p.exerciseDuration, 0);
      const averageWorkoutDuration = totalWorkouts > 0 ? totalExerciseTime / totalWorkouts : 0;
      
      // Calculate weekly and monthly completion rates
      const lastWeek = recentProgress.slice(0, 7);
      const lastMonth = recentProgress.slice(0, 30);
      
      const weeklyGoals = lastWeek.reduce((sum, p) => sum + p.totalGoals, 0);
      const weeklyCompleted = lastWeek.reduce((sum, p) => sum + p.goalsCompleted, 0);
      const weeklyCompletionRate = weeklyGoals > 0 ? (weeklyCompleted / weeklyGoals) * 100 : 0;
      
      const monthlyGoals = lastMonth.reduce((sum, p) => sum + p.totalGoals, 0);
      const monthlyCompleted = lastMonth.reduce((sum, p) => sum + p.goalsCompleted, 0);
      const monthlyCompletionRate = monthlyGoals > 0 ? (monthlyCompleted / monthlyGoals) * 100 : 0;
      
      // Determine next milestone target
      const nextMilestoneTarget = this.getNextMilestoneTarget(currentStreak, totalWorkouts, totalCaloriesBurned);
      
      return {
        currentStreak,
        longestStreak,
        totalGoalsCompleted,
        weeklyCompletionRate,
        monthlyCompletionRate,
        totalCaloriesBurned,
        totalWorkouts,
        averageWorkoutDuration,
        recentMilestones,
        nextMilestoneTarget
      };
      
    } catch (error) {
      console.error('❌ Error getting progress stats:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalGoalsCompleted: 0,
        weeklyCompletionRate: 0,
        monthlyCompletionRate: 0,
        totalCaloriesBurned: 0,
        totalWorkouts: 0,
        averageWorkoutDuration: 0,
        recentMilestones: [],
        nextMilestoneTarget: null
      };
    }
  }

  /**
   * Get next milestone target
   */
  private static getNextMilestoneTarget(currentStreak: number, totalWorkouts: number, totalCalories: number) {
    const streakTargets = [7, 14, 30, 50, 100];
    const workoutTargets = [10, 25, 50, 100, 200];
    const calorieTargets = [1000, 5000, 10000, 25000, 50000];
    
    const nextStreak = streakTargets.find(target => target > currentStreak);
    const nextWorkout = workoutTargets.find(target => target > totalWorkouts);
    const nextCalorie = calorieTargets.find(target => target > totalCalories);
    
    // Return the closest milestone
    if (nextStreak && (!nextWorkout || (nextStreak - currentStreak) <= (nextWorkout - totalWorkouts))) {
      return {
        type: 'streak',
        target: nextStreak,
        current: currentStreak,
        description: `${nextStreak}-day streak`
      };
    } else if (nextWorkout) {
      return {
        type: 'workouts',
        target: nextWorkout,
        current: totalWorkouts,
        description: `${nextWorkout} total workouts`
      };
    } else if (nextCalorie) {
      return {
        type: 'calories',
        target: nextCalorie,
        current: totalCalories,
        description: `${nextCalorie} calories burned`
      };
    }
    
    return null;
  }
}
