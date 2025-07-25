import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/hooks/useUser';

export interface ProgressStats {
  // Onboarding & Setup
  onboardingCompleted: boolean;
  onboardingCompletedDate?: Date;
  daysSinceOnboarding: number;
  
  // Goals & Achievements
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  goalCompletionRate: number;
  
  // Workout Progress
  totalWorkouts: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  averageWorkoutDuration: number;
  
  // Check-ins & Consistency
  totalCheckIns: number;
  checkInsThisWeek: number;
  checkInsThisMonth: number;
  consistencyRate: number;
  
  // Badges & Achievements
  totalBadges: number;
  recentBadges: Array<{
    id: string;
    name: string;
    earnedAt: Date;
  }>;
  
  // Wellness Tracking
  averageMood: number;
  averageEnergy: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  energyTrend: 'improving' | 'stable' | 'declining';
  
  // Progress Metrics
  weightProgress?: {
    startWeight?: number;
    currentWeight?: number;
    targetWeight?: number;
    progressPercentage: number;
  };
  
  // Activity Summary
  lastActivityDate?: Date;
  daysSinceLastActivity: number;
  isActiveUser: boolean;
}

export interface WeeklyProgress {
  week: string;
  workouts: number;
  checkIns: number;
  goalsCompleted: number;
  averageMood: number;
  averageEnergy: number;
}

export class ProgressTrackingService {
  private static readonly GOALS_COLLECTION = 'goals';
  private static readonly WORKOUT_SESSIONS_COLLECTION = 'workout_sessions';
  private static readonly CHECK_INS_COLLECTION = 'check_ins';
  private static readonly BADGES_COLLECTION = 'user_badges';
  private static readonly ACTIVITY_LOGS_COLLECTION = 'activity_logs';

