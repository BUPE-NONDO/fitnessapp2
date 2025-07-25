import { UserDataInitializationService } from './userDataInitializationService';
import { ProgressTrackingService } from './progressTrackingService';
import { goalService } from './goalService';
import { UserProfile } from '@/hooks/useUser';

export interface FreshUserValidationResult {
  isFresh: boolean;
  issues: string[];
  recommendations: string[];
  userProfile?: UserProfile;
  validationDetails: {
    userDataInitialized: boolean;
    onboardingCompleted: boolean;
    hasGoals: boolean;
    hasWorkouts: boolean;
    hasCheckIns: boolean;
    hasBadges: boolean;
    hasStreak: boolean;
    goalCount: number;
    workoutCount: number;
    checkInCount: number;
    badgeCount: number;
    currentStreak: number;
  };
}

export class FreshUserValidationService {
  /**
   * Comprehensive validation that a user has completely fresh data
   */
  static async validateCompletelyFreshUser(
    userId: string,
    userProfile?: UserProfile
  ): Promise<FreshUserValidationResult> {
    try {
      console.log('🔍 Validating fresh user state for:', userId);

      const issues: string[] = [];
      const recommendations: string[] = [];

      // 1. Check user initialization status
      const userDataInitialized = userProfile?.dataInitialized ?? false;
      const onboardingCompleted = userProfile?.onboardingCompleted ?? false;

      if (userDataInitialized && onboardingCompleted) {
        issues.push('User has completed initialization and onboarding');
        recommendations.push('Consider resetting user to fresh state if needed');
      }

      // 2. Check user stats from initialization service
      const userStats = await UserDataInitializationService.getFreshUserStats(userId);
      
      if (userStats.totalGoals > 0) {
        issues.push(`User has ${userStats.totalGoals} goals`);
        recommendations.push('Reset goal count to zero');
      }

      if (userStats.totalWorkouts > 0) {
        issues.push(`User has ${userStats.totalWorkouts} workouts`);
        recommendations.push('Reset workout count to zero');
      }

      if (userStats.totalCheckIns > 0) {
        issues.push(`User has ${userStats.totalCheckIns} check-ins`);
        recommendations.push('Reset check-in count to zero');
      }

      if (userStats.totalBadges > 0) {
        issues.push(`User has ${userStats.totalBadges} badges`);
        recommendations.push('Reset badge count to zero');
      }

      if (userStats.currentStreak > 0) {
        issues.push(`User has a current streak of ${userStats.currentStreak} days`);
        recommendations.push('Reset streak to zero');
      }

      // 3. Check actual data collections
      const [goalValidation, progressValidation] = await Promise.all([
        goalService.validateFreshUserGoals(userId),
        ProgressTrackingService.validateFreshUserProgress(userId)
      ]);

      // Add goal-specific issues
      if (!goalValidation.isFresh) {
        issues.push(`User has ${goalValidation.goalCount} actual goals in database`);
        recommendations.push('Delete all existing goals');
      }

      // Add progress-specific issues
      if (!progressValidation.isFresh) {
        issues.push(...progressValidation.issues);
        recommendations.push('Reset all progress data');
      }

      // 4. Check user profile stats
      if (userProfile?.progressStats) {
        const stats = userProfile.progressStats;
        
        if (stats.totalWorkouts > 0) {
          issues.push(`User profile shows ${stats.totalWorkouts} workouts`);
        }
        if (stats.totalGoals > 0) {
          issues.push(`User profile shows ${stats.totalGoals} goals`);
        }
        if (stats.currentStreak > 0) {
          issues.push(`User profile shows streak of ${stats.currentStreak} days`);
        }
        if (stats.totalBadges > 0) {
          issues.push(`User profile shows ${stats.totalBadges} badges`);
        }
      }

      // 5. Check legacy stats
      if (userProfile?.stats) {
        const legacyStats = userProfile.stats;
        
        if (legacyStats.totalGoals > 0) {
          issues.push(`Legacy stats show ${legacyStats.totalGoals} goals`);
        }
        if (legacyStats.streakDays > 0) {
          issues.push(`Legacy stats show ${legacyStats.streakDays} streak days`);
        }
        if (legacyStats.totalLogs > 0) {
          issues.push(`Legacy stats show ${legacyStats.totalLogs} logs`);
        }
      }

      const validationDetails = {
        userDataInitialized,
        onboardingCompleted,
        hasGoals: goalValidation.goalCount > 0,
        hasWorkouts: userStats.totalWorkouts > 0,
        hasCheckIns: userStats.totalCheckIns > 0,
        hasBadges: userStats.totalBadges > 0,
        hasStreak: userStats.currentStreak > 0,
        goalCount: goalValidation.goalCount,
        workoutCount: userStats.totalWorkouts,
        checkInCount: userStats.totalCheckIns,
        badgeCount: userStats.totalBadges,
        currentStreak: userStats.currentStreak,
      };

      const isFresh = issues.length === 0;

      if (isFresh) {
        console.log('✅ User validation passed - user is completely fresh');
      } else {
        console.log('❌ User validation failed - user has existing data:', issues);
      }

      return {
        isFresh,
        issues,
        recommendations,
        userProfile,
        validationDetails,
      };

    } catch (error) {
      console.error('Failed to validate fresh user:', error);
      return {
        isFresh: false,
        issues: ['Failed to validate user state'],
        recommendations: ['Check system logs and retry validation'],
        validationDetails: {
          userDataInitialized: false,
          onboardingCompleted: false,
          hasGoals: false,
          hasWorkouts: false,
          hasCheckIns: false,
          hasBadges: false,
          hasStreak: false,
          goalCount: 0,
          workoutCount: 0,
          checkInCount: 0,
          badgeCount: 0,
          currentStreak: 0,
        },
      };
    }
  }

