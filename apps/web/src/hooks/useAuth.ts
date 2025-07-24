import { useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔐 Attempting to sign in with email:', email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign in successful');
    } catch (err: any) {
      console.error('❌ Sign in error:', err);
      console.error('❌ Error code:', err.code);
      console.error('❌ Error message:', err.message);
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔐 Attempting to create user with email:', email);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ User created successfully:', user.uid);

      // Update the user's display name
      await updateProfile(user, { displayName: name });
      console.log('✅ User profile updated with name:', name);
    } catch (err: any) {
      console.error('❌ Sign up error:', err);
      console.error('❌ Error code:', err.code);
      console.error('❌ Error message:', err.message);
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔐 Attempting to sign in with Google');

      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google sign in successful:', result.user.uid);
    } catch (err: any) {
      console.error('❌ Google sign in error:', err);
      setError(getGoogleAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const linkGoogleAccount = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!user) {
        throw new Error('No user is currently signed in');
      }

      console.log('🔗 Attempting to link Google account');

      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      const result = await linkWithPopup(user, provider);
      console.log('✅ Google account linked successfully:', result.user.uid);
    } catch (err: any) {
      console.error('❌ Google account linking error:', err);
      setError(getGoogleAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    linkGoogleAccount,
    logout,
    clearError,
  };
}

function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}

function getGoogleAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials.';
    case 'auth/auth-domain-config-required':
      return 'Google authentication is not properly configured.';
    case 'auth/cancelled-popup-request':
      return 'Authentication was cancelled.';
    case 'auth/operation-not-allowed':
      return 'Google authentication is not enabled for this app.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'Google authentication is not supported in this environment.';
    case 'auth/popup-blocked':
      return 'Authentication popup was blocked by the browser.';
    case 'auth/popup-closed-by-user':
      return 'Authentication was cancelled by the user.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Google authentication.';
    case 'auth/credential-already-in-use':
      return 'This Google account is already linked to another user.';
    default:
      return 'Google authentication failed. Please try again.';
  }
}
