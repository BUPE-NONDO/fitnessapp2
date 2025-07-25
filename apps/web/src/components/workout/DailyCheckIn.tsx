import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface CheckInData {
  date: string;
  workoutCompleted: boolean;
  workoutType?: string;
  duration?: number;
  intensity?: 1 | 2 | 3 | 4 | 5;
  mood?: 1 | 2 | 3 | 4 | 5;
  energy?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  weight?: number;
  bodyFat?: number;
}

interface DailyCheckInProps {
  className?: string;
  onCheckInComplete?: (data: CheckInData) => void;
}

export function DailyCheckIn({ className = '', onCheckInComplete }: DailyCheckInProps) {
  const { user } = useUser();
  const [checkInData, setCheckInData] = useState<CheckInData>({
    date: new Date().toISOString().split('T')[0],
    workoutCompleted: false,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkTodayCheckIn();
  }, [user]);

  const checkTodayCheckIn = async () => {
    // In a real app, you'd check if user has already checked in today
    // For now, we'll assume they haven't
    setHasCheckedInToday(false);
  };

  const updateCheckInData = (updates: Partial<CheckInData>) => {
    setCheckInData(prev => ({ ...prev, ...updates }));
  };

  const submitCheckIn = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // In a real app, you'd save this to the database
      console.log('Check-in data:', checkInData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasCheckedInToday(true);
      if (onCheckInComplete) {
        onCheckInComplete(checkInData);
      }
    } catch (error) {
      console.error('Failed to submit check-in:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '😊', '😄'];
    return emojis[mood - 1] || '😐';
  };

  const getEnergyColor = (energy: number) => {
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-blue-500'];
    return colors[energy - 1] || 'text-gray-500';
  };

  const getIntensityLabel = (intensity: number) => {
    const labels = ['Very Light', 'Light', 'Moderate', 'Hard', 'Very Hard'];
    return labels[intensity - 1] || 'Moderate';
  };

  if (hasCheckedInToday) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="check" size={48} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check-in Complete!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Thanks for checking in today. See you tomorrow!
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Today's Summary</h3>
          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Workout:</span>
              <span className={cn(
                'font-medium',
                checkInData.workoutCompleted ? 'text-green-600' : 'text-red-600'
              )}>
                {checkInData.workoutCompleted ? 'Completed' : 'Skipped'}
              </span>
            </div>
            {checkInData.workoutCompleted && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {checkInData.duration} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Intensity:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {checkInData.intensity ? getIntensityLabel(checkInData.intensity) : 'Not set'}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Mood:</span>
              <span className="text-2xl">
                {checkInData.mood ? getMoodEmoji(checkInData.mood) : '😐'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Daily Check-in</h2>
        <p className="text-gray-600 dark:text-gray-400">
          How was your day? Let's track your progress!
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm',
              currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            )}>
              {step}
            </div>
            {step < 3 && (
              <div className={cn(
                'w-8 h-1 mx-2',
                currentStep > step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
              Did you work out today?
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  updateCheckInData({ workoutCompleted: true });
                  setCurrentStep(2);
                }}
                className={cn(
                  'p-6 rounded-lg border-2 transition-all duration-200 text-center',
                  checkInData.workoutCompleted 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                )}
              >
                <Icon name="check" size={32} className="text-green-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-white">Yes, I worked out!</div>
              </button>
              
              <button
                onClick={() => {
                  updateCheckInData({ workoutCompleted: false });
                  setCurrentStep(3);
                }}
                className={cn(
                  'p-6 rounded-lg border-2 transition-all duration-200 text-center',
                  !checkInData.workoutCompleted 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                )}
              >
                <Icon name="x" size={32} className="text-red-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-white">No, I skipped today</div>
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && checkInData.workoutCompleted && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
              Tell us about your workout
            </h3>
            
            {/* Workout Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Workout Type
              </label>
              <select
                value={checkInData.workoutType || ''}
                onChange={(e) => updateCheckInData({ workoutType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select workout type</option>
                <option value="strength">Strength Training</option>
                <option value="cardio">Cardio</option>
                <option value="yoga">Yoga</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={checkInData.duration || ''}
                onChange={(e) => updateCheckInData({ duration: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="30"
                min="1"
                max="300"
              />
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How intense was your workout?
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => updateCheckInData({ intensity: level as 1 | 2 | 3 | 4 | 5 })}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors',
                      checkInData.intensity === level
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    )}
                  >
                    {getIntensityLabel(level)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
              How are you feeling?
            </h3>
            
            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mood
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => updateCheckInData({ mood: mood as 1 | 2 | 3 | 4 | 5 })}
                    className={cn(
                      'flex-1 py-3 rounded-lg border transition-all duration-200',
                      checkInData.mood === mood
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-110'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <div className="text-2xl mb-1">{getMoodEmoji(mood)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Energy Level
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((energy) => (
                  <button
                    key={energy}
                    onClick={() => updateCheckInData({ energy: energy as 1 | 2 | 3 | 4 | 5 })}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors',
                      checkInData.energy === energy
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    )}
                  >
                    <Icon name="zap" size={16} className={cn('mx-auto mb-1', getEnergyColor(energy))} />
                    {energy}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={checkInData.notes || ''}
                onChange={(e) => updateCheckInData({ notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="How did you feel during your workout? Any achievements or challenges?"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentStep(checkInData.workoutCompleted ? 2 : 1)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={submitCheckIn}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Icon name="check" size={16} />
                    <span>Complete Check-in</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyCheckIn;
