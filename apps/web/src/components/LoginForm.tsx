import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleSignInButton } from './GoogleSignInButton';
import { PasswordStrengthIndicator } from './ui/PasswordStrengthIndicator';
import { TermsAndConditions } from './legal/TermsAndConditions';
import { PrivacyPolicy } from './legal/PrivacyPolicy';
import { AboutUs } from './about/AboutUs';
import { validatePassword } from '@/utils/passwordValidation';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  onToggleMode: () => void;
  isSignUp: boolean;
}

export function LoginForm({ onToggleMode, isSignUp }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const { signIn, signUp, signInWithGoogle, loading, error, clearError } = useAuth();



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
      // Validate password strength
      const passwordValidation = validatePassword(formPassword);
      if (!passwordValidation.isValid) {
        clearError();
        return; // Let the password strength indicator show the errors
      }

      // Check password confirmation
      if (formPassword !== confirmPassword) {
        clearError();
        return; // Let the UI show the mismatch
      }

      // Check terms acceptance
      if (!acceptedTerms) {
        clearError();
        return; // Let the UI show the terms requirement
      }

      // Set flag to indicate this was a signup
      sessionStorage.setItem('was-signup', 'true');
      await signUp(formEmail, formPassword, formName, acceptedTerms);
    } else {
      await signIn(formEmail, formPassword);
    }
  };

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword;
  const canSubmit = isSignUp
    ? passwordValidation.isValid && passwordsMatch && acceptedTerms && name.trim() && email.trim()
    : email.trim() && password.trim();

  return (
    <div className={cn(
      "glass-morphism-strong rounded-xl shadow-2xl border border-teal-400/20 mx-auto relative z-10 transform hover:scale-105 transition-all duration-300",
      isSignUp
        ? "p-2 sm:p-3 max-w-xs sm:max-w-sm"
        : "p-4 sm:p-6 max-w-sm sm:max-w-md"
    )}>
      <div className={cn(
        "text-center",
        isSignUp ? "mb-2 sm:mb-3" : "mb-4 sm:mb-6"
      )}>
        <h1 className={cn(
          "font-bold text-white",
          isSignUp ? "text-base sm:text-lg" : "text-lg sm:text-xl"
        )}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className={cn(
          "text-slate-300 mt-0.5",
          isSignUp ? "text-xs" : "text-sm"
        )}>
          {isSignUp
            ? 'Start your journey'
            : 'Sign in to continue your fitness journey'
          }
        </p>
      </div>



      <form onSubmit={handleSubmit} className={cn(
        isSignUp ? "space-y-1.5 sm:space-y-2" : "space-y-3 sm:space-y-4"
      )}>
        {isSignUp && (
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-slate-200 mb-0.5">
              Name
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
              className="w-full px-2 py-1 text-xs border border-teal-400/30 rounded focus:ring-1 focus:ring-teal-400 focus:border-teal-400 transition-all duration-300 bg-slate-800/60 text-white placeholder-slate-400 backdrop-blur-sm relative z-20 hover:bg-slate-700/60 focus:bg-slate-700/80"
              placeholder="Enter your full name"
              required
              disabled={loading}
              autoComplete="name"
              style={{ pointerEvents: 'auto', userSelect: 'text' }}
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className={cn(
            "block font-medium text-slate-200",
            isSignUp ? "text-xs mb-0.5" : "text-sm mb-1"
          )}>
            Email
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

            className={cn(
              "w-full border border-teal-400/30 rounded focus:ring-1 focus:ring-teal-400 focus:border-teal-400 transition-all duration-300 bg-slate-800/60 text-white placeholder-slate-400 backdrop-blur-sm relative z-20 hover:bg-slate-700/60 focus:bg-slate-700/80",
              isSignUp ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
            )}
            placeholder="Enter your email"
            required
            disabled={loading}
            autoComplete="email"
            style={{ pointerEvents: 'auto', userSelect: 'text' }}
          />
        </div>

        <div>
          <label htmlFor="password" className={cn(
            "block font-medium text-slate-200",
            isSignUp ? "text-xs mb-0.5" : "text-sm mb-1"
          )}>
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                console.log('Password input changed:', e.target.value.length, 'characters');
                setPassword(e.target.value);
              }}
              className={cn(
                "w-full border border-teal-400/30 rounded focus:ring-1 focus:ring-teal-400 focus:border-teal-400 transition-all duration-300 bg-slate-800/60 text-white placeholder-slate-400 backdrop-blur-sm relative z-20 hover:bg-slate-700/60 focus:bg-slate-700/80",
                isSignUp ? "px-2 py-1 pr-7 text-xs" : "px-3 py-2 pr-10 text-sm"
              )}
              placeholder="Enter your password"
              required
              disabled={loading}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength={8}
              style={{ pointerEvents: 'auto', userSelect: 'text' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "absolute inset-y-0 right-0 flex items-center text-slate-400 hover:text-white transition-colors duration-200 z-30 cursor-pointer",
                isSignUp ? "pr-2" : "pr-3"
              )}
              tabIndex={0}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className={cn(isSignUp ? "w-4 h-4" : "w-5 h-5")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className={cn(isSignUp ? "w-4 h-4" : "w-5 h-5")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Ultra Compact Password Strength Indicator for Sign Up */}
          {isSignUp && password && (
            <div className="mt-1">
              <PasswordStrengthIndicator
                password={password}
                compact={true}
                showRequirements={false}
              />
            </div>
          )}
        </div>

        {/* Confirm Password for Sign Up */}
        {isSignUp && (
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-200 mb-0.5">
              Confirm
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-2 py-1 pr-7 text-xs border border-teal-400/30 rounded focus:ring-1 focus:ring-teal-400 focus:border-teal-400 transition-all duration-300 bg-slate-800/60 text-white placeholder-slate-400 backdrop-blur-sm relative z-20 hover:bg-slate-700/60 focus:bg-slate-700/80"
                placeholder="Confirm your password"
                required
                disabled={loading}
                autoComplete="new-password"
                style={{ pointerEvents: 'auto', userSelect: 'text' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-white transition-colors duration-200 z-30 cursor-pointer"
                tabIndex={0}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Compact Password Match Indicator */}
            {confirmPassword && (
              <div className="mt-1 flex items-center space-x-1">
                {passwordsMatch ? (
                  <span className="text-green-400 text-xs">✅ Match</span>
                ) : (
                  <span className="text-red-400 text-xs">❌ No match</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Minimal Terms for Sign Up */}
        {isSignUp && (
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1">
              <input
                id="acceptTerms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-2.5 h-2.5 text-teal-500 bg-slate-800/60 border-teal-400/30 rounded focus:ring-teal-400 focus:ring-1"
                required
              />
              <label htmlFor="acceptTerms" className="text-xs text-slate-300 leading-tight">
                Accept{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-teal-300 hover:text-teal-200 underline"
                >
                  Terms
                </button>
                {' '}& {' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacy(true)}
                  className="text-teal-300 hover:text-teal-200 underline"
                >
                  Privacy
                </button>
              </label>
            </div>

            {!acceptedTerms && isSignUp && (
              <div className="text-red-400 text-xs">
                Required
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className={cn(
            "w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded transition-all duration-300 shadow-lg disabled:opacity-50 hover:shadow-xl hover:scale-105 transform",
            isSignUp ? "py-1.5 px-3 text-xs" : "py-2.5 px-4 text-sm"
          )}
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
      <div className={cn(isSignUp ? "mt-2 mb-2" : "mt-4 mb-4")}>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-teal-400/20" />
          </div>
          <div className={cn("relative flex justify-center", isSignUp ? "text-xs" : "text-sm")}>
            <span className={cn("bg-slate-800 text-slate-400", isSignUp ? "px-1.5" : "px-2")}>
              {isSignUp ? "Or" : "Or continue with"}
            </span>
          </div>
        </div>
      </div>

      {/* Google Sign-In Button */}
      <div className={cn(isSignUp ? "mb-2" : "mb-4")}>
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

      <div className={cn("text-center", isSignUp ? "mt-2" : "mt-4")}>
        <p className={cn("text-slate-400", isSignUp ? "text-xs" : "text-sm")}>
          {isSignUp ? 'Have account?' : "Already have an account?"}{' '}
          <button
            onClick={onToggleMode}
            className="text-teal-300 hover:text-teal-200 font-medium underline transform hover:scale-105 transition-all duration-200"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        {/* Footer Links */}
        <div className={cn(
          "flex justify-center text-xs text-slate-500",
          isSignUp ? "space-x-1.5 mt-1" : "space-x-2 mt-3"
        )}>
          <button
            onClick={() => setShowAbout(true)}
            className="hover:text-slate-400 transition-colors duration-200"
          >
            About
          </button>
          <span>•</span>
          <button
            onClick={() => setShowTerms(true)}
            className="hover:text-slate-400 transition-colors duration-200"
          >
            Terms
          </button>
          <span>•</span>
          <button
            onClick={() => setShowPrivacy(true)}
            className="hover:text-slate-400 transition-colors duration-200"
          >
            Privacy
          </button>
        </div>

        <p className="text-xs text-white/50">
          Developed by Bupe Nondo • Hytel Organization
        </p>
      </div>

      {/* Modals */}
      <TermsAndConditions
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          setAcceptedTerms(true);
          setShowTerms(false);
        }}
        showAcceptButton={isSignUp && !acceptedTerms}
      />

      <PrivacyPolicy
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />

      <AboutUs
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />
    </div>
  );
}
