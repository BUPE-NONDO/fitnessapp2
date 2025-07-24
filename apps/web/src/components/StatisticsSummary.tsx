import { Goal, LogEntry } from '@fitness-app/shared';

interface StatisticsSummaryProps {
  goals: Goal[];
  logs: LogEntry[];
}

export function StatisticsSummary({ goals, logs }: StatisticsSummaryProps) {
  // Calculate various statistics
  const totalGoals = goals.length;
  const activeGoals = goals.filter(g => g.isActive).length;
  const totalLogs = logs.length;
  
  // Calculate achievements
  const achievements = logs.filter(log => {
    const goal = goals.find(g => g.id === log.goalId);
    return goal && log.value >= goal.target;
  }).length;

  // Calculate today's activities
  const today = new Date().toDateString();
  const todayLogs = logs.filter(log => 
    new Date(log.date).toDateString() === today
  ).length;

  // Calculate this week's activities
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const thisWeekLogs = logs.filter(log => 
    new Date(log.date) >= weekStart
  ).length;

  // Calculate streak (consecutive days with activities)
  const calculateStreak = () => {
    const sortedDates = [...new Set(logs.map(log => 
      new Date(log.date).toDateString()
    ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (sortedDates.length === 0) return 0;

    let streak = 0;
    const today = new Date().toDateString();
    let currentDate = new Date();

    // Check if there's activity today or yesterday
    if (sortedDates[0] === today) {
      streak = 1;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (sortedDates[0] === new Date(Date.now() - 86400000).toDateString()) {
      streak = 1;
      currentDate = new Date(sortedDates[0]);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      return 0;
    }

    // Count consecutive days
    for (let i = 1; i < sortedDates.length; i++) {
      const expectedDate = currentDate.toDateString();
      if (sortedDates[i] === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  // Calculate average activities per day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30DaysLogs = logs.filter(log => 
    new Date(log.date) >= thirtyDaysAgo
  );
  const avgActivitiesPerDay = last30DaysLogs.length / 30;

  // Calculate goal completion rate
  const goalCompletionRate = totalGoals > 0 ? (achievements / totalLogs) * 100 : 0;

  // Calculate most active goal
  const goalActivity = goals.map(goal => ({
    goal,
    logCount: logs.filter(log => log.goalId === goal.id).length
  })).sort((a, b) => b.logCount - a.logCount);

  const mostActiveGoal = goalActivity[0]?.goal;

  const stats = [
    {
      label: 'Total Goals',
      value: totalGoals,
      icon: '🎯',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Active Goals',
      value: activeGoals,
      icon: '✅',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      label: 'Total Activities',
      value: totalLogs,
      icon: '📝',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      label: 'Achievements',
      value: achievements,
      icon: '🏆',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      label: 'Today\'s Activities',
      value: todayLogs,
      icon: '📅',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      label: 'This Week',
      value: thisWeekLogs,
      icon: '📊',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      label: 'Current Streak',
      value: currentStreak,
      suffix: currentStreak === 1 ? ' day' : ' days',
      icon: '🔥',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      label: 'Daily Average',
      value: avgActivitiesPerDay.toFixed(1),
      suffix: ' activities',
      icon: '📈',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`card ${stat.bgColor} ${stat.borderColor} border`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}{stat.suffix || ''}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {stat.label}
                </div>
              </div>
              <div className="text-2xl">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goal Completion Rate */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Goal Completion Rate
          </h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Success Rate</span>
            <span className="text-lg font-bold text-primary-600">
              {goalCompletionRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                goalCompletionRate >= 75 
                  ? 'bg-green-500' 
                  : goalCompletionRate >= 50 
                    ? 'bg-blue-500' 
                    : goalCompletionRate >= 25 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(goalCompletionRate, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {achievements} achievements out of {totalLogs} activities
          </div>
        </div>

        {/* Most Active Goal */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔥 Most Active Goal
          </h3>
          {mostActiveGoal ? (
            <div>
              <div className="font-medium text-gray-900 mb-1">
                {mostActiveGoal.title}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {goalActivity[0].logCount} activities logged
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                  {mostActiveGoal.metric}
                </span>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                  {mostActiveGoal.frequency}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-gray-600">No activities yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200">
        <div className="text-center">
          <div className="text-3xl mb-2">
            {currentStreak >= 7 ? '🔥' : currentStreak >= 3 ? '💪' : achievements > 0 ? '🎉' : '🚀'}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {currentStreak >= 7 
              ? 'Amazing streak! You\'re on fire!' 
              : currentStreak >= 3 
                ? 'Great consistency! Keep it up!' 
                : achievements > 0 
                  ? 'Congratulations on your achievements!' 
                  : 'Ready to start your fitness journey?'
            }
          </h3>
          <p className="text-gray-600">
            {currentStreak >= 7 
              ? `${currentStreak} days of consistent activity. You're building great habits!`
              : currentStreak >= 3 
                ? `${currentStreak} days in a row. Consistency is key to success!`
                : achievements > 0 
                  ? `You've achieved ${achievements} goals. Every achievement counts!`
                  : 'Set your goals and start logging activities to see your progress!'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
