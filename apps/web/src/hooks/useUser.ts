import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserDataCleanupService } from '@/services/userDataCleanupService';
import { IsolatedOnboardingService } from '@/services/isolatedOnboardingService';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;

  // Onboarding status
  onboardingCompleted?: boolean;
  onboardingStarted?: boolean;
  onboardingData?: {
    ageRange?: '18-29' | '30-39' | '40-49' | '50+';
    gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
    bodyType?: 'ectomorph' | 'mesomorph' | 'endomorph';
    primaryGoal?: 'lose-weight' | 'gain-muscle' | 'tone-body' | 'increase-endurance' | 'improve-flexibility' | 'general-fitness';
    currentWeight?: number;
    targetWeight?: number;
    height?: number;
    weightUnit?: 'kg' | 'lbs';
    heightUnit?: 'cm' | 'ft-in';
    fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
    workoutEnvironment?: 'home' | 'gym' | 'outdoor' | 'mixed';
    availableTime?: '15-30' | '30-45' | '45-60' | '60+';
    equipmentAccess?: 'none' | 'basic' | 'full-gym';
    workoutDaysPerWeek?: number;
    workoutPlan?: {
      title: string;
      description: string;
      workoutsPerWeek: number;
      duration: string;
      exercises: Array<{
        name: string;
        sets: string;
        reps: string;
        muscle: string;
      }>;
    };
    completedAt?: Date;
  };

  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    units?: 'metric' | 'imperial';
    language?: string;
    emailUpdates?: boolean;
  };

  // New progress stats structure
  progressStats?: {
    totalWorkouts: number;
    totalGoals: number;
    totalCheckIns: number;
    totalBadges: number;
    currentStreak: number;
    longestStreak: number;
    weeklyGoalProgress: number;
    monthlyGoalProgress: number;
    lastActivityDate: Date | null;
  };

  // User badges and achievements
  badges?: string[];
  achievements?: string[];

  // Workout plan (top-level for easy access)
  workoutPlan?: {
    id: string;
    title: string;
    description: string;
    goal: string;
    fitnessLevel: string;
    workoutsPerWeek: number;
    duration: number;
    estimatedCaloriesPerWeek: number;
    createdAt: Date;
  };

  // User settings
  settings?: {
    privacy: 'public' | 'private';
    shareProgress: boolean;
    allowFriendRequests: boolean;
  };

  // Additional timestamps
  lastLoginAt?: Date;

  // User flags
  isNewUser?: boolean;
  dataInitialized?: boolean;

  // Legacy stats for backward compatibility
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
          onboardingCompleted: data.onboardingCompleted || false,
          onboardingData: data.onboardingData || undefined,
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
        // Initialize fresh user with completely clean data
        console.log('🆕 Creating fresh user profile for:', firebaseUser.uid);

        const userProfileData = {
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL,
        };

        // Create simple user profile without cleanup service
        try {
          console.log('🆕 Creating simple user profile...');

          const basicUserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            onboardingCompleted: false,
            isNewUser: true,
            dataInitialized: true,
          };

          await setDoc(userDocRef, basicUserData);

          // Initialize isolated onboarding
          await IsolatedOnboardingService.initializeOnboarding(firebaseUser.uid);

          console.log('✅ Simple user profile created successfully');
        } catch (createError) {
          console.error('❌ Failed to create user profile:', createError);
          throw new Error('Failed to create user profile');
        }

        // Fetch the newly created profile
        const freshUserDoc = await getDoc(userDocRef);
        if (freshUserDoc.exists()) {
          const data = freshUserDoc.data();
          const freshProfile: UserProfile = {
            uid: data.uid,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            onboardingCompleted: false, // Force fresh start for all users
            onboardingStarted: false,   // Force fresh start
            onboardingData: undefined,  // Clear any existing onboarding data
            generatedPlan: undefined,   // Clear any existing plan
            workoutPlan: undefined,     // Clear any existing workout plan
            isNewUser: true,            // Mark as new user
            preferences: data.preferences || {
              theme: 'light',
              notifications: true,
              units: 'metric',
            },
            progressStats: data.progressStats || {
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
            badges: data.badges || [],
            achievements: data.achievements || [],
            settings: data.settings || {
              privacy: 'private',
              shareProgress: false,
              allowFriendRequests: true,
            },
            // Legacy stats for backward compatibility
            stats: {
              totalGoals: 0,
              activeGoals: 0,
              totalLogs: 0,
              streakDays: 0,
              joinedDate: data.createdAt?.toDate() || new Date(),
            },
          };

          setUserProfile(freshProfile);
          console.log('✅ Fresh user profile created and loaded');
        } else {
          throw new Error('Failed to create fresh user profile');
        }
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
