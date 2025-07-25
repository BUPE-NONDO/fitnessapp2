import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';

interface WorkoutPlan {
  title: string;
  description: string;
  workoutsPerWeek: number;
  duration: string;
  focus: string;
  difficulty: string;
  estimatedDuration: string;
  exercises: Array<{
    name: string;
    sets: string;
    reps: string;
    muscle: string;
  }>;
}

interface WorkoutPlanDisplayProps {
  className?: string;
}

export function WorkoutPlanDisplay({ className = '' }: WorkoutPlanDisplayProps) {
  const { userProfile } = useUser();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);

  useEffect(() => {
    // Get workout plan from user profile
    if (userProfile?.onboardingData?.workoutPlan) {
      setWorkoutPlan(userProfile.onboardingData.workoutPlan);
    } else if (userProfile?.generatedPlan) {
      setWorkoutPlan(userProfile.generatedPlan);
    }
  }, [userProfile]);

  const handleStartWorkout = () => {
    setIsWorkoutStarted(true);
    setCurrentExerciseIndex(0);
  };

  const handleNextExercise = () => {
    if (workoutPlan && currentExerciseIndex < workoutPlan.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Workout completed
      setIsWorkoutStarted(false);
      setCurrentExerciseIndex(0);
      alert('🎉 Workout completed! Great job!');
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleEndWorkout = () => {
    setIsWorkoutStarted(false);
    setCurrentExerciseIndex(0);
  };

  if (!workoutPlan) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">🏋️‍♂️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Workout Plan Available
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Complete your onboarding to get a personalized workout plan.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Start Onboarding
          </button>
        </div>
      </div>
    );
  }

  if (isWorkoutStarted) {
    const currentExercise = workoutPlan.exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex + 1) / workoutPlan.exercises.length) * 100;

    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        {/* Workout Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Workout in Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Exercise {currentExerciseIndex + 1} of {workoutPlan.exercises.length}
            </p>
          </div>
          <button
            onClick={handleEndWorkout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            End Workout
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Current Exercise */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
          <div className="text-center">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentExercise.name}
            </h4>
            <div className="text-lg text-blue-600 dark:text-blue-400 font-semibold mb-2">
              {currentExercise.sets} sets × {currentExercise.reps}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Target: {currentExercise.muscle}
            </div>
            
            {/* Exercise Instructions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-left">
              <h5 className="font-semibold mb-2">Instructions:</h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Perform {currentExercise.reps} repetitions for {currentExercise.sets} sets. 
                Rest 30-60 seconds between sets. Focus on proper form over speed.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleNextExercise}
            className="bg-gradient-to-r from-purple-500 to-primary-600 hover:from-purple-600 hover:to-primary-700 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-circle"
          >
            {currentExerciseIndex === workoutPlan.exercises.length - 1 ? 'Complete Workout' : 'Next Exercise'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Plan Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {workoutPlan.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {workoutPlan.description}
          </p>
        </div>
        <div className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
          FREE
        </div>
      </div>

      {/* Plan Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {workoutPlan.workoutsPerWeek}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">per week</div>
        </div>
        <div className="text-center bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-4">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {workoutPlan.duration}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">duration</div>
        </div>
        <div className="text-center bg-accent-50 dark:bg-accent-900/20 rounded-2xl p-4">
          <div className="text-2xl font-bold text-accent-600 dark:text-accent-400 capitalize">
            {workoutPlan.difficulty}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">difficulty</div>
        </div>
        <div className="text-center bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {workoutPlan.exercises.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">exercises</div>
        </div>
      </div>

      {/* Exercise Preview */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Today's Exercises</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {workoutPlan.exercises.slice(0, 6).map((exercise, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{exercise.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{exercise.muscle}</div>
              </div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {exercise.sets} × {exercise.reps}
              </div>
            </div>
          ))}
          {workoutPlan.exercises.length > 6 && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
              +{workoutPlan.exercises.length - 6} more exercises
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleStartWorkout}
          className="flex-1 bg-gradient-to-r from-purple-500 to-primary-600 hover:from-purple-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-2xl transition-colors shadow-circle hover:shadow-circle-lg transform hover:scale-105"
        >
          🚀 Start Workout
        </button>
        <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-2xl transition-colors shadow-circle">
          📋 View Full Plan
        </button>
      </div>

      {/* Tips */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Quick Tips</h5>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Warm up for 5-10 minutes before starting</li>
          <li>• Focus on proper form over speed</li>
          <li>• Stay hydrated throughout your workout</li>
          <li>• Rest 30-60 seconds between sets</li>
        </ul>
      </div>
    </div>
  );
}

export default WorkoutPlanDisplay;
