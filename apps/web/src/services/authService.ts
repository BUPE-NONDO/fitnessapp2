import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  AuthError,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Enhanced error handling for Firebase Auth
export function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please check your email and password.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked. Please allow popups and try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    default:
      console.error('Unhandled auth error:', errorCode);
      return 'An unexpected error occurred. Please try again.';
  }
}

// Google Auth specific error handling
export function getGoogleAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Please allow popups for Google sign-in.';
    case 'auth/account-exists-with-different-credential':
      return 'An account with this email already exists. Please sign in with your original method first.';
    case 'auth/credential-already-in-use':
      return 'This Google account is already linked to another user.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Please contact support.';
    default:
      return getAuthErrorMessage(errorCode);
  }
}

// Authentication Service Class
export class AuthService {
  // Email/Password Authentication
  static async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      console.log('🔐 Attempting email sign-in for:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Email sign-in successful');
      return result;
    } catch (error: any) {
      console.error('❌ Email sign-in error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  }

  static async signUpWithEmail(email: string, password: string, displayName?: string): Promise<UserCredential> {
    try {
      console.log('🔐 Attempting email sign-up for:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
        console.log('✅ Display name updated:', displayName);
      }
      
      console.log('✅ Email sign-up successful');
      return result;
    } catch (error: any) {
      console.error('❌ Email sign-up error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  }

  // Google Authentication
  static async signInWithGoogle(): Promise<UserCredential> {
    try {
      console.log('🔐 Attempting Google sign-in');
      
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google sign-in successful');
      return result;
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      throw new Error(getGoogleAuthErrorMessage(error.code));
    }
  }

  static async linkGoogleAccount(user: User): Promise<UserCredential> {
    try {
      console.log('🔗 Attempting to link Google account');
      
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      const result = await linkWithPopup(user, provider);
      console.log('✅ Google account linked successfully');
      return result;
    } catch (error: any) {
      console.error('❌ Google account linking error:', error);
      throw new Error(getGoogleAuthErrorMessage(error.code));
    }
  }

  // User Management
  static async signOut(): Promise<void> {
    try {
      console.log('🔐 Signing out user');
      await signOut(auth);
      console.log('✅ Sign-out successful');
    } catch (error: any) {
      console.error('❌ Sign-out error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  static async sendEmailVerification(user: User): Promise<void> {
    try {
      console.log('📧 Sending email verification');
      await sendEmailVerification(user);
      console.log('✅ Email verification sent');
    } catch (error: any) {
      console.error('❌ Email verification error:', error);
      throw new Error('Failed to send verification email. Please try again.');
    }
  }

  static async sendPasswordReset(email: string): Promise<void> {
    try {
      console.log('🔐 Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent');
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  }

  // Utility Methods
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  static isUserSignedIn(): boolean {
    return !!auth.currentUser;
  }

  static async waitForAuthReady(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }
}

// Export default instance
export default AuthService;
