import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminAnalyticsService, AdminAnalytics } from '@/services/adminAnalyticsService';
import { Icon } from '@/components/ui/Icon';
import { ThemeToggle } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface AdminDashboardProps {
  children?: React.ReactNode;
}

interface NavigationItem {
  id: string;
  name: string;
  icon: string;
  href: string;
  requiredPermission?: {
    category: string;
    action: string;
  };
  requiredRole?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'overview',
    name: 'Overview',
    icon: 'home',
    href: '/admin',
  },
  {
    id: 'users',
    name: 'User Management',
    icon: 'user',
    href: '/admin/users',
    requiredPermission: { category: 'users', action: 'view' },
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: 'bar_chart',
    href: '/admin/analytics',
    requiredPermission: { category: 'analytics', action: 'view' },
  },
  {
    id: 'content',
    name: 'Content Management',
    icon: 'settings',
    href: '/admin/content',
    requiredPermission: { category: 'content', action: 'view' },
  },
  {
    id: 'system',
    name: 'System',
    icon: 'shield',
    href: '/admin/system',
    requiredPermission: { category: 'system', action: 'view' },
  },
];

export function AdminDashboard({ children }: AdminDashboardProps) {
  const { adminUser, signOut, hasPermission } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await AdminAnalyticsService.getAdminAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load admin analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const filteredNavigation = navigationItems.filter(item => {
    if (item.requiredPermission) {
      return hasPermission(
        item.requiredPermission.category as any,
        item.requiredPermission.action
      );
    }
    return true;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'moderator': return 'bg-green-100 text-green-800';
      case 'support': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={cn(
        'bg-white shadow-lg transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={cn('flex items-center', !sidebarOpen && 'justify-center')}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icon name="shield" size={20} className="text-white" />
              </div>
              {sidebarOpen && (
                <div className="ml-3">
                  <h1 className="text-lg font-bold text-gray-900">Admin Portal</h1>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Icon name={sidebarOpen ? 'chevron_left' : 'chevron_right'} size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredNavigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors',
                activeTab === item.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon name={item.icon as any} size={20} />
              {sidebarOpen && (
                <span className="ml-3 font-medium">{item.name}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Icon name="user" size={16} className="text-gray-600" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {adminUser?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {adminUser?.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getRoleColor(adminUser?.role || '')
                )}>
                  {adminUser?.role?.replace('_', ' ').toUpperCase()}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Sign Out"
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <Icon name="user" size={16} className="text-gray-600" />
              </div>
              <button
                onClick={handleSignOut}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Sign Out"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navigationItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600">
                Welcome back, {adminUser?.name}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6">
                {loading ? (
                  <>
                    <div className="text-center animate-pulse">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="text-center animate-pulse">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="text-center animate-pulse">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  </>
                ) : analytics ? (
                  <>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {analytics.totalUsers.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{analytics.systemUptime}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{analytics.dailyActiveUsers}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Active Today</div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <div className="text-sm">Unable to load stats</div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <ThemeToggle size="md" />

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Icon name="bell" size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children || <AdminOverview activeTab={activeTab} analytics={analytics} loading={loading} />}
        </main>
      </div>
    </div>
  );
}

// Default overview component
function AdminOverview({ activeTab, analytics, loading }: {
  activeTab: string;
  analytics: AdminAnalytics | null;
  loading: boolean;
}) {
  const { adminUser } = useAdminAuth();

  const getStats = () => {
    if (!analytics) return [];

    return [
      {
        name: 'Total Users',
        value: analytics.totalUsers.toLocaleString(),
        change: analytics.newUsersThisWeek > 0 ? `+${analytics.newUsersThisWeek} this week` : 'No new users',
        icon: 'user',
        color: 'blue'
      },
      {
        name: 'Active Users',
        value: analytics.activeUsers.toLocaleString(),
        change: `${Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}% of total`,
        icon: 'activity',
        color: 'green'
      },
      {
        name: 'Total Goals',
        value: analytics.totalGoals.toLocaleString(),
        change: `${Math.round(analytics.goalCompletionRate)}% completed`,
        icon: 'target',
        color: 'purple'
      },
      {
        name: 'Badges Earned',
        value: analytics.totalBadgesEarned.toLocaleString(),
        change: `${Math.round(analytics.totalBadgesEarned / Math.max(analytics.totalUsers, 1))} per user`,
        icon: 'trophy',
        color: 'yellow'
      },
    ];
  };

  const stats = getStats();

  if (activeTab !== 'overview') {
    return (
      <div className="text-center py-12">
        <Icon name="settings" size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {navigationItems.find(item => item.id === activeTab)?.name}
        </h3>
        <p className="text-gray-600">
          This section is under development
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-2">
          Welcome back, {adminUser?.name}! 👋
        </h3>
        <p className="text-blue-100">
          Here's what's happening with your fitness app today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          ))
        ) : (
          stats.map((stat) => (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">{stat.change}</p>
                </div>
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  stat.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/30',
                  stat.color === 'green' && 'bg-green-100 dark:bg-green-900/30',
                  stat.color === 'purple' && 'bg-purple-100 dark:bg-purple-900/30',
                  stat.color === 'yellow' && 'bg-yellow-100 dark:bg-yellow-900/30'
                )}>
                  <Icon
                    name={stat.icon as any}
                    size={24}
                    className={cn(
                      stat.color === 'blue' && 'text-blue-600',
                      stat.color === 'green' && 'text-green-600',
                      stat.color === 'purple' && 'text-purple-600',
                      stat.color === 'yellow' && 'text-yellow-600'
                    )}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Recent Activity</h4>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Icon name="activity" size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
