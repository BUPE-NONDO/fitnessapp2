import { useState, useCallback, useEffect } from 'react';
import { OnboardingData } from '../OnboardingWizard';

const STORAGE_KEY = 'fitness-app-onboarding-progress';
const TOTAL_STEPS = 10;

interface OnboardingFlowState {
  currentStep: number;
  data: OnboardingData;
  isValid: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
}

export function useOnboardingFlow(initialData?: Partial<OnboardingData>) {
  const [state, setState] = useState<OnboardingFlowState>(() => {
    // Try to restore from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedData = saved ? JSON.parse(saved) : null;
    
    const baseData: OnboardingData = {
      startedAt: new Date(),
      currentStep: 0,
      totalSteps: TOTAL_STEPS,
      ...initialData,
      ...savedData,
    };

    return {
      currentStep: savedData?.currentStep || 0,
      data: baseData,
      isValid: true,
      canGoNext: true,
      canGoBack: false,
    };
  });

  // Validation logic for each step
  const validateStep = useCallback((step: number, data: OnboardingData): boolean => {
    switch (step) {
      case 0: // Welcome step
        return true;
      
      case 1: // Age selection
        return !!data.ageRange;
      
      case 2: // Gender/Body type
        return !!data.gender;
      
      case 3: // Fitness goal
        return !!data.primaryGoal;
      
      case 4: // Body metrics
        return !!(data.currentWeight && data.height && data.weightUnit && data.heightUnit);
      
      case 5: // Preferences
        return !!(data.fitnessLevel && data.workoutEnvironment && data.availableTime && data.equipmentAccess && data.workoutDaysPerWeek);
      
      case 6: // Progress preview (loading step)
        return true;
      
      case 7: // Plan summary
        return !!data.personalizedPlan;
      
      case 8: // Subscription
        return !!data.selectedPlan;
      
      case 9: // Completion
        return true;
      
      default:
        return false;
    }
  }, []);

  // Update validation when data changes
  useEffect(() => {
    const isValid = validateStep(state.currentStep, state.data);
    const canGoNext = isValid && state.currentStep < TOTAL_STEPS - 1;
    const canGoBack = state.currentStep > 0;

    setState(prev => ({
      ...prev,
      isValid,
      canGoNext,
      canGoBack,
    }));
  }, [state.currentStep, state.data, validateStep]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        ...newData,
      },
    }));
  }, []);

  const nextStep = useCallback(async () => {
    if (!state.canGoNext) return;

    const nextStepIndex = state.currentStep + 1;
    
    // Special handling for step 6 (progress preview) - generate plan
    if (nextStepIndex === 7) {
      // Simulate plan generation
      await generatePersonalizedPlan(state.data);
    }

    setState(prev => ({
      ...prev,
      currentStep: nextStepIndex,
      data: {
        ...prev.data,
        currentStep: nextStepIndex,
      },
    }));
  }, [state.canGoNext, state.currentStep, state.data]);

  const previousStep = useCallback(() => {
    if (!state.canGoBack) return;

    const prevStepIndex = state.currentStep - 1;
    setState(prev => ({
      ...prev,
      currentStep: prevStepIndex,
      data: {
        ...prev.data,
        currentStep: prevStepIndex,
      },
    }));
  }, [state.canGoBack, state.currentStep]);

  const resetFlow = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      currentStep: 0,
      data: {
        startedAt: new Date(),
        currentStep: 0,
        totalSteps: TOTAL_STEPS,
      },
      isValid: true,
      canGoNext: true,
      canGoBack: false,
    });
  }, []);

  const saveProgress = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  }, [state.data]);

  const jumpToStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= TOTAL_STEPS) return;
    
    setState(prev => ({
      ...prev,
      currentStep: stepIndex,
      data: {
        ...prev.data,
        currentStep: stepIndex,
      },
    }));
  }, []);

  // Generate personalized plan based on user data
  const generatePersonalizedPlan = async (data: OnboardingData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const plan = createPersonalizedPlan(data);
    
    updateData({
      personalizedPlan: plan,
    });
  };

  return {
    currentStep: state.currentStep,
    data: state.data,
    isValid: state.isValid,
    canGoNext: state.canGoNext,
    canGoBack: state.canGoBack,
    nextStep,
    previousStep,
    updateData,
    resetFlow,
    saveProgress,
    jumpToStep,
  };
}

// Helper function to create personalized plan
function createPersonalizedPlan(data: OnboardingData) {
  const { primaryGoal, currentWeight, targetWeight, fitnessLevel, workoutDaysPerWeek, availableTime } = data;
  
  // Calculate projected results based on goal and user data
  let weightChange = 0;
  let timeframe = 4; // weeks
  
  if (primaryGoal === 'lose-weight' && currentWeight && targetWeight) {
    weightChange = targetWeight - currentWeight;
    // Safe weight loss: 0.5-1kg per week
    timeframe = Math.max(4, Math.abs(weightChange) / 0.75);
  } else if (primaryGoal === 'gain-muscle') {
    weightChange = 2; // 2kg muscle gain in 4 weeks (optimistic)
    timeframe = 4;
  }

  // Create weekly schedule based on preferences
  const workoutTypes = getWorkoutTypes(primaryGoal, fitnessLevel);
  const weeklySchedule = createWeeklySchedule(workoutDaysPerWeek || 4, workoutTypes, availableTime || 30);

  return {
    planId: `plan_${Date.now()}`,
    duration: Math.round(timeframe),
    projectedResults: {
      weightChange: Math.round(weightChange * 10) / 10,
      timeframe: Math.round(timeframe),
    },
    weeklySchedule,
  };
}

function getWorkoutTypes(goal?: string, level?: string) {
  const baseTypes = ['Strength Training', 'Cardio', 'Flexibility'];
  
  switch (goal) {
    case 'lose-weight':
      return ['HIIT Cardio', 'Strength Training', 'Active Recovery'];
    case 'gain-muscle':
      return ['Strength Training', 'Hypertrophy', 'Recovery'];
    case 'tone-body':
      return ['Circuit Training', 'Strength Training', 'Cardio'];
    case 'increase-endurance':
      return ['Cardio', 'Interval Training', 'Recovery'];
    default:
      return baseTypes;
  }
}

function createWeeklySchedule(daysPerWeek: number, workoutTypes: string[], duration: number) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const schedule = [];
  
  for (let i = 0; i < daysPerWeek; i++) {
    schedule.push({
      day: days[i],
      workoutType: workoutTypes[i % workoutTypes.length],
      duration,
      intensity: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
    });
  }
  
  return schedule;
}
