import React, { ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  requireEmailVerification?: boolean;
}

interface AuthLoadingProps {
  message?: string;
}

// Loading component for authentication checks
function AuthLoading({ message = 'Checking authentication...' }: AuthLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Error component for authentication errors
interface AuthErrorProps {
  error: string;
  onRetry?: () => void;
}

function AuthError({ error, onRetry }: AuthErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn btn-primary"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// Email verification prompt
interface EmailVerificationProps {
  email: string;
  onResendVerification?: () => void;
}

function EmailVerificationPrompt({ email, onResendVerification }: EmailVerificationProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600 mb-4">
          Please check your email ({email}) and click the verification link to continue.
        </p>
        {onResendVerification && (
          <button
            onClick={onResendVerification}
            className="btn btn-secondary"
          >
            Resend Verification Email
          </button>
        )}
      </div>
    </div>
  );
}

// Main RequireAuth component
export function RequireAuth({ 
  children, 
  fallback,
  requireEmailVerification = false 
}: RequireAuthProps) {
  const { 
    user, 
    userProfile, 
    loading, 
    error, 
    isAuthenticated, 
    isEmailVerified,
    refreshProfile 
  } = useUser();

  // Show loading state while checking authentication
  if (loading) {
    return <AuthLoading />;
  }

  // Show error state if there's an authentication error
  if (error) {
    return <AuthError error={error} onRetry={refreshProfile} />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Default fallback - redirect to login
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access this page.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Check email verification if required
  if (requireEmailVerification && !isEmailVerified) {
    return (
      <EmailVerificationPrompt 
        email={user.email || ''} 
        onResendVerification={() => {
          // TODO: Implement resend verification email
          console.log('Resend verification email');
        }}
      />
    );
  }

  // User is authenticated and verified (if required)
  return <>{children}</>;
}

// Higher-Order Component version
export function withRequireAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    requireEmailVerification?: boolean;
  }
) {
  const WrappedComponent = (props: P) => {
    return (
      <RequireAuth 
        fallback={options?.fallback}
        requireEmailVerification={options?.requireEmailVerification}
      >
        <Component {...props} />
      </RequireAuth>
    );
  };

  WrappedComponent.displayName = `withRequireAuth(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook version for conditional rendering
export function useRequireAuth(requireEmailVerification = false) {
  const { isAuthenticated, isEmailVerified, loading, error } = useUser();
  
  const isAuthorized = isAuthenticated && (!requireEmailVerification || isEmailVerified);
  
  return {
    isAuthorized,
    isAuthenticated,
    isEmailVerified,
    loading,
    error,
    canAccess: !loading && !error && isAuthorized,
  };
}
