import { OnboardingData } from '../OnboardingWizard';
import { cn } from '@/lib/utils';

interface FitnessGoalStepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
}

type FitnessGoal = 'lose-weight' | 'gain-muscle' | 'tone-body' | 'increase-endurance' | 'improve-flexibility' | 'general-fitness';

const goalOptions: Array<{
  value: FitnessGoal;
  title: string;
  description: string;
  icon: string;
  color: string;
  benefits: string[];
  timeframe: string;
}> = [
  {
    value: 'lose-weight',
    title: 'Lose Weight',
    description: 'Burn fat and achieve your ideal body composition',
    icon: '🔥',
    color: 'red',
    benefits: ['Fat burning workouts', 'Nutrition guidance', 'Progress tracking'],
    timeframe: '4-12 weeks'
  },
  {
    value: 'gain-muscle',
    title: 'Gain Muscle',
    description: 'Build strength and increase muscle mass',
    icon: '💪',
    color: 'blue',
    benefits: ['Strength training', 'Muscle building', 'Progressive overload'],
    timeframe: '8-16 weeks'
  },
  {
    value: 'tone-body',
    title: 'Tone Body',
    description: 'Define muscles and improve body shape',
    icon: '✨',
    color: 'purple',
    benefits: ['Body sculpting', 'Lean muscle', 'Definition workouts'],
    timeframe: '6-12 weeks'
  },
  {
    value: 'increase-endurance',
    title: 'Increase Endurance',
    description: 'Boost cardiovascular fitness and stamina',
    icon: '🏃',
    color: 'green',
    benefits: ['Cardio training', 'Stamina building', 'Heart health'],
    timeframe: '4-8 weeks'
  },
  {
    value: 'improve-flexibility',
    title: 'Improve Flexibility',
    description: 'Enhance mobility and reduce stiffness',
    icon: '🧘',
    color: 'indigo',
    benefits: ['Stretching routines', 'Mobility work', 'Injury prevention'],
    timeframe: '2-6 weeks'
  },
  {
    value: 'general-fitness',
    title: 'General Fitness',
    description: 'Overall health and wellness improvement',
    icon: '🎯',
    color: 'gray',
    benefits: ['Balanced training', 'Health focus', 'Lifestyle change'],
    timeframe: '4-8 weeks'
  }
];

const colorClasses = {
  red: {
    border: 'border-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    hover: 'hover:border-red-300'
  },
  blue: {
    border: 'border-cyan-500',
    bg: 'bg-gradient-to-br from-cyan-50 to-violet-50 dark:from-cyan-900/30 dark:to-violet-900/30',
    text: 'bg-gradient-to-r from-cyan-700 to-violet-700 bg-clip-text text-transparent dark:from-cyan-300 dark:to-violet-300',
    hover: 'hover:border-cyan-400'
  },
  purple: {
    border: 'border-fuchsia-500',
    bg: 'bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/30 dark:to-pink-900/30',
    text: 'bg-gradient-to-r from-fuchsia-700 to-pink-700 bg-clip-text text-transparent dark:from-fuchsia-300 dark:to-pink-300',
    hover: 'hover:border-fuchsia-400'
  },
  green: {
    border: 'border-emerald-500',
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30',
    text: 'bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent dark:from-emerald-300 dark:to-teal-300',
    hover: 'hover:border-emerald-400'
  },
  indigo: {
    border: 'border-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    hover: 'hover:border-indigo-300'
  },
  gray: {
    border: 'border-gray-500',
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    text: 'text-gray-600 dark:text-gray-400',
    hover: 'hover:border-gray-300'
  }
};

export function FitnessGoalStep({ data, onUpdate, onNext }: FitnessGoalStepProps) {
  const selectedGoal = data.primaryGoal;

  const handleGoalSelect = (goal: FitnessGoal) => {
    onUpdate({ primaryGoal: goal });
    // Auto-advance after selection
    setTimeout(() => {
      onNext();
    }, 500);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Compact Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-2 sm:mb-3">
          What's your primary fitness goal?
        </h1>
        <p className="text-sm sm:text-base text-black max-w-2xl mx-auto">
          Choose your main objective to create your workout plan.
        </p>
      </div>

      {/* Compact Goals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {goalOptions.map((goal) => {
          const isSelected = selectedGoal === goal.value;
          const colors = colorClasses[goal.color as keyof typeof colorClasses];
          
          return (
            <button
              key={goal.value}
              onClick={() => handleGoalSelect(goal.value)}
              className={cn(
                'relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-500 text-left glass-morphism',
                'hover:shadow-2xl hover:scale-110 transform hover:-translate-y-2',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400',
                'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-teal-400/5 before:to-blue-500/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500',
                {
                  [colors.border]: isSelected,
                  [colors.bg]: isSelected,
                  'shadow-2xl scale-110 -translate-y-1 animate-pulse-glow': isSelected,
                  'border-teal-400/30 bg-slate-800/60 backdrop-blur-sm hover:border-teal-400/50': !isSelected,
                  [colors.hover]: !isSelected,
                }
              )}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', colors.border.replace('border-', 'bg-'))}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{goal.icon}</div>

              {/* Content */}
              <div className="mb-2 sm:mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                  {goal.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-2">
                  {goal.description}
                </p>
                <div className={cn('text-xs font-medium', colors.text)}>
                  {goal.timeframe}
                </div>
              </div>

              {/* Compact Benefits */}
              <div className="space-y-1">
                {goal.benefits.slice(0, 2).map((benefit, index) => (
                  <div key={index} className="flex items-center text-xs text-slate-400">
                    <svg className="w-3 h-3 text-teal-400 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {benefit}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Compact Popular Choice Indicator */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center px-3 py-1.5 bg-amber-500/20 backdrop-blur-sm border border-amber-400/50 rounded-full text-xs text-amber-200">
          <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Popular: "Lose Weight" & "Tone Body"
        </div>
      </div>

      {/* Progress Hint */}
      {selectedGoal && (
        <div className="text-center">
          <div className="inline-flex items-center text-sm text-slate-300">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Personalizing your plan...
          </div>
        </div>
      )}
    </div>
  );
}
