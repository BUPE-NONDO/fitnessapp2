import { useState, useEffect } from 'react';
import { useOnboardingFlow } from './hooks/useOnboardingFlow';
import { ProgressIndicator } from './components/ProgressIndicator';
import { OnboardingProgress } from './OnboardingProgress';
import { StepNavigation } from './components/StepNavigation';
import { IsolatedOnboardingService } from '@/services/isolatedOnboardingService';
import { useUser } from '@/hooks/useUser';

// Step Components
import { WelcomeStep } from './steps/WelcomeStep';
import { AgeSelectionStep } from './steps/AgeSelectionStep';
import { GenderBodyTypeStep } from './steps/GenderBodyTypeStep';
import { FitnessGoalStep } from './steps/FitnessGoalStep';
import { BodyMetricsStep } from './steps/BodyMetricsStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { ProgressPreviewStep } from './steps/ProgressPreviewStep';
import { PlanSummaryStep } from './steps/PlanSummaryStep';
import { CompletionStep } from './steps/CompletionStep';

export interface OnboardingData {
  // Step 2: Age Selection
  ageRange?: '18-29' | '30-39' | '40-49' | '50+';
  
  // Step 3: Gender/Body Type
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  bodyType?: 'ectomorph' | 'mesomorph' | 'endomorph';
  
  // Step 4: Primary Goal
  primaryGoal?: 'lose-weight' | 'gain-muscle' | 'tone-body' | 'increase-endurance' | 'improve-flexibility' | 'general-fitness';
  
  // Step 5: Body Metrics
  currentWeight?: number;
  targetWeight?: number;
  height?: number;
  weightUnit?: 'kg' | 'lbs';
  heightUnit?: 'cm' | 'ft-in';
  bodyFatPercentage?: number;
  
  // Step 6: Experience & Preferences
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  workoutEnvironment?: 'home' | 'gym' | 'outdoor' | 'mixed';
  availableTime?: '15-30' | '30-45' | '45-60' | '60+';
  equipmentAccess?: 'none' | 'basic' | 'full-gym';
  workoutDaysPerWeek?: number;
  
  // Step 7: Generated Plan Data
  personalizedPlan?: {
    planId: string;
    duration: number;
    projectedResults: {
      weightChange: number;
      timeframe: number;
    };
    weeklySchedule: Array<{
      day: string;
      workoutType: string;
      duration: number;
      intensity: 'low' | 'medium' | 'high';
    }>;
  };
  
  // Step 8-9: Free Plan Generation
  generatedPlan?: {
    title: string;
    description: string;
    workoutsPerWeek: number;
    duration: string;
    exercises: Array<{
      name: string;
      sets: string;
      reps: string;
      muscle: string;
    }>;
  };
  
  // Metadata
  startedAt: Date;
  completedAt?: Date;
  currentStep: number;
  totalSteps: number;
}

const TOTAL_STEPS = 9;

const STEP_COMPONENTS = [
  WelcomeStep,           // Step 1
  AgeSelectionStep,      // Step 2
  GenderBodyTypeStep,    // Step 3
  FitnessGoalStep,       // Step 4
  BodyMetricsStep,       // Step 5
  PreferencesStep,       // Step 6
  ProgressPreviewStep,   // Step 7
  PlanSummaryStep,       // Step 8
  CompletionStep,        // Step 9 (Free plan completion)
];

interface OnboardingWizardProps {
  onComplete?: (data: OnboardingData) => void;
  onExit?: () => void;
  initialData?: Partial<OnboardingData>;
}

export function OnboardingWizard({
  onComplete,
  onExit,
  initialData
}: OnboardingWizardProps) {
  const { user } = useUser();
  const {
    currentStep,
    data,
    isValid,
    canGoNext,
    canGoBack,
    nextStep,
    previousStep,
    updateData,
    resetFlow,
    saveProgress
  } = useOnboardingFlow(initialData);

  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-save progress periodically using isolated service
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user && data && currentStep > 0) {
        try {
          await IsolatedOnboardingService.updateOnboardingProgress(user.uid, currentStep, data);
          saveProgress(); // Also save to localStorage
        } catch (error) {
          console.warn('Failed to save onboarding progress:', error);
        }
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [user, data, currentStep, saveProgress]);

  const handleNext = async () => {
    if (!canGoNext || isTransitioning) return;

    setIsTransitioning(true);
    
    try {
      await nextStep();
      
      // If we've completed all steps, call onComplete
      if (currentStep >= TOTAL_STEPS - 1) {
        onComplete?.(data);
      }
    } catch (error) {
      console.error('Error proceeding to next step:', error);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleBack = () => {
    if (!canGoBack || isTransitioning) return;
    previousStep();
  };

  const handleExit = () => {
    saveProgress();
    onExit?.();
  };

  const handleStepUpdate = async (stepData: Partial<OnboardingData>) => {
    updateData(stepData);

    // Save progress to isolated service
    if (user && currentStep > 0) {
      try {
        await IsolatedOnboardingService.updateOnboardingProgress(user.uid, currentStep, { ...data, ...stepData });
      } catch (error) {
        console.warn('Failed to save step progress:', error);
      }
    }
  };

  // Get current step component with bounds checking
  const safeCurrentStep = Math.max(0, Math.min(currentStep, STEP_COMPONENTS.length - 1));
  const CurrentStepComponent = STEP_COMPONENTS[safeCurrentStep];

  if (!CurrentStepComponent) {
    console.error(`No component found for step ${currentStep} (safe: ${safeCurrentStep}), total components: ${STEP_COMPONENTS.length}`);
    return null;
  }

  // Debug logging
  console.log(`Rendering step ${currentStep} (safe: ${safeCurrentStep}) of ${TOTAL_STEPS}`);

  // If currentStep is out of bounds, reset to safe value
  if (currentStep !== safeCurrentStep) {
    console.warn(`Step ${currentStep} out of bounds, resetting to ${safeCurrentStep}`);
    // Don't update here to avoid infinite loops, just use the safe value
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-primary-100 dark:from-gray-900 dark:to-purple-900/20 relative overflow-hidden">
      {/* Circle decorations */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-primary-300/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100/10 to-primary-200/10 rounded-full blur-3xl"></div>
      {/* Header with Progress */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExit}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label="Exit onboarding"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Build Your Perfect Body
              </h1>
            </div>
            
            <OnboardingProgress
              currentStep={currentStep + 1}
              totalSteps={TOTAL_STEPS}
              stepTitles={[
                'Welcome',
                'Age',
                'Profile',
                'Goals',
                'Metrics',
                'Preferences',
                'Preview',
                'Summary',
                'Plan',
                'Complete'
              ]}
              className="hidden sm:block"
            />
          </div>

          {/* Mobile Progress Bar */}
          <div className="mt-3 sm:hidden">
            <OnboardingProgress
              currentStep={currentStep + 1}
              totalSteps={TOTAL_STEPS}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`
          transition-all duration-300 ease-in-out
          ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        `}>
          <CurrentStepComponent
            data={data}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onBack={handleBack}
            isValid={isValid}
            canGoNext={canGoNext}
            canGoBack={canGoBack}
          />
        </div>
      </div>

      {/* Footer Navigation */}
      {currentStep > 0 && currentStep < TOTAL_STEPS - 1 && (
        <div className="sticky bottom-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <StepNavigation
              canGoBack={canGoBack}
              canGoNext={canGoNext}
              isLoading={isTransitioning}
              onBack={handleBack}
              onNext={handleNext}
              nextLabel={currentStep === TOTAL_STEPS - 2 ? 'Complete' : 'Continue'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
