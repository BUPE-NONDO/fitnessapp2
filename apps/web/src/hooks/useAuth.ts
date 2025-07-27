import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthService } from '@/services/authService';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  justLoggedIn: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearJustLoggedIn: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

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
      await AuthService.signInWithEmail(email, password);
      setJustLoggedIn(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, acceptedTerms: boolean = false) => {
    try {
      setError(null);
      setLoading(true);
      await AuthService.signUpWithEmail(email, password, name, acceptedTerms);
      setJustLoggedIn(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      await AuthService.signInWithGoogle();
      setJustLoggedIn(true);
    } catch (err: any) {
      setError(err.message);
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

      await AuthService.linkGoogleAccount(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await AuthService.signOut();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearJustLoggedIn = () => {
    setJustLoggedIn(false);
  };

  return {
    user,
    loading,
    error,
    justLoggedIn,
    signIn,
    signUp,
    signInWithGoogle,
    linkGoogleAccount,
    logout,
    clearError,
    clearJustLoggedIn,
  };
}


