import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleSignInButton } from './GoogleSignInButton';

interface LoginFormProps {
  onToggleMode: () => void;
  isSignUp: boolean;
}

export function LoginForm({ onToggleMode, isSignUp }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { signIn, signUp, signInWithGoogle, loading, error, clearError } = useAuth();

  // Debug logging
  console.log('LoginForm render:', { email, password, name, loading, isSignUp });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Get values directly from form elements as fallback
    const formData = new FormData(e.target as HTMLFormElement);
    const formEmail = formData.get('email') as string || email;
    const formPassword = formData.get('password') as string || password;
    const formName = formData.get('name') as string || name;

    console.log('Form submit:', { formEmail, formPassword, formName, email, password, name });

    if (isSignUp) {
      // Set flag to indicate this was a signup
      sessionStorage.setItem('was-signup', 'true');
      await signUp(formEmail, formPassword, formName);
    } else {
      await signIn(formEmail, formPassword);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 max-w-md mx-auto relative z-10">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isSignUp
            ? 'Start your fitness journey today'
            : 'Sign in to continue your fitness journey'
          }
        </p>
      </div>

      {/* Debug info */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
        Debug: Email="{email}" Password="{password}" Name="{name}" Loading={loading.toString()}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => {
                console.log('Name input changed:', e.target.value);
                setName(e.target.value);
              }}
              onFocus={() => console.log('Name input focused')}
              onBlur={() => console.log('Name input blurred')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-purple-400 relative z-20"
              placeholder="Enter your full name"
              required
              disabled={loading}
              autoComplete="name"
              style={{ pointerEvents: 'auto', userSelect: 'text' }}
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              console.log('Email input changed:', e.target.value);
              setEmail(e.target.value);
            }}
            onFocus={() => console.log('Email input focused')}
            onBlur={() => console.log('Email input blurred')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-purple-400 relative z-20"
            placeholder="Enter your email"
            required
            disabled={loading}
            autoComplete="email"
            style={{ pointerEvents: 'auto', userSelect: 'text' }}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => {
              console.log('Password input changed:', e.target.value.length, 'characters');
              setPassword(e.target.value);
            }}
            onFocus={() => console.log('Password input focused')}
            onBlur={() => console.log('Password input blurred')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-purple-400 relative z-20"
            placeholder="Enter your password"
            required
            disabled={loading}
            autoComplete="current-password"
            minLength={6}
            style={{ pointerEvents: 'auto', userSelect: 'text' }}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </span>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>
      </form>

      {/* Social Authentication Divider */}
      <div className="mt-6 mb-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
      </div>

      {/* Google Sign-In Button */}
      <div className="mb-6">
        <GoogleSignInButton
          mode={isSignUp ? 'signup' : 'signin'}
          onSuccess={() => {
            // Success is handled by the auth state change
            console.log('Google authentication successful');
          }}
          onError={(error) => {
            clearError();
            // The error will be set by the useAuth hook
            console.error('Google authentication error:', error);
          }}
          disabled={loading}
        />
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={onToggleMode}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
