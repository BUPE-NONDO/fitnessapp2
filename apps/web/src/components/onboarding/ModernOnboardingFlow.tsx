import React, { useState, useEffect } from 'react';
import { OnboardingData } from './OnboardingWizard';

interface ModernOnboardingFlowProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => Promise<void>;
  onSkip: () => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  illustration: string;
  content: React.ReactNode;
  canSkip?: boolean;
}

export function ModernOnboardingFlow({
  isOpen,
  onComplete,
  onSkip,
  onClose,
  isLoading = false
}: ModernOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to FitnessApp',
      subtitle: 'Your personal fitness journey starts here',
      illustration: '🎯',
      content: <WelcomeStep onNext={() => setCurrentStep(1)} />,
      canSkip: true
    },
    {
      id: 'goals',
      title: 'What\'s your main goal?',
      subtitle: 'Help us personalize your experience',
      illustration: '💪',
      content: (
        <GoalSelectionStep
          value={onboardingData.primaryGoal}
          onChange={(goal) => setOnboardingData(prev => ({ ...prev, primaryGoal: goal }))}
          onNext={() => setCurrentStep(2)}
          onBack={() => setCurrentStep(0)}
        />
      )
    },
    {
      id: 'profile',
      title: 'Tell us about yourself',
      subtitle: 'This helps us create your perfect plan',
      illustration: '👤',
      content: (
        <ProfileStep
          data={onboardingData}
          onChange={(data) => setOnboardingData(prev => ({ ...prev, ...data }))}
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      )
    },
    {
      id: 'preferences',
      title: 'Your workout preferences',
      subtitle: 'Let\'s match you with the right workouts',
      illustration: '🏋️',
      content: (
        <PreferencesStep
          data={onboardingData}
          onChange={(data) => setOnboardingData(prev => ({ ...prev, ...data }))}
          onNext={() => setCurrentStep(4)}
          onBack={() => setCurrentStep(2)}
        />
      )
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      subtitle: 'Ready to start your fitness journey?',
      illustration: '🎉',
      content: (
        <CompletionStep
          data={onboardingData}
          onComplete={handleComplete}
          onBack={() => setCurrentStep(3)}
          isLoading={isSubmitting}
        />
      )
    }
  ];

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      await onComplete(onboardingData as OnboardingData);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      await onSkip();
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="relative flex items-center justify-between p-6">
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress Bar */}
        <div className="flex-1 mx-8">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {currentStepData.canSkip && (
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="w-full max-w-2xl mx-auto">
          {/* Illustration */}
          <div className="text-center mb-8">
            <div className="text-8xl mb-4 animate-bounce">
              {currentStepData.illustration}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {currentStepData.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {currentStepData.subtitle}
            </p>
          </div>

          {/* Step Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {currentStepData.content}
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= currentStep
                  ? 'bg-blue-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Individual Step Components
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Track Progress</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Monitor your fitness journey with detailed analytics</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Set Goals</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Create personalized fitness goals that motivate you</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏆</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Achieve More</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Unlock achievements and celebrate milestones</p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
      >
        Let's Get Started 🚀
      </button>
    </div>
  );
}

function GoalSelectionStep({
  value,
  onChange,
  onNext,
  onBack
}: {
  value?: string;
  onChange: (goal: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const goals = [
    { id: 'lose-weight', title: 'Lose Weight', icon: '⚖️', description: 'Burn calories and shed pounds' },
    { id: 'gain-muscle', title: 'Build Muscle', icon: '💪', description: 'Increase strength and muscle mass' },
    { id: 'tone-body', title: 'Tone & Shape', icon: '✨', description: 'Define and sculpt your physique' },
    { id: 'increase-endurance', title: 'Boost Endurance', icon: '🏃', description: 'Improve cardiovascular fitness' },
    { id: 'improve-flexibility', title: 'Flexibility', icon: '🧘', description: 'Enhance mobility and flexibility' },
    { id: 'general-fitness', title: 'General Fitness', icon: '🌟', description: 'Overall health and wellness' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => onChange(goal.id)}
            className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              value === goal.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="text-3xl mb-3">{goal.icon}</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{goal.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{goal.description}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!value}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function ProfileStep({
  data,
  onChange,
  onNext,
  onBack
}: {
  data: Partial<OnboardingData>;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [formData, setFormData] = useState({
    ageRange: data.ageRange || '',
    gender: data.gender || '',
    currentWeight: data.currentWeight || '',
    targetWeight: data.targetWeight || '',
    height: data.height || '',
    fitnessLevel: data.fitnessLevel || ''
  });

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  const isValid = formData.ageRange && formData.gender && formData.fitnessLevel;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Age Range
          </label>
          <div className="space-y-2">
            {['18-29', '30-39', '40-49', '50+'].map((age) => (
              <button
                key={age}
                onClick={() => handleChange('ageRange', age)}
                className={`w-full p-3 text-left rounded-lg border transition-colors ${
                  formData.ageRange === age
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                {age} years
              </button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Gender
          </label>
          <div className="space-y-2">
            {[
              { id: 'male', label: 'Male' },
              { id: 'female', label: 'Female' },
              { id: 'non-binary', label: 'Non-binary' },
              { id: 'prefer-not-to-say', label: 'Prefer not to say' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => handleChange('gender', option.id)}
                className={`w-full p-3 text-left rounded-lg border transition-colors ${
                  formData.gender === option.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weight Inputs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Current Weight (kg)
          </label>
          <input
            type="number"
            value={formData.currentWeight}
            onChange={(e) => handleChange('currentWeight', Number(e.target.value))}
            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Enter your current weight"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Target Weight (kg)
          </label>
          <input
            type="number"
            value={formData.targetWeight}
            onChange={(e) => handleChange('targetWeight', Number(e.target.value))}
            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Enter your target weight"
          />
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Height (cm)
          </label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => handleChange('height', Number(e.target.value))}
            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Enter your height"
          />
        </div>

        {/* Fitness Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Fitness Level
          </label>
          <div className="space-y-2">
            {[
              { id: 'beginner', label: 'Beginner', desc: 'New to fitness' },
              { id: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
              { id: 'advanced', label: 'Advanced', desc: 'Very experienced' }
            ].map((level) => (
              <button
                key={level.id}
                onClick={() => handleChange('fitnessLevel', level.id)}
                className={`w-full p-3 text-left rounded-lg border transition-colors ${
                  formData.fitnessLevel === level.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{level.label}</div>
                <div className="text-sm opacity-75">{level.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function PreferencesStep({
  data,
  onChange,
  onNext,
  onBack
}: {
  data: Partial<OnboardingData>;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [formData, setFormData] = useState({
    workoutEnvironment: data.workoutEnvironment || '',
    availableTime: data.availableTime || '',
    equipmentAccess: data.equipmentAccess || '',
    workoutDaysPerWeek: data.workoutDaysPerWeek || 3
  });

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  const isValid = formData.workoutEnvironment && formData.availableTime && formData.equipmentAccess;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workout Environment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Where do you prefer to workout?
          </label>
          <div className="space-y-2">
            {[
              { id: 'home', label: 'At Home', icon: '🏠' },
              { id: 'gym', label: 'At the Gym', icon: '🏋️' },
              { id: 'outdoor', label: 'Outdoors', icon: '🌳' },
              { id: 'mixed', label: 'Mix of All', icon: '🔄' }
            ].map((env) => (
              <button
                key={env.id}
                onClick={() => handleChange('workoutEnvironment', env.id)}
                className={`w-full p-3 text-left rounded-lg border transition-colors flex items-center space-x-3 ${
                  formData.workoutEnvironment === env.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">{env.icon}</span>
                <span>{env.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Available Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            How much time can you dedicate?
          </label>
          <div className="space-y-2">
            {[
              { id: '15-30', label: '15-30 minutes', icon: '⏱️' },
              { id: '30-45', label: '30-45 minutes', icon: '⏰' },
              { id: '45-60', label: '45-60 minutes', icon: '🕐' },
              { id: '60+', label: '60+ minutes', icon: '⏳' }
            ].map((time) => (
              <button
                key={time.id}
                onClick={() => handleChange('availableTime', time.id)}
                className={`w-full p-3 text-left rounded-lg border transition-colors flex items-center space-x-3 ${
                  formData.availableTime === time.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">{time.icon}</span>
                <span>{time.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Access */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            What equipment do you have access to?
          </label>
          <div className="space-y-2">
            {[
              { id: 'none', label: 'No Equipment (Bodyweight)', icon: '🤸' },
              { id: 'basic', label: 'Basic Equipment', icon: '🏃' },
              { id: 'full-gym', label: 'Full Gym Access', icon: '🏋️' }
            ].map((equipment) => (
              <button
                key={equipment.id}
                onClick={() => handleChange('equipmentAccess', equipment.id)}
                className={`w-full p-3 text-left rounded-lg border transition-colors flex items-center space-x-3 ${
                  formData.equipmentAccess === equipment.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">{equipment.icon}</span>
                <span>{equipment.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Workout Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            How many days per week? ({formData.workoutDaysPerWeek} days)
          </label>
          <input
            type="range"
            min="1"
            max="7"
            value={formData.workoutDaysPerWeek}
            onChange={(e) => handleChange('workoutDaysPerWeek', Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span>1 day</span>
            <span>7 days</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function CompletionStep({
  data,
  onComplete,
  onBack,
  isLoading
}: {
  data: Partial<OnboardingData>;
  onComplete: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const getGoalLabel = (goal?: string) => {
    const goals: Record<string, string> = {
      'lose-weight': 'Lose Weight',
      'gain-muscle': 'Build Muscle',
      'tone-body': 'Tone & Shape',
      'increase-endurance': 'Boost Endurance',
      'improve-flexibility': 'Flexibility',
      'general-fitness': 'General Fitness'
    };
    return goals[goal || ''] || 'Not specified';
  };

  const getEnvironmentLabel = (env?: string) => {
    const environments: Record<string, string> = {
      'home': 'At Home 🏠',
      'gym': 'At the Gym 🏋️',
      'outdoor': 'Outdoors 🌳',
      'mixed': 'Mix of All 🔄'
    };
    return environments[env || ''] || 'Not specified';
  };

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Personalized Plan Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-300">Primary Goal:</span>
            <div className="font-medium text-gray-900 dark:text-white">{getGoalLabel(data.primaryGoal)}</div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-300">Fitness Level:</span>
            <div className="font-medium text-gray-900 dark:text-white capitalize">{data.fitnessLevel || 'Not specified'}</div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-300">Workout Environment:</span>
            <div className="font-medium text-gray-900 dark:text-white">{getEnvironmentLabel(data.workoutEnvironment)}</div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-300">Available Time:</span>
            <div className="font-medium text-gray-900 dark:text-white">{data.availableTime || 'Not specified'} minutes</div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-300">Workout Days:</span>
            <div className="font-medium text-gray-900 dark:text-white">{data.workoutDaysPerWeek || 3} days per week</div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-300">Age Range:</span>
            <div className="font-medium text-gray-900 dark:text-white">{data.ageRange || 'Not specified'} years</div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl mb-2">🎯</div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Personalized Goals</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">Custom goals based on your preferences</p>
        </div>
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl mb-2">📊</div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Progress Tracking</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">Monitor your fitness journey</p>
        </div>
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-2xl mb-2">🏆</div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Achievements</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">Unlock badges and milestones</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          onClick={onComplete}
          disabled={isLoading}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Setting up your profile...
            </span>
          ) : (
            <>
              🚀 Start My Fitness Journey
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ModernOnboardingFlow;
