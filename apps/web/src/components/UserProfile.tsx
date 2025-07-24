import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { BadgeSummary } from './BadgeSummary';

export function UserProfile() {
  const { 
    user, 
    userProfile, 
    loading, 
    error, 
    updateProfile, 
    signOut,
    displayName,
    initials,
    isEmailVerified 
  } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: userProfile?.displayName || '',
    preferences: {
      theme: userProfile?.preferences?.theme || 'system',
      notifications: userProfile?.preferences?.notifications ?? true,
      units: userProfile?.preferences?.units || 'metric',
    }
  });

  const handleSave = async () => {
    try {
      await updateProfile({
        displayName: editForm.displayName,
        preferences: editForm.preferences,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleCancel = () => {
    setEditForm({
      displayName: userProfile?.displayName || '',
      preferences: {
        theme: userProfile?.preferences?.theme || 'system',
        notifications: userProfile?.preferences?.notifications ?? true,
        units: userProfile?.preferences?.units || 'metric',
      }
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50">
        <div className="text-red-700">
          <h3 className="font-medium">Error loading profile</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary btn-sm"
          >
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="btn btn-primary btn-sm"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={displayName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-xl font-semibold text-primary-700">
                {initials}
              </span>
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editForm.displayName}
                onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                className="input"
                placeholder="Display name"
              />
            ) : (
              <h3 className="text-lg font-medium text-gray-900">{displayName}</h3>
            )}
            <p className="text-gray-600 flex items-center">
              {user?.email}
              {isEmailVerified ? (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Unverified
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Stats */}
        {userProfile?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{userProfile.stats.totalGoals}</div>
              <div className="text-sm text-gray-600">Total Goals</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userProfile.stats.activeGoals}</div>
              <div className="text-sm text-gray-600">Active Goals</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userProfile.stats.totalLogs}</div>
              <div className="text-sm text-gray-600">Total Logs</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{userProfile.stats.streakDays}</div>
              <div className="text-sm text-gray-600">Streak Days</div>
            </div>
          </div>
        )}

        {/* Badges Section */}
        <div>
          <BadgeSummary showProgress={true} maxDisplay={6} />
        </div>

        {/* Preferences */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Preferences</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Theme</label>
              {isEditing ? (
                <select
                  value={editForm.preferences.theme}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, theme: e.target.value as 'light' | 'dark' | 'system' }
                  }))}
                  className="input w-32"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              ) : (
                <span className="text-sm text-gray-600 capitalize">{userProfile?.preferences?.theme}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Units</label>
              {isEditing ? (
                <select
                  value={editForm.preferences.units}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, units: e.target.value as 'metric' | 'imperial' }
                  }))}
                  className="input w-32"
                >
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </select>
              ) : (
                <span className="text-sm text-gray-600 capitalize">{userProfile?.preferences?.units}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Notifications</label>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={editForm.preferences.notifications}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, notifications: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              ) : (
                <span className="text-sm text-gray-600">
                  {userProfile?.preferences?.notifications ? 'Enabled' : 'Disabled'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={signOut}
            className="btn btn-secondary w-full"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
