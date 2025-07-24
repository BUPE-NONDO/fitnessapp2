import { cn } from '@/lib/utils';

interface StepNavigationProps {
  canGoBack: boolean;
  canGoNext: boolean;
  isLoading?: boolean;
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
  className?: string;
}

export function StepNavigation({
  canGoBack,
  canGoNext,
  isLoading = false,
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Continue',
  className
}: StepNavigationProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={!canGoBack || isLoading}
        className={cn(
          'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
          'border border-gray-300 dark:border-gray-600',
          'text-gray-700 dark:text-gray-300',
          'hover:bg-gray-50 dark:hover:bg-gray-700',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          {
            'invisible': !canGoBack,
          }
        )}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {backLabel}
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canGoNext || isLoading}
        className={cn(
          'inline-flex items-center px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200',
          'bg-gradient-to-r from-blue-600 to-indigo-600',
          'text-white',
          'hover:from-blue-700 hover:to-indigo-700',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600',
          'shadow-lg hover:shadow-xl',
          {
            'animate-pulse': isLoading,
          }
        )}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            {nextLabel}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}
