import { collection, doc, getDoc, getDocs, setDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Achievement {
  id: string;
  type: 'goal_completed' | 'streak_milestone' | 'first_goal' | 'first_log' | 'consistency' | 'overachiever';
  title: string;
  description: string;
  icon: string;
  goalId?: string;
  value?: number;
  streakDays?: number;
  earnedAt: Date;
  celebrated?: boolean;
}

export interface GoalCompletion {
  goalId: string;
  goal: any;
  completionValue: number;
  completionPercentage: number;
  isNewCompletion: boolean;
}

class AchievementService {
  private lastCheckedAchievements: Set<string> = new Set();

  async checkForNewAchievements(userId: string): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];

    try {
      // Get user's goals and logs
      const [goals, logs] = await Promise.all([
        this.getUserGoals(userId),
        this.getUserLogs(userId)
      ]);

      // Check for goal completions
      const goalCompletions = await this.checkGoalCompletions(goals, logs);
      for (const completion of goalCompletions) {
        if (completion.isNewCompletion) {
          newAchievements.push({
            id: `goal_${completion.goalId}_${Date.now()}`,
            type: 'goal_completed',
            title: 'Goal Achieved!',
            description: `You completed "${completion.goal.title}"`,
            icon: '🎉',
            goalId: completion.goalId,
            value: completion.completionValue,
            earnedAt: new Date(),
            celebrated: false
          });
        }
      }

      // Check for streak milestones
      const streakDays = this.calculateCurrentStreak(logs);
      if (this.isStreakMilestone(streakDays)) {
        const streakKey = `streak_${streakDays}`;
        if (!this.lastCheckedAchievements.has(streakKey)) {
          newAchievements.push({
            id: `streak_${streakDays}_${Date.now()}`,
            type: 'streak_milestone',
            title: `${streakDays} Day Streak!`,
            description: this.getStreakDescription(streakDays),
            icon: this.getStreakIcon(streakDays),
            streakDays,
            earnedAt: new Date(),
            celebrated: false
          });
          this.lastCheckedAchievements.add(streakKey);
        }
      }

      // Check for first-time achievements
      if (goals.length === 1 && !this.lastCheckedAchievements.has('first_goal')) {
        newAchievements.push({
          id: `first_goal_${Date.now()}`,
          type: 'first_goal',
          title: 'First Goal Created!',
          description: 'Welcome to your fitness journey!',
          icon: '🎯',
          earnedAt: new Date(),
          celebrated: false
        });
        this.lastCheckedAchievements.add('first_goal');
      }

      if (logs.length === 1 && !this.lastCheckedAchievements.has('first_log')) {
        newAchievements.push({
          id: `first_log_${Date.now()}`,
          type: 'first_log',
          title: 'First Activity Logged!',
          description: 'Great start! Keep it up!',
          icon: '📝',
          earnedAt: new Date(),
          celebrated: false
        });
        this.lastCheckedAchievements.add('first_log');
      }

      // Check for consistency achievements
      const consistencyRate = this.calculateConsistencyRate(logs);
      if (consistencyRate >= 80 && logs.length >= 14) {
        const consistencyKey = 'consistency_80';
        if (!this.lastCheckedAchievements.has(consistencyKey)) {
          newAchievements.push({
            id: `consistency_${Date.now()}`,
            type: 'consistency',
            title: 'Consistency Master!',
            description: 'You\'ve maintained 80%+ consistency!',
            icon: '👑',
            value: consistencyRate,
            earnedAt: new Date(),
            celebrated: false
          });
          this.lastCheckedAchievements.add(consistencyKey);
        }
      }

      // Check for overachiever status
      const overachievements = this.findOverachievements(goals, logs);
      for (const overachievement of overachievements) {
        const overachieverKey = `overachiever_${overachievement.goalId}`;
        if (!this.lastCheckedAchievements.has(overachieverKey)) {
          newAchievements.push({
            id: `overachiever_${overachievement.goalId}_${Date.now()}`,
            type: 'overachiever',
            title: 'Overachiever!',
            description: `You exceeded "${overachievement.goal.title}" by ${Math.round(overachievement.percentage - 100)}%!`,
            icon: '⭐',
            goalId: overachievement.goalId,
            value: overachievement.percentage,
            earnedAt: new Date(),
            celebrated: false
          });
          this.lastCheckedAchievements.add(overachieverKey);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking for achievements:', error);
      return [];
    }
  }

  private async checkGoalCompletions(goals: any[], logs: any[]): Promise<GoalCompletion[]> {
    const completions: GoalCompletion[] = [];

    for (const goal of goals) {
      const goalLogs = logs.filter(log => log.goalId === goal.id);
      if (goalLogs.length === 0) continue;

      // Calculate completion based on goal frequency
      let isCompleted = false;
      let completionValue = 0;
      let completionPercentage = 0;

      if (goal.frequency === 'daily') {
        // Check if any single day meets the target
        const bestDay = Math.max(...goalLogs.map(log => log.value));
        completionValue = bestDay;
        completionPercentage = (bestDay / goal.target) * 100;
        isCompleted = bestDay >= goal.target;
      } else if (goal.frequency === 'weekly') {
        // Check if current week meets the target
        const weekLogs = this.getThisWeekLogs(goalLogs);
        completionValue = weekLogs.reduce((sum, log) => sum + log.value, 0);
        completionPercentage = (completionValue / goal.target) * 100;
        isCompleted = completionValue >= goal.target;
      } else if (goal.frequency === 'monthly') {
        // Check if current month meets the target
        const monthLogs = this.getThisMonthLogs(goalLogs);
        completionValue = monthLogs.reduce((sum, log) => sum + log.value, 0);
        completionPercentage = (completionValue / goal.target) * 100;
        isCompleted = completionValue >= goal.target;
      }

      if (isCompleted) {
        // Check if this is a new completion (not previously celebrated)
        const isNewCompletion = !this.lastCheckedAchievements.has(`goal_completed_${goal.id}`);
        
        completions.push({
          goalId: goal.id,
          goal,
          completionValue,
          completionPercentage,
          isNewCompletion
        });

        if (isNewCompletion) {
          this.lastCheckedAchievements.add(`goal_completed_${goal.id}`);
        }
      }
    }

    return completions;
  }

  private calculateCurrentStreak(logs: any[]): number {
    if (logs.length === 0) return 0;

    const sortedLogs = logs.sort((a, b) => b.date.getTime() - a.date.getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    // Get unique days with logs
    const logDays = new Set(
      sortedLogs.map(log => {
        const date = new Date(log.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    // Count consecutive days from today backwards
    while (logDays.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  private isStreakMilestone(days: number): boolean {
    const milestones = [3, 7, 14, 21, 30, 60, 90, 100];
    return milestones.includes(days);
  }

  private getStreakDescription(days: number): string {
    if (days >= 100) return "Legendary dedication! You're unstoppable!";
    if (days >= 60) return "Incredible consistency! You're a fitness champion!";
    if (days >= 30) return "Amazing commitment! You've built a strong habit!";
    if (days >= 14) return "You're on fire! Keep the momentum going!";
    if (days >= 7) return "One week strong! You're building great habits!";
    return "Great start! Consistency is key!";
  }

  private getStreakIcon(days: number): string {
    if (days >= 100) return "👑";
    if (days >= 60) return "🏆";
    if (days >= 30) return "🔥";
    if (days >= 14) return "⚡";
    if (days >= 7) return "🌟";
    return "✨";
  }

  private calculateConsistencyRate(logs: any[]): number {
    if (logs.length === 0) return 0;

    const uniqueDays = new Set(
      logs.map(log => {
        const date = new Date(log.date);
        return date.toDateString();
      })
    ).size;

    const daysSinceFirst = Math.ceil(
      (new Date().getTime() - logs[logs.length - 1].date.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.min(100, (uniqueDays / Math.max(1, daysSinceFirst)) * 100);
  }

  private findOverachievements(goals: any[], logs: any[]): Array<{goalId: string, goal: any, percentage: number}> {
    const overachievements = [];

    for (const goal of goals) {
      const goalLogs = logs.filter(log => log.goalId === goal.id);
      const bestValue = Math.max(...goalLogs.map(log => log.value), 0);
      const percentage = (bestValue / goal.target) * 100;

      if (percentage >= 150) { // 50% over target
        overachievements.push({
          goalId: goal.id,
          goal,
          percentage
        });
      }
    }

    return overachievements;
  }

  private getThisWeekLogs(logs: any[]): any[] {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    return logs.filter(log => log.date >= startOfWeek);
  }

  private getThisMonthLogs(logs: any[]): any[] {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return logs.filter(log => log.date >= startOfMonth);
  }

  private async getUserGoals(userId: string): Promise<any[]> {
    try {
      const q = query(collection(db, 'goals'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user goals:', error);
      return [];
    }
  }

  private async getUserLogs(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'logs'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Error getting user logs:', error);
      return [];
    }
  }

  markAchievementCelebrated(achievementId: string): void {
    this.lastCheckedAchievements.add(achievementId);
  }

  resetAchievementTracking(): void {
    this.lastCheckedAchievements.clear();
  }
}

export const achievementService = new AchievementService();
