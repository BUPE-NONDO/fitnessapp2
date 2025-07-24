import { useEffect, useState } from 'react';
import { OnboardingData } from '../OnboardingWizard';

interface ProgressPreviewStepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
}

export function ProgressPreviewStep({ onNext }: ProgressPreviewStepProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onNext(), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onNext]);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="text-6xl mb-6">🎯</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Creating Your Personalized Plan
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Analyzing your goals and preferences to build the perfect workout plan...
        </p>
      </div>

      <div className="mb-8">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {progress}% Complete
        </div>
      </div>

      <div className="space-y-4 text-left max-w-md mx-auto">
        {[
          { text: 'Analyzing your fitness goals...', done: progress > 20 },
          { text: 'Calculating optimal workout intensity...', done: progress > 40 },
          { text: 'Selecting exercises for your level...', done: progress > 60 },
          { text: 'Creating your weekly schedule...', done: progress > 80 },
          { text: 'Finalizing your personalized plan...', done: progress >= 100 }
        ].map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${
              step.done ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              {step.done && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={step.done ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
              {step.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
