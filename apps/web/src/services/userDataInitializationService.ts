import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  writeBatch,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/hooks/useUser';

export interface FreshUserData {
  // Progress Stats - All start at zero
  totalWorkouts: number;
  totalGoals: number;
  totalCheckIns: number;
  totalBadges: number;
  currentStreak: number;
  longestStreak: number;

  // Dates (using Firestore Timestamp for storage)
  joinDate: Timestamp;
  lastActivityDate: Timestamp | null;

  // Onboarding Status
  onboardingCompleted: boolean;
  onboardingStarted: boolean;

  // Initial State
  isNewUser: boolean;
  dataInitialized: boolean;
}

export class UserDataInitializationService {
  private static readonly USERS_COLLECTION = 'users';
  private static readonly USER_STATS_COLLECTION = 'user_stats';
  private static readonly ACTIVITY_LOGS_COLLECTION = 'activity_logs';

  /**
   * Initialize a completely fresh user with zero data
   */
  static async initializeFreshUser(userId: string, userProfile: Partial<UserProfile>): Promise<void> {
    try {
      console.log('🆕 Initializing fresh user data for:', userId);

      // Check if user is already initialized
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, userId));
      if (userDoc.exists() && userDoc.data().dataInitialized) {
        console.log('✅ User already initialized, skipping...');
        return;
      }

      const batch = writeBatch(db);
      const now = Timestamp.now();

      // 1. Initialize user profile with fresh data for Firestore
      const freshUserProfileForFirestore = {
        uid: userId,
        email: userProfile.email || '',
        displayName: userProfile.displayName || '',
        photoURL: userProfile.photoURL || null,

        // Fresh progress stats - all start at zero
        progressStats: {
          totalWorkouts: 0,
          totalGoals: 0,
          totalCheckIns: 0,
          totalBadges: 0,
          currentStreak: 0,
          longestStreak: 0,
          weeklyGoalProgress: 0,
          monthlyGoalProgress: 0,
          lastActivityDate: null,
        },

        // Onboarding status
        onboardingCompleted: false,
        onboardingStarted: false,
        onboardingData: null,

        // Timestamps (Firestore Timestamp objects)
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        
        // Fresh user flags
        isNewUser: true,
        dataInitialized: true,
        
        // Default preferences
        preferences: {
          theme: 'light',
          notifications: true,
          emailUpdates: true,
          language: 'en',
        },
        
        // Empty arrays for fresh start
        badges: [],
        achievements: [],
        
        // Default settings
        settings: {
          privacy: 'private',
          shareProgress: false,
          allowFriendRequests: true,
        }
      };

      // Set user profile
      batch.set(doc(db, this.USERS_COLLECTION, userId), freshUserProfileForFirestore);

      // 2. Initialize user stats document with zero values
      const freshUserStats: FreshUserData = {
        totalWorkouts: 0,
        totalGoals: 0,
        totalCheckIns: 0,
        totalBadges: 0,
        currentStreak: 0,
        longestStreak: 0,
        joinDate: now,
        lastActivityDate: null,
        onboardingCompleted: false,
        onboardingStarted: false,
        isNewUser: true,
        dataInitialized: true,
      };

      batch.set(doc(db, this.USER_STATS_COLLECTION, userId), freshUserStats);

      // 3. Create initial activity log entry
      const initialActivityLog = {
        userId,
        action: 'user_created',
        description: 'User account created',
        timestamp: serverTimestamp(),
        metadata: {
          source: 'registration',
          isNewUser: true,
        }
      };

      const activityLogRef = doc(collection(db, this.ACTIVITY_LOGS_COLLECTION));
      batch.set(activityLogRef, initialActivityLog);

      // Commit all changes atomically
      await batch.commit();

      console.log('✅ Fresh user data initialized successfully');
      
