import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { UserManagement } from './UserManagement';
import { AdminAnalytics } from './AdminAnalytics';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { ContentManagement } from './ContentManagement';
import { SystemMonitoring } from './SystemMonitoring';
import { BulkOperations } from './BulkOperations';
import { AdminSetupService } from '@/services/adminSetupService';
import { AuditLogService } from '@/services/auditLogService';
import { Icon } from '@/components/ui/Icon';

interface AdminAppProps {
  initialTab?: string;
}

export function AdminApp({ initialTab = 'overview' }: AdminAppProps) {
  const { adminUser, loading: authLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [setupStatus, setSetupStatus] = useState<{
    hasAdmins: boolean;
    adminCount: number;
    isSetupComplete: boolean;
  } | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);

  // Check setup status on mount
  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const status = await AdminSetupService.getSetupStatus();
      setSetupStatus(status);
    } catch (error) {
      console.error('Error checking setup status:', error);
    }
  };

  const handleSetupAdmins = async () => {
    try {
      setSetupLoading(true);
      await AdminSetupService.initializeAdminUsers();
      await checkSetupStatus();
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setSetupLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'advanced-analytics':
        return <AdvancedAnalytics />;
      case 'content':
        return <ContentManagement />;
      case 'system':
        return <SystemMonitoring />;
      case 'bulk':
        return <BulkOperations />;
      default:
        return null; // Will show default overview in AdminDashboard
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  // Show setup screen if no admins exist
  if (setupStatus && !setupStatus.hasAdmins) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="shield" size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Setup Required
            </h1>
            <p className="text-blue-100">
              Initialize the admin system to get started
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  First Time Setup
                </h2>
                <p className="text-gray-600">
                  This will create default admin accounts for the system.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Default Accounts</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Super Admin:</strong> admin@fitnessapp.com</p>
                  <p><strong>Admin:</strong> manager@fitnessapp.com</p>
                  <p><strong>Moderator:</strong> mod@fitnessapp.com</p>
                  <p><strong>Support:</strong> support@fitnessapp.com</p>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Default password: [role]123 (e.g., admin123)
                </p>
              </div>

              <button
                onClick={handleSetupAdmins}
                disabled={setupLoading}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors duration-200"
              >
                {setupLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Setting up...
                  </>
                ) : (
                  <>
                    <Icon name="rocket" size={20} className="mr-3" />
                    Initialize Admin System
                  </>
                )}
              </button>

              <div className="text-xs text-gray-500">
                <p>⚠️ This is a one-time setup process</p>
                <p>Make sure to change default passwords after setup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!adminUser) {
    return <AdminLogin onSuccess={() => setActiveTab('overview')} />;
  }

  // Show admin dashboard
  return (
    <AdminDashboard>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
          {[
            { id: 'overview', name: 'Overview', icon: 'home' },
            { id: 'users', name: 'Users', icon: 'user' },
            { id: 'analytics', name: 'Analytics', icon: 'bar_chart' },
            { id: 'advanced-analytics', name: 'Advanced', icon: 'trending_up' },
            { id: 'content', name: 'Content', icon: 'settings' },
            { id: 'bulk', name: 'Bulk Ops', icon: 'upload' },
            { id: 'system', name: 'System', icon: 'shield' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon name={tab.icon as any} size={18} />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderContent()}
      </div>
    </AdminDashboard>
  );
}

// Setup component for development
export function AdminSetup() {
  const [setupStatus, setSetupStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const status = await AdminSetupService.getSetupStatus();
      setSetupStatus(status);
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSetup = async () => {
    try {
      setLoading(true);
      await AdminSetupService.initializeAdminUsers();
      await checkStatus();
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Admin Setup</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Current Status</h3>
          <p>Admin Count: {setupStatus?.adminCount || 0}</p>
          <p>Setup Complete: {setupStatus?.isSetupComplete ? 'Yes' : 'No'}</p>
        </div>

        {!setupStatus?.isSetupComplete && (
          <button
            onClick={runSetup}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Run Setup
          </button>
        )}

        {setupStatus?.isSetupComplete && (
          <div className="text-green-600">
            ✅ Admin system is set up and ready!
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminApp;
