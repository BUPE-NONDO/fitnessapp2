import { format } from '@/utils/chartUtils';

interface GoalAnalyticsProps {
  goal: any;
  logs: any[];
}

interface AnalyticsData {
  totalLogs: number;
  averageValue: number;
  bestValue: number;
  worstValue: number;
  targetHits: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  consistency: number;
  improvement: number;
  weeklyAverage: number;
  monthlyAverage: number;
  recentTrend: 'up' | 'down' | 'stable';
  predictions: {
    nextWeek: number;
    nextMonth: number;
    goalCompletion: string;
  };
}

export function GoalAnalytics({ goal, logs }: GoalAnalyticsProps) {
  const analytics = calculateAnalytics(goal, logs);

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'duration':
        return value >= 60 ? `${Math.floor(value / 60)}h ${Math.round(value % 60)}m` : `${Math.round(value)}m`;
      case 'distance':
        return `${value.toFixed(1)} km`;
      case 'weight':
        return `${value.toFixed(1)} kg`;
      default:
        return Math.round(value).toString();
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {formatValue(analytics.averageValue, goal.metric)}
          </div>
          <div className="text-sm text-blue-700">Average Performance</div>
          <div className="text-xs text-blue-600 mt-1">
            {Math.round((analytics.averageValue / goal.target) * 100)}% of target
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {formatValue(analytics.bestValue, goal.metric)}
          </div>
          <div className="text-sm text-green-700">Personal Best</div>
          <div className="text-xs text-green-600 mt-1">
            {Math.round((analytics.bestValue / goal.target) * 100)}% of target
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{analytics.currentStreak}</div>
          <div className="text-sm text-purple-700">Current Streak</div>
          <div className="text-xs text-purple-600 mt-1">
            Longest: {analytics.longestStreak} days
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(analytics.completionRate)}%
          </div>
          <div className="text-sm text-orange-700">Success Rate</div>
          <div className="text-xs text-orange-600 mt-1">
            {analytics.targetHits} of {analytics.totalLogs} logs
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Consistency Analysis */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Consistency Analysis</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Logging Consistency</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${analytics.consistency}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{Math.round(analytics.consistency)}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Weekly Average</span>
              <span className="text-sm font-medium">
                {formatValue(analytics.weeklyAverage, goal.metric)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monthly Average</span>
              <span className="text-sm font-medium">
                {formatValue(analytics.monthlyAverage, goal.metric)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recent Trend</span>
              <div className="flex items-center">
                <span className="mr-1">{getTrendIcon(analytics.recentTrend)}</span>
                <span className={`text-sm font-medium ${getTrendColor(analytics.recentTrend)}`}>
                  {analytics.recentTrend === 'up' ? 'Improving' : 
                   analytics.recentTrend === 'down' ? 'Declining' : 'Stable'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Predictions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Predictions</h4>
          
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-1">Next Week Prediction</div>
              <div className="text-lg font-bold text-blue-600">
                {formatValue(analytics.predictions.nextWeek, goal.metric)}
              </div>
              <div className="text-xs text-blue-600">
                Based on recent performance trend
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700 mb-1">Next Month Prediction</div>
              <div className="text-lg font-bold text-green-600">
                {formatValue(analytics.predictions.nextMonth, goal.metric)}
              </div>
              <div className="text-xs text-green-600">
                Projected monthly average
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-700 mb-1">Goal Completion</div>
              <div className="text-lg font-bold text-purple-600">
                {analytics.predictions.goalCompletion}
              </div>
              <div className="text-xs text-purple-600">
                Estimated timeline to consistent success
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">💡 Improvement Suggestions</h4>
        
        <div className="space-y-3">
          {getImprovementSuggestions(analytics, goal).map((suggestion, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-lg">{suggestion.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{suggestion.title}</div>
                <div className="text-sm text-gray-600">{suggestion.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Milestones */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">🏆 Achievement Milestones</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getAchievementMilestones(analytics, goal).map((milestone, index) => (
            <div key={index} className={`p-4 rounded-lg border-2 ${
              milestone.achieved ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-center">
                <div className="text-2xl mb-2">{milestone.icon}</div>
                <div className="font-medium text-gray-900">{milestone.title}</div>
                <div className="text-sm text-gray-600 mt-1">{milestone.description}</div>
                {milestone.achieved && (
                  <div className="text-xs text-green-600 mt-2 font-medium">✓ Achieved!</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function calculateAnalytics(goal: any, logs: any[]): AnalyticsData {
  if (logs.length === 0) {
    return {
      totalLogs: 0,
      averageValue: 0,
      bestValue: 0,
      worstValue: 0,
      targetHits: 0,
      completionRate: 0,
      currentStreak: 0,
      longestStreak: 0,
      consistency: 0,
      improvement: 0,
      weeklyAverage: 0,
      monthlyAverage: 0,
      recentTrend: 'stable',
      predictions: {
        nextWeek: 0,
        nextMonth: 0,
        goalCompletion: 'No data available'
      }
    };
  }

  const values = logs.map(log => log.value);
  const totalLogs = logs.length;
  const averageValue = values.reduce((sum, val) => sum + val, 0) / totalLogs;
  const bestValue = Math.max(...values);
  const worstValue = Math.min(...values);
  const targetHits = logs.filter(log => log.value >= goal.target).length;
  const completionRate = (targetHits / totalLogs) * 100;

  // Calculate streaks
  const sortedLogs = logs.sort((a, b) => b.date.getTime() - a.date.getTime());
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < sortedLogs.length; i++) {
    if (sortedLogs[i].value >= goal.target) {
      tempStreak++;
      if (i === 0) currentStreak = tempStreak;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
      if (i === 0) currentStreak = 0;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate consistency (days with logs vs total days)
  const daysSinceFirst = Math.ceil((new Date().getTime() - logs[logs.length - 1].date.getTime()) / (1000 * 60 * 60 * 24));
  const uniqueDays = new Set(logs.map(log => log.date.toDateString())).size;
  const consistency = Math.min(100, (uniqueDays / Math.max(1, daysSinceFirst)) * 100);

  // Calculate recent trend
  const recentLogs = logs.slice(0, Math.min(7, logs.length));
  const olderLogs = logs.slice(7, Math.min(14, logs.length));
  const recentAvg = recentLogs.reduce((sum, log) => sum + log.value, 0) / recentLogs.length;
  const olderAvg = olderLogs.length > 0 ? olderLogs.reduce((sum, log) => sum + log.value, 0) / olderLogs.length : recentAvg;
  
  let recentTrend: 'up' | 'down' | 'stable' = 'stable';
  const trendDiff = ((recentAvg - olderAvg) / olderAvg) * 100;
  if (Math.abs(trendDiff) > 10) {
    recentTrend = trendDiff > 0 ? 'up' : 'down';
  }

  // Calculate averages
  const weeklyLogs = logs.filter(log => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return log.date >= weekAgo;
  });
  const monthlyLogs = logs.filter(log => {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    return log.date >= monthAgo;
  });

  const weeklyAverage = weeklyLogs.length > 0 ? weeklyLogs.reduce((sum, log) => sum + log.value, 0) / weeklyLogs.length : 0;
  const monthlyAverage = monthlyLogs.length > 0 ? monthlyLogs.reduce((sum, log) => sum + log.value, 0) / monthlyLogs.length : 0;

  // Predictions
  const nextWeek = recentTrend === 'up' ? recentAvg * 1.1 : recentTrend === 'down' ? recentAvg * 0.9 : recentAvg;
  const nextMonth = monthlyAverage > 0 ? monthlyAverage : averageValue;
  
  let goalCompletion = 'On track';
  if (completionRate < 50) goalCompletion = '2-3 months';
  else if (completionRate < 75) goalCompletion = '1-2 months';
  else if (completionRate < 90) goalCompletion = '2-4 weeks';
  else goalCompletion = 'Already achieving!';

  return {
    totalLogs,
    averageValue,
    bestValue,
    worstValue,
    targetHits,
    completionRate,
    currentStreak,
    longestStreak,
    consistency,
    improvement: trendDiff,
    weeklyAverage,
    monthlyAverage,
    recentTrend,
    predictions: {
      nextWeek,
      nextMonth,
      goalCompletion
    }
  };
}

function getImprovementSuggestions(analytics: AnalyticsData, goal: any) {
  const suggestions = [];

  if (analytics.consistency < 70) {
    suggestions.push({
      icon: '📅',
      title: 'Improve Consistency',
      description: 'Try to log activities more regularly. Set daily reminders to build the habit.'
    });
  }

  if (analytics.completionRate < 60) {
    suggestions.push({
      icon: '🎯',
      title: 'Adjust Target',
      description: 'Consider lowering your target temporarily to build confidence and momentum.'
    });
  }

  if (analytics.recentTrend === 'down') {
    suggestions.push({
      icon: '💪',
      title: 'Boost Motivation',
      description: 'Your recent performance is declining. Try mixing up your routine or finding an accountability partner.'
    });
  }

  if (analytics.currentStreak === 0) {
    suggestions.push({
      icon: '🔥',
      title: 'Start a Streak',
      description: 'Focus on hitting your target for the next 3 days to build momentum.'
    });
  }

  return suggestions;
}

function getAchievementMilestones(analytics: AnalyticsData, goal: any) {
  return [
    {
      icon: '🎯',
      title: 'First Target Hit',
      description: 'Achieve your target for the first time',
      achieved: analytics.targetHits > 0
    },
    {
      icon: '🔥',
      title: '7-Day Streak',
      description: 'Hit your target 7 days in a row',
      achieved: analytics.longestStreak >= 7
    },
    {
      icon: '⭐',
      title: 'Consistency Master',
      description: 'Maintain 80%+ logging consistency',
      achieved: analytics.consistency >= 80
    },
    {
      icon: '🏆',
      title: '30-Day Champion',
      description: 'Hit your target 30 days in a row',
      achieved: analytics.longestStreak >= 30
    },
    {
      icon: '👑',
      title: 'Overachiever',
      description: 'Exceed your target by 50%',
      achieved: analytics.bestValue >= goal.target * 1.5
    },
    {
      icon: '💎',
      title: 'Perfect Month',
      description: '100% success rate over 30 days',
      achieved: analytics.completionRate >= 100 && analytics.totalLogs >= 30
    }
  ];
}
