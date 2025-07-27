import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  variant?: 'dots' | 'bar' | 'numbers';
  className?: string;
  showLabels?: boolean;
}

export function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  variant = 'dots',
  className,
  showLabels = false 
}: ProgressIndicatorProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  if (variant === 'bar') {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-800">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-700">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'numbers') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div
              key={stepNumber}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200',
                {
                  'bg-blue-600 text-white': isActive,
                  'bg-green-500 text-white': isCompleted,
                  'bg-gray-200 text-gray-700': !isActive && !isCompleted,
                }
              )}
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                stepNumber
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Default: dots variant
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {showLabels && (
        <span className="text-sm font-medium text-gray-800 mr-3">
          {currentStep} / {totalSteps}
        </span>
      )}
      
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div
            key={stepNumber}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              {
                'bg-blue-600 scale-125': isActive,
                'bg-green-500': isCompleted,
                'bg-gray-300 dark:bg-gray-600': !isActive && !isCompleted,
              }
            )}
          />
        );
      })}
      
      {showLabels && (
        <span className="text-sm text-gray-700 ml-3">
          {Math.round(progressPercentage)}% complete
        </span>
      )}
    </div>
  );
}
