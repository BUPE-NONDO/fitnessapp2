import React, { useState } from 'react';
import { UserDataCleanupService } from '@/services/userDataCleanupService';

export function CompleteDataReset() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [stats, setStats] = useState<any>(null);

  const loadStats = async () => {
    try {
      const cleanupStats = await UserDataCleanupService.getCleanupStats();
      setStats(cleanupStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCompleteReset = async () => {
    if (confirmText !== 'RESET EVERYTHING') {
      alert('Please type "RESET EVERYTHING" to confirm');
      return;
    }

    if (!window.confirm('⚠️ This will delete ALL user data and cannot be undone! Continue?')) {
      return;
    }

    if (!window.confirm('🗑️ This includes all users, workout plans, goals, and subcollections. Are you sure?')) {
      return;
    }

    try {
      setIsResetting(true);
      console.log('🗑️ Starting complete database reset...');
      
      // Delete all user data
      await UserDataCleanupService.deleteAllUserData();
      
      setResetComplete(true);
      setConfirmText('');
      await loadStats();
      
      console.log('✅ Complete database reset finished');
      
    } catch (error) {
      console.error('❌ Failed to reset database:', error);
      alert('Failed to reset database: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsResetting(false);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-red-600 mb-2">🗑️ Complete Database Reset</h2>
        <p className="text-gray-600">
          This will completely reset the database and ensure all users have their own isolated data buckets.
          <strong className="text-red-500"> This action cannot be undone!</strong>
        </p>
      </div>

      {/* Current Stats */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Current Database State</h3>
          <button
            onClick={loadStats}
            disabled={isResetting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Refresh Stats
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800">Total Users</h4>
              <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800">Total Documents</h4>
              <p className="text-2xl font-bold text-green-600">{stats.totalDocuments}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800">Collections</h4>
              <p className="text-2xl font-bold text-purple-600">{Object.keys(stats.collections).length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Reset Action */}
      <div className="border-t pt-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h4 className="font-semibold text-red-800 mb-2">⚠️ Complete Database Reset</h4>
          <p className="text-red-700 mb-4">
            This will permanently delete ALL user data and reset the database for fresh user isolation testing.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-red-700 mb-2">
              Type "RESET EVERYTHING" to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="RESET EVERYTHING"
              disabled={isResetting}
            />
          </div>

          <button
            onClick={handleCompleteReset}
            disabled={isResetting || confirmText !== 'RESET EVERYTHING'}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isResetting ? '🗑️ Resetting Database...' : '🗑️ Reset Complete Database'}
          </button>
        </div>
      </div>

      {/* Reset Complete */}
      {resetComplete && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800">✅ Database Reset Complete!</h4>
          <p className="text-green-700 mb-2">
            All user data has been deleted. The database is now clean and ready for fresh users.
          </p>
          <div className="text-sm text-green-600 space-y-1">
            <p>• All user documents deleted</p>
            <p>• All user subcollections cleaned</p>
            <p>• All workout plans removed</p>
            <p>• All goals and activity logs deleted</p>
            <p>• Database ready for isolated user buckets</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">📋 After Reset - Testing Flow</h4>
        <ol className="text-blue-700 space-y-1 text-sm list-decimal list-inside">
          <li>Database is completely clean</li>
          <li>Sign up with a new account</li>
          <li>User gets isolated data bucket automatically</li>
          <li>Flow: Signup → Onboarding → Dashboard</li>
          <li>Workout plan generated during onboarding</li>
          <li>Dashboard shows personalized plan</li>
          <li>All data isolated per user</li>
        </ol>
      </div>

      {/* Technical Details */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">🔧 What Happens After Reset</h4>
        <div className="text-gray-700 text-sm space-y-1">
          <p><strong>New User Flow:</strong> UserFlowManager handles signup → onboarding → dashboard</p>
          <p><strong>Data Isolation:</strong> Each user gets their own subcollection bucket</p>
          <p><strong>Workout Plans:</strong> Generated during onboarding and stored in user subcollections</p>
          <p><strong>Progress Tracking:</strong> Completely isolated per user</p>
          <p><strong>Security:</strong> Users can only access their own data</p>
        </div>
      </div>
    </div>
  );
}
