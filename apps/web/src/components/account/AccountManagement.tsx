import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useOnboarding } from '@/hooks/useOnboarding';
import { AccountManagementService } from '@/services/accountManagementService';

interface AccountManagementProps {
  className?: string;
}

export function AccountManagement({ className = '' }: AccountManagementProps) {
  const { user, userProfile, signOut } = useUser();
  const { restartOnboarding, isLoading: onboardingLoading } = useOnboarding();
  
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showExportData, setShowExportData] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleRestartOnboarding = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to restart your onboarding? This will reset your current plan and preferences.'
    );
    
    if (confirmed) {
      try {
        await restartOnboarding();
      } catch (error) {
        console.error('Failed to restart onboarding:', error);
        alert('Failed to restart onboarding. Please try again.');
      }
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    
    try {
      setIsExporting(true);
      const userData = await AccountManagementService.exportUserData(user.uid);
      
      // Create and download JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `fitness-app-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      alert('Your data has been exported successfully!');
      
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    // Validate confirmation input
    if (!AccountManagementService.validateDeletionConfirmation(deleteConfirmationInput)) {
      setDeleteError('Please type "DELETE" to confirm account deletion.');
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      const result = await AccountManagementService.deleteAccount(password);
      
      if (result.success) {
        alert(result.message);
        // User will be automatically signed out when account is deleted
      } else {
        setDeleteError(result.message);
        
        if (result.requiresReauth) {
          // Keep the modal open for reauthentication
          setPassword('');
        }
      }
      
    } catch (error) {
      console.error('Failed to delete account:', error);
      setDeleteError('An unexpected error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetDeleteForm = () => {
    setShowDeleteConfirmation(false);
    setDeleteConfirmationInput('');
    setPassword('');
    setDeleteError(null);
  };

  const isGoogleUser = user?.providerData.some(provider => provider.providerId === 'google.com');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Account Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-circle border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Account Information
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
            <div className="font-medium text-gray-900 dark:text-white">{user?.email}</div>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Display Name</label>
            <div className="font-medium text-gray-900 dark:text-white">{userProfile?.displayName || 'Not set'}</div>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Account Created</label>
            <div className="font-medium text-gray-900 dark:text-white">
              {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Sign-in Method</label>
            <div className="font-medium text-gray-900 dark:text-white">
              {isGoogleUser ? 'Google' : 'Email/Password'}
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-circle border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Account Actions
        </h3>
        <div className="space-y-4">
          {/* Restart Onboarding */}
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
            <div>
              <h4 className="font-semibold text-purple-900 dark:text-purple-100">Restart Onboarding</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Update your goals and preferences to get a new personalized plan
              </p>
            </div>
            <button
              onClick={handleRestartOnboarding}
              disabled={onboardingLoading}
              className="bg-gradient-to-r from-purple-500 to-primary-600 hover:from-purple-600 hover:to-primary-700 disabled:from-purple-400 disabled:to-primary-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-full transition-colors shadow-circle"
            >
              {onboardingLoading ? 'Restarting...' : 'Restart'}
            </button>
          </div>

          {/* Export Data */}
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100">Export Your Data</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Download a copy of all your fitness data and progress
              </p>
            </div>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>

          {/* Sign Out */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Sign Out</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sign out of your account on this device
              </p>
            </div>
            <button
              onClick={signOut}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-200 dark:border-red-800 p-6">
        <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-4">
          Danger Zone
        </h3>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100">Delete Account</h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-4">
              Delete Account
            </h3>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-line">
                {AccountManagementService.getAccountDeletionWarning()}
              </p>
              
              <input
                type="text"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {!isGoogleUser && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter your password to confirm:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {deleteError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{deleteError}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={resetDeleteForm}
                disabled={isDeleting}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || !AccountManagementService.validateDeletionConfirmation(deleteConfirmationInput)}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountManagement;
