import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { WorkoutRoutineService, WorkoutRoutine, Exercise } from '@/services/workoutRoutineService';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface WorkoutRoutineProps {
  className?: string;
}

export function WorkoutRoutineComponent({ className = '' }: WorkoutRoutineProps) {
  const { user } = useUser();
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<string>('');

  useEffect(() => {
    loadUserRoutine();
  }, [user]);

  useEffect(() => {
    // Set active day to today
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setActiveDay(today);
  }, []);

  const loadUserRoutine = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userRoutine = await WorkoutRoutineService.getUserRoutine(user.uid);
      
      if (userRoutine) {
        setRoutine(userRoutine);
        
        // Load exercise details
        const exerciseMap: Record<string, Exercise> = {};
        for (const workoutSet of userRoutine.exercises) {
          const exercise = WorkoutRoutineService.getExerciseById(workoutSet.exerciseId);
          if (exercise) {
            exerciseMap[exercise.id] = exercise;
          }
        }
        setExercises(exerciseMap);
      }
    } catch (error) {
      console.error('Failed to load routine:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = async () => {
    if (!user || !routine) return;

    try {
      const session = await WorkoutRoutineService.startWorkoutSession(user.uid, routine.id);
      // Navigate to workout session (you'll implement this component next)
      console.log('Started workout session:', session.id);
    } catch (error) {
      console.error('Failed to start workout:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength': return 'dumbbell';
      case 'cardio': return 'heart';
      case 'flexibility': return 'wind';
      case 'balance': return 'target';
      default: return 'activity';
    }
  };

  const isWorkoutDay = (day: string) => {
    return routine?.schedule.includes(day) || false;
  };

  const getTodayWorkout = () => {
    if (!routine || !isWorkoutDay(activeDay)) return null;
    return routine.exercises;
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading your routine...</span>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Icon name="calendar" size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Routine Found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Complete your onboarding to get a personalized workout routine
        </p>
      </div>
    );
  }

  const todayWorkout = getTodayWorkout();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Routine Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{routine.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">{routine.description}</p>
            
            <div className="flex items-center space-x-4">
              <span className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize',
                getDifficultyColor(routine.difficulty)
              )}>
                {routine.difficulty}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {routine.daysPerWeek} days/week
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {routine.duration} weeks
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {routine.exercises.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Exercises</div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Schedule</h3>
        
        <div className="grid grid-cols-7 gap-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
            const isToday = day === activeDay;
            const isScheduled = isWorkoutDay(day);
            
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={cn(
                  'p-3 rounded-lg text-center transition-all duration-200',
                  isToday && isScheduled && 'bg-blue-600 text-white shadow-lg',
                  isToday && !isScheduled && 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white',
                  !isToday && isScheduled && 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50',
                  !isToday && !isScheduled && 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                )}
              >
                <div className="text-xs font-medium mb-1">{day.slice(0, 3)}</div>
                <div className="text-xs">
                  {isScheduled ? (
                    <Icon name="dumbbell" size={16} className="mx-auto" />
                  ) : (
                    <Icon name="moon" size={16} className="mx-auto" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Workout */}
      {todayWorkout ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeDay}'s Workout
            </h3>
            
            <button
              onClick={startWorkout}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
            >
              <Icon name="play" size={20} />
              <span>Start Workout</span>
            </button>
          </div>

          <div className="space-y-4">
            {todayWorkout.map((workoutSet, index) => {
              const exercise = exercises[workoutSet.exerciseId];
              if (!exercise) return null;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center',
                      exercise.category === 'strength' && 'bg-blue-100 dark:bg-blue-900/30',
                      exercise.category === 'cardio' && 'bg-red-100 dark:bg-red-900/30',
                      exercise.category === 'flexibility' && 'bg-green-100 dark:bg-green-900/30'
                    )}>
                      <Icon 
                        name={getCategoryIcon(exercise.category) as any} 
                        size={24} 
                        className={cn(
                          exercise.category === 'strength' && 'text-blue-600',
                          exercise.category === 'cardio' && 'text-red-600',
                          exercise.category === 'flexibility' && 'text-green-600'
                        )}
                      />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{exercise.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {exercise.muscleGroups.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {workoutSet.sets} sets
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {workoutSet.reps ? `${workoutSet.reps} reps` : 
                       workoutSet.duration ? `${Math.floor(workoutSet.duration / 60)}:${(workoutSet.duration % 60).toString().padStart(2, '0')}` : 
                       'As prescribed'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="info" size={20} className="text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Workout Tips</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Warm up for 5-10 minutes before starting</li>
                  <li>• Rest {Math.round(todayWorkout[0]?.restTime / 60)} minutes between sets</li>
                  <li>• Focus on proper form over speed</li>
                  <li>• Stay hydrated throughout your workout</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Icon name="moon" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Rest Day</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {activeDay} is a rest day. Take time to recover and prepare for your next workout!
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">{routine.daysPerWeek}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Days/Week</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">{routine.exercises.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Exercises</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {routine.exercises.reduce((total, set) => total + set.sets, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Sets</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-1">{routine.duration}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Weeks</div>
        </div>
      </div>
    </div>
  );
}

export default WorkoutRoutineComponent;
