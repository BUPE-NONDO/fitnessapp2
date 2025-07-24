import { useState } from 'react';
import { AuthService } from '@/services/authService';

interface GoogleSignInButtonProps {
  mode?: 'signin' | 'signup' | 'link';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export function GoogleSignInButton({ 
  mode = 'signin', 
  onSuccess, 
  onError, 
  disabled = false,
  className = ''
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);

      if (mode === 'link') {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
          throw new Error('No user is currently signed in');
        }
        await AuthService.linkGoogleAccount(currentUser);
      } else {
        await AuthService.signInWithGoogle();
      }

      onSuccess?.();

    } catch (error: any) {
      console.error('❌ Google authentication error:', error);

      let errorMessage = error.message || 'Failed to authenticate with Google';
      
      switch (error.code) {
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
          break;
        case 'auth/auth-domain-config-required':
          errorMessage = 'Google authentication is not properly configured.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Authentication was cancelled.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Google authentication is not enabled for this app.';
          break;
        case 'auth/operation-not-supported-in-this-environment':
          errorMessage = 'Google authentication is not supported in this environment.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Authentication popup was blocked by the browser.';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Authentication was cancelled by the user.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = 'This domain is not authorized for Google authentication.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred';
      }
      
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) {
      return mode === 'link' ? 'Linking...' : 'Signing in...';
    }
    
    switch (mode) {
      case 'signup':
        return 'Sign up with Google';
      case 'link':
        return 'Link Google Account';
      default:
        return 'Sign in with Google';
    }
  };

  const getButtonIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        w-full px-4 py-2.5
        border border-gray-300 rounded-lg
        bg-white hover:bg-gray-50
        text-gray-700 font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <span className="mr-3 text-blue-500">
          {getButtonIcon()}
        </span>
      )}
      {getButtonText()}
    </button>
  );
}
