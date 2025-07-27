import { useState, useCallback, useEffect } from 'react';
import { OnboardingData } from '../OnboardingWizard';

const STORAGE_KEY = 'fitness-app-onboarding-progress';
const TOTAL_STEPS = 9;

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
      
      case 7: // Plan summary (free plan generation)
        return !!data.generatedPlan;

      case 8: // Completion
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
      generatedPlan: plan
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
  const goal = data.primaryGoal || 'general-fitness';
  const fitnessLevel = data.fitnessLevel || 'beginner';
  const workoutDays = data.workoutDaysPerWeek || 3;

  // Plan templates based on goals
  const planTemplates = {
    'lose-weight': {
      title: 'Fat Burning Transformation',
      description: 'High-intensity workouts designed to maximize calorie burn and boost metabolism',
      exercises: [
        { name: 'Burpees', sets: '3', reps: '10-15', muscle: 'Full Body' },
        { name: 'Mountain Climbers', sets: '3', reps: '20', muscle: 'Core/Cardio' },
        { name: 'Jump Squats', sets: '3', reps: '15', muscle: 'Legs' },
        { name: 'Push-ups', sets: '3', reps: '8-12', muscle: 'Chest/Arms' },
        { name: 'Plank', sets: '3', reps: '30-60 sec', muscle: 'Core' },
        { name: 'High Knees', sets: '3', reps: '30 sec', muscle: 'Cardio' }
      ]
    },
    'gain-muscle': {
      title: 'Muscle Building Program',
      description: 'Progressive strength training to build lean muscle mass and increase strength',
      exercises: [
        { name: 'Squats', sets: '4', reps: '8-12', muscle: 'Legs' },
        { name: 'Push-ups/Bench Press', sets: '4', reps: '8-12', muscle: 'Chest' },
        { name: 'Deadlifts', sets: '4', reps: '6-10', muscle: 'Back/Legs' },
        { name: 'Pull-ups/Rows', sets: '3', reps: '6-10', muscle: 'Back' },
        { name: 'Overhead Press', sets: '3', reps: '8-12', muscle: 'Shoulders' },
        { name: 'Dips', sets: '3', reps: '8-15', muscle: 'Triceps' }
      ]
    },
    'tone-body': {
      title: 'Body Toning & Sculpting',
      description: 'Balanced workouts combining strength and cardio for a lean, toned physique',
      exercises: [
        { name: 'Bodyweight Squats', sets: '3', reps: '15-20', muscle: 'Legs' },
        { name: 'Push-ups', sets: '3', reps: '10-15', muscle: 'Chest/Arms' },
        { name: 'Lunges', sets: '3', reps: '12 each leg', muscle: 'Legs' },
        { name: 'Tricep Dips', sets: '3', reps: '10-15', muscle: 'Arms' },
        { name: 'Russian Twists', sets: '3', reps: '20', muscle: 'Core' },
        { name: 'Glute Bridges', sets: '3', reps: '15-20', muscle: 'Glutes' }
      ]
    },
    'increase-endurance': {
      title: 'Endurance & Stamina Builder',
      description: 'Cardiovascular and muscular endurance training for improved stamina',
      exercises: [
        { name: 'Jumping Jacks', sets: '4', reps: '30 sec', muscle: 'Cardio' },
        { name: 'Burpees', sets: '3', reps: '8-12', muscle: 'Full Body' },
        { name: 'Mountain Climbers', sets: '4', reps: '30 sec', muscle: 'Core/Cardio' },
        { name: 'Step-ups', sets: '3', reps: '15 each leg', muscle: 'Legs' },
        { name: 'Plank Hold', sets: '3', reps: '45-90 sec', muscle: 'Core' },
        { name: 'Wall Sit', sets: '3', reps: '30-60 sec', muscle: 'Legs' }
      ]
    },
    'general-fitness': {
      title: 'Complete Fitness Program',
      description: 'Well-rounded workouts for overall health, strength, and fitness',
      exercises: [
        { name: 'Squats', sets: '3', reps: '12-15', muscle: 'Legs' },
        { name: 'Push-ups', sets: '3', reps: '8-12', muscle: 'Chest/Arms' },
        { name: 'Plank', sets: '3', reps: '30-60 sec', muscle: 'Core' },
        { name: 'Lunges', sets: '3', reps: '10 each leg', muscle: 'Legs' },
        { name: 'Jumping Jacks', sets: '3', reps: '20', muscle: 'Cardio' },
        { name: 'Glute Bridges', sets: '3', reps: '15', muscle: 'Glutes' }
      ]
    }
  };

  const selectedTemplate = planTemplates[goal as keyof typeof planTemplates] || planTemplates['general-fitness'];

  return {
    title: selectedTemplate.title,
    description: selectedTemplate.description,
    workoutsPerWeek: workoutDays,
    duration: fitnessLevel === 'beginner' ? '4 weeks' : fitnessLevel === 'intermediate' ? '6 weeks' : '8 weeks',
    exercises: selectedTemplate.exercises
  };
}


