import React, { useState, useEffect } from 'react';
import { OnboardingData } from './OnboardingWizard';

interface PersonalizedOnboardingFunnelProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData & { subscriptionTier?: string }) => Promise<void>;
  onSkip: () => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

interface FunnelData extends Partial<OnboardingData> {
  subscriptionTier?: 'basic' | 'premium' | 'elite';
  quizStartTime?: Date;
  completionTime?: Date;
}

export function PersonalizedOnboardingFunnel({
  isOpen,
  onComplete,
  onSkip,
  onClose,
  isLoading = false
}: PersonalizedOnboardingFunnelProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [funnelData, setFunnelData] = useState<FunnelData>({
    quizStartTime: new Date()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 'welcome', title: 'Build Your Perfect Body', component: WelcomeStep },
    { id: 'age', title: 'What\'s your age?', component: AgeSelectionStep },
    { id: 'gender', title: 'Tell us about yourself', component: GenderBodyTypeStep },
    { id: 'goal', title: 'What\'s your main goal?', component: PrimaryGoalStep },
    { id: 'metrics', title: 'Your body metrics', component: BodyMetricsStep },
    { id: 'preferences', title: 'Your preferences', component: ExperiencePreferencesStep },
    { id: 'progress', title: 'Creating your plan...', component: ProgressPreviewStep },
    { id: 'plan', title: 'Your personalized plan', component: PlanSummaryStep },
    { id: 'subscription', title: 'Unlock your plan', component: SubscriptionPaywallStep },
    { id: 'complete', title: 'Welcome to FitnessApp!', component: ConversionCompleteStep }
  ];

  const updateData = (newData: Partial<FunnelData>) => {
    setFunnelData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      const completionData = {
        ...funnelData,
        completionTime: new Date()
      };
      await onComplete(completionData as OnboardingData & { subscriptionTier?: string });
    } catch (error) {
      console.error('Failed to complete onboarding funnel:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header with Progress */}
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {steps[currentStep].title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          <div className="w-8 h-8" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <CurrentStepComponent
            data={funnelData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        </div>
      </div>
    </div>
  );
}

// Step Component Interface
interface StepProps {
  data: FunnelData;
  updateData: (data: Partial<FunnelData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
  currentStep: number;
  totalSteps: number;
}

// Step 1: Welcome / Start Page
function WelcomeStep({ nextStep }: StepProps) {
  return (
    <div className="text-center py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Build Your
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            {" "}Perfect Body
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Get a personalized fitness plan designed specifically for your body type, goals, and lifestyle. 
          Join thousands who've already transformed their lives.
        </p>
      </div>

      {/* Social Proof */}
      <div className="mb-12">
        <div className="flex justify-center items-center space-x-8 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">50K+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Success Stories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">4.8★</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">App Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">12M+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Workouts Completed</div>
          </div>
        </div>

        {/* Testimonial Carousel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              S
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Sarah M.</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Lost 25 lbs in 3 months</div>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 italic">
            "This app completely changed my approach to fitness. The personalized plan made all the difference!"
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-4">
        <button
          onClick={nextStep}
          className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 text-lg"
        >
          🚀 Start Your 1-Minute Quiz
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Takes less than 1 minute • Get instant results
        </p>
      </div>
    </div>
  );
}

// Step 2: Age Selection
function AgeSelectionStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const ageRanges = [
    { id: '18-29', label: '18-29', desc: 'Young adult metabolism' },
    { id: '30-39', label: '30-39', desc: 'Prime fitness years' },
    { id: '40-49', label: '40-49', desc: 'Mature metabolism' },
    { id: '50+', label: '50+', desc: 'Experienced lifestyle' }
  ];

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          What's your age range?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          This helps us tailor your plan to your metabolism and fitness capacity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {ageRanges.map((age) => (
          <button
            key={age.id}
            onClick={() => {
              updateData({ ageRange: age.id as any });
              setTimeout(nextStep, 300);
            }}
            className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-105 ${
              data.ageRange === age.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {age.label}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {age.desc}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={prevStep}
          className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

// Step 3: Gender / Body Type
function GenderBodyTypeStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const options = [
    { id: 'male', label: 'Male', icon: '👨', silhouette: '🚹' },
    { id: 'female', label: 'Female', icon: '👩', silhouette: '🚺' },
    { id: 'non-binary', label: 'Non-binary', icon: '👤', silhouette: '⚧️' }
  ];

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Tell us about yourself
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          This helps us personalize your workout content and visuals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              updateData({ gender: option.id as any });
              setTimeout(nextStep, 300);
            }}
            className={`p-8 rounded-2xl border-2 transition-all duration-200 text-center hover:scale-105 ${
              data.gender === option.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="text-6xl mb-4">{option.silhouette}</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {option.label}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={prevStep}
          className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

// Step 4: Primary Fitness Goal
function PrimaryGoalStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const goals = [
    {
      id: 'lose-weight',
      title: 'Lose Weight',
      icon: '⚖️',
      desc: 'Burn calories and shed pounds',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'gain-muscle',
      title: 'Gain Muscle',
      icon: '💪',
      desc: 'Build strength and muscle mass',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'tone-body',
      title: 'Tone Body',
      icon: '✨',
      desc: 'Define and sculpt your physique',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'increase-endurance',
      title: 'Increase Endurance',
      icon: '🏃',
      desc: 'Boost cardiovascular fitness',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          What's your main goal?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Choose your primary focus - we'll customize everything around this
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => {
              updateData({ primaryGoal: goal.id as any });
              setTimeout(nextStep, 300);
            }}
            className={`p-8 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-105 group ${
              data.primaryGoal === goal.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 bg-white dark:bg-gray-800'
            }`}
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${goal.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
              {goal.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {goal.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {goal.desc}
            </p>
          </button>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={prevStep}
          className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

// Step 5: Body Metrics Input
function BodyMetricsStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const [metrics, setMetrics] = React.useState({
    currentWeight: data.currentWeight || '',
    targetWeight: data.targetWeight || '',
    height: data.height || ''
  });

  const [bmi, setBmi] = useState<number | null>(null);

  // Calculate BMI in real-time
  React.useEffect(() => {
    if (metrics.currentWeight && metrics.height) {
      const weightKg = Number(metrics.currentWeight);
      const heightM = Number(metrics.height) / 100;
      const calculatedBmi = weightKg / (heightM * heightM);
      setBmi(Math.round(calculatedBmi * 10) / 10);
    } else {
      setBmi(null);
    }
  }, [metrics.currentWeight, metrics.height]);

  const handleNext = () => {
    updateData({
      currentWeight: Number(metrics.currentWeight),
      targetWeight: Number(metrics.targetWeight),
      height: Number(metrics.height)
    });
    nextStep();
  };

  const isValid = metrics.currentWeight && metrics.height;

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Your body metrics
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          This helps us calculate your personalized calorie and workout targets
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Current Weight (kg) *
              </label>
              <input
                type="number"
                value={metrics.currentWeight}
                onChange={(e) => setMetrics(prev => ({ ...prev, currentWeight: e.target.value }))}
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                placeholder="70"
              />
            </div>

            {/* Target Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Target Weight (kg)
              </label>
              <input
                type="number"
                value={metrics.targetWeight}
                onChange={(e) => setMetrics(prev => ({ ...prev, targetWeight: e.target.value }))}
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                placeholder="65"
              />
            </div>

            {/* Height */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Height (cm) *
              </label>
              <input
                type="number"
                value={metrics.height}
                onChange={(e) => setMetrics(prev => ({ ...prev, height: e.target.value }))}
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                placeholder="170"
              />
            </div>
          </div>

          {/* BMI Display */}
          {bmi && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Your BMI:</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{bmi}</span>
                  <span className={`ml-2 text-sm font-medium ${getBmiCategory(bmi).color}`}>
                    {getBmiCategory(bmi).label}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isValid}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 6: Experience & Preferences
function ExperiencePreferencesStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const [preferences, setPreferences] = React.useState({
    fitnessLevel: data.fitnessLevel || '',
    workoutEnvironment: data.workoutEnvironment || '',
    availableTime: data.availableTime || ''
  });

  const handleNext = () => {
    updateData(preferences);
    nextStep();
  };

  const isValid = preferences.fitnessLevel && preferences.workoutEnvironment && preferences.availableTime;

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Your preferences
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Help us create the perfect workout plan for your lifestyle
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Fitness Level */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            What's your fitness level?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'beginner', label: 'Beginner', desc: 'New to fitness', icon: '🌱' },
              { id: 'intermediate', label: 'Intermediate', desc: 'Some experience', icon: '💪' },
              { id: 'advanced', label: 'Advanced', desc: 'Very experienced', icon: '🏆' }
            ].map((level) => (
              <button
                key={level.id}
                onClick={() => setPreferences(prev => ({ ...prev, fitnessLevel: level.id }))}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  preferences.fitnessLevel === level.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="text-2xl mb-2">{level.icon}</div>
                <div className="font-semibold text-gray-900 dark:text-white">{level.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{level.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Workout Environment */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Where do you prefer to workout?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'home', label: 'At Home', icon: '🏠' },
              { id: 'gym', label: 'At the Gym', icon: '🏋️' },
              { id: 'outdoor', label: 'Outdoors', icon: '🌳' },
              { id: 'mixed', label: 'Mix of All', icon: '🔄' }
            ].map((env) => (
              <button
                key={env.id}
                onClick={() => setPreferences(prev => ({ ...prev, workoutEnvironment: env.id }))}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                  preferences.workoutEnvironment === env.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 bg-white dark:bg-gray-800'
                }`}
              >
                <span className="text-2xl">{env.icon}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{env.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Available Time */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            How much time can you dedicate per workout?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: '15-30', label: '15-30 minutes', icon: '⏱️' },
              { id: '30-45', label: '30-45 minutes', icon: '⏰' },
              { id: '45-60', label: '45-60 minutes', icon: '🕐' },
              { id: '60+', label: '60+ minutes', icon: '⏳' }
            ].map((time) => (
              <button
                key={time.id}
                onClick={() => setPreferences(prev => ({ ...prev, availableTime: time.id }))}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                  preferences.availableTime === time.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 bg-white dark:bg-gray-800'
                }`}
              >
                <span className="text-2xl">{time.icon}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{time.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8 max-w-4xl mx-auto">
        <button
          onClick={prevStep}
          className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isValid}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// Step 7: Progress Preview / Loading Screen
function ProgressPreviewStep({ data, nextStep }: StepProps) {
  const [progress, setProgress] = React.useState(0);
  const [currentMessage, setCurrentMessage] = React.useState(0);

  const messages = [
    "Analyzing your body type and goals...",
    "Creating your personalized workout plan...",
    "Calculating your calorie targets...",
    "Generating your 4-week transformation plan...",
    "Almost ready! Finalizing your program..."
  ];

  React.useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(nextStep, 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const messageTimer = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 2000);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [nextStep, messages.length]);

  return (
    <div className="py-12 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="text-6xl mb-8 animate-pulse">🎯</div>

        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Creating Your Perfect Plan
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
          Our AI is analyzing your responses to create a personalized fitness plan just for you
        </p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {progress}%
          </p>
        </div>

        {/* Dynamic Message */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
          <p className="text-lg text-gray-700 dark:text-gray-300 animate-pulse">
            {messages[currentMessage]}
          </p>
        </div>

        {/* Social Proof Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Alex M.", result: "Lost 15 lbs", time: "6 weeks" },
            { name: "Sarah K.", result: "Gained 8 lbs muscle", time: "8 weeks" },
            { name: "Mike R.", result: "Improved endurance 40%", time: "4 weeks" }
          ].map((testimonial, index) => (
            <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
              <div className="text-sm text-green-600 dark:text-green-400">{testimonial.result}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">in {testimonial.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 8: Personalized Plan Summary
function PlanSummaryStep({ data, nextStep, prevStep }: StepProps) {
  const getGoalLabel = (goal?: string) => {
    const goals: Record<string, string> = {
      'lose-weight': 'Weight Loss',
      'gain-muscle': 'Muscle Building',
      'tone-body': 'Body Toning',
      'increase-endurance': 'Endurance Building'
    };
    return goals[goal || ''] || 'Fitness';
  };

  const calculateWeeklyProgress = () => {
    if (data.primaryGoal === 'lose-weight') return '1-2 lbs lost';
    if (data.primaryGoal === 'gain-muscle') return '0.5-1 lb muscle gained';
    if (data.primaryGoal === 'tone-body') return '2-3% body fat reduced';
    return '10-15% endurance improved';
  };

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Your Personalized Plan is Ready!
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Here's your custom 4-week {getGoalLabel(data.primaryGoal)} transformation plan
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Plan Overview */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h3 className="text-2xl font-bold mb-4">
            4-Week {getGoalLabel(data.primaryGoal)} Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{data.availableTime || '30-45'}</div>
              <div className="text-blue-100">Minutes per workout</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">4-5</div>
              <div className="text-blue-100">Workouts per week</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{calculateWeeklyProgress()}</div>
              <div className="text-blue-100">Expected weekly progress</div>
            </div>
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((week) => (
            <div key={week} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Week {week}
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div>• Foundation building</div>
                <div>• Progressive intensity</div>
                <div>• Form perfection</div>
              </div>
              <div className="mt-4 text-xs text-blue-600 dark:text-blue-400 font-medium">
                {week === 1 && "Getting started"}
                {week === 2 && "Building momentum"}
                {week === 3 && "Pushing limits"}
                {week === 4 && "Transformation"}
              </div>
            </div>
          ))}
        </div>

        {/* Features Included */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            What's Included in Your Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '🎯', title: 'Personalized Workouts', desc: 'Tailored to your goals and fitness level' },
              { icon: '📊', title: 'Progress Tracking', desc: 'Monitor your transformation journey' },
              { icon: '🍎', title: 'Nutrition Guidance', desc: 'Meal plans and calorie targets' },
              { icon: '💬', title: '24/7 Support', desc: 'Expert guidance whenever you need it' }
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="text-2xl">{feature.icon}</div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{feature.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={nextStep}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 text-lg"
          >
            🚀 Unlock My Plan
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 9: Subscription Paywall
function SubscriptionPaywallStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const [selectedTier, setSelectedTier] = React.useState<'basic' | 'premium' | 'elite'>('premium');

  const tiers = [
    {
      id: 'basic' as const,
      name: 'Basic',
      price: 9.99,
      originalPrice: 19.99,
      savings: '50%',
      features: [
        'Personalized workout plan',
        'Basic progress tracking',
        'Email support'
      ],
      popular: false
    },
    {
      id: 'premium' as const,
      name: 'Premium',
      price: 19.99,
      originalPrice: 39.99,
      savings: '50%',
      features: [
        'Everything in Basic',
        'Advanced analytics',
        'Nutrition guidance',
        'Priority support',
        'Video demonstrations'
      ],
      popular: true
    },
    {
      id: 'elite' as const,
      name: 'Elite',
      price: 29.99,
      originalPrice: 59.99,
      savings: '50%',
      features: [
        'Everything in Premium',
        '1-on-1 coaching calls',
        'Custom meal plans',
        'Supplement recommendations',
        '24/7 chat support'
      ],
      popular: false
    }
  ];

  const handleSubscribe = () => {
    updateData({ subscriptionTier: selectedTier });
    nextStep();
  };

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <div className="text-6xl mb-6">🔓</div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Unlock Your Transformation
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Choose your plan and start your fitness journey today
        </p>

        {/* Limited Time Offer */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 max-w-md mx-auto">
          <div className="text-red-600 dark:text-red-400 font-bold">🔥 Limited Time Offer</div>
          <div className="text-sm text-red-700 dark:text-red-300">Save 50% on all plans - Today only!</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl border-2 p-8 transition-all duration-200 cursor-pointer ${
                selectedTier === tier.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-105'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300'
              } ${tier.popular ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedTier(tier.id)}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${tier.price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  Was ${tier.originalPrice}/month
                </div>
                <div className="text-green-600 dark:text-green-400 font-bold">
                  Save {tier.savings}!
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Weekly cost: ${(tier.price / 4).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 mb-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose FitnessApp?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-semibold text-gray-900 dark:text-white">Personalized</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Plans tailored to your goals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📱</div>
                <div className="font-semibold text-gray-900 dark:text-white">Convenient</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Workout anywhere, anytime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-semibold text-gray-900 dark:text-white">Proven Results</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">50K+ success stories</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleSubscribe}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 text-lg"
          >
            🚀 Start My Transformation - ${tiers.find(t => t.id === selectedTier)?.price}/month
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            30-day money-back guarantee • Cancel anytime • Secure payment
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 10: Conversion & Onboarding Complete
function ConversionCompleteStep({ data, onComplete, isSubmitting }: StepProps) {
  const [email, setEmail] = React.useState('');
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleComplete = async () => {
    setIsDownloading(true);
    // Simulate app download/installation process
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const selectedTier = data.subscriptionTier || 'premium';
  const tierLabels = {
    basic: 'Basic',
    premium: 'Premium',
    elite: 'Elite'
  };

  return (
    <div className="py-12 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-8xl mb-8 animate-bounce">🎉</div>

        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to FitnessApp!
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Congratulations! You've successfully subscribed to the {tierLabels[selectedTier]} plan.
          Your transformation journey starts now!
        </p>

        {/* Subscription Confirmation */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xl font-bold text-green-700 dark:text-green-300">
              Subscription Confirmed
            </span>
          </div>
          <div className="text-green-600 dark:text-green-400">
            {tierLabels[selectedTier]} Plan • Your personalized fitness journey awaits
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            What happens next?
          </h3>
          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Download the App</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Get the full FitnessApp experience on your mobile device
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Access Your Plan</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Your personalized workout plan is ready and waiting
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Start Your Journey</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Begin your first workout and track your progress
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email for App Link */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Get the app download link
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={() => {
                // Send email with app download link
                alert(`Download link sent to ${email}!`);
              }}
              disabled={!email}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Link
            </button>
          </div>
        </div>

        {/* App Store Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleComplete}
            disabled={isDownloading || isSubmitting}
            className="flex items-center justify-center space-x-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Opening App...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">📱</span>
                <span>Continue to App</span>
              </>
            )}
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          You can also access your account anytime at fitnessapp.com
        </p>
      </div>
    </div>
  );
}

export default PersonalizedOnboardingFunnel;
