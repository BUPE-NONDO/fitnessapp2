import { OnboardingData } from '../OnboardingWizard';

interface PreferencesStepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
}

export function PreferencesStep({ data, onUpdate }: PreferencesStepProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Tell us about your preferences
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          We'll customize your workouts based on your experience and available time.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Fitness Level</h3>
          <div className="space-y-3">
            {[
              { value: 'beginner', label: 'Beginner', desc: 'New to fitness' },
              { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
              { value: 'advanced', label: 'Advanced', desc: 'Very experienced' }
            ].map((level) => (
              <button
                key={level.value}
                onClick={() => onUpdate({ fitnessLevel: level.value as any })}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                  data.fitnessLevel === level.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="font-medium">{level.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{level.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Available Time</h3>
          <div className="space-y-3">
            {[
              { value: 15, label: '15 minutes', desc: 'Quick sessions' },
              { value: 30, label: '30 minutes', desc: 'Standard workouts' },
              { value: 45, label: '45 minutes', desc: 'Extended sessions' },
              { value: 60, label: '60+ minutes', desc: 'Full workouts' }
            ].map((time) => (
              <button
                key={time.value}
                onClick={() => onUpdate({ availableTime: time.value as any })}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                  data.availableTime === time.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="font-medium">{time.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{time.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Workout Environment</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { value: 'home', label: 'Home', icon: '🏠' },
            { value: 'gym', label: 'Gym', icon: '🏋️' },
            { value: 'outdoor', label: 'Outdoor', icon: '🌳' },
            { value: 'mixed', label: 'Mixed', icon: '🔄' }
          ].map((env) => (
            <button
              key={env.value}
              onClick={() => onUpdate({ workoutEnvironment: env.value as any, equipmentAccess: 'bodyweight', workoutDaysPerWeek: 4 })}
              className={`p-4 text-center border-2 rounded-lg transition-all ${
                data.workoutEnvironment === env.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="text-2xl mb-2">{env.icon}</div>
              <div className="font-medium">{env.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