  /**
   * Calculate comprehensive progress statistics for a user
   */
  static async calculateProgressStats(
    userId: string,
    userProfile: UserProfile
  ): Promise<ProgressStats> {
    try {
      // Check if user is fresh/new - return default stats if so
      if (userProfile.isNewUser || !userProfile.dataInitialized) {
        console.log('🆕 User is fresh, returning default progress stats');
        return this.getDefaultProgressStats();
      }

      // Check if user has completed onboarding
      if (!userProfile.onboardingCompleted) {
        console.log('📝 User has not completed onboarding, returning minimal stats');
        return this.getDefaultProgressStats();
      }

      const [
        goals,
        workoutSessions,
        checkIns,
        badges,
        activityLogs
      ] = await Promise.all([
        this.getUserGoals(userId),
        this.getUserWorkoutSessions(userId),
        this.getUserCheckIns(userId),
        this.getUserBadges(userId),
        this.getUserActivityLogs(userId)
      ]);

      const now = new Date();
      const onboardingDate = userProfile.onboardingData?.completedAt;
      const daysSinceOnboarding = onboardingDate
        ? Math.floor((now.getTime() - onboardingDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Calculate goal statistics
      const totalGoals = goals.length;
      const completedGoals = goals.filter(g => g.completed).length;
      const activeGoals = goals.filter(g => !g.completed && g.isActive).length;
      const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

      // Calculate workout statistics
      const totalWorkouts = workoutSessions.filter(s => s.completed).length;
      const workoutsThisWeek = this.getThisWeekCount(workoutSessions.filter(s => s.completed));
      const workoutsThisMonth = this.getThisMonthCount(workoutSessions.filter(s => s.completed));
      const currentStreak = this.calculateCurrentWorkoutStreak(workoutSessions);
      const longestStreak = this.calculateLongestWorkoutStreak(workoutSessions);
      const averageWorkoutDuration = this.calculateAverageWorkoutDuration(workoutSessions);

      // Calculate check-in statistics
      const totalCheckIns = checkIns.length;
      const checkInsThisWeek = this.getThisWeekCount(checkIns);
      const checkInsThisMonth = this.getThisMonthCount(checkIns);
      const consistencyRate = this.calculateConsistencyRate(checkIns, daysSinceOnboarding);

      // Calculate badge statistics
      const totalBadges = badges.length;
      const recentBadges = badges
        .sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime())
        .slice(0, 3)
        .map(badge => ({
          id: badge.id,
          name: badge.name,
          earnedAt: badge.earnedAt
        }));

      // Calculate wellness statistics
      const { averageMood, averageEnergy, moodTrend, energyTrend } = 
        this.calculateWellnessStats(checkIns);

      // Calculate weight progress
      const weightProgress = this.calculateWeightProgress(userProfile, checkIns);

      // Calculate activity metrics
      const lastActivityDate = this.getLastActivityDate(workoutSessions, checkIns, activityLogs);
      const daysSinceLastActivity = lastActivityDate 
        ? Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      const isActiveUser = daysSinceLastActivity <= 7; // Active if activity within last week

      return {
        onboardingCompleted: !!userProfile.onboardingCompleted,
        onboardingCompletedDate: onboardingDate,
        daysSinceOnboarding,
        totalGoals,
        completedGoals,
        activeGoals,
        goalCompletionRate,
        totalWorkouts,
        workoutsThisWeek,
        workoutsThisMonth,
        currentStreak,
        longestStreak,
        averageWorkoutDuration,
        totalCheckIns,
        checkInsThisWeek,
        checkInsThisMonth,
        consistencyRate,
        totalBadges,
        recentBadges,
        averageMood,
        averageEnergy,
        moodTrend,
        energyTrend,
        weightProgress,
        lastActivityDate,
        daysSinceLastActivity,
        isActiveUser,
      };
    } catch (error) {
      console.error('Failed to calculate progress stats:', error);
      return this.getDefaultProgressStats();
    }
  }

  /**
   * Get weekly progress data for charts
   */
  static async getWeeklyProgress(userId: string, weeks: number = 12): Promise<WeeklyProgress[]> {
    try {
      const [workoutSessions, checkIns, goals] = await Promise.all([
        this.getUserWorkoutSessions(userId),
        this.getUserCheckIns(userId),
        this.getUserGoals(userId)
      ]);

      const weeklyData: WeeklyProgress[] = [];
      const now = new Date();

      for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekWorkouts = workoutSessions.filter(s => 
          s.completed && s.date >= weekStart && s.date <= weekEnd
        ).length;

        const weekCheckIns = checkIns.filter(c => 
          c.date >= weekStart && c.date <= weekEnd
        );

        const weekGoalsCompleted = goals.filter(g => 
          g.completedAt && g.completedAt >= weekStart && g.completedAt <= weekEnd
        ).length;

        const weekMoods = weekCheckIns.map(c => c.mood).filter(m => m !== undefined);
        const weekEnergies = weekCheckIns.map(c => c.energy).filter(e => e !== undefined);

        weeklyData.push({
          week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          workouts: weekWorkouts,
          checkIns: weekCheckIns.length,
          goalsCompleted: weekGoalsCompleted,
          averageMood: weekMoods.length > 0 ? weekMoods.reduce((a, b) => a + b, 0) / weekMoods.length : 0,
          averageEnergy: weekEnergies.length > 0 ? weekEnergies.reduce((a, b) => a + b, 0) / weekEnergies.length : 0,
        });
      }

      return weeklyData;
    } catch (error) {
      console.error('Failed to get weekly progress:', error);
      return [];
    }
  }

