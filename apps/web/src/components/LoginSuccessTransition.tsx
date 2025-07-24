import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';

interface LoginSuccessTransitionProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function LoginSuccessTransition({ isVisible, onComplete }: LoginSuccessTransitionProps) {
  const { userProfile } = useUser();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const steps = [
      { delay: 0, step: 1 },      // Show welcome
      { delay: 1500, step: 2 },   // Show checkmark
      { delay: 2500, step: 3 },   // Fade out
    ];

    const timers = steps.map(({ delay, step }) =>
      setTimeout(() => setAnimationStep(step), delay)
    );

    // Complete transition
    const completeTimer = setTimeout(() => {
      onComplete();
      setAnimationStep(0);
    }, 3000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white">
        {/* Step 1: Welcome Message */}
        <div className={`transition-all duration-1000 ${
          animationStep >= 1 ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`}>
          <div className="text-6xl mb-6">👋</div>
          <h1 className="text-4xl font-bold mb-4">
            Welcome{userProfile?.displayName ? `, ${userProfile.displayName}` : ''}!
          </h1>
          <p className="text-xl text-blue-100">
            You're successfully signed in
          </p>
        </div>

        {/* Step 2: Success Checkmark */}
        <div className={`mt-8 transition-all duration-1000 ${
          animationStep >= 2 ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-50'
        }`}>
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Step 3: Loading dots */}
        <div className={`mt-6 transition-all duration-500 ${
          animationStep >= 2 ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-blue-100 mt-3">Setting up your dashboard...</p>
        </div>
      </div>
    </div>
  );
}

export default LoginSuccessTransition;
