import React, { useState } from 'react';
import { WorkoutTimer } from './WorkoutTimer';
import { Icon } from '@/components/ui/Icon';

interface Exercise {
  name: string;
  duration: number;
  rest?: number;
  description?: string;
  tips?: string[];
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // total duration in minutes
  exercises: Exercise[];
}

interface WorkoutSessionProps {
  workoutPlan?: WorkoutPlan;
  onComplete?: (sessionData: any) => void;
  onClose?: () => void;
}

export function WorkoutSession({ 
  workoutPlan,
  onComplete,
  onClose 
}: WorkoutSessionProps) {
  const [showTimer, setShowTimer] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  // Default workout plan if none provided
  const defaultPlan: WorkoutPlan = {
    id: 'default-beginner',
    name: 'Beginner Full Body Workout',
    description: 'A gentle introduction to fitness with basic exercises',
    difficulty: 'beginner',
    duration: 25,
    exercises: [
      {
        name: 'Warm Up',
        duration: 300, // 5 minutes
        description: 'Light stretching and movement to prepare your body',
        tips: ['Start slowly', 'Focus on breathing', 'Gentle movements only']
      },
      {
        name: 'Push-ups (Modified)',
        duration: 180, // 3 minutes
        rest: 60,
        description: 'Modified push-ups from knees or wall',
        tips: ['Keep core engaged', 'Control the movement', 'Modify as needed']
      },
      {
        name: 'Bodyweight Squats',
        duration: 180, // 3 minutes
        rest: 60,
        description: 'Basic squats focusing on form',
        tips: ['Feet shoulder-width apart', 'Keep chest up', 'Go at your own pace']
      },
      {
        name: 'Plank Hold',
        duration: 120, // 2 minutes
        rest: 60,
        description: 'Hold plank position for strength',
        tips: ['Keep body straight', 'Breathe normally', 'Modify on knees if needed']
      },
      {
        name: 'Marching in Place',
        duration: 180, // 3 minutes
        rest: 60,
        description: 'Light cardio to get heart rate up',
        tips: ['Lift knees high', 'Swing arms naturally', 'Maintain steady pace']
      },
      {
        name: 'Cool Down Stretch',
        duration: 300, // 5 minutes
        description: 'Gentle stretching to end the session',
        tips: ['Hold each stretch', 'Breathe deeply', 'Relax and unwind']
      }
    ]
  };

  const plan = workoutPlan || defaultPlan;

  const handleStartWorkout = () => {
    setSessionStarted(true);
    setShowTimer(true);
  };

  const handleTimerComplete = () => {
    setShowTimer(false);
    
    // Create session data
    const sessionData = {
      workoutId: plan.id,
      workoutName: plan.name,
      completedAt: new Date(),
      duration: plan.duration,
      exercises: plan.exercises.length,
      difficulty: plan.difficulty
    };

    onComplete?.(sessionData);
  };

  const handleTimerClose = () => {
    setShowTimer(false);
    if (!sessionStarted) {
      onClose?.();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const totalDuration = plan.exercises.reduce((total, exercise) => {
    return total + exercise.duration + (exercise.rest || 0);
  }, 0);

  if (showTimer) {
    return (
      <WorkoutTimer
        workoutName={plan.name}
        exercises={plan.exercises}
        onComplete={handleTimerComplete}
        onClose={handleTimerClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <Icon name="x" size={24} />
          </button>
          
          <div className="pr-12">
            <h1 className="text-2xl font-bold mb-2">{plan.name}</h1>
            <p className="text-purple-100 mb-4">{plan.description}</p>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Icon name="clock" size={16} />
                <span>{Math.ceil(totalDuration / 60)} minutes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="activity" size={16} />
                <span>{plan.exercises.length} exercises</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(plan.difficulty)}`}>
                {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="p-6 overflow-y-auto max-h-96">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Breakdown</h3>
          
          <div className="space-y-4">
            {plan.exercises.map((exercise, index) => (
              <div key={index} className="border border-gray-200 rounded-2xl p-4 hover:border-purple-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                      <div className="text-sm text-gray-500">
                        {Math.floor(exercise.duration / 60)}:{(exercise.duration % 60).toString().padStart(2, '0')}
                        {exercise.rest && ` + ${exercise.rest}s rest`}
                      </div>
                    </div>
                  </div>
                </div>
                
                {exercise.description && (
                  <p className="text-sm text-gray-600 mb-2 ml-11">{exercise.description}</p>
                )}
                
                {exercise.tips && exercise.tips.length > 0 && (
                  <div className="ml-11">
                    <div className="text-xs text-gray-500 mb-1">Tips:</div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {exercise.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start space-x-1">
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Exercise</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Rest</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleStartWorkout}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              <Icon name="play" size={20} />
              <span>Start Workout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
