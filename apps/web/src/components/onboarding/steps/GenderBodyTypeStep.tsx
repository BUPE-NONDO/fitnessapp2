import { OnboardingData } from '../OnboardingWizard';

interface GenderBodyTypeStepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
}

export function GenderBodyTypeStep({ data, onUpdate, onNext }: GenderBodyTypeStepProps) {
  const handleGenderSelect = (gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say') => {
    onUpdate({ gender });
    setTimeout(() => onNext(), 500);
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Tell us about yourself
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
        This helps us personalize your workout content and recommendations.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { value: 'male', label: 'Male', icon: '👨' },
          { value: 'female', label: 'Female', icon: '👩' },
          { value: 'non-binary', label: 'Non-binary', icon: '🧑' },
          { value: 'prefer-not-to-say', label: 'Prefer not to say', icon: '👤' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => handleGenderSelect(option.value as any)}
            className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
          >
            <div className="text-4xl mb-3">{option.icon}</div>
            <div className="text-xl font-semibold">{option.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
