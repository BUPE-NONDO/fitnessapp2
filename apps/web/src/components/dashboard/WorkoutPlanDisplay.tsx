import React, { useState, useEffect } from 'react';
import { useUserWorkoutPlan } from '@/hooks/useUserWorkoutPlan';
import { useOnboarding } from '@/hooks/useOnboarding';
import { WorkoutPlan } from '@/services/userWorkoutPlanService';
import { WorkoutSession } from '@/components/workout/WorkoutSession';
import { ProgressTrackingService } from '@/services/progressTrackingService';
import { useUser } from '@/hooks/useUser';

interface WorkoutPlanDisplayProps {
  className?: string;
  onWorkoutComplete?: () => void;
}

export function WorkoutPlanDisplay({ className = '', onWorkoutComplete }: WorkoutPlanDisplayProps) {
  const { currentPlan, isLoading, hasWorkoutPlan, refreshPlans } = useUserWorkoutPlan();
  const { triggerOnboarding } = useOnboarding();
  const { user } = useUser();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showWorkoutSession, setShowWorkoutSession] = useState(false);
  const [showFullPlan, setShowFullPlan] = useState(false);

  // Get today's workout
  const todaysWorkout = currentPlan?.weeklySchedule?.[currentDayIndex];
  const todaysExercises = todaysWorkout?.exercises || [];

  const handleStartWorkout = () => {
    setShowWorkoutSession(true);
  };

  const handleWorkoutComplete = async (sessionData: any) => {
    if (user && sessionData) {
      try {
        // Track the completed workout
        await ProgressTrackingService.trackWorkoutCompletion(
          user.uid,
          sessionData.id,
          sessionData.name,
          sessionData.exercises?.length || 0,
          sessionData.duration || 30
        );
      } catch (error) {
        console.error('Error tracking workout completion:', error);
      }
    }

    setShowWorkoutSession(false);
    // Refresh plans to update progress
    refreshPlans();
    // Refresh dashboard progress stats
    onWorkoutComplete?.();
  };

  const handleWorkoutClose = () => {
    setShowWorkoutSession(false);
  };

  const handleContinueWeek = () => {
    if (currentPlan?.weeklySchedule && currentDayIndex < currentPlan.weeklySchedule.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    } else if (currentPlan?.weeklySchedule) {
      // Reset to first day if at the end
      setCurrentDayIndex(0);
    }
  };

  // Convert current plan to workout session format
  const convertToWorkoutSession = () => {
    // Default workout if no plan is available
    const defaultExercises = [
      { name: "Push-ups", duration: 180, rest: 60, description: "Classic upper body exercise", tips: ["Keep your body straight", "Lower chest to ground", "Push up explosively"] },
      { name: "Squats", duration: 180, rest: 60, description: "Lower body strength exercise", tips: ["Keep feet shoulder-width apart", "Lower until thighs parallel", "Drive through heels"] },
      { name: "Plank", duration: 180, rest: 60, description: "Core strengthening exercise", tips: ["Keep body straight", "Engage core muscles", "Breathe steadily"] },
      { name: "Lunges", duration: 180, rest: 60, description: "Single-leg strength exercise", tips: ["Step forward with control", "Lower back knee toward ground", "Push back to start"] },
      { name: "Mountain Climbers", duration: 180, rest: 60, description: "Full-body cardio exercise", tips: ["Start in plank position", "Alternate bringing knees to chest", "Keep core engaged"] }
    ];

    if (!currentPlan || !todaysWorkout) {
      return {
        id: 'quick-start-workout',
        name: 'Quick Start Workout',
        description: 'A basic full-body workout to get you started',
        difficulty: 'beginner',
        duration: 15,
        exercises: defaultExercises
      };
    }

    return {
      id: currentPlan.id,
      name: todaysWorkout.name || `${currentPlan.name} - Day ${currentDayIndex + 1}`,
      description: currentPlan.description,
      difficulty: currentPlan.difficulty,
      duration: Math.ceil(todaysExercises.reduce((total, ex) => total + (ex.duration || 180), 0) / 60),
      exercises: todaysExercises.map(exercise => ({
        name: exercise.name,
        duration: exercise.duration || 180, // 3 minutes default
        rest: exercise.restTime || 60, // 1 minute rest default
        description: exercise.description,
        tips: exercise.instructions ? [exercise.instructions] : []
      }))
    };
  };

  const handleNextExercise = () => {
    if (todaysExercises && currentExerciseIndex < todaysExercises.length - 1) {
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

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Loading Your Workout Plan...
          </h3>
          <p className="text-white/80">
            Please wait while we fetch your personalized workout plan.
          </p>
        </div>
      </div>
    );
  }

  // No workout plan state - but still show Start Workout button
  if (!hasWorkoutPlan || !currentPlan) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        {/* Plan Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Quick Start Workout
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Start with a basic workout while we prepare your personalized plan
            </p>
          </div>
          <div className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            FREE
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 space-y-3">
          <button
            onClick={handleStartWorkout}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
          >
            🚀 Start Quick Workout
          </button>

          <button
            onClick={triggerOnboarding}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-base"
          >
            📋 Get Personalized Plan
          </button>
        </div>

        <div className="text-center mb-4">
          <div className="text-4xl mb-4">🏋️‍♂️</div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Get Your Personalized Plan
          </h4>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Complete onboarding for a customized workout plan tailored to your goals.
          </p>
          <button
            onClick={triggerOnboarding}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    );
  }

  if (isWorkoutStarted && todaysExercises.length > 0) {
    const currentExercise = todaysExercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex + 1) / todaysExercises.length) * 100;

    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        {/* Workout Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Workout in Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Exercise {currentExerciseIndex + 1} of {todaysExercises.length}
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {currentPlan.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {currentPlan.description}
          </p>
        </div>
        <div className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
          FREE
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 space-y-3">
        <button
          onClick={handleStartWorkout}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
        >
          🚀 Start Workout Now
        </button>

        {/* Continue Week Button - Only show if there are multiple days */}
        {currentPlan?.weeklySchedule && currentPlan.weeklySchedule.length > 1 && (
          <button
            onClick={handleContinueWeek}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-base"
          >
            📅 Continue Week ({currentDayIndex + 1}/{currentPlan.weeklySchedule.length})
          </button>
        )}
      </div>

      {/* Plan Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentPlan.workoutsPerWeek}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">per week</div>
        </div>
        <div className="text-center bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentPlan.duration} weeks
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">duration</div>
        </div>
        <div className="text-center bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
          <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {currentPlan.fitnessLevel}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">difficulty</div>
        </div>
        <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
          <div className="text-2xl font-bold text-white">
            {todaysExercises.length}
          </div>
          <div className="text-sm text-purple-100">today's exercises</div>
        </div>
      </div>

      {/* Day Selector */}
      {currentPlan.weeklySchedule && currentPlan.weeklySchedule.length > 1 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Select Workout Day</h4>
          <div className="flex flex-wrap gap-2">
            {currentPlan.weeklySchedule.map((day, index) => (
              <button
                key={index}
                onClick={() => setCurrentDayIndex(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentDayIndex === index
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                }`}
              >
                {day.dayOfWeek}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Preview */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          {todaysWorkout ? `${todaysWorkout.name} - ${todaysWorkout.dayOfWeek}` : "Today's Exercises"}
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {todaysExercises.length > 0 ? todaysExercises.slice(0, 6).map((exercise, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{exercise.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{exercise.muscle}</div>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                {exercise.sets} sets × {exercise.reps}
              </div>
            </div>
          )) : (
            // Default exercises when none are available
            [
              { name: "Push-ups", muscle: "Chest, Arms", sets: 3, reps: "10-15" },
              { name: "Squats", muscle: "Legs, Glutes", sets: 3, reps: "15-20" },
              { name: "Plank", muscle: "Core", sets: 3, reps: "30-60s" },
              { name: "Lunges", muscle: "Legs, Glutes", sets: 3, reps: "10 each leg" },
              { name: "Mountain Climbers", muscle: "Full Body", sets: 3, reps: "20-30" },
              { name: "Burpees", muscle: "Full Body", sets: 2, reps: "5-10" }
            ].map((exercise, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{exercise.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{exercise.muscle}</div>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                  {exercise.sets} sets × {exercise.reps}
                </div>
              </div>
            ))
          )}
          {todaysExercises.length > 6 && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-300 py-2">
              +{todaysExercises.length - 6} more exercises
            </div>
          )}
        </div>
      </div>

      {/* Secondary Action Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowFullPlan(!showFullPlan)}
          className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          📋 {showFullPlan ? 'Hide Full Plan' : 'View Full Plan'}
        </button>
      </div>

      {/* Tips */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Quick Tips</h5>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• Warm up for 5-10 minutes before starting</li>
          <li>• Focus on proper form over speed</li>
          <li>• Stay hydrated throughout your workout</li>
          <li>• Rest 30-60 seconds between sets</li>
        </ul>
      </div>

      {/* Full Weekly Plan */}
      {showFullPlan && (
        <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            📅 Weekly Workout Schedule
          </h4>

          {currentPlan?.weeklySchedule && currentPlan.weeklySchedule.length > 0 ? (
            <div className="space-y-4">
              {currentPlan.weeklySchedule.map((day, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {day.dayOfWeek} - {day.name}
                    </h5>
                    <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {day.exercises?.length || 0} exercises
                    </span>
                  </div>

                  {day.exercises && day.exercises.length > 0 ? (
                    <div className="grid gap-2">
                      {day.exercises.map((exercise, exerciseIndex) => (
                        <div key={exerciseIndex} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300">
                          <div>
                            <span className="text-gray-900 dark:text-white font-medium">{exercise.name}</span>
                            <span className="text-gray-600 dark:text-gray-300 text-sm ml-2">({exercise.muscle})</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {exercise.sets} sets × {exercise.reps}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Rest day or no exercises planned</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📋</div>
              <h5 className="text-gray-900 dark:text-white font-semibold mb-2">Default Weekly Plan</h5>
              <div className="space-y-3">
                {[
                  { day: "Monday", focus: "Upper Body", exercises: ["Push-ups", "Pull-ups", "Shoulder Press"] },
                  { day: "Tuesday", focus: "Lower Body", exercises: ["Squats", "Lunges", "Calf Raises"] },
                  { day: "Wednesday", focus: "Core & Cardio", exercises: ["Plank", "Mountain Climbers", "Burpees"] },
                  { day: "Thursday", focus: "Full Body", exercises: ["Deadlifts", "Push-ups", "Squats"] },
                  { day: "Friday", focus: "Cardio", exercises: ["Jumping Jacks", "High Knees", "Running"] },
                  { day: "Saturday", focus: "Flexibility", exercises: ["Yoga", "Stretching", "Mobility"] },
                  { day: "Sunday", focus: "Rest", exercises: ["Active Recovery", "Light Walking"] }
                ].map((day, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-900 dark:text-white font-medium">{day.day}</span>
                        <span className="text-gray-600 dark:text-gray-300 text-sm ml-2">- {day.focus}</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {day.exercises.join(", ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workout Session Modal */}
      {showWorkoutSession && (
        <WorkoutSession
          workoutPlan={convertToWorkoutSession()}
          onComplete={handleWorkoutComplete}
          onClose={handleWorkoutClose}
        />
      )}
    </div>
  );
}

export default WorkoutPlanDisplay;