  /**
   * Reset user to completely fresh state
   */
  static async resetUserToCompletelyFreshState(
    userId: string,
    userProfile?: UserProfile
  ): Promise<void> {
    try {
      console.log('🔄 Resetting user to completely fresh state:', userId);

      // 1. Reset user data using initialization service
      await UserDataInitializationService.resetUserToFreshState(userId);

      // 2. Reset progress tracking
      await ProgressTrackingService.resetUserProgressToFresh(userId);

      // 3. Ensure data isolation
      await UserDataInitializationService.ensureUserDataIsolation(userId);

      console.log('✅ User reset to completely fresh state successfully');

    } catch (error) {
      console.error('❌ Failed to reset user to fresh state:', error);
      throw new Error('Failed to reset user to fresh state');
    }
  }

  /**
   * Quick check if user appears to be fresh
   */
  static async isUserFresh(userId: string, userProfile?: UserProfile): Promise<boolean> {
    try {
      // Quick checks for fresh user indicators
      if (userProfile?.isNewUser === true && userProfile?.dataInitialized === true) {
        return true;
      }

      if (userProfile?.onboardingCompleted === false && !userProfile?.progressStats) {
        return true;
      }

      // Check if all stats are zero
      if (userProfile?.progressStats) {
        const stats = userProfile.progressStats;
        return (
          stats.totalWorkouts === 0 &&
          stats.totalGoals === 0 &&
          stats.totalCheckIns === 0 &&
          stats.totalBadges === 0 &&
          stats.currentStreak === 0 &&
          stats.longestStreak === 0
        );
      }

      // Fallback to initialization service check
      return await UserDataInitializationService.isUserFresh(userId);

    } catch (error) {
      console.error('Failed to check if user is fresh:', error);
      return false; // Default to not fresh on error
    }
  }

  /**
   * Generate a fresh user report
   */
  static async generateFreshUserReport(userId: string, userProfile?: UserProfile): Promise<string> {
    try {
      const validation = await this.validateCompletelyFreshUser(userId, userProfile);
      
      let report = `🔍 Fresh User Validation Report for User: ${userId}\n\n`;
      
      report += `Status: ${validation.isFresh ? '✅ FRESH' : '❌ NOT FRESH'}\n\n`;
      
      report += `Validation Details:\n`;
      report += `- Data Initialized: ${validation.validationDetails.userDataInitialized}\n`;
      report += `- Onboarding Completed: ${validation.validationDetails.onboardingCompleted}\n`;
      report += `- Goals: ${validation.validationDetails.goalCount}\n`;
      report += `- Workouts: ${validation.validationDetails.workoutCount}\n`;
      report += `- Check-ins: ${validation.validationDetails.checkInCount}\n`;
      report += `- Badges: ${validation.validationDetails.badgeCount}\n`;
      report += `- Current Streak: ${validation.validationDetails.currentStreak}\n\n`;
      
      if (validation.issues.length > 0) {
        report += `Issues Found:\n`;
        validation.issues.forEach((issue, index) => {
          report += `${index + 1}. ${issue}\n`;
        });
        report += `\n`;
      }
      
      if (validation.recommendations.length > 0) {
        report += `Recommendations:\n`;
        validation.recommendations.forEach((rec, index) => {
          report += `${index + 1}. ${rec}\n`;
        });
      }
      
      return report;

    } catch (error) {
      console.error('Failed to generate fresh user report:', error);
      return `❌ Failed to generate fresh user report: ${error}`;
    }
  }
}

export default FreshUserValidationService;
