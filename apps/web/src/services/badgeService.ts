import { collection, doc, getDoc, getDocs, setDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'achievement' | 'consistency' | 'performance' | 'social';
  requirements: {
    type: string;
    count?: number;
    percentage?: number;
    days?: number;
    value?: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeDefinitionId: string;
  earnedAt: Date;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
  metadata?: {
    goalId?: string;
    value?: number;
    streakDays?: number;
  };
}

export interface BadgeProgress {
  badgeDefinition: BadgeDefinition;
  earned: boolean;
  earnedAt?: Date;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  nextMilestone?: number;
}

class BadgeService {
  private badgeDefinitions: BadgeDefinition[] = [];
  private userBadges: UserBadge[] = [];

  async loadBadgeDefinitions(): Promise<BadgeDefinition[]> {
    try {
      const snapshot = await getDocs(collection(db, 'badgeDefinitions'));
      this.badgeDefinitions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as BadgeDefinition[];
      
      return this.badgeDefinitions;
    } catch (error) {
      console.error('Error loading badge definitions:', error);
      return [];
    }
  }

  async loadUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const q = query(
        collection(db, 'badges'),
        where('userId', '==', userId),
        orderBy('earnedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      this.userBadges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        earnedAt: doc.data().earnedAt?.toDate() || new Date(),
      })) as UserBadge[];
      
      return this.userBadges;
    } catch (error) {
      console.error('Error loading user badges:', error);
      return [];
    }
  }

  async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
    const newBadges: UserBadge[] = [];
    
    try {
      // Load definitions if not already loaded
      if (this.badgeDefinitions.length === 0) {
        await this.loadBadgeDefinitions();
      }

      // Load user's existing badges
      await this.loadUserBadges(userId);
      const earnedBadgeIds = this.userBadges.map(b => b.badgeDefinitionId);

      // Get user's goals and logs for evaluation
      const [goals, logs] = await Promise.all([
        this.getUserGoals(userId),
        this.getUserLogs(userId)
      ]);

      // Check each badge definition
      for (const badgeDef of this.badgeDefinitions) {
        // Skip if already earned
        if (earnedBadgeIds.includes(badgeDef.id)) continue;

        const earned = await this.evaluateBadgeRequirement(badgeDef, userId, goals, logs);
        
        if (earned) {
          const newBadge = await this.awardBadge(userId, badgeDef, goals, logs);
          if (newBadge) {
            newBadges.push(newBadge);
          }
        }
      }

      return newBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }

  async getBadgeProgress(userId: string): Promise<BadgeProgress[]> {
    try {
      // Load data if not already loaded
      if (this.badgeDefinitions.length === 0) {
        await this.loadBadgeDefinitions();
      }
      await this.loadUserBadges(userId);

      const [goals, logs] = await Promise.all([
        this.getUserGoals(userId),
        this.getUserLogs(userId)
      ]);

      const progress: BadgeProgress[] = [];

      for (const badgeDef of this.badgeDefinitions) {
        const userBadge = this.userBadges.find(b => b.badgeDefinitionId === badgeDef.id);
        const earned = !!userBadge;
        
        let current = 0;
        let target = 1;

        if (!earned) {
          const progressData = await this.calculateProgress(badgeDef, userId, goals, logs);
          current = progressData.current;
          target = progressData.target;
        } else {
          current = target = 1; // Already earned
        }

        progress.push({
          badgeDefinition: badgeDef,
          earned,
          earnedAt: userBadge?.earnedAt,
          progress: {
            current,
            target,
            percentage: Math.min(100, (current / target) * 100)
          },
          nextMilestone: earned ? undefined : target
        });
      }

      return progress.sort((a, b) => {
        // Sort by: earned badges first, then by progress percentage
        if (a.earned && !b.earned) return -1;
        if (!a.earned && b.earned) return 1;
        return b.progress.percentage - a.progress.percentage;
      });
    } catch (error) {
      console.error('Error getting badge progress:', error);
      return [];
    }
  }

  private async evaluateBadgeRequirement(
    badgeDef: BadgeDefinition,
    userId: string,
    goals: any[],
    logs: any[]
  ): Promise<boolean> {
    const { type, count, percentage, days, value } = badgeDef.requirements;

    switch (type) {
      case 'goal_created':
        return goals.length >= (count || 1);

      case 'activity_logged':
        return logs.length >= (count || 1);

      case 'goal_achieved':
        return this.countAchievedGoals(goals, logs) >= (count || 1);

      case 'streak':
        return this.calculateCurrentStreak(logs) >= (days || 7);

      case 'days_logged':
        return this.countUniqueDaysLogged(logs) >= (days || 30);

      case 'goal_exceeded':
        return this.hasExceededGoal(goals, logs, percentage || 150);

      case 'consistency':
        return this.calculateConsistencyRate(logs) >= (percentage || 80);

      case 'total_value':
        return this.calculateTotalValue(logs) >= (value || 1000);

      default:
        return false;
    }
  }

  private async calculateProgress(
    badgeDef: BadgeDefinition,
    userId: string,
    goals: any[],
    logs: any[]
  ): Promise<{ current: number; target: number }> {
    const { type, count, percentage, days, value } = badgeDef.requirements;

    switch (type) {
      case 'goal_created':
        return { current: goals.length, target: count || 1 };

      case 'activity_logged':
        return { current: logs.length, target: count || 1 };

      case 'goal_achieved':
        return { current: this.countAchievedGoals(goals, logs), target: count || 1 };

      case 'streak':
        return { current: this.calculateCurrentStreak(logs), target: days || 7 };

      case 'days_logged':
        return { current: this.countUniqueDaysLogged(logs), target: days || 30 };

      case 'goal_exceeded':
        return { current: this.hasExceededGoal(goals, logs, percentage || 150) ? 1 : 0, target: 1 };

      case 'consistency':
        return { current: this.calculateConsistencyRate(logs), target: percentage || 80 };

      case 'total_value':
        return { current: this.calculateTotalValue(logs), target: value || 1000 };

      default:
        return { current: 0, target: 1 };
    }
  }

  private async awardBadge(
    userId: string,
    badgeDef: BadgeDefinition,
    goals: any[],
    logs: any[]
  ): Promise<UserBadge | null> {
    try {
      const badgeData: Omit<UserBadge, 'id'> = {
        userId,
        badgeDefinitionId: badgeDef.id,
        earnedAt: new Date(),
        metadata: this.generateBadgeMetadata(badgeDef, goals, logs)
      };

      const docRef = doc(collection(db, 'badges'));
      await setDoc(docRef, {
        ...badgeData,
        earnedAt: Timestamp.fromDate(badgeData.earnedAt)
      });

      return {
        id: docRef.id,
        ...badgeData
      };
    } catch (error) {
      console.error('Error awarding badge:', error);
      return null;
    }
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

  // Helper methods for badge calculations
  private countAchievedGoals(goals: any[], logs: any[]): number {
    return goals.filter(goal => {
      const goalLogs = logs.filter(log => log.goalId === goal.id);
      if (goalLogs.length === 0) return false;

      // Simple achievement check: has any log that meets or exceeds target
      return goalLogs.some(log => log.value >= goal.target);
    }).length;
  }

  private calculateCurrentStreak(logs: any[]): number {
    if (logs.length === 0) return 0;

    const sortedLogs = logs.sort((a, b) => b.date.getTime() - a.date.getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (logDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  private countUniqueDaysLogged(logs: any[]): number {
    const uniqueDays = new Set();
    logs.forEach(log => {
      const dateStr = log.date.toISOString().split('T')[0];
      uniqueDays.add(dateStr);
    });
    return uniqueDays.size;
  }

  private hasExceededGoal(goals: any[], logs: any[], percentage: number): boolean {
    return goals.some(goal => {
      const goalLogs = logs.filter(log => log.goalId === goal.id);
      return goalLogs.some(log => (log.value / goal.target) * 100 >= percentage);
    });
  }

  private calculateConsistencyRate(logs: any[]): number {
    if (logs.length === 0) return 0;

    const uniqueDays = this.countUniqueDaysLogged(logs);
    const daysSinceFirst = Math.ceil(
      (new Date().getTime() - logs[logs.length - 1].date.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.min(100, (uniqueDays / Math.max(1, daysSinceFirst)) * 100);
  }

  private calculateTotalValue(logs: any[]): number {
    return logs.reduce((total, log) => total + (log.value || 0), 0);
  }

  private generateBadgeMetadata(badgeDef: BadgeDefinition, goals: any[], logs: any[]): any {
    const metadata: any = {};

    switch (badgeDef.requirements.type) {
      case 'streak':
        metadata.streakDays = this.calculateCurrentStreak(logs);
        break;
      case 'goal_exceeded':
        const exceededGoal = goals.find(goal => {
          const goalLogs = logs.filter(log => log.goalId === goal.id);
          return goalLogs.some(log => (log.value / goal.target) * 100 >= (badgeDef.requirements.percentage || 150));
        });
        if (exceededGoal) {
          metadata.goalId = exceededGoal.id;
          const bestLog = logs
            .filter(log => log.goalId === exceededGoal.id)
            .sort((a, b) => b.value - a.value)[0];
          metadata.value = bestLog?.value;
        }
        break;
    }

    return metadata;
  }
}

export const badgeService = new BadgeService();
