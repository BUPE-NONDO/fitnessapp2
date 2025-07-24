import { useState } from 'react';
import { OnboardingWizard, OnboardingData } from '@/components/onboarding/OnboardingWizard';

export default function OnboardingPage() {
  const [isComplete, setIsComplete] = useState(false);
  const [completedData, setCompletedData] = useState<OnboardingData | null>(null);

  const handleComplete = (data: OnboardingData) => {
    console.log('Onboarding completed with data:', data);
    setCompletedData(data);
    setIsComplete(true);
  };

  const handleExit = () => {
    // Navigate back to home or login
    window.location.href = '/';
  };

  const handleRestart = () => {
    setIsComplete(false);
    setCompletedData(null);
    localStorage.removeItem('fitness-app-onboarding-progress');
  };

  if (isComplete && completedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Onboarding Complete!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Thank you for completing the onboarding process. Your personalized fitness plan is ready!
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold mb-4">Your Data Summary:</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Age Range:</strong> {completedData.ageRange}</div>
              <div><strong>Gender:</strong> {completedData.gender}</div>
              <div><strong>Primary Goal:</strong> {completedData.primaryGoal}</div>
              <div><strong>Fitness Level:</strong> {completedData.fitnessLevel}</div>
              <div><strong>Selected Plan:</strong> {completedData.selectedPlan}</div>
              {completedData.personalizedPlan && (
                <div><strong>Plan Duration:</strong> {completedData.personalizedPlan.duration} weeks</div>
              )}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-all duration-200"
            >
              Restart Onboarding
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OnboardingWizard
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}
