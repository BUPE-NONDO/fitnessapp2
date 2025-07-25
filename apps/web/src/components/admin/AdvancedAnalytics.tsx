import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
}

interface AdvancedAnalyticsProps {
  className?: string;
}

export function AdvancedAnalytics({ className = '' }: AdvancedAnalyticsProps) {
  const { hasPermission } = useAdminAuth();
  const [activeChart, setActiveChart] = useState<'users' | 'engagement' | 'revenue' | 'retention'>('users');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [activeChart, timeRange]);

  const loadChartData = async () => {
    setLoading(true);
    
    // Mock chart data based on active chart and time range
    const mockData: ChartData = {
      labels: generateLabels(timeRange),
      datasets: generateDatasets(activeChart, timeRange),
    };

    setTimeout(() => {
      setChartData(mockData);
      setLoading(false);
    }, 1000);
  };

  const generateLabels = (range: string): string[] => {
    const now = new Date();
    const labels: string[] = [];
    
    switch (range) {
      case '7d':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        break;
      case '30d':
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        break;
      case '90d':
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        }
        break;
      case '1y':
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        }
        break;
    }
    
    return labels;
  };

  const generateDatasets = (chart: string, range: string) => {
    const dataLength = range === '7d' ? 7 : range === '30d' ? 30 : 12;
    
    switch (chart) {
      case 'users':
        return [
          {
            label: 'New Users',
            data: Array.from({ length: dataLength }, () => Math.floor(Math.random() * 50) + 10),
            color: '#3B82F6',
          },
          {
            label: 'Active Users',
            data: Array.from({ length: dataLength }, () => Math.floor(Math.random() * 200) + 100),
            color: '#10B981',
          },
        ];
      case 'engagement':
        return [
          {
            label: 'Goals Created',
            data: Array.from({ length: dataLength }, () => Math.floor(Math.random() * 30) + 5),
            color: '#8B5CF6',
          },
          {
            label: 'Workouts Logged',
            data: Array.from({ length: dataLength }, () => Math.floor(Math.random() * 100) + 20),
            color: '#F59E0B',
          },
        ];
      case 'retention':
        return [
          {
            label: 'Day 1 Retention',
            data: Array.from({ length: dataLength }, () => Math.floor(Math.random() * 20) + 70),
            color: '#EF4444',
          },
          {
            label: 'Day 7 Retention',
            data: Array.from({ length: dataLength }, () => Math.floor(Math.random() * 15) + 45),
            color: '#F97316',
          },
        ];
      default:
        return [];
    }
  };

  const exportData = async () => {
    if (!hasPermission('analytics', 'export')) {
      alert('You do not have permission to export data');
      return;
    }

    // Mock export functionality
    const csvData = generateCSVData();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${activeChart}-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateCSVData = (): string => {
    if (!chartData) return '';
    
    const headers = ['Date', ...chartData.datasets.map(d => d.label)];
    const rows = chartData.labels.map((label, index) => [
      label,
      ...chartData.datasets.map(dataset => dataset.data[index])
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const chartTypes = [
    { id: 'users', name: 'User Growth', icon: 'user', description: 'New and active user trends' },
    { id: 'engagement', name: 'Engagement', icon: 'activity', description: 'User engagement metrics' },
    { id: 'retention', name: 'Retention', icon: 'heart', description: 'User retention rates' },
  ];

  if (!hasPermission('analytics', 'view')) {
    return (
      <div className="text-center py-12">
        <Icon name="bar_chart" size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Access Denied</h3>
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to view analytics</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Detailed insights and custom reports</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>

          {hasPermission('analytics', 'export') && (
            <button
              onClick={exportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Icon name="download" size={20} />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {chartTypes.map((chart) => (
          <button
            key={chart.id}
            onClick={() => setActiveChart(chart.id as any)}
            className={cn(
              'p-4 rounded-xl border-2 transition-all duration-200 text-left',
              activeChart === chart.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            )}
          >
            <div className="flex items-center space-x-3 mb-2">
              <Icon name={chart.icon as any} size={24} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{chart.name}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{chart.description}</p>
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading chart...</span>
          </div>
        ) : chartData ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {chartTypes.find(c => c.id === activeChart)?.name} - {timeRange.toUpperCase()}
            </h3>
            
            {/* Simple Bar Chart Visualization */}
            <div className="h-64 flex items-end space-x-2 overflow-x-auto">
              {chartData.labels.map((label, index) => (
                <div key={index} className="flex flex-col items-center min-w-0 flex-1">
                  <div className="flex flex-col items-center space-y-1 mb-2 h-48">
                    {chartData.datasets.map((dataset, datasetIndex) => {
                      const maxValue = Math.max(...chartData.datasets.flatMap(d => d.data));
                      const height = (dataset.data[index] / maxValue) * 180;
                      
                      return (
                        <div
                          key={datasetIndex}
                          className="w-8 rounded-t transition-all duration-500 hover:opacity-80"
                          style={{
                            height: `${height}px`,
                            backgroundColor: dataset.color,
                            minHeight: '4px',
                          }}
                          title={`${dataset.label}: ${dataset.data[index]}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center transform -rotate-45 origin-center">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6">
              {chartData.datasets.map((dataset, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: dataset.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{dataset.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Icon name="bar_chart" size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No chart data available</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {chartData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {chartData.datasets.map((dataset, index) => {
            const total = dataset.data.reduce((sum, value) => sum + value, 0);
            const average = Math.round(total / dataset.data.length);
            const trend = dataset.data[dataset.data.length - 1] - dataset.data[dataset.data.length - 2];
            
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{dataset.label}</h4>
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: dataset.color }}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{average}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average</div>
                  <div className={cn(
                    'text-sm font-medium',
                    trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
                  )}>
                    {trend > 0 ? '+' : ''}{trend} from previous
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdvancedAnalytics;
