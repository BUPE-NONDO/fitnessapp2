import { OnboardingData } from '../OnboardingWizard';
import { useEffect, useState } from 'react';
import { IsolatedOnboardingService } from '@/services/isolatedOnboardingService';
import { useUser } from '@/hooks/useUser';

interface PlanSummaryStepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
}

export function PlanSummaryStep({ data }: PlanSummaryStepProps) {
  const [buildingProgress, setBuildingProgress] = useState(0);
  const [currentBuildingStep, setCurrentBuildingStep] = useState('Analyzing your goals...');
  const [isCompleting, setIsCompleting] = useState(false);
  const { user } = useUser();

  // Building steps for progress display
  const buildingSteps = [
    'Analyzing your goals...',
    'Selecting optimal exercises...',
    'Creating weekly schedule...',
    'Calculating calorie targets...',
    'Generating daily goals...',
    'Finalizing your plan...',
    'Ready to start!'
  ];

  // Start the building process and complete onboarding
  useEffect(() => {
    if (!user || isCompleting) return;

    const buildPlanAndComplete = async () => {
      console.log('🏗️ Starting plan building process...');
      setIsCompleting(true);

      try {
        // Simulate realistic plan building with progress updates
        for (let i = 0; i < buildingSteps.length; i++) {
          setCurrentBuildingStep(buildingSteps[i]);
          setBuildingProgress((i / (buildingSteps.length - 1)) * 100);

          // Realistic timing for each step
          const stepDelay = i === buildingSteps.length - 1 ? 500 : 800 + Math.random() * 400;
          await new Promise(resolve => setTimeout(resolve, stepDelay));
        }

        console.log('🎉 Completing onboarding...');

        // Complete onboarding using the isolated service
        await IsolatedOnboardingService.completeOnboarding(user.uid, data);

        console.log('✅ Onboarding completed successfully!');

        // Set flag to indicate onboarding was just completed
        localStorage.setItem('onboarding-just-completed', 'true');

        // Wait a moment then redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);

      } catch (error) {
        console.error('❌ Error completing onboarding:', error);
        // Still redirect to dashboard on error, but mark as completed anyway
        localStorage.setItem('onboarding-just-completed', 'true');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    };

    buildPlanAndComplete();
  }, [user, isCompleting]);

  // Return the building progress UI
  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="text-6xl mb-6">🏗️</div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Building Your Personalized Plan...
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        {currentBuildingStep}
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${buildingProgress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(buildingProgress)}% Complete
          </div>
        </div>

        <div className="space-y-3 text-left max-w-md mx-auto">
          {buildingSteps.map((step, index) => {
            const currentStepIndex = buildingSteps.indexOf(currentBuildingStep);
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={index} className={`flex items-center text-sm ${
                isCompleted ? 'text-green-600 dark:text-green-400' :
                isCurrent ? 'text-blue-600 dark:text-blue-400' :
                'text-gray-400 dark:text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  isCompleted ? 'bg-green-500' :
                  isCurrent ? 'bg-blue-500 animate-pulse' :
                  'bg-gray-300'
                }`}></div>
                {step}
                {isCompleted && <span className="ml-2">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          🎉 Almost Ready!
        </h3>
        <p className="text-blue-800 dark:text-blue-200">
          Your complete fitness system is being built - 100% FREE with daily goals and progress tracking!
        </p>
      </div>
    </div>
  );
}
