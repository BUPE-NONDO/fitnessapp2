import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    units?: 'metric' | 'imperial';
  };
  stats?: {
    totalGoals: number;
    activeGoals: number;
    totalLogs: number;
    streakDays: number;
    joinedDate: Date;
  };
}

interface UseUserReturn {
  // User state
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  // User actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // Computed properties
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  displayName: string;
  initials: string;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setError(null);
        setUser(firebaseUser);

        if (firebaseUser) {
          // User is signed in, fetch their profile
          await fetchUserProfile(firebaseUser);
        } else {
          // User is signed out
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (firebaseUser: User) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // User profile exists, use it
        const data = userDoc.data();
        setUserProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || data.displayName || '',
          photoURL: firebaseUser.photoURL || data.photoURL,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          preferences: data.preferences || {},
          stats: data.stats || {
            totalGoals: 0,
            activeGoals: 0,
            totalLogs: 0,
            streakDays: 0,
            joinedDate: data.createdAt?.toDate() || new Date(),
          },
        });
      } else {
        // Create new user profile
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL,
          createdAt: new Date(),
          updatedAt: new Date(),
          preferences: {
            theme: 'system',
            notifications: true,
            units: 'metric',
          },
          stats: {
            totalGoals: 0,
            activeGoals: 0,
            totalLogs: 0,
            streakDays: 0,
            joinedDate: new Date(),
          },
        };

        // Save to Firestore
        await setDoc(userDocRef, {
          ...newProfile,
          createdAt: Timestamp.fromDate(newProfile.createdAt),
          updatedAt: Timestamp.fromDate(newProfile.updatedAt),
          'stats.joinedDate': Timestamp.fromDate(newProfile.stats!.joinedDate),
        });

        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      throw new Error('Failed to load user profile');
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) {
      throw new Error('No user signed in');
    }

    try {
      setError(null);
      const userDocRef = doc(db, 'users', user.uid);
      
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(userDocRef, updateData);

      // Update local state
      setUserProfile(prev => prev ? {
        ...prev,
        ...updates,
        updatedAt: new Date(),
      } : null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      throw err;
    }
  };

  // Refresh user profile from Firestore
  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      setError(null);
      await fetchUserProfile(user);
    } catch (err) {
      console.error('Error refreshing profile:', err);
      setError('Failed to refresh profile');
      throw err;
    }
  };

  // Sign out user
  const signOut = async () => {
    try {
      setError(null);
      await auth.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
      throw err;
    }
  };

  // Computed properties
  const isAuthenticated = !!user;
  const isEmailVerified = user?.emailVerified ?? false;
  const displayName = userProfile?.displayName || user?.displayName || 'User';
  const initials = displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return {
    // State
    user,
    userProfile,
    loading,
    error,
    
    // Actions
    updateProfile,
    refreshProfile,
    signOut,
    
    // Computed
    isAuthenticated,
    isEmailVerified,
    displayName,
    initials,
  };
}
