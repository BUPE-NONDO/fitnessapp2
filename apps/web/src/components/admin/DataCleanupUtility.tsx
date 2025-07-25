import React, { useState } from 'react';
import { UserDataCleanupService } from '@/services/userDataCleanupService';

interface CleanupStats {
  totalUsers: number;
  totalDocuments: number;
  collections: { [key: string]: number };
}

export function DataCleanupUtility() {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const cleanupStats = await UserDataCleanupService.getCleanupStats();
      setStats(cleanupStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (confirmText !== 'DELETE ALL DATA') {
      alert('Please type "DELETE ALL DATA" to confirm');
      return;
    }

    if (!window.confirm('Are you absolutely sure? This will delete ALL user data and cannot be undone!')) {
      return;
    }

    try {
      setIsLoading(true);
      await UserDataCleanupService.deleteAllUserData();
      setLastCleanup(new Date());
      setConfirmText('');
      await loadStats(); // Reload stats after cleanup
      alert('All user data has been deleted successfully');
    } catch (error) {
      console.error('Failed to delete all data:', error);
      alert('Failed to delete data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-red-600 mb-2">⚠️ Data Cleanup Utility</h2>
        <p className="text-gray-600">
          This utility allows you to delete all user data and start fresh with isolated subcollections.
          <strong className="text-red-500"> Use with extreme caution!</strong>
        </p>
      </div>

      {/* Current Stats */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Current Database Stats</h3>
          <button
            onClick={loadStats}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh Stats'}
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

        {stats && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Documents per Collection:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(stats.collections).map(([collection, count]) => (
                <div key={collection} className="bg-gray-50 p-2 rounded text-sm">
                  <span className="font-medium">{collection}:</span> {count}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cleanup Actions */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h4 className="font-semibold text-red-800 mb-2">Delete All User Data</h4>
          <p className="text-red-700 mb-4">
            This will permanently delete all user data from the database and cannot be undone.
            This includes users, workout plans, goals, activity logs, and all related data.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-red-700 mb-2">
              Type "DELETE ALL DATA" to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="DELETE ALL DATA"
            />
          </div>

          <button
            onClick={handleDeleteAllData}
            disabled={isLoading || confirmText !== 'DELETE ALL DATA'}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isLoading ? 'Deleting...' : '🗑️ Delete All User Data'}
          </button>
        </div>
      </div>

      {/* Last Cleanup Info */}
      {lastCleanup && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800">✅ Cleanup Completed</h4>
          <p className="text-green-700">
            Last cleanup performed at: {lastCleanup.toLocaleString()}
          </p>
          <p className="text-sm text-green-600 mt-1">
            All user data has been deleted. New users will start with fresh, isolated subcollection structures.
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">📋 What happens after cleanup:</h4>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• All existing user data is permanently deleted</li>
          <li>• New users will be created with isolated subcollection structures</li>
          <li>• Onboarding data will be stored in user subcollections</li>
          <li>• Workout plans will be isolated per user</li>
          <li>• Progress tracking will be completely separated</li>
          <li>• Each user's data will be fully isolated from others</li>
        </ul>
      </div>

      {/* Technical Details */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">🔧 Technical Details:</h4>
        <div className="text-gray-700 text-sm space-y-1">
          <p><strong>Collections cleaned:</strong> users, user_stats, workout_plans, goals, logs, badges, activity_logs, workout_routines</p>
          <p><strong>New structure:</strong> users/{`{userId}`}/onboarding, users/{`{userId}`}/progress, users/{`{userId}`}/workout_plans</p>
          <p><strong>Security:</strong> Firestore rules ensure complete user data isolation</p>
          <p><strong>Backup:</strong> No automatic backup - ensure you have backups before cleanup</p>
        </div>
      </div>
    </div>
  );
}
