interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
  className?: string;
}

export function OnboardingProgress({ 
  currentStep, 
  totalSteps, 
  stepTitles = [],
  className = '' 
}: OnboardingProgressProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between mt-4">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const stepTitle = stepTitles[index];

          return (
            <div key={stepNumber} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-800'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              
              {stepTitle && (
                <span className={`text-xs mt-1 text-center max-w-16 ${
                  isCurrent 
                    ? 'text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {stepTitle}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Motivational Message */}
      <div className="mt-4 text-center">
        {currentStep === 1 && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            🎯 Let's personalize your fitness journey!
          </p>
        )}
        {currentStep > 1 && currentStep < totalSteps && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            🚀 Great progress! Keep going...
          </p>
        )}
        {currentStep === totalSteps && (
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
            🎉 Almost done! Ready to start your journey?
          </p>
        )}
      </div>
    </div>
  );
}

export default OnboardingProgress;
