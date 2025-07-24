import { OnboardingData } from '../OnboardingWizard';

interface CompletionStepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
}

export function CompletionStep({ data }: CompletionStepProps) {
  const handleStartWorkout = () => {
    // Navigate to main app or first workout
    window.location.href = '/dashboard';
  };

  const handleDownloadApp = () => {
    // Open app store or provide download link
    window.open('https://apps.apple.com/app/fitness-app', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-12">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Your Fitness Journey!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Congratulations! You're all set up and ready to start transforming your body.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Your Plan Summary
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Goal</div>
            <div className="font-semibold capitalize">
              {data.primaryGoal?.replace('-', ' ') || 'General Fitness'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Plan</div>
            <div className="font-semibold capitalize">
              {data.selectedPlan || 'Premium'} Plan
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</div>
            <div className="font-semibold">
              {data.personalizedPlan?.duration || 4} Weeks
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-4xl mb-4">💻</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Start on Web
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Begin your first workout right now in your browser.
          </p>
          <button
            onClick={handleStartWorkout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Start First Workout
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Download Mobile App
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Get the full experience with our mobile app.
          </p>
          <button
            onClick={handleDownloadApp}
            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Download App
          </button>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
          🎯 Your Next Steps
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-green-800 dark:text-green-200">
          <div className="flex items-center">
            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
            Complete your first workout
          </div>
          <div className="flex items-center">
            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
            Track your progress daily
          </div>
          <div className="flex items-center">
            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
            See results in 2 weeks
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Need help? Our support team is available 24/7
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm">
          <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            📧 support@fitnessapp.com
          </a>
          <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            💬 Live Chat
          </a>
          <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            📚 Help Center
          </a>
        </div>
      </div>
    </div>
  );
}