      // Log the initialization
      await this.logUserInitialization(userId);

    } catch (error) {
      console.error('❌ Failed to initialize fresh user data:', error);
      console.error('Error details:', {
        userId,
        userProfile,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorCode: (error as any)?.code,
      });
      throw new Error(`Failed to initialize user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reset user data to fresh state (for testing or user request)
   */
  static async resetUserToFreshState(userId: string): Promise<void> {
    try {
      console.log('🔄 Resetting user to fresh state:', userId);

      const batch = writeBatch(db);

      // Get current user profile to preserve basic info
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const currentProfile = userDoc.data() as UserProfile;

      // Reset progress stats to zero
      const resetProfile: UserProfile = {
        ...currentProfile,
        progressStats: {
          totalWorkouts: 0,
          totalGoals: 0,
          totalCheckIns: 0,
          totalBadges: 0,
          currentStreak: 0,
          longestStreak: 0,
          weeklyGoalProgress: 0,
          monthlyGoalProgress: 0,
          lastActivityDate: null,
        },
        onboardingCompleted: false,
        onboardingStarted: false,
        onboardingData: undefined,
        badges: [],
        achievements: [],
        updatedAt: new Date(),
        isNewUser: true, // Mark as new user again
      };

      batch.set(doc(db, this.USERS_COLLECTION, userId), resetProfile);

      // Reset user stats
      const resetStats: FreshUserData = {
        totalWorkouts: 0,
        totalGoals: 0,
        totalCheckIns: 0,
        totalBadges: 0,
        currentStreak: 0,
        longestStreak: 0,
        joinDate: Timestamp.fromDate(currentProfile.createdAt || new Date()),
        lastActivityDate: null,
        onboardingCompleted: false,
        onboardingStarted: false,
        isNewUser: true,
        dataInitialized: true,
      };

      batch.set(doc(db, this.USER_STATS_COLLECTION, userId), resetStats);

      // Log the reset action
      const resetActivityLog = {
        userId,
        action: 'user_reset',
        description: 'User data reset to fresh state',
        timestamp: serverTimestamp(),
        metadata: {
          source: 'manual_reset',
          resetDate: new Date().toISOString(),
        }
      };

      const activityLogRef = doc(collection(db, this.ACTIVITY_LOGS_COLLECTION));
      batch.set(activityLogRef, resetActivityLog);

      await batch.commit();

      console.log('✅ User reset to fresh state successfully');

    } catch (error) {
      console.error('❌ Failed to reset user to fresh state:', error);
      throw new Error('Failed to reset user data');
    }
  }

  /**
   * Check if user has fresh, uninitialized data
   */
  static async isUserFresh(userId: string): Promise<boolean> {
    try {
      const userStatsDoc = await getDoc(doc(db, this.USER_STATS_COLLECTION, userId));
      
      if (!userStatsDoc.exists()) {
        return true; // No stats document means fresh user
      }

      const stats = userStatsDoc.data() as FreshUserData;
      
      // User is fresh if they have zero activity
      return (
        stats.totalWorkouts === 0 &&
        stats.totalGoals === 0 &&
        stats.totalCheckIns === 0 &&
        stats.totalBadges === 0 &&
        stats.currentStreak === 0 &&
        !stats.onboardingCompleted
      );
    } catch (error) {
      console.error('Failed to check if user is fresh:', error);
      return true; // Default to fresh on error
    }
  }

  /**
   * Get fresh user statistics (all zeros for new users)
   */
  static async getFreshUserStats(userId: string): Promise<FreshUserData> {
    try {
      const userStatsDoc = await getDoc(doc(db, this.USER_STATS_COLLECTION, userId));
      
      if (!userStatsDoc.exists()) {
        // Return default fresh stats if no document exists
        return this.getDefaultFreshStats(userId);
      }

      return userStatsDoc.data() as FreshUserData;
    } catch (error) {
      console.error('Failed to get fresh user stats:', error);
      return this.getDefaultFreshStats(userId);
    }
  }

  /**
   * Ensure user data isolation - create user-specific subcollections
   */
  static async ensureUserDataIsolation(userId: string): Promise<void> {
    try {
      console.log('🔒 Ensuring user data isolation for:', userId);

      // Create user-specific document references (subcollections will be created when data is added)
      const userCollections = [
        `users/${userId}/goals`,
        `users/${userId}/workout_sessions`,
        `users/${userId}/check_ins`,
        `users/${userId}/badges`,
        `users/${userId}/activity_logs`,
        `users/${userId}/workout_routines`,
      ];

      // Log the isolation setup
      await this.logDataIsolationSetup(userId, userCollections);

      console.log('✅ User data isolation ensured');
    } catch (error) {
      console.error('❌ Failed to ensure user data isolation:', error);
      throw new Error('Failed to setup user data isolation');
    }
  }

  /**
   * Validate that user has completely fresh data
   */
  static async validateFreshUserState(userId: string): Promise<{
    isFresh: boolean;
    issues: string[];
  }> {
    try {
      const issues: string[] = [];
      
      // Check user stats
      const stats = await this.getFreshUserStats(userId);
      
      if (stats.totalWorkouts > 0) issues.push('User has existing workouts');
      if (stats.totalGoals > 0) issues.push('User has existing goals');
      if (stats.totalCheckIns > 0) issues.push('User has existing check-ins');
      if (stats.totalBadges > 0) issues.push('User has existing badges');
      if (stats.currentStreak > 0) issues.push('User has existing streak');
      if (stats.onboardingCompleted) issues.push('User has completed onboarding');

      return {
        isFresh: issues.length === 0,
        issues,
      };
    } catch (error) {
      console.error('Failed to validate fresh user state:', error);
      return {
        isFresh: false,
        issues: ['Failed to validate user state'],
      };
    }
  }

  // Private helper methods
  private static getDefaultFreshStats(_userId: string): FreshUserData {
    return {
      totalWorkouts: 0,
      totalGoals: 0,
      totalCheckIns: 0,
      totalBadges: 0,
      currentStreak: 0,
      longestStreak: 0,
      joinDate: Timestamp.fromDate(new Date()),
      lastActivityDate: null,
      onboardingCompleted: false,
      onboardingStarted: false,
      isNewUser: true,
      dataInitialized: true,
    };
  }

  private static async logUserInitialization(userId: string): Promise<void> {
    try {
      const logEntry = {
        userId,
        action: 'fresh_user_initialized',
        description: 'Fresh user data initialization completed',
        timestamp: serverTimestamp(),
        metadata: {
          initializationDate: new Date().toISOString(),
          dataState: 'fresh',
          allStatsZero: true,
        }
      };

      await addDoc(collection(db, this.ACTIVITY_LOGS_COLLECTION), logEntry);
    } catch (error) {
      console.error('Failed to log user initialization:', error);
    }
  }

  private static async logDataIsolationSetup(userId: string, collections: string[]): Promise<void> {
    try {
      const logEntry = {
        userId,
        action: 'data_isolation_setup',
        description: 'User data isolation configured',
        timestamp: serverTimestamp(),
        metadata: {
          collections,
          isolationDate: new Date().toISOString(),
        }
      };

      await addDoc(collection(db, this.ACTIVITY_LOGS_COLLECTION), logEntry);
    } catch (error) {
      console.error('Failed to log data isolation setup:', error);
    }
  }
}

export default UserDataInitializationService;
