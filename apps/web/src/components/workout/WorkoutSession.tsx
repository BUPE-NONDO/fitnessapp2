import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { WorkoutRoutineService, WorkoutSession, Exercise } from '@/services/workoutRoutineService';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface WorkoutSessionProps {
  sessionId?: string;
  onComplete?: () => void;
  className?: string;
}

export function WorkoutSessionComponent({ sessionId, onComplete, className = '' }: WorkoutSessionProps) {
  const { user } = useUser();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    } else {
      startNewSession();
    }
  }, [sessionId, user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  const startNewSession = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const routine = await WorkoutRoutineService.getUserRoutine(user.uid);
      if (!routine) throw new Error('No active routine found');

      const newSession = await WorkoutRoutineService.startWorkoutSession(user.uid, routine.id);
      setSession(newSession);
      setStartTime(new Date());
      
      // Load exercise details
      const exerciseMap: Record<string, Exercise> = {};
      for (const exercise of newSession.exercises) {
        const exerciseDetail = WorkoutRoutineService.getExerciseById(exercise.exerciseId);
        if (exerciseDetail) {
          exerciseMap[exercise.exerciseId] = exerciseDetail;
        }
      }
      setExercises(exerciseMap);
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async () => {
    // In a real app, you'd load the session from the database
    // For now, we'll start a new session
    startNewSession();
  };

  const completeSet = (weight?: number, reps?: number, duration?: number) => {
    if (!session) return;

    const updatedSession = { ...session };
    const currentExercise = updatedSession.exercises[currentExerciseIndex];
    const currentSet = currentExercise.sets[currentSetIndex];

    // Update the set
    currentSet.completed = true;
    if (weight !== undefined) currentSet.weight = weight;
    if (reps !== undefined) currentSet.reps = reps;
    if (duration !== undefined) currentSet.duration = duration;

    setSession(updatedSession);

    // Check if exercise is complete
    const allSetsComplete = currentExercise.sets.every(set => set.completed);
    if (allSetsComplete) {
      currentExercise.completed = true;
    }

    // Move to next set or exercise
    if (currentSetIndex < currentExercise.sets.length - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
      startRest();
    } else if (currentExerciseIndex < updatedSession.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      startRest();
    } else {
      // Workout complete
      completeWorkout();
    }
  };

  const startRest = () => {
    if (!session) return;
    
    const currentExercise = session.exercises[currentExerciseIndex];
    const exercise = exercises[currentExercise.exerciseId];
    
    // Get rest time from routine (you'd need to add this to the session data)
    const restTime = 60; // Default 60 seconds
    
    setIsResting(true);
    setRestTimeLeft(restTime);
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const completeWorkout = async () => {
    if (!session || !user) return;

    try {
      const duration = Math.round((new Date().getTime() - startTime.getTime()) / 60000); // minutes
      await WorkoutRoutineService.completeWorkoutSession(session.id, duration);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to complete workout:', error);
    }
  };

  const getCurrentExercise = () => {
    if (!session || currentExerciseIndex >= session.exercises.length) return null;
    return session.exercises[currentExerciseIndex];
  };

  const getCurrentExerciseDetail = () => {
    const currentExercise = getCurrentExercise();
    if (!currentExercise) return null;
    return exercises[currentExercise.exerciseId];
  };

  const getProgressPercentage = () => {
    if (!session) return 0;
    
    const totalSets = session.exercises.reduce((total, ex) => total + ex.sets.length, 0);
    const completedSets = session.exercises.reduce((total, ex) => 
      total + ex.sets.filter(set => set.completed).length, 0
    );
    
    return Math.round((completedSets / totalSets) * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Starting workout...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Icon name="alert_triangle" size={48} className="text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Session Error</h3>
        <p className="text-gray-600 dark:text-gray-400">Failed to start workout session</p>
      </div>
    );
  }

  const currentExercise = getCurrentExercise();
  const currentExerciseDetail = getCurrentExerciseDetail();
  const currentSet = currentExercise?.sets[currentSetIndex];
  const isWorkoutComplete = session.exercises.every(ex => ex.completed);

  if (isWorkoutComplete) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="check" size={48} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Workout Complete!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Great job! You've completed your workout session.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((new Date().getTime() - startTime.getTime()) / 60000)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {session.exercises.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Exercises</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isResting) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="clock" size={48} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Rest Time</h2>
        <div className="text-4xl font-bold text-blue-600 mb-4">
          {formatTime(restTimeLeft)}
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Take a break and prepare for your next set
        </p>
        <button
          onClick={skipRest}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Skip Rest
        </button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Workout Session</h2>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
            <div className="text-lg font-bold text-blue-600">{getProgressPercentage()}%</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Exercise {currentExerciseIndex + 1} of {session.exercises.length}</span>
          <span>Set {currentSetIndex + 1} of {currentExercise?.sets.length || 0}</span>
        </div>
      </div>

      {/* Current Exercise */}
      {currentExerciseDetail && currentExercise && currentSet && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentExerciseDetail.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 capitalize">
              {currentExerciseDetail.muscleGroups.join(', ')}
            </p>
          </div>

          {/* Exercise Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Instructions</h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              {currentExerciseDetail.instructions.map((instruction, index) => (
                <li key={index}>{index + 1}. {instruction}</li>
              ))}
            </ol>
          </div>

          {/* Set Information */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Set {currentSetIndex + 1}
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-400">
              {currentSet.reps ? `${currentSet.reps} reps` : 
               currentSet.duration ? `${Math.floor(currentSet.duration / 60)}:${(currentSet.duration % 60).toString().padStart(2, '0')}` : 
               'Complete the exercise'}
            </div>
          </div>

          {/* Complete Set Button */}
          <div className="text-center">
            <button
              onClick={() => completeSet(currentSet.weight, currentSet.reps, currentSet.duration)}
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
            >
              Complete Set
            </button>
          </div>
        </div>
      )}

      {/* Exercise List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Today's Exercises</h4>
        <div className="space-y-3">
          {session.exercises.map((exercise, index) => {
            const exerciseDetail = exercises[exercise.exerciseId];
            const isActive = index === currentExerciseIndex;
            const isComplete = exercise.completed;
            
            return (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg',
                  isActive && 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
                  isComplete && 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
                  !isActive && !isComplete && 'bg-gray-50 dark:bg-gray-700/50'
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    isComplete && 'bg-green-600',
                    isActive && !isComplete && 'bg-blue-600',
                    !isActive && !isComplete && 'bg-gray-400'
                  )}>
                    {isComplete ? (
                      <Icon name="check" size={16} className="text-white" />
                    ) : (
                      <span className="text-white text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    'font-medium',
                    isComplete && 'text-green-700 dark:text-green-300',
                    isActive && !isComplete && 'text-blue-700 dark:text-blue-300',
                    !isActive && !isComplete && 'text-gray-700 dark:text-gray-300'
                  )}>
                    {exerciseDetail?.name || 'Unknown Exercise'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {exercise.sets.filter(set => set.completed).length} / {exercise.sets.length} sets
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WorkoutSessionComponent;
