import { OnboardingData } from '../OnboardingWizard';
import { cn } from '@/lib/utils';

interface AgeSelectionStepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
}

type AgeRange = '18-29' | '30-39' | '40-49' | '50+';

const ageOptions: Array<{
  value: AgeRange;
  label: string;
  description: string;
  icon: string;
  benefits: string[];
}> = [
  {
    value: '18-29',
    label: '18-29 years',
    description: 'Peak metabolism & recovery',
    icon: '🚀',
    benefits: ['High intensity workouts', 'Fast muscle building', 'Quick recovery']
  },
  {
    value: '30-39',
    label: '30-39 years',
    description: 'Balanced approach',
    icon: '⚡',
    benefits: ['Strength & cardio mix', 'Sustainable habits', 'Work-life balance']
  },
  {
    value: '40-49',
    label: '40-49 years',
    description: 'Smart training focus',
    icon: '🎯',
    benefits: ['Joint-friendly exercises', 'Metabolism boost', 'Injury prevention']
  },
  {
    value: '50+',
    label: '50+ years',
    description: 'Health & longevity',
    icon: '🌟',
    benefits: ['Mobility & flexibility', 'Bone health', 'Active aging']
  }
];

export function AgeSelectionStep({ data, onUpdate, onNext }: AgeSelectionStepProps) {
  const selectedAge = data.ageRange;

  const handleAgeSelect = (ageRange: AgeRange) => {
    onUpdate({ ageRange });
    // Auto-advance after selection
    setTimeout(() => {
      onNext();
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          What's your age range?
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          We'll tailor your workout intensity and recovery time based on your age and metabolism.
        </p>
      </div>

      {/* Age Options Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {ageOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAgeSelect(option.value)}
            className={cn(
              'relative p-6 rounded-xl border-2 transition-all duration-300 text-left',
              'hover:shadow-lg hover:scale-105 transform',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              {
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105': selectedAge === option.value,
                'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300': selectedAge !== option.value,
              }
            )}
          >
            {/* Selection Indicator */}
            {selectedAge === option.value && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            {/* Icon */}
            <div className="text-4xl mb-4">{option.icon}</div>

            {/* Content */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {option.label}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {option.description}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              {option.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {benefit}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Why we ask about age
          </h3>
        </div>
        <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
          Age affects metabolism, recovery time, and optimal training intensity. 
          Our algorithm uses this to create safer, more effective workouts tailored to your body's needs.
        </p>
      </div>

      {/* Progress Hint */}
      {selectedAge && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Continuing to next step...
          </div>
        </div>
      )}
    </div>
  );
}
