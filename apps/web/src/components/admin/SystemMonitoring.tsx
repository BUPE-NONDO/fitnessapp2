import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AuditLogService } from '@/services/auditLogService';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface SystemMonitoringProps {
  className?: string;
}

export function SystemMonitoring({ className = '' }: SystemMonitoringProps) {
  const { hasPermission } = useAdminAuth();
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [auditSummary, setAuditSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'logs' | 'performance'>('overview');

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      // Mock system health data
      const mockHealth: SystemHealth = {
        status: 'healthy',
        uptime: 99.9,
        responseTime: 245,
        errorRate: 0.02,
        activeUsers: 156,
        memoryUsage: 68,
        cpuUsage: 23,
      };

      // Mock alerts
      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'High Memory Usage',
          message: 'Memory usage is above 80% threshold',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          resolved: false,
        },
        {
          id: '2',
          type: 'info',
          title: 'Scheduled Maintenance',
          message: 'System maintenance scheduled for tonight at 2 AM',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          resolved: false,
        },
        {
          id: '3',
          type: 'error',
          title: 'Database Connection Issue',
          message: 'Temporary database connection timeout resolved',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
          resolved: true,
        },
      ];

      // Load audit summary
      const summary = await AuditLogService.getActivitySummary();

      setSystemHealth(mockHealth);
      setAlerts(mockAlerts);
      setAuditSummary(summary);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load system data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 dark:bg-green-900/30';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'critical': return 'bg-red-100 dark:bg-red-900/30';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return 'x';
      case 'warning': return 'alert_triangle';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading system data...</span>
      </div>
    );
  }

  if (!hasPermission('system', 'view')) {
    return (
      <div className="text-center py-12">
        <Icon name="shield" size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Access Denied</h3>
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to view system monitoring</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Monitoring</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitor system health, performance, and security</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={cn(
            'flex items-center space-x-2 px-3 py-2 rounded-lg',
            getStatusBg(systemHealth?.status || 'healthy')
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full',
              systemHealth?.status === 'healthy' ? 'bg-green-500' :
              systemHealth?.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            )}></div>
            <span className={cn('font-medium capitalize', getStatusColor(systemHealth?.status || 'healthy'))}>
              {systemHealth?.status || 'Unknown'}
            </span>
          </div>
          
          <button
            onClick={loadSystemData}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Icon name="refresh" size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: 'home' },
            { id: 'alerts', name: 'Alerts', icon: 'alert_triangle', count: alerts.filter(a => !a.resolved).length },
            { id: 'logs', name: 'Audit Logs', icon: 'file_text' },
            { id: 'performance', name: 'Performance', icon: 'bar_chart' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
              )}
            >
              <Icon name={tab.icon as any} size={18} />
              <span>{tab.name}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                  <p className="text-2xl font-bold text-green-600">{systemHealth?.uptime}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Icon name="check_circle" size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                  <p className="text-2xl font-bold text-blue-600">{systemHealth?.responseTime}ms</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Icon name="zap" size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-purple-600">{systemHealth?.activeUsers}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Icon name="user" size={24} className="text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
                  <p className="text-2xl font-bold text-red-600">{systemHealth?.errorRate}%</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <Icon name="alert_triangle" size={24} className="text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Resource Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Memory Usage</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Used</span>
                  <span className="font-medium text-gray-900 dark:text-white">{systemHealth?.memoryUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${systemHealth?.memoryUsage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">CPU Usage</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Used</span>
                  <span className="font-medium text-gray-900 dark:text-white">{systemHealth?.cpuUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${systemHealth?.cpuUsage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Icon name="check_circle" size={48} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Alerts</h3>
              <p className="text-gray-600 dark:text-gray-400">System is running smoothly</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4',
                  alert.type === 'error' && 'border-l-red-500',
                  alert.type === 'warning' && 'border-l-yellow-500',
                  alert.type === 'info' && 'border-l-blue-500',
                  alert.resolved && 'opacity-60'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Icon 
                      name={getAlertIcon(alert.type) as any} 
                      size={20} 
                      className={getAlertColor(alert.type)} 
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {alert.resolved ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Resolved
                      </span>
                    ) : (
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'logs' && auditSummary && (
        <div className="space-y-6">
          {/* Audit Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{auditSummary.totalActions}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Actions</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{auditSummary.todayActions}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{auditSummary.weekActions}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{auditSummary.criticalActions}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
              </div>
            </div>
          </div>

          {/* Top Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Admin Actions</h3>
            <div className="space-y-3">
              {auditSummary.topActions.map((action: any, index: number) => (
                <div key={action.action} className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-white">{action.action.replace('_', ' ')}</span>
                  <span className="font-medium text-gray-600 dark:text-gray-400">{action.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Icon name="bar_chart" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Performance Metrics</h3>
          <p className="text-gray-600 dark:text-gray-400">Detailed performance charts coming soon</p>
        </div>
      )}
    </div>
  );
}

export default SystemMonitoring;
