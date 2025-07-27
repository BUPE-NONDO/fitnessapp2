import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';

interface WorkoutTimerProps {
  onComplete?: () => void;
  onClose?: () => void;
  workoutName?: string;
  exercises?: Array<{
    name: string;
    duration: number; // in seconds
    rest?: number; // rest time in seconds
  }>;
}

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentExercise: number;
  timeRemaining: number;
  isResting: boolean;
  totalTime: number;
}

export function WorkoutTimer({ 
  onComplete, 
  onClose, 
  workoutName = "Workout Session",
  exercises = [
    { name: "Warm Up", duration: 300, rest: 60 },
    { name: "Push-ups", duration: 180, rest: 60 },
    { name: "Squats", duration: 180, rest: 60 },
    { name: "Plank", duration: 120, rest: 60 },
    { name: "Cool Down", duration: 300 }
  ]
}: WorkoutTimerProps) {
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    currentExercise: 0,
    timeRemaining: exercises[0]?.duration || 300,
    isResting: false,
    totalTime: exercises[0]?.duration || 300
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.5;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (timer.isRunning && !timer.isPaused) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev.timeRemaining <= 1) {
            // Time's up for current phase
            playNotification();
            
            if (prev.isResting) {
              // Rest is over, move to next exercise
              const nextExercise = prev.currentExercise + 1;
              if (nextExercise >= exercises.length) {
                // Workout complete
                onComplete?.();
                return { ...prev, isRunning: false };
              }
              
              return {
                ...prev,
                currentExercise: nextExercise,
                timeRemaining: exercises[nextExercise].duration,
                totalTime: exercises[nextExercise].duration,
                isResting: false
              };
            } else {
              // Exercise is over, start rest (if any)
              const currentEx = exercises[prev.currentExercise];
              if (currentEx.rest && currentEx.rest > 0) {
                return {
                  ...prev,
                  timeRemaining: currentEx.rest,
                  totalTime: currentEx.rest,
                  isResting: true
                };
              } else {
                // No rest, move to next exercise
                const nextExercise = prev.currentExercise + 1;
                if (nextExercise >= exercises.length) {
                  onComplete?.();
                  return { ...prev, isRunning: false };
                }
                
                return {
                  ...prev,
                  currentExercise: nextExercise,
                  timeRemaining: exercises[nextExercise].duration,
                  totalTime: exercises[nextExercise].duration
                };
              }
            }
          }
          
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isRunning, timer.isPaused, exercises, onComplete]);

  const playNotification = () => {
    // Create a simple beep sound
    if (audioRef.current) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    }
  };

  const startTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: true, isPaused: false }));
  };

  const pauseTimer = () => {
    setTimer(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const stopTimer = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      currentExercise: 0,
      timeRemaining: exercises[0]?.duration || 300,
      totalTime: exercises[0]?.duration || 300,
      isResting: false
    }));
  };

  const skipToNext = () => {
    if (timer.isResting) {
      // Skip rest, go to next exercise
      const nextExercise = timer.currentExercise + 1;
      if (nextExercise < exercises.length) {
        setTimer(prev => ({
          ...prev,
          currentExercise: nextExercise,
          timeRemaining: exercises[nextExercise].duration,
          totalTime: exercises[nextExercise].duration,
          isResting: false
        }));
      }
    } else {
      // Skip exercise, go to rest or next exercise
      const currentEx = exercises[timer.currentExercise];
      if (currentEx.rest && currentEx.rest > 0) {
        setTimer(prev => ({
          ...prev,
          timeRemaining: currentEx.rest,
          totalTime: currentEx.rest,
          isResting: true
        }));
      } else {
        const nextExercise = timer.currentExercise + 1;
        if (nextExercise < exercises.length) {
          setTimer(prev => ({
            ...prev,
            currentExercise: nextExercise,
            timeRemaining: exercises[nextExercise].duration,
            totalTime: exercises[nextExercise].duration
          }));
        }
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timer.totalTime > 0 ? (timer.totalTime - timer.timeRemaining) / timer.totalTime : 0;
  const circumference = 2 * Math.PI * 120; // radius = 120
  const strokeDashoffset = circumference - (progress * circumference);

  const currentExercise = exercises[timer.currentExercise];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="x" size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{workoutName}</h2>
          <div className="text-sm text-gray-600">
            Exercise {timer.currentExercise + 1} of {exercises.length}
          </div>
        </div>

        {/* Circular Progress */}
        <div className="relative flex items-center justify-center mb-8">
          <svg className="transform -rotate-90 w-64 h-64">
            {/* Background circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="#f3e8ff"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke={timer.isResting ? "#fbbf24" : "#a855f7"}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Timer Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {formatTime(timer.timeRemaining)}
            </div>
            <div className={`text-lg font-medium ${timer.isResting ? 'text-yellow-600' : 'text-purple-600'}`}>
              {timer.isResting ? 'Rest Time' : currentExercise?.name}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {timer.isResting ? 'Get ready for next exercise' : 'Keep going!'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          {!timer.isRunning ? (
            <button
              onClick={startTimer}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full transition-colors"
            >
              <Icon name="play" size={20} />
              <span>Start</span>
            </button>
          ) : (
            <>
              <button
                onClick={pauseTimer}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full transition-colors"
              >
                <Icon name={timer.isPaused ? "play" : "pause"} size={20} />
                <span>{timer.isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                onClick={stopTimer}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-colors"
              >
                <Icon name="square" size={20} />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>

        {/* Skip Button */}
        {timer.isRunning && (
          <div className="flex justify-center">
            <button
              onClick={skipToNext}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
            >
              Skip {timer.isResting ? 'Rest' : 'Exercise'} →
            </button>
          </div>
        )}

        {/* Exercise List Preview */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-3">Upcoming Exercises:</div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {exercises.slice(timer.currentExercise + 1, timer.currentExercise + 4).map((exercise, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-700">{exercise.name}</span>
                <span className="text-gray-500">{formatTime(exercise.duration)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