  // Helper methods for data fetching
  private static async getUserGoals(userId: string): Promise<any[]> {
    try {
      const q = query(collection(db, this.GOALS_COLLECTION), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Failed to get user goals:', error);
      return [];
    }
  }

  private static async getUserWorkoutSessions(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.WORKOUT_SESSIONS_COLLECTION), 
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date)
        };
      });
    } catch (error) {
      console.error('Failed to get workout sessions:', error);
      return [];
    }
  }

  private static async getUserCheckIns(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.CHECK_INS_COLLECTION), 
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date)
        };
      });
    } catch (error) {
      console.error('Failed to get check-ins:', error);
      return [];
    }
  }

  private static async getUserBadges(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.BADGES_COLLECTION), 
        where('userId', '==', userId),
        orderBy('earnedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          earnedAt: data.earnedAt?.toDate ? data.earnedAt.toDate() : new Date(data.earnedAt)
        };
      });
    } catch (error) {
      console.error('Failed to get user badges:', error);
      return [];
    }
  }

  private static async getUserActivityLogs(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.ACTIVITY_LOGS_COLLECTION), 
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
        };
      });
    } catch (error) {
      console.error('Failed to get activity logs:', error);
      return [];
    }
  }

  // Helper calculation methods
  private static getThisWeekCount(items: any[]): number {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    return items.filter(item => item.date >= weekStart).length;
  }

  private static getThisMonthCount(items: any[]): number {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return items.filter(item => item.date >= monthStart).length;
  }

  private static calculateCurrentWorkoutStreak(workoutSessions: any[]): number {
    const completedSessions = workoutSessions
      .filter(s => s.completed)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (completedSessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const session of completedSessions) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  private static calculateLongestWorkoutStreak(workoutSessions: any[]): number {
    const completedSessions = workoutSessions
      .filter(s => s.completed)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (completedSessions.length === 0) return 0;

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < completedSessions.length; i++) {
      const prevDate = new Date(completedSessions[i - 1].date);
      const currDate = new Date(completedSessions[i].date);
      
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }

  private static calculateAverageWorkoutDuration(workoutSessions: any[]): number {
    const completedSessions = workoutSessions.filter(s => s.completed && s.duration);
    if (completedSessions.length === 0) return 0;
    
    const totalDuration = completedSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    return Math.round(totalDuration / completedSessions.length);
  }

  private static calculateConsistencyRate(checkIns: any[], daysSinceOnboarding: number): number {
    if (daysSinceOnboarding === 0) return 0;
    const expectedCheckIns = Math.min(daysSinceOnboarding, 30); // Cap at 30 days for calculation
    const actualCheckIns = checkIns.length;
    return Math.min((actualCheckIns / expectedCheckIns) * 100, 100);
  }

  private static calculateWellnessStats(checkIns: any[]): {
    averageMood: number;
    averageEnergy: number;
    moodTrend: 'improving' | 'stable' | 'declining';
    energyTrend: 'improving' | 'stable' | 'declining';
  } {
    const recentCheckIns = checkIns.slice(0, 30); // Last 30 check-ins
    const moods = recentCheckIns.map(c => c.mood).filter(m => m !== undefined);
    const energies = recentCheckIns.map(c => c.energy).filter(e => e !== undefined);

    const averageMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;
    const averageEnergy = energies.length > 0 ? energies.reduce((a, b) => a + b, 0) / energies.length : 0;

    // Calculate trends (compare first half vs second half of recent data)
    const moodTrend = this.calculateTrend(moods);
    const energyTrend = this.calculateTrend(energies);

    return { averageMood, averageEnergy, moodTrend, energyTrend };
  }

  private static calculateTrend(values: number[]): 'improving' | 'stable' | 'declining' {
    if (values.length < 4) return 'stable';
    
    const midPoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, midPoint);
    const secondHalf = values.slice(midPoint);
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    
    if (diff > 0.2) return 'improving';
    if (diff < -0.2) return 'declining';
    return 'stable';
  }

  private static calculateWeightProgress(userProfile: UserProfile, checkIns: any[]): any {
    const startWeight = userProfile.onboardingData?.currentWeight;
    const targetWeight = userProfile.onboardingData?.targetWeight;
    
    if (!startWeight || !targetWeight) return undefined;

    // Get most recent weight from check-ins
    const recentWeightCheckIn = checkIns.find(c => c.weight);
    const currentWeight = recentWeightCheckIn?.weight || startWeight;
    
    const totalProgress = Math.abs(targetWeight - startWeight);
    const currentProgress = Math.abs(currentWeight - startWeight);
    const progressPercentage = totalProgress > 0 ? (currentProgress / totalProgress) * 100 : 0;

    return {
      startWeight,
      currentWeight,
      targetWeight,
      progressPercentage: Math.min(progressPercentage, 100)
    };
  }

  private static getLastActivityDate(workoutSessions: any[], checkIns: any[], activityLogs: any[]): Date | undefined {
    const dates = [
      ...workoutSessions.map(s => s.date),
      ...checkIns.map(c => c.date),
      ...activityLogs.map(l => l.timestamp)
    ].filter(date => date);

    if (dates.length === 0) return undefined;
    
    return new Date(Math.max(...dates.map(d => d.getTime())));
  }

  /**
   * Get fresh user progress stats (all zeros for new users)
   */
  static getFreshUserProgressStats(): ProgressStats {
    return {
      onboardingCompleted: false,
      daysSinceOnboarding: 0,
      totalGoals: 0,
      completedGoals: 0,
      activeGoals: 0,
      goalCompletionRate: 0,
      totalWorkouts: 0,
      workoutsThisWeek: 0,
      workoutsThisMonth: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageWorkoutDuration: 0,
      totalCheckIns: 0,
      checkInsThisWeek: 0,
      checkInsThisMonth: 0,
      consistencyRate: 0,
      totalBadges: 0,
      recentBadges: [],
      averageMood: 0,
      averageEnergy: 0,
      moodTrend: 'stable',
      energyTrend: 'stable',
      daysSinceLastActivity: 0, // Fresh users have no activity gap
      isActiveUser: false,
    };
  }

  /**
   * Validate that user has completely fresh progress data
   */
  static async validateFreshUserProgress(userId: string): Promise<{
    isFresh: boolean;
    issues: string[];
  }> {
    try {
      const issues: string[] = [];

      // Check all user data collections
      const [goals, workouts, checkIns, badges] = await Promise.all([
        this.getUserGoals(userId),
        this.getUserWorkoutSessions(userId),
        this.getUserCheckIns(userId),
        this.getUserBadges(userId)
      ]);

      if (goals.length > 0) issues.push(`User has ${goals.length} existing goals`);
      if (workouts.length > 0) issues.push(`User has ${workouts.length} existing workouts`);
      if (checkIns.length > 0) issues.push(`User has ${checkIns.length} existing check-ins`);
      if (badges.length > 0) issues.push(`User has ${badges.length} existing badges`);

      return {
        isFresh: issues.length === 0,
        issues,
      };
    } catch (error) {
      console.error('Failed to validate fresh user progress:', error);
      return {
        isFresh: false,
        issues: ['Failed to validate user progress data'],
      };
    }
  }

  /**
   * Reset user progress to fresh state
   */
  static async resetUserProgressToFresh(userId: string): Promise<void> {
    try {
      console.log('🔄 Resetting user progress to fresh state:', userId);

      // This would typically involve deleting all user data
      // For now, we'll just log the action
      console.log('⚠️ Progress reset not implemented - would delete all user data');

      // TODO: Implement actual data deletion if needed
      // await this.deleteAllUserGoals(userId);
      // await this.deleteAllUserWorkouts(userId);
      // await this.deleteAllUserCheckIns(userId);
      // await this.deleteAllUserBadges(userId);

    } catch (error) {
      console.error('Failed to reset user progress:', error);
      throw new Error('Failed to reset user progress');
    }
  }

  private static getDefaultProgressStats(): ProgressStats {
    return this.getFreshUserProgressStats();
  }
}

export default ProgressTrackingService;
