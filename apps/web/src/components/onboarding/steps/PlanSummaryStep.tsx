import { OnboardingData } from '../OnboardingWizard';
import { useEffect, useState } from 'react';

interface PlanSummaryStepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
}

export function PlanSummaryStep({ data, onUpdate, onNext }: PlanSummaryStepProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  // Generate free workout plan based on user data (only once)
  useEffect(() => {
    // Only generate if we don't already have a plan
    if (generatedPlan || data.generatedPlan) {
      setIsGenerating(false);
      if (data.generatedPlan && !generatedPlan) {
        setGeneratedPlan(data.generatedPlan);
      }
      return;
    }

    const generateFreePlan = async () => {
      setIsGenerating(true);

      // Simulate plan generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const plan = createPersonalizedPlan(data);
      setGeneratedPlan(plan);

      // Update onboarding data with generated plan
      onUpdate({
        generatedPlan: plan,
        workoutPlan: plan // Also store in workoutPlan for compatibility
      });

      setIsGenerating(false);
    };

    generateFreePlan();
  }, []); // Remove dependencies to prevent infinite loop

  const createPersonalizedPlan = (userData: OnboardingData) => {
    const goal = userData.primaryGoal || 'general-fitness';
    const fitnessLevel = userData.fitnessLevel || 'beginner';
    const workoutDays = userData.workoutDaysPerWeek || 3;

    // Plan templates based on goals
    const planTemplates = {
      'lose-weight': {
        title: 'Fat Burning Transformation',
        description: 'High-intensity workouts designed to maximize calorie burn and boost metabolism',
        focus: 'Cardio + Strength Training',
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
        focus: 'Strength Training + Progressive Overload',
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
        focus: 'Circuit Training + Bodyweight',
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
        focus: 'Cardio + Endurance Training',
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
        focus: 'Balanced Training',
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
      focus: selectedTemplate.focus,
      exercises: selectedTemplate.exercises,
      difficulty: fitnessLevel,
      estimatedDuration: '30-45 minutes per workout'
    };
  };

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-6xl mb-6">🎯</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Creating Your Free Personalized Plan...
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Analyzing your goals and preferences to create the perfect workout plan for you.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>

          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Analyzing your fitness goals...
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Selecting optimal exercises...
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
              Customizing workout intensity...
            </div>
            <div className="flex items-center text-sm text-gray-400 dark:text-gray-500">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
              Finalizing your plan...
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🎉 Good News!
          </h3>
          <p className="text-blue-800 dark:text-blue-200">
            Your personalized workout plan is completely FREE! No subscription required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Your FREE Personalized Plan is Ready!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Based on your goals and preferences, we've created the perfect fitness plan for you - completely free!
        </p>
      </div>

      {generatedPlan && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {generatedPlan.title}
            </h2>
            <div className="text-lg text-blue-600 dark:text-blue-400 font-semibold mb-2">
              {generatedPlan.workoutsPerWeek} workouts per week • {generatedPlan.duration}
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {generatedPlan.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Plan Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Focus:</span>
                  <span className="font-medium">{generatedPlan.focus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                  <span className="font-medium capitalize">{generatedPlan.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium">{generatedPlan.estimatedDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                  <span className="font-medium">{generatedPlan.workoutsPerWeek}x per week</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Sample Exercises</h3>
              <div className="space-y-3">
                {generatedPlan.exercises.slice(0, 4).map((exercise: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{exercise.muscle}</div>
                    </div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {exercise.sets} × {exercise.reps}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">What's Included (FREE)</h3>
            <div className="space-y-3">
              {[
                'Complete personalized workout plan',
                'Exercise instructions and form tips',
                'Progress tracking tools',
                'Workout scheduling',
                'Achievement badges',
                'Community support'
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mt-8">
            <div className="text-center">
              <div className="text-3xl mb-3">🎉</div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                100% FREE - No Payment Required!
              </h3>
              <p className="text-green-800 dark:text-green-200 text-sm mb-4">
                Your complete personalized workout plan is ready to use immediately. Start your fitness journey today!
              </p>
              <button
                onClick={onNext}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Continue to Dashboard →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Ready to Start Your Transformation?
          </h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
            Your personalized plan is completely free and ready to use!
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
