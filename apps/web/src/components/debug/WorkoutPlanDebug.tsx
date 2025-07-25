import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { WorkoutPlanGenerator } from '@/services/workoutPlanGenerator';
import { IsolatedOnboardingService } from '@/services/isolatedOnboardingService';
import { OnboardingData } from '@/components/onboarding/OnboardingWizard';

export function WorkoutPlanDebug() {
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testOnboardingData: OnboardingData = {
    ageRange: '30-39',
    gender: 'male',
    bodyType: 'mesomorph',
    primaryGoal: 'lose-weight',
    currentWeight: 80,
    targetWeight: 75,
    height: 175,
    weightUnit: 'kg',
    heightUnit: 'cm',
    fitnessLevel: 'intermediate',
    workoutEnvironment: 'gym',
    availableTime: '45-60',
    equipmentAccess: 'full-gym',
    workoutDaysPerWeek: 4,
  };

  const handleGeneratePlan = async () => {
    if (!user) {
      setError('No user signed in');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setResult(null);

      console.log('🧪 Testing workout plan generation...');
      const plan = await WorkoutPlanGenerator.generateWorkoutPlan(user.uid, testOnboardingData);
      
      setResult(plan);
      console.log('✅ Test plan generated:', plan);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Test failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!user) {
      setError('No user signed in');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setResult(null);

      console.log('🧪 Testing complete onboarding flow...');
      await IsolatedOnboardingService.completeOnboarding(user.uid, testOnboardingData);
      
      setResult({ message: 'Onboarding completed successfully' });
      console.log('✅ Test onboarding completed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Test failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetUserPlans = async () => {
    if (!user) {
      setError('No user signed in');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setResult(null);

      console.log('🧪 Getting user workout plans...');
      const plans = await IsolatedOnboardingService.getUserWorkoutPlans(user.uid);
      
      setResult({ plans });
      console.log('✅ User plans retrieved:', plans);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Test failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please sign in to test workout plan generation</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🧪 Workout Plan Debug</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">User Info</h3>
        <p><strong>UID:</strong> {user.uid}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Test Data</h3>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(testOnboardingData, null, 2)}
        </pre>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : '🏋️ Test Workout Plan Generation'}
        </button>

        <button
          onClick={handleCompleteOnboarding}
          disabled={isGenerating}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isGenerating ? 'Processing...' : '🎉 Test Complete Onboarding Flow'}
        </button>

        <button
          onClick={handleGetUserPlans}
          disabled={isGenerating}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {isGenerating ? 'Loading...' : '📋 Get User Workout Plans'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-800">❌ Error</h4>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800">✅ Result</h4>
          <pre className="text-green-700 text-sm overflow-auto mt-2">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800">📋 Instructions</h4>
        <ul className="text-blue-700 text-sm mt-2 space-y-1">
          <li>• <strong>Test Workout Plan Generation:</strong> Directly test the WorkoutPlanGenerator service</li>
          <li>• <strong>Test Complete Onboarding:</strong> Test the full onboarding completion flow</li>
          <li>• <strong>Get User Plans:</strong> Retrieve all workout plans for the current user</li>
          <li>• Check browser console for detailed logs</li>
          <li>• Check Firestore console to see if data is being saved</li>
        </ul>
      </div>
    </div>
  );
}
