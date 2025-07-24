import React, { createContext, useContext, ReactNode } from 'react';
import { useUser, UserProfile } from '@/hooks/useUser';
import { User } from 'firebase/auth';

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const userState = useUser();

  return (
    <AuthContext.Provider value={userState}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}

// Re-export useUser for convenience
export { useUser } from '@/hooks/useUser';
export type { UserProfile } from '@/hooks/useUser';
