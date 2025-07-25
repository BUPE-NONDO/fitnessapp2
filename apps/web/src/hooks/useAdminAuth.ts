import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AdminAuthService } from '@/services/adminAuthService';
import { AdminUser, AdminRole, AdminPermission } from '@fitness-app/shared';

interface AdminAuthState {
  adminUser: AdminUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AdminAuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (category: keyof AdminPermission, action: string) => boolean;
  hasRole: (role: AdminRole) => boolean;
  hasMinimumRole: (role: AdminRole) => boolean;
  clearError: () => void;
}

export function useAdminAuth(): AdminAuthState & AdminAuthActions {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      try {
        setLoading(true);
        setError(null);

        if (firebaseUser) {
          // Try to initialize admin user from Firebase auth state
          const admin = await AdminAuthService.initializeFromAuthState(firebaseUser);
          setAdminUser(admin);
        } else {
          setAdminUser(null);
        }
      } catch (err: any) {
        console.error('Auth state change error:', err);
        setError(err.message || 'Authentication error');
        setAdminUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const admin = await AdminAuthService.signIn(email, password);
      setAdminUser(admin);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await AdminAuthService.signOut();
      setAdminUser(null);
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
    }
  };

  const hasPermission = (category: keyof AdminPermission, action: string): boolean => {
    return AdminAuthService.hasPermission(category, action);
  };

  const hasRole = (role: AdminRole): boolean => {
    return AdminAuthService.hasRole(role);
  };

  const hasMinimumRole = (role: AdminRole): boolean => {
    return AdminAuthService.hasMinimumRole(role);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    adminUser,
    loading,
    error,
    isAuthenticated: !!adminUser,
    signIn,
    signOut,
    hasPermission,
    hasRole,
    hasMinimumRole,
    clearError,
  };
}

// Hook for checking specific permissions
export function useAdminPermission(
  category: keyof AdminPermission,
  action: string
): boolean {
  const { hasPermission } = useAdminAuth();
  return hasPermission(category, action);
}

// Hook for checking minimum role
export function useAdminRole(minimumRole: AdminRole): boolean {
  const { hasMinimumRole } = useAdminAuth();
  return hasMinimumRole(minimumRole);
}

// Higher-order component for protecting admin routes
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: AdminRole
) {
  return function AdminProtectedComponent(props: P) {
    const { adminUser, loading, hasMinimumRole } = useAdminAuth();

    if (loading) {
      return React.createElement('div', {
        className: 'min-h-screen bg-gray-50 flex items-center justify-center'
      }, React.createElement('div', {
        className: 'text-center'
      }, [
        React.createElement('div', {
          key: 'spinner',
          className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'
        }),
        React.createElement('p', {
          key: 'text',
          className: 'text-gray-600'
        }, 'Loading...')
      ]));
    }

    if (!adminUser) {
      return React.createElement('div', {
        className: 'min-h-screen bg-gray-50 flex items-center justify-center'
      }, React.createElement('div', {
        className: 'text-center'
      }, [
        React.createElement('h1', {
          key: 'title',
          className: 'text-2xl font-bold text-gray-900 mb-4'
        }, 'Access Denied'),
        React.createElement('p', {
          key: 'text',
          className: 'text-gray-600'
        }, 'Admin authentication required')
      ]));
    }

    if (requiredRole && !hasMinimumRole(requiredRole)) {
      return React.createElement('div', {
        className: 'min-h-screen bg-gray-50 flex items-center justify-center'
      }, React.createElement('div', {
        className: 'text-center'
      }, [
        React.createElement('h1', {
          key: 'title',
          className: 'text-2xl font-bold text-gray-900 mb-4'
        }, 'Insufficient Permissions'),
        React.createElement('p', {
          key: 'text',
          className: 'text-gray-600'
        }, `${requiredRole} role or higher required`)
      ]));
    }

    return React.createElement(Component, props);
  };
}

export default useAdminAuth;
