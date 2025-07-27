import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import { AccountManagement } from '@/components/account/AccountManagement';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { validatePassword } from '@/utils/passwordValidation';

interface SettingsPageProps {
  className?: string;
}

export function SettingsPage({ className = '' }: SettingsPageProps) {
  const { userProfile } = useUser();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'account' | 'about' | 'terms' | 'help'>('profile');

  // Form state
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'account', label: 'Account', icon: '🔐' },
    { id: 'about', label: 'About Us', icon: 'ℹ️' },
    { id: 'terms', label: 'Terms & Privacy', icon: '📄' },
    { id: 'help', label: 'How to Use', icon: '❓' },
  ];

  // Update form when userProfile changes
  React.useEffect(() => {
    if (userProfile?.displayName) {
      setDisplayName(userProfile.displayName);
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setSaveMessage(null);

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName
      });

      // Update Firestore user document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayName,
        updatedAt: new Date()
      });

      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage('Failed to update profile. Please try again.');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;

    try {
      setPasswordLoading(true);
      setPasswordMessage(null);

      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        setPasswordMessage(`Password requirements not met: ${passwordValidation.errors.join(', ')}`);
        return;
      }

      // Check password confirmation
      if (newPassword !== confirmPassword) {
        setPasswordMessage('New passwords do not match');
        return;
      }

      // Reauthenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      // Clear form and show success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password updated successfully!');
      setTimeout(() => setPasswordMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        setPasswordMessage('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        setPasswordMessage('New password is too weak');
      } else {
        setPasswordMessage('Failed to update password. Please try again.');
      }
      setTimeout(() => setPasswordMessage(null), 3000);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account, preferences, and fitness profile
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Profile Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your display name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userProfile?.email || ''}
                    disabled
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  />
                </div>
              </div>
              
              {/* Fitness Profile */}
              {userProfile?.onboardingData && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Fitness Profile
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Primary Goal</label>
                      <div className="font-medium text-gray-900 dark:text-white capitalize">
                        {userProfile.onboardingData.primaryGoal?.replace('-', ' ') || 'Not set'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Fitness Level</label>
                      <div className="font-medium text-gray-900 dark:text-white capitalize">
                        {userProfile.onboardingData.fitnessLevel || 'Not set'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Workouts per Week</label>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {userProfile.onboardingData.workoutDaysPerWeek || 'Not set'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                {saveMessage && (
                  <div className={`mt-2 text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                    {saveMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* App Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                App Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Theme</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
                  </div>
                  <select className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Units</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Measurement units for weight and distance</p>
                  </div>
                  <select className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="metric">Metric (kg, cm)</option>
                    <option value="imperial">Imperial (lbs, ft)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive workout reminders and updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Email Updates</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive progress reports and tips via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Save Preferences
                </button>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Privacy Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Profile Visibility</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Control who can see your profile</p>
                  </div>
                  <select className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Share Progress</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Allow others to see your workout progress</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Save Privacy Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Security Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="text-blue-600 dark:text-blue-400 mr-3 mt-1">🔒</div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Security & Privacy
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Your passwords are securely hashed using industry-standard encryption (bcrypt/scrypt) and never stored in plain text.
                    All data transmission is encrypted with HTTPS/TLS 1.3.
                  </p>
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Confirm your new password"
                  />
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                  {passwordMessage && (
                    <div className={`mt-2 text-sm ${passwordMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Management Section */}
            <AccountManagement />
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              About FitnessTracker
            </h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                FitnessTracker is your personal fitness companion, designed to help you achieve your health and wellness goals through personalized workout plans, progress tracking, and expert guidance.
              </p>
              <p>
                Our mission is to make fitness accessible, enjoyable, and effective for everyone, regardless of their current fitness level or experience.
              </p>

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Features</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Personalized workout plans based on your goals and fitness level
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Progress tracking and analytics
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Flexible scheduling that fits your lifestyle
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Achievement badges and motivation system
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Expert-designed exercises and routines
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm">
                  <strong>Version:</strong> 1.0.0<br />
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString()}<br />
                  <strong>Contact:</strong> support@fitnesstracker.com
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Terms of Service
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 text-sm">
                <p>
                  <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                </p>
                <p>
                  By using FitnessTracker, you agree to these terms of service. Please read them carefully.
                </p>

                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">1. Use of Service</h4>
                <p>
                  You may use our service for personal, non-commercial purposes. You are responsible for maintaining the confidentiality of your account and password.
                </p>

                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">2. Health and Safety</h4>
                <p>
                  Consult with a healthcare professional before starting any fitness program. Use the app at your own risk and listen to your body during workouts.
                </p>

                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">3. Data Usage</h4>
                <p>
                  We collect and use your data to provide personalized fitness recommendations. Your privacy is important to us.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Privacy Policy
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 text-sm">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Information We Collect</h4>
                <ul className="space-y-2 ml-4">
                  <li>• Personal information (name, email, age)</li>
                  <li>• Fitness data (weight, height, workout preferences)</li>
                  <li>• Usage data (app interactions, progress metrics)</li>
                </ul>

                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">How We Use Your Information</h4>
                <ul className="space-y-2 ml-4">
                  <li>• Provide personalized workout recommendations</li>
                  <li>• Track your fitness progress</li>
                  <li>• Improve our services</li>
                  <li>• Send important updates (with your consent)</li>
                </ul>

                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Data Security</h4>
                <p>
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                How to Use FitnessTracker
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🚀 Getting Started</h4>
                  <ol className="space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>1. Complete the onboarding questionnaire to set your fitness goals</li>
                    <li>2. Review your personalized workout plan on the dashboard</li>
                    <li>3. Start your first workout by clicking "Start Workout"</li>
                    <li>4. Track your progress and earn achievement badges</li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📊 Dashboard Overview</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>• <strong>Today's Goal:</strong> Your daily fitness objective</li>
                    <li>• <strong>Progress Cards:</strong> Weekly and monthly progress tracking</li>
                    <li>• <strong>Workout Plan:</strong> Your personalized exercise routine</li>
                    <li>• <strong>Achievement Badges:</strong> Milestones and accomplishments</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🏋️ Starting a Workout</h4>
                  <ol className="space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>1. Click "Start Workout" on your daily goal or workout plan</li>
                    <li>2. Follow the exercise instructions and timer</li>
                    <li>3. Mark exercises as complete as you finish them</li>
                    <li>4. Complete the workout to update your progress</li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📈 Tracking Progress</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>• View your weekly and monthly progress percentages</li>
                    <li>• Check your achievement badges for motivation</li>
                    <li>• Monitor your workout streak and consistency</li>
                    <li>• Review your fitness journey in the progress section</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">⚙️ Customizing Your Experience</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>• Update your profile information in Settings</li>
                    <li>• Adjust notification preferences</li>
                    <li>• Change measurement units (metric/imperial)</li>
                    <li>• Modify your fitness goals as you progress</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                💡 Pro Tips
              </h4>
              <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
                <li>• Set realistic goals and gradually increase intensity</li>
                <li>• Stay consistent with your workout schedule</li>
                <li>• Listen to your body and take rest days when needed</li>
                <li>• Celebrate small victories and progress milestones</li>
                <li>• Use the achievement system to stay motivated</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
