import { 
  deleteUser, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/hooks/useUser';

export interface AccountDeletionResult {
  success: boolean;
  message: string;
  requiresReauth?: boolean;
}

export class AccountManagementService {
  /**
   * Delete user account and all associated data
   */
  static async deleteAccount(password?: string): Promise<AccountDeletionResult> {
    const user = auth.currentUser;
    
    if (!user) {
      return {
        success: false,
        message: 'No user is currently signed in',
      };
    }

    try {
      console.log('🗑️ Starting account deletion process for:', user.uid);

      // Step 1: Reauthenticate user for security
      const reauthResult = await this.reauthenticateUser(password);
      if (!reauthResult.success) {
        return reauthResult;
      }

      // Step 2: Delete all user data from Firestore
      await this.deleteUserData(user.uid);

      // Step 3: Log the deletion for audit purposes
      await this.logAccountDeletion(user.uid, user.email || 'unknown');

      // Step 4: Delete the Firebase Auth user
      await deleteUser(user);

      console.log('✅ Account deletion completed successfully');

      return {
        success: true,
        message: 'Your account and all associated data have been permanently deleted.',
      };

    } catch (error: any) {
      console.error('❌ Account deletion failed:', error);

      // Handle specific Firebase Auth errors
      if (error.code === 'auth/requires-recent-login') {
        return {
          success: false,
          message: 'For security reasons, please sign in again before deleting your account.',
          requiresReauth: true,
        };
      }

      return {
        success: false,
        message: `Failed to delete account: ${error.message || 'Unknown error'}`,
      };
    }
  }

  /**
   * Reauthenticate user before account deletion
   */
  private static async reauthenticateUser(password?: string): Promise<AccountDeletionResult> {
    const user = auth.currentUser;
    
    if (!user) {
      return {
        success: false,
        message: 'No user is currently signed in',
      };
    }

    try {
      // Check if user signed in with Google
      const isGoogleUser = user.providerData.some(
        provider => provider.providerId === 'google.com'
      );

      if (isGoogleUser) {
        // Reauthenticate with Google
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } else {
        // Reauthenticate with email/password
        if (!password) {
          return {
            success: false,
            message: 'Password is required for reauthentication',
            requiresReauth: true,
          };
        }

        if (!user.email) {
          return {
            success: false,
            message: 'User email not found',
          };
        }

        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }

      return {
        success: true,
        message: 'Reauthentication successful',
      };

    } catch (error: any) {
      console.error('❌ Reauthentication failed:', error);

      if (error.code === 'auth/wrong-password') {
        return {
          success: false,
          message: 'Incorrect password. Please try again.',
          requiresReauth: true,
        };
      }

      if (error.code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          message: 'Authentication cancelled. Please try again.',
          requiresReauth: true,
        };
      }

      return {
        success: false,
        message: `Authentication failed: ${error.message || 'Unknown error'}`,
        requiresReauth: true,
      };
    }
  }

  /**
   * Delete all user data from Firestore
   */
  private static async deleteUserData(userId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting user data from Firestore:', userId);

      const batch = writeBatch(db);

      // Collections to delete
      const collectionsToDelete = [
        'users',
        'user_stats',
        'goals',
        'workout_sessions',
        'check_ins',
        'user_badges',
        'activity_logs',
        'workout_routines',
      ];

      // Delete main user document
      batch.delete(doc(db, 'users', userId));
      batch.delete(doc(db, 'user_stats', userId));

      // Delete user-specific data from other collections
      for (const collectionName of ['goals', 'workout_sessions', 'check_ins', 'activity_logs', 'workout_routines']) {
        const q = query(
          collection(db, collectionName),
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
        });
      }

      // Delete user badges
      const badgesQuery = query(
        collection(db, 'user_badges'),
        where('userId', '==', userId)
      );
      const badgesSnapshot = await getDocs(badgesQuery);
      badgesSnapshot.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
      });

      // Commit all deletions
      await batch.commit();

      console.log('✅ User data deleted from Firestore');

    } catch (error) {
      console.error('❌ Failed to delete user data:', error);
      throw new Error('Failed to delete user data from database');
    }
  }

  /**
   * Log account deletion for audit purposes
   */
  private static async logAccountDeletion(userId: string, email: string): Promise<void> {
    try {
      const deletionLog = {
        userId,
        email,
        action: 'account_deleted',
        timestamp: serverTimestamp(),
        metadata: {
          deletionDate: new Date().toISOString(),
          userAgent: navigator.userAgent,
          source: 'user_initiated',
        }
      };

      // Log to a separate audit collection
      await addDoc(collection(db, 'audit_logs'), deletionLog);

      console.log('✅ Account deletion logged for audit');

    } catch (error) {
      console.error('⚠️ Failed to log account deletion:', error);
      // Don't throw error here as it shouldn't block the deletion process
    }
  }

  /**
   * Get account deletion confirmation message
   */
  static getAccountDeletionWarning(): string {
    return `⚠️ WARNING: This action cannot be undone!

Deleting your account will permanently remove:
• Your profile and personal information
• All workout plans and routines
• Progress tracking and statistics
• Goals and achievements
• Check-in history and logs
• All badges and milestones

Are you absolutely sure you want to delete your account?

Type "DELETE" to confirm:`;
  }

  /**
   * Validate account deletion confirmation
   */
  static validateDeletionConfirmation(input: string): boolean {
    return input.trim().toUpperCase() === 'DELETE';
  }

  /**
   * Export user data before deletion (optional)
   */
  static async exportUserData(userId: string): Promise<any> {
    try {
      console.log('📤 Exporting user data for:', userId);

      const userData: any = {};

      // Get user profile
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)));
      if (!userDoc.empty) {
        userData.profile = userDoc.docs[0].data();
      }

      // Get user stats
      const statsDoc = await getDocs(query(collection(db, 'user_stats'), where('userId', '==', userId)));
      if (!statsDoc.empty) {
        userData.stats = statsDoc.docs[0].data();
      }

      // Get goals
      const goalsQuery = query(collection(db, 'goals'), where('userId', '==', userId));
      const goalsSnapshot = await getDocs(goalsQuery);
      userData.goals = goalsSnapshot.docs.map(doc => doc.data());

      // Get workout sessions
      const workoutsQuery = query(collection(db, 'workout_sessions'), where('userId', '==', userId));
      const workoutsSnapshot = await getDocs(workoutsQuery);
      userData.workouts = workoutsSnapshot.docs.map(doc => doc.data());

      // Get check-ins
      const checkInsQuery = query(collection(db, 'check_ins'), where('userId', '==', userId));
      const checkInsSnapshot = await getDocs(checkInsQuery);
      userData.checkIns = checkInsSnapshot.docs.map(doc => doc.data());

      // Get activity logs
      const logsQuery = query(collection(db, 'activity_logs'), where('userId', '==', userId));
      const logsSnapshot = await getDocs(logsQuery);
      userData.activityLogs = logsSnapshot.docs.map(doc => doc.data());

      userData.exportDate = new Date().toISOString();
      userData.exportedBy = userId;

      console.log('✅ User data exported successfully');
      return userData;

    } catch (error) {
      console.error('❌ Failed to export user data:', error);
      throw new Error('Failed to export user data');
    }
  }
}

export default AccountManagementService;
