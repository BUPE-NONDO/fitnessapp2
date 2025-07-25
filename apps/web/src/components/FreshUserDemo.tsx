import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { UserDataInitializationService } from '@/services/userDataInitializationService';
import { FreshUserValidationService } from '@/services/freshUserValidationService';

export function FreshUserDemo() {
  const { user, userProfile } = useUser();
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string>('');

  const handleValidateUser = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await FreshUserValidationService.validateCompletelyFreshUser(
        user.uid, 
        userProfile || undefined
      );
      setValidationResult(result);
      
      const reportText = await FreshUserValidationService.generateFreshUserReport(
        user.uid, 
        userProfile || undefined
      );
      setReport(reportText);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetToFresh = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await FreshUserValidationService.resetUserToCompletelyFreshState(
        user.uid, 
        userProfile || undefined
      );
      alert('User reset to fresh state successfully!');
      // Re-validate after reset
      await handleValidateUser();
    } catch (error) {
      console.error('Reset failed:', error);
      alert('Failed to reset user to fresh state');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeFreshUser = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await UserDataInitializationService.initializeFreshUser(user.uid, {
        email: user.email || '',
        displayName: user.displayName || 'User',
        photoURL: user.photoURL,
      });
      alert('Fresh user initialized successfully!');
      // Re-validate after initialization
      await handleValidateUser();
    } catch (error) {
      console.error('Initialization failed:', error);
      alert('Failed to initialize fresh user');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Fresh User Demo</h2>
        <p className="text-gray-600">Please sign in to test fresh user functionality.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">🆕 Fresh User Demo</h2>
        <p className="text-gray-600 mb-4">
          Test the fresh user initialization system. Every user should start with completely clean data.
        </p>
      </div>

      {/* User Info */}
      <div className="bg-white p-4 rounded border">
        <h3 className="font-semibold mb-2">Current User</h3>
        <div className="text-sm space-y-1">
          <p><strong>UID:</strong> {user.uid}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
          <p><strong>Is New User:</strong> {userProfile?.isNewUser ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Data Initialized:</strong> {userProfile?.dataInitialized ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Onboarding Completed:</strong> {userProfile?.onboardingCompleted ? '✅ Yes' : '❌ No'}</p>
        </div>
      </div>

      {/* Progress Stats */}
      {userProfile?.progressStats && (
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">Progress Stats</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>Total Workouts: <span className="font-mono">{userProfile.progressStats.totalWorkouts}</span></p>
            <p>Total Goals: <span className="font-mono">{userProfile.progressStats.totalGoals}</span></p>
            <p>Total Check-ins: <span className="font-mono">{userProfile.progressStats.totalCheckIns}</span></p>
            <p>Total Badges: <span className="font-mono">{userProfile.progressStats.totalBadges}</span></p>
            <p>Current Streak: <span className="font-mono">{userProfile.progressStats.currentStreak}</span></p>
            <p>Longest Streak: <span className="font-mono">{userProfile.progressStats.longestStreak}</span></p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleValidateUser}
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Validating...' : '🔍 Validate Fresh User State'}
        </button>

        <button
          onClick={handleInitializeFreshUser}
          disabled={loading}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Initializing...' : '🆕 Initialize Fresh User'}
        </button>

        <button
          onClick={handleResetToFresh}
          disabled={loading}
          className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? 'Resetting...' : '🔄 Reset to Fresh State'}
        </button>
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">
            Validation Result: {validationResult.isFresh ? '✅ FRESH' : '❌ NOT FRESH'}
          </h3>
          
          {validationResult.issues.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium text-red-600 mb-1">Issues Found:</h4>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {validationResult.issues.map((issue: string, index: number) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-orange-600 mb-1">Recommendations:</h4>
              <ul className="text-sm text-orange-600 list-disc list-inside">
                {validationResult.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Report */}
      {report && (
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">Detailed Report</h3>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto whitespace-pre-wrap">
            {report}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">How to Test</h3>
        <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
          <li>Click "Validate Fresh User State" to check current status</li>
          <li>If user is not fresh, click "Reset to Fresh State" to clean all data</li>
          <li>Click "Initialize Fresh User" to set up clean user data</li>
          <li>Validate again to confirm user is now fresh</li>
          <li>All stats should be zero and user should be marked as new</li>
        </ol>
      </div>
    </div>
  );
}

export default FreshUserDemo;
