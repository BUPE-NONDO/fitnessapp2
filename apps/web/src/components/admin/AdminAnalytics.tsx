import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    retentionRate: number;
    averageSessionDuration: number;
  };
  engagement: {
    totalGoals: number;
    completedGoals: number;
    totalWorkouts: number;
    totalBadgesEarned: number;
    averageStreakLength: number;
  };
  growth: {
    userGrowthRate: number;
    goalCompletionRate: number;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
}

interface AdminAnalyticsProps {
  className?: string;
}

export function AdminAnalytics({ className = '' }: AdminAnalyticsProps) {
  const { hasPermission } = useAdminAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock analytics data
  useEffect(() => {
    const mockData: AnalyticsData = {
      overview: {
        totalUsers: 1234,
        activeUsers: 856,
        newUsersToday: 12,
        newUsersThisWeek: 89,
        retentionRate: 78.5,
        averageSessionDuration: 24.5,
      },
      engagement: {
        totalGoals: 3456,
        completedGoals: 2789,
        totalWorkouts: 8945,
        totalBadgesEarned: 1567,
        averageStreakLength: 8.3,
      },
      growth: {
        userGrowthRate: 15.2,
        goalCompletionRate: 80.7,
        dailyActiveUsers: 234,
        weeklyActiveUsers: 567,
        monthlyActiveUsers: 856,
      },
    };

    setTimeout(() => {
      setAnalytics(mockData);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const canExport = hasPermission('analytics', 'export');

  const handleExport = () => {
    console.log('Exporting analytics data...');
    // Implement export functionality
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <Icon name="bar_chart" size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const overviewStats = [
    {
      name: 'Total Users',
      value: analytics.overview.totalUsers.toLocaleString(),
      change: '+12%',
      icon: 'user',
      color: 'blue',
    },
    {
      name: 'Active Users',
      value: analytics.overview.activeUsers.toLocaleString(),
      change: '+8%',
      icon: 'activity',
      color: 'green',
    },
    {
      name: 'New Users Today',
      value: analytics.overview.newUsersToday.toString(),
      change: '+15%',
      icon: 'user_plus',
      color: 'purple',
    },
    {
      name: 'Retention Rate',
      value: `${analytics.overview.retentionRate}%`,
      change: '+2.3%',
      icon: 'heart',
      color: 'red',
    },
  ];

  const engagementStats = [
    {
      name: 'Total Goals',
      value: analytics.engagement.totalGoals.toLocaleString(),
      subtitle: `${analytics.engagement.completedGoals} completed`,
      icon: 'target',
      color: 'blue',
    },
    {
      name: 'Total Workouts',
      value: analytics.engagement.totalWorkouts.toLocaleString(),
      subtitle: 'All time',
      icon: 'dumbbell',
      color: 'green',
    },
    {
      name: 'Badges Earned',
      value: analytics.engagement.totalBadgesEarned.toLocaleString(),
      subtitle: 'Total achievements',
      icon: 'trophy',
      color: 'yellow',
    },
    {
      name: 'Avg Streak',
      value: `${analytics.engagement.averageStreakLength} days`,
      subtitle: 'User average',
      icon: 'flame',
      color: 'orange',
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Monitor app performance and user engagement</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          {canExport && (
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Icon name="download" size={20} />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change}</p>
              </div>
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                stat.color === 'blue' && 'bg-blue-100',
                stat.color === 'green' && 'bg-green-100',
                stat.color === 'purple' && 'bg-purple-100',
                stat.color === 'red' && 'bg-red-100'
              )}>
                <Icon 
                  name={stat.icon as any} 
                  size={24} 
                  className={cn(
                    stat.color === 'blue' && 'text-blue-600',
                    stat.color === 'green' && 'text-green-600',
                    stat.color === 'purple' && 'text-purple-600',
                    stat.color === 'red' && 'text-red-600'
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User Engagement</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {engagementStats.map((stat) => (
              <div key={stat.name} className="text-center">
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3',
                  stat.color === 'blue' && 'bg-blue-100',
                  stat.color === 'green' && 'bg-green-100',
                  stat.color === 'yellow' && 'bg-yellow-100',
                  stat.color === 'orange' && 'bg-orange-100'
                )}>
                  <Icon 
                    name={stat.icon as any} 
                    size={28} 
                    className={cn(
                      stat.color === 'blue' && 'text-blue-600',
                      stat.color === 'green' && 'text-green-600',
                      stat.color === 'yellow' && 'text-yellow-600',
                      stat.color === 'orange' && 'text-orange-600'
                    )}
                  />
                </div>
                <h4 className="text-lg font-bold text-gray-900">{stat.value}</h4>
                <p className="text-sm font-medium text-gray-700">{stat.name}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Growth Rate</span>
                <span className="text-lg font-bold text-green-600">+{analytics.growth.userGrowthRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Daily Active</span>
                <span className="text-lg font-bold text-gray-900">{analytics.growth.dailyActiveUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Weekly Active</span>
                <span className="text-lg font-bold text-gray-900">{analytics.growth.weeklyActiveUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Active</span>
                <span className="text-lg font-bold text-gray-900">{analytics.growth.monthlyActiveUsers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Completion */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Goal Performance</h3>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {analytics.growth.goalCompletionRate}%
              </div>
              <p className="text-sm text-gray-600">Goal Completion Rate</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed Goals</span>
                <span className="font-medium">{analytics.engagement.completedGoals}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analytics.growth.goalCompletionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Goals</span>
                <span className="font-medium">{analytics.engagement.totalGoals}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { action: 'New user registered', user: 'john.doe@example.com', time: '2 minutes ago', icon: 'user_plus', color: 'green' },
              { action: 'Goal completed', user: 'jane.smith@example.com', time: '5 minutes ago', icon: 'target', color: 'blue' },
              { action: 'Badge earned', user: 'mike.johnson@example.com', time: '12 minutes ago', icon: 'trophy', color: 'yellow' },
              { action: 'Workout logged', user: 'sarah.wilson@example.com', time: '18 minutes ago', icon: 'dumbbell', color: 'purple' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  activity.color === 'green' && 'bg-green-100',
                  activity.color === 'blue' && 'bg-blue-100',
                  activity.color === 'yellow' && 'bg-yellow-100',
                  activity.color === 'purple' && 'bg-purple-100'
                )}>
                  <Icon 
                    name={activity.icon as any} 
                    size={16} 
                    className={cn(
                      activity.color === 'green' && 'text-green-600',
                      activity.color === 'blue' && 'text-blue-600',
                      activity.color === 'yellow' && 'text-yellow-600',
                      activity.color === 'purple' && 'text-purple-600'
                    )}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;
