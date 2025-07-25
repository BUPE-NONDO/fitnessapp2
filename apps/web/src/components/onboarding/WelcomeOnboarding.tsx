import { useState } from 'react';
import { OnboardingWizard, OnboardingData } from './OnboardingWizard';
import { OnboardingIntro } from './OnboardingIntro';
import { useUser } from '@/hooks/useUser';

interface WelcomeOnboardingProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => Promise<void>;
  onSkip: () => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function WelcomeOnboarding({
  isOpen,
  onComplete,
  onSkip,
  onClose,
  isLoading = false
}: WelcomeOnboardingProps) {
  const { userProfile } = useUser();
  const [showIntro, setShowIntro] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  if (!isOpen) return null;

  const handleIntroStart = () => {
    setShowIntro(false);
    setShowWizard(true);
  };

  const handleIntroSkip = async () => {
    try {
      setIsSkipping(true);
      await onSkip();
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    } finally {
      setIsSkipping(false);
    }
  };

  const handleWizardComplete = async (data: OnboardingData) => {
    try {
      await onComplete(data);
      setShowWizard(false);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Keep wizard open on error
    }
  };

  const handleWizardExit = () => {
    setShowWizard(false);
    setShowIntro(true);
    onClose();
  };

  // Show intro screen first
  if (showIntro) {
    return (
      <OnboardingIntro
        isVisible={true}
        onStart={handleIntroStart}
        onSkip={handleIntroSkip}
        userName={userProfile?.displayName}
      />
    );
  }

  // Show onboarding wizard
  if (showWizard) {
    return (
      <OnboardingWizard
        onComplete={handleWizardComplete}
        onExit={handleWizardExit}
      />
    );
  }

  // Show welcome screen
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-500 to-primary-600 text-white p-8 rounded-t-2xl overflow-hidden">
          {/* Circle decorations */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 rounded-full"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome to FitnessApp!
            </h1>
            <p className="text-blue-100 text-lg">
              {userProfile?.displayName ? `Hi ${userProfile.displayName}! ` : ''}
              Let's personalize your fitness journey
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm">🎯</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Personalized Goals</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get custom fitness goals based on your preferences
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-sm">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Progress Tracking</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Monitor your progress with detailed analytics
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-sm">🏆</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Achievements</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Earn badges and celebrate your milestones
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 text-sm">💪</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Custom Workouts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Workouts tailored to your fitness level
                  </p>
                </div>
              </div>
            </div>

            {/* Setup Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">⏱️</div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Quick 2-minute setup
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Tell us about your fitness goals and preferences to get personalized recommendations
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleIntroStart}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-primary-600 hover:from-purple-600 hover:to-primary-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg shadow-circle hover:shadow-circle-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Setting up...
                  </span>
                ) : (
                  <>
                    <span className="mr-2">🚀</span>
                    Start Your FREE Fitness Plan
                  </>
                )}
              </button>

              <button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="w-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-200 font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="mr-2">⚙️</span>
                Use Modern Setup
              </button>

              <button
                onClick={handleUseClassicFlow}
                disabled={isLoading}
                className="w-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-200 font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="mr-2">🔧</span>
                Use Detailed Setup
              </button>

              <button
                onClick={handleSkip}
                disabled={isLoading || isSkipping}
                className="w-full px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSkipping ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Skipping...
                  </span>
                ) : (
                  'Skip for now'
                )}
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ⭐ Recommended: Take our quick quiz for the most personalized experience
              </p>
            </div>

            {/* Skip Note */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              You can always complete your profile setup later in Settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeOnboarding;
