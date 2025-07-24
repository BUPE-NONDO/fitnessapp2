import { useEffect, useState } from 'react';

interface SplashScreenProps {
  isVisible: boolean;
  onComplete: () => void;
  minDisplayTime?: number;
}

export function SplashScreen({ 
  isVisible, 
  onComplete, 
  minDisplayTime = 2000 
}: SplashScreenProps) {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const steps = [
      { delay: 0, step: 1 },      // Show logo
      { delay: 500, step: 2 },    // Show app name
      { delay: 1000, step: 3 },   // Show tagline
      { delay: 1500, step: 4 },   // Show loading
    ];

    const timers = steps.map(({ delay, step }) =>
      setTimeout(() => setAnimationStep(step), delay)
    );

    // Complete splash screen
    const completeTimer = setTimeout(() => {
      onComplete();
      setAnimationStep(0);
    }, minDisplayTime);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [isVisible, onComplete, minDisplayTime]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center">
      <div className="text-center text-white">
        {/* Logo Animation */}
        <div className={`transition-all duration-1000 ${
          animationStep >= 1 ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-50'
        }`}>
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-4xl">💪</span>
          </div>
        </div>

        {/* App Name */}
        <div className={`transition-all duration-1000 ${
          animationStep >= 2 ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`}>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            FitnessApp
          </h1>
        </div>

        {/* Tagline */}
        <div className={`transition-all duration-1000 ${
          animationStep >= 3 ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`}>
          <p className="text-xl text-blue-100 mb-8">
            Your Personal Fitness Journey
          </p>
        </div>

        {/* Loading Animation */}
        <div className={`transition-all duration-500 ${
          animationStep >= 4 ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-blue-100 mt-4 text-sm">Loading your experience...</p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-16 w-16 h-16 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 right-12 w-24 h-24 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
}

export default SplashScreen;
