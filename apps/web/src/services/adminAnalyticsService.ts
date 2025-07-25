import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AdminAnalytics {
  // User Statistics
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  
  // Onboarding Statistics
  onboardingCompletionRate: number;
  averageOnboardingTime: number; // in minutes
  
  // Engagement Statistics
  totalWorkouts: number;
  workoutsToday: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  averageWorkoutsPerUser: number;
  
  // Goal Statistics
  totalGoals: number;
  completedGoals: number;
  goalCompletionRate: number;
  averageGoalsPerUser: number;
  
  // Check-in Statistics
  totalCheckIns: number;
  checkInsToday: number;
  checkInsThisWeek: number;
  dailyActiveUsers: number;
  
  // Badge Statistics
  totalBadgesEarned: number;
  mostPopularBadges: Array<{
    badgeId: string;
    name: string;
    count: number;
  }>;
  
  // System Health
  systemUptime: number;
  averageResponseTime: number;
  errorRate: number;
  
  // Trends
  userGrowthTrend: 'increasing' | 'stable' | 'decreasing';
  engagementTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface UserGrowthData {
  date: string;
  newUsers: number;
  totalUsers: number;
  activeUsers: number;
}

export interface EngagementData {
  date: string;
  workouts: number;
  checkIns: number;
  goalsCompleted: number;
  badgesEarned: number;
}

export class AdminAnalyticsService {
  private static readonly USERS_COLLECTION = 'users';
  private static readonly WORKOUT_SESSIONS_COLLECTION = 'workout_sessions';
  private static readonly CHECK_INS_COLLECTION = 'check_ins';
  private static readonly GOALS_COLLECTION = 'goals';
  private static readonly BADGES_COLLECTION = 'user_badges';
  private static readonly AUDIT_LOGS_COLLECTION = 'audit_logs';

  /**
   * Get comprehensive admin analytics
   */
  static async getAdminAnalytics(): Promise<AdminAnalytics> {
    try {
      const [
        userStats,
        workoutStats,
        goalStats,
        checkInStats,
        badgeStats,
        systemStats
      ] = await Promise.all([
        this.getUserStatistics(),
        this.getWorkoutStatistics(),
        this.getGoalStatistics(),
        this.getCheckInStatistics(),
        this.getBadgeStatistics(),
        this.getSystemStatistics()
      ]);

      return {
        ...userStats,
        ...workoutStats,
        ...goalStats,
        ...checkInStats,
        ...badgeStats,
        ...systemStats,
      };
    } catch (error) {
      console.error('Failed to get admin analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  /**
   * Get user growth data for charts
   */
  static async getUserGrowthData(days: number = 30): Promise<UserGrowthData[]> {
    try {
      const users = await this.getAllUsers();
      const growthData: UserGrowthData[] = [];
      
      const now = new Date();
      let runningTotal = 0;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        // Count new users for this day
        const newUsers = users.filter(user => {
          const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
          return createdAt >= date && createdAt < nextDate;
        }).length;

        runningTotal += newUsers;

        // Count active users (users who had activity on this day)
        const activeUsers = await this.getActiveUsersForDate(date);

        growthData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          newUsers,
          totalUsers: runningTotal,
          activeUsers,
        });
      }

      return growthData;
    } catch (error) {
      console.error('Failed to get user growth data:', error);
      return [];
    }
  }

  /**
   * Get engagement data for charts
   */
  static async getEngagementData(days: number = 30): Promise<EngagementData[]> {
    try {
      const [workouts, checkIns, goals, badges] = await Promise.all([
        this.getAllWorkouts(),
        this.getAllCheckIns(),
        this.getAllGoals(),
        this.getAllBadges()
      ]);

      const engagementData: EngagementData[] = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayWorkouts = workouts.filter(w => {
          const workoutDate = w.date?.toDate ? w.date.toDate() : new Date(w.date);
          return workoutDate >= date && workoutDate < nextDate && w.completed;
        }).length;

        const dayCheckIns = checkIns.filter(c => {
          const checkInDate = c.date?.toDate ? c.date.toDate() : new Date(c.date);
          return checkInDate >= date && checkInDate < nextDate;
        }).length;

        const dayGoalsCompleted = goals.filter(g => {
          const completedDate = g.completedAt?.toDate ? g.completedAt.toDate() : new Date(g.completedAt);
          return g.completed && completedDate >= date && completedDate < nextDate;
        }).length;

        const dayBadgesEarned = badges.filter(b => {
          const earnedDate = b.earnedAt?.toDate ? b.earnedAt.toDate() : new Date(b.earnedAt);
          return earnedDate >= date && earnedDate < nextDate;
        }).length;

        engagementData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          workouts: dayWorkouts,
          checkIns: dayCheckIns,
          goalsCompleted: dayGoalsCompleted,
          badgesEarned: dayBadgesEarned,
        });
      }

      return engagementData;
    } catch (error) {
      console.error('Failed to get engagement data:', error);
      return [];
    }
  }

  // Private helper methods
  private static async getUserStatistics() {
    try {
      const users = await this.getAllUsers();
      const now = new Date();
      
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const totalUsers = users.length;
      const newUsersToday = users.filter(u => {
        const createdAt = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
        return createdAt >= today;
      }).length;

      const newUsersThisWeek = users.filter(u => {
        const createdAt = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
        return createdAt >= weekAgo;
      }).length;

      const newUsersThisMonth = users.filter(u => {
        const createdAt = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
        return createdAt >= monthAgo;
      }).length;

      // Calculate active users (users with activity in last 7 days)
      const activeUsers = await this.getActiveUsersCount();

      // Calculate onboarding completion rate
      const completedOnboarding = users.filter(u => u.onboardingCompleted).length;
      const onboardingCompletionRate = totalUsers > 0 ? (completedOnboarding / totalUsers) * 100 : 0;

      // Calculate user growth trend
      const lastWeekUsers = users.filter(u => {
        const createdAt = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
        const twoWeeksAgo = new Date(weekAgo);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
        return createdAt >= twoWeeksAgo && createdAt < weekAgo;
      }).length;

      const userGrowthTrend = newUsersThisWeek > lastWeekUsers ? 'increasing' : 
                            newUsersThisWeek < lastWeekUsers ? 'decreasing' : 'stable';

      return {
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        onboardingCompletionRate,
        averageOnboardingTime: 15, // Placeholder - would calculate from actual data
        userGrowthTrend,
      };
    } catch (error) {
      console.error('Failed to get user statistics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: 0,
        onboardingCompletionRate: 0,
        averageOnboardingTime: 0,
        userGrowthTrend: 'stable' as const,
      };
    }
  }

  private static async getWorkoutStatistics() {
    try {
      const workouts = await this.getAllWorkouts();
      const completedWorkouts = workouts.filter(w => w.completed);
      
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const totalWorkouts = completedWorkouts.length;
      const workoutsToday = completedWorkouts.filter(w => {
        const workoutDate = w.date?.toDate ? w.date.toDate() : new Date(w.date);
        return workoutDate >= today;
      }).length;

      const workoutsThisWeek = completedWorkouts.filter(w => {
        const workoutDate = w.date?.toDate ? w.date.toDate() : new Date(w.date);
        return workoutDate >= weekAgo;
      }).length;

      const workoutsThisMonth = completedWorkouts.filter(w => {
        const workoutDate = w.date?.toDate ? w.date.toDate() : new Date(w.date);
        return workoutDate >= monthAgo;
      }).length;

      // Get unique users who have worked out
      const uniqueUsers = new Set(completedWorkouts.map(w => w.userId)).size;
      const averageWorkoutsPerUser = uniqueUsers > 0 ? totalWorkouts / uniqueUsers : 0;

      return {
        totalWorkouts,
        workoutsToday,
        workoutsThisWeek,
        workoutsThisMonth,
        averageWorkoutsPerUser: Math.round(averageWorkoutsPerUser * 10) / 10,
      };
    } catch (error) {
      console.error('Failed to get workout statistics:', error);
      return {
        totalWorkouts: 0,
        workoutsToday: 0,
        workoutsThisWeek: 0,
        workoutsThisMonth: 0,
        averageWorkoutsPerUser: 0,
      };
    }
  }

  private static async getGoalStatistics() {
    try {
      const goals = await this.getAllGoals();
      const totalGoals = goals.length;
      const completedGoals = goals.filter(g => g.completed).length;
      const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
      
      const uniqueUsers = new Set(goals.map(g => g.userId)).size;
      const averageGoalsPerUser = uniqueUsers > 0 ? totalGoals / uniqueUsers : 0;

      return {
        totalGoals,
        completedGoals,
        goalCompletionRate,
        averageGoalsPerUser: Math.round(averageGoalsPerUser * 10) / 10,
      };
    } catch (error) {
      console.error('Failed to get goal statistics:', error);
      return {
        totalGoals: 0,
        completedGoals: 0,
        goalCompletionRate: 0,
        averageGoalsPerUser: 0,
      };
    }
  }

  private static async getCheckInStatistics() {
    try {
      const checkIns = await this.getAllCheckIns();
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const totalCheckIns = checkIns.length;
      const checkInsToday = checkIns.filter(c => {
        const checkInDate = c.date?.toDate ? c.date.toDate() : new Date(c.date);
        return checkInDate >= today;
      }).length;

      const checkInsThisWeek = checkIns.filter(c => {
        const checkInDate = c.date?.toDate ? c.date.toDate() : new Date(c.date);
        return checkInDate >= weekAgo;
      }).length;

      const dailyActiveUsers = new Set(checkIns.filter(c => {
        const checkInDate = c.date?.toDate ? c.date.toDate() : new Date(c.date);
        return checkInDate >= today;
      }).map(c => c.userId)).size;

      return {
        totalCheckIns,
        checkInsToday,
        checkInsThisWeek,
        dailyActiveUsers,
      };
    } catch (error) {
      console.error('Failed to get check-in statistics:', error);
      return {
        totalCheckIns: 0,
        checkInsToday: 0,
        checkInsThisWeek: 0,
        dailyActiveUsers: 0,
      };
    }
  }

  private static async getBadgeStatistics() {
    try {
      const badges = await this.getAllBadges();
      const totalBadgesEarned = badges.length;

      // Count badges by type
      const badgeCounts: Record<string, number> = {};
      badges.forEach(badge => {
        badgeCounts[badge.badgeId] = (badgeCounts[badge.badgeId] || 0) + 1;
      });

      const mostPopularBadges = Object.entries(badgeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([badgeId, count]) => ({
          badgeId,
          name: this.getBadgeName(badgeId),
          count,
        }));

      return {
        totalBadgesEarned,
        mostPopularBadges,
      };
    } catch (error) {
      console.error('Failed to get badge statistics:', error);
      return {
        totalBadgesEarned: 0,
        mostPopularBadges: [],
      };
    }
  }

  private static async getSystemStatistics() {
    try {
      // These would typically come from monitoring services
      return {
        systemUptime: 99.9,
        averageResponseTime: 245,
        errorRate: 0.02,
        engagementTrend: 'increasing' as const,
      };
    } catch (error) {
      console.error('Failed to get system statistics:', error);
      return {
        systemUptime: 0,
        averageResponseTime: 0,
        errorRate: 0,
        engagementTrend: 'stable' as const,
      };
    }
  }

  // Data fetching helpers
  private static async getAllUsers(): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(db, this.USERS_COLLECTION));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Failed to get users:', error);
      return [];
    }
  }

  private static async getAllWorkouts(): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(db, this.WORKOUT_SESSIONS_COLLECTION));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Failed to get workouts:', error);
      return [];
    }
  }

  private static async getAllCheckIns(): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(db, this.CHECK_INS_COLLECTION));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Failed to get check-ins:', error);
      return [];
    }
  }

  private static async getAllGoals(): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(db, this.GOALS_COLLECTION));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Failed to get goals:', error);
      return [];
    }
  }

  private static async getAllBadges(): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(db, this.BADGES_COLLECTION));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Failed to get badges:', error);
      return [];
    }
  }

  private static async getActiveUsersCount(): Promise<number> {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Count users with recent activity (workouts or check-ins)
      const [recentWorkouts, recentCheckIns] = await Promise.all([
        this.getAllWorkouts(),
        this.getAllCheckIns()
      ]);

      const activeUserIds = new Set([
        ...recentWorkouts.filter(w => {
          const workoutDate = w.date?.toDate ? w.date.toDate() : new Date(w.date);
          return workoutDate >= weekAgo;
        }).map(w => w.userId),
        ...recentCheckIns.filter(c => {
          const checkInDate = c.date?.toDate ? c.date.toDate() : new Date(c.date);
          return checkInDate >= weekAgo;
        }).map(c => c.userId)
      ]);

      return activeUserIds.size;
    } catch (error) {
      console.error('Failed to get active users count:', error);
      return 0;
    }
  }

  private static async getActiveUsersForDate(date: Date): Promise<number> {
    try {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [workouts, checkIns] = await Promise.all([
        this.getAllWorkouts(),
        this.getAllCheckIns()
      ]);

      const activeUserIds = new Set([
        ...workouts.filter(w => {
          const workoutDate = w.date?.toDate ? w.date.toDate() : new Date(w.date);
          return workoutDate >= date && workoutDate < nextDate;
        }).map(w => w.userId),
        ...checkIns.filter(c => {
          const checkInDate = c.date?.toDate ? c.date.toDate() : new Date(c.date);
          return checkInDate >= date && checkInDate < nextDate;
        }).map(c => c.userId)
      ]);

      return activeUserIds.size;
    } catch (error) {
      console.error('Failed to get active users for date:', error);
      return 0;
    }
  }

  private static getBadgeName(badgeId: string): string {
    // Map badge IDs to names - in real app this would come from badge definitions
    const badgeNames: Record<string, string> = {
      'first_workout': 'First Workout',
      'week_streak': 'Week Streak',
      'goal_achiever': 'Goal Achiever',
      'consistency_king': 'Consistency King',
      'early_bird': 'Early Bird',
    };
    return badgeNames[badgeId] || badgeId;
  }

  private static getDefaultAnalytics(): AdminAnalytics {
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsersToday: 0,
      newUsersThisWeek: 0,
      newUsersThisMonth: 0,
      onboardingCompletionRate: 0,
      averageOnboardingTime: 0,
      totalWorkouts: 0,
      workoutsToday: 0,
      workoutsThisWeek: 0,
      workoutsThisMonth: 0,
      averageWorkoutsPerUser: 0,
      totalGoals: 0,
      completedGoals: 0,
      goalCompletionRate: 0,
      averageGoalsPerUser: 0,
      totalCheckIns: 0,
      checkInsToday: 0,
      checkInsThisWeek: 0,
      dailyActiveUsers: 0,
      totalBadgesEarned: 0,
      mostPopularBadges: [],
      systemUptime: 0,
      averageResponseTime: 0,
      errorRate: 0,
      userGrowthTrend: 'stable',
      engagementTrend: 'stable',
    };
  }
}

export default AdminAnalyticsService;
