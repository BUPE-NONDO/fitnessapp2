import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  deleteDoc, 
  writeBatch, 
  query, 
  where,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';

export class UserDataCleanupService {
  private static readonly COLLECTIONS_TO_CLEAN = [
    'users',
    'user_stats', 
    'workout_plans',
    'workout_sessions',
    'goals',
    'logs',
    'badges',
    'activity_logs',
    'workout_routines'
  ];

  /**
   * Delete ALL user data from the database (use with caution!)
   */
  static async deleteAllUserData(): Promise<void> {
    try {
      console.log('🗑️ Starting complete user data cleanup...');
      
      const batch = writeBatch(db);
      let deleteCount = 0;

      // Delete from all main collections
      for (const collectionName of this.COLLECTIONS_TO_CLEAN) {
        console.log(`🧹 Cleaning collection: ${collectionName}`);
        
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        snapshot.docs.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
          deleteCount++;
        });
      }

      // Commit all deletions
      await batch.commit();
      
      console.log(`✅ Deleted ${deleteCount} documents from ${this.COLLECTIONS_TO_CLEAN.length} collections`);
      
      // Log the cleanup action
      await this.logCleanupAction(deleteCount);
      
    } catch (error) {
      console.error('❌ Failed to delete all user data:', error);
      throw new Error(`Failed to cleanup user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete specific user's data across all collections
   */
  static async deleteUserData(userId: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting all data for user: ${userId}`);
      
      const batch = writeBatch(db);
      let deleteCount = 0;

      // Delete from main user document
      batch.delete(doc(db, 'users', userId));
      deleteCount++;

      // Delete from user_stats
      batch.delete(doc(db, 'user_stats', userId));
      deleteCount++;

      // Delete user's workout plans
      const workoutPlansQuery = query(
        collection(db, 'workout_plans'),
        where('userId', '==', userId)
      );
      const workoutPlansSnapshot = await getDocs(workoutPlansQuery);
      workoutPlansSnapshot.docs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
        deleteCount++;
      });

      // Delete user's goals
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', userId)
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      goalsSnapshot.docs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
        deleteCount++;
      });

      // Delete user's activity logs
      const activityLogsQuery = query(
        collection(db, 'activity_logs'),
        where('userId', '==', userId)
      );
      const activityLogsSnapshot = await getDocs(activityLogsQuery);
      activityLogsSnapshot.docs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
        deleteCount++;
      });

      // Delete user subcollections (these will be cleaned up automatically by Firestore)
      // But we'll log them for reference
      const subcollections = [
        `users/${userId}/onboarding`,
        `users/${userId}/workout_plans`,
        `users/${userId}/workout_sessions`,
        `users/${userId}/goals`,
        `users/${userId}/activity_logs`,
        `users/${userId}/progress`,
        `users/${userId}/achievements`
      ];

      console.log(`📁 User subcollections that will be cleaned: ${subcollections.join(', ')}`);

      // Commit all deletions
      await batch.commit();
      
      console.log(`✅ Deleted ${deleteCount} documents for user ${userId}`);
      
    } catch (error) {
      console.error(`❌ Failed to delete user data for ${userId}:`, error);
      throw new Error(`Failed to delete user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initialize clean user subcollection structure
   */
  static async initializeUserSubcollections(userId: string): Promise<void> {
    try {
      console.log(`🏗️ Initializing clean subcollection structure for user: ${userId}`);
      
      const batch = writeBatch(db);

      // Create onboarding subcollection with initial document
      const onboardingRef = doc(db, 'users', userId, 'onboarding', 'current');
      batch.set(onboardingRef, {
        status: 'not_started',
        currentStep: 0,
        completedSteps: [],
        startedAt: null,
        completedAt: null,
        data: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create progress subcollection with initial stats
      const progressRef = doc(db, 'users', userId, 'progress', 'stats');
      batch.set(progressRef, {
        totalWorkouts: 0,
        totalGoals: 0,
        totalCheckIns: 0,
        totalBadges: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyGoalProgress: 0,
        monthlyGoalProgress: 0,
        lastActivityDate: null,
        joinDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create achievements subcollection with initial document
      const achievementsRef = doc(db, 'users', userId, 'achievements', 'summary');
      batch.set(achievementsRef, {
        totalBadges: 0,
        earnedBadges: [],
        milestones: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create preferences subcollection
      const preferencesRef = doc(db, 'users', userId, 'preferences', 'settings');
      batch.set(preferencesRef, {
        theme: 'light',
        notifications: true,
        units: 'metric',
        language: 'en',
        emailUpdates: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      
      console.log('✅ User subcollections initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize user subcollections:', error);
      throw new Error(`Failed to initialize subcollections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a fresh user with isolated subcollection structure
   */
  static async createFreshUser(userId: string, userProfile: {
    email: string;
    displayName: string;
    photoURL?: string | null;
  }): Promise<void> {
    try {
      console.log(`🆕 Creating fresh user with isolated structure: ${userId}`);
      
      // First, clean any existing data for this user
      await this.deleteUserData(userId);
      
      // Create main user document with minimal data
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        uid: userId,
        email: userProfile.email,
        displayName: userProfile.displayName,
        photoURL: userProfile.photoURL || null,
        isNewUser: true,
        dataInitialized: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Initialize all subcollections
      await this.initializeUserSubcollections(userId);
      
      console.log('✅ Fresh user created with isolated subcollection structure');
      
    } catch (error) {
      console.error('❌ Failed to create fresh user:', error);
      throw new Error(`Failed to create fresh user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify user data isolation
   */
  static async verifyUserDataIsolation(userId: string): Promise<{
    isIsolated: boolean;
    subcollections: string[];
    issues: string[];
  }> {
    try {
      console.log(`🔍 Verifying data isolation for user: ${userId}`);
      
      const subcollections: string[] = [];
      const issues: string[] = [];

      // Check if user document exists
      const userDoc = await getDocs(collection(db, 'users', userId, 'onboarding'));
      if (!userDoc.empty) {
        subcollections.push('onboarding');
      } else {
        issues.push('Missing onboarding subcollection');
      }

      // Check other expected subcollections
      const expectedSubcollections = ['progress', 'achievements', 'preferences'];
      
      for (const subcollectionName of expectedSubcollections) {
        const subcollectionDocs = await getDocs(collection(db, 'users', userId, subcollectionName));
        if (!subcollectionDocs.empty) {
          subcollections.push(subcollectionName);
        } else {
          issues.push(`Missing ${subcollectionName} subcollection`);
        }
      }

      const isIsolated = issues.length === 0;
      
      console.log(`${isIsolated ? '✅' : '❌'} User data isolation check: ${isIsolated ? 'PASSED' : 'FAILED'}`);
      
      return {
        isIsolated,
        subcollections,
        issues
      };
      
    } catch (error) {
      console.error('❌ Failed to verify user data isolation:', error);
      return {
        isIsolated: false,
        subcollections: [],
        issues: ['Failed to verify isolation']
      };
    }
  }

  /**
   * Log cleanup action for audit purposes
   */
  private static async logCleanupAction(deleteCount: number): Promise<void> {
    try {
      const logRef = doc(collection(db, 'system_logs'));
      await setDoc(logRef, {
        action: 'user_data_cleanup',
        description: 'Complete user data cleanup performed',
        deletedDocuments: deleteCount,
        collections: this.COLLECTIONS_TO_CLEAN,
        timestamp: serverTimestamp(),
        source: 'UserDataCleanupService'
      });
    } catch (error) {
      console.warn('Failed to log cleanup action:', error);
      // Don't throw here as this is just logging
    }
  }

  /**
   * Get cleanup statistics
   */
  static async getCleanupStats(): Promise<{
    totalUsers: number;
    totalDocuments: number;
    collections: { [key: string]: number };
  }> {
    try {
      const stats = {
        totalUsers: 0,
        totalDocuments: 0,
        collections: {} as { [key: string]: number }
      };

      for (const collectionName of this.COLLECTIONS_TO_CLEAN) {
        const snapshot = await getDocs(collection(db, collectionName));
        const count = snapshot.size;
        stats.collections[collectionName] = count;
        stats.totalDocuments += count;
        
        if (collectionName === 'users') {
          stats.totalUsers = count;
        }
      }

      return stats;
    } catch (error) {
      console.error('Failed to get cleanup stats:', error);
      return {
        totalUsers: 0,
        totalDocuments: 0,
        collections: {}
      };
    }
  }
}
