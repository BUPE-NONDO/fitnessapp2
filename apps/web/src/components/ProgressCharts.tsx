import { useState } from 'react';
import { Goal, LogEntry } from '@fitness-app/shared';
import { WeeklyProgressChart } from './WeeklyProgressChart';
import { DailyProgressChart } from './DailyProgressChart';
import { GoalProgressChart } from './GoalProgressChart';

interface ProgressChartsProps {
  goals: Goal[];
  logs: LogEntry[];
}

export function ProgressCharts({ goals, logs }: ProgressChartsProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [chartView, setChartView] = useState<'overview' | 'weekly' | 'daily' | 'goals'>('overview');

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'count': return 'times';
      case 'duration': return 'minutes';
      case 'distance': return 'km';
      case 'weight': return 'kg';
      default: return metric;
    }
  };

  // Calculate progress for each goal
  const goalProgress = goals.map(goal => {
    const goalLogs = logs.filter(log => log.goalId === goal.id);
    
    // Calculate progress based on frequency
    let progress = 0;
    let totalLogged = 0;
    
    if (goal.frequency === 'daily') {
      // For daily goals, show today's progress
      const today = new Date().toDateString();
      const todayLogs = goalLogs.filter(log => 
        new Date(log.date).toDateString() === today
      );
      totalLogged = todayLogs.reduce((sum, log) => sum + log.value, 0);
    } else if (goal.frequency === 'weekly') {
      // For weekly goals, show this week's progress
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const weekLogs = goalLogs.filter(log => 
        new Date(log.date) >= weekStart
      );
      totalLogged = weekLogs.reduce((sum, log) => sum + log.value, 0);
    } else if (goal.frequency === 'monthly') {
      // For monthly goals, show this month's progress
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthLogs = goalLogs.filter(log => 
        new Date(log.date) >= monthStart
      );
      totalLogged = monthLogs.reduce((sum, log) => sum + log.value, 0);
    }
    
    progress = Math.min((totalLogged / goal.target) * 100, 100);
    
    return {
      goal,
      progress,
      totalLogged,
      isAchieved: totalLogged >= goal.target,
      logsCount: goalLogs.length
    };
  });

  // Calculate weekly activity trend (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  }).reverse();

  const weeklyTrend = last7Days.map(dateStr => {
    const dayLogs = logs.filter(log => 
      new Date(log.date).toDateString() === dateStr
    );
    return {
      date: dateStr,
      count: dayLogs.length,
      day: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
    };
  });

  const maxDailyLogs = Math.max(...weeklyTrend.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Chart View Toggle */}
      <div className="flex flex-wrap gap-2 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setChartView('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            chartView === 'overview'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setChartView('weekly')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            chartView === 'weekly'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📈 Weekly Progress
        </button>
        <button
          onClick={() => setChartView('daily')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            chartView === 'daily'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📅 Daily Progress
        </button>
        <button
          onClick={() => setChartView('goals')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            chartView === 'goals'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🎯 Goal Details
        </button>
      </div>

      {/* Chart Content */}
      {chartView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyProgressChart
            logs={logs}
            goals={goals}
            weeksCount={8}
            height={300}
            showTrend={true}
          />
          <DailyProgressChart
            logs={logs}
            goals={goals}
            daysCount={14}
            compact={false}
          />
        </div>
      )}

      {chartView === 'weekly' && (
        <WeeklyProgressChart
          logs={logs}
          goals={goals}
          weeksCount={12}
          height={400}
          showTrend={true}
          interactive={true}
        />
      )}

      {chartView === 'daily' && (
        <DailyProgressChart
          logs={logs}
          goals={goals}
          daysCount={30}
          compact={false}
        />
      )}

      {chartView === 'goals' && (
        <div className="space-y-6">
          {/* Goal Selection */}
          {goals.length > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Goal to Analyze</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {goals.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedGoal?.id === goal.id
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{goal.title}</div>
                    <div className="text-sm text-gray-600">
                      {goal.target} {getMetricLabel(goal.metric)} • {goal.frequency}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Goal Progress Chart */}
          {(selectedGoal || goals.length === 1) && (
            <GoalProgressChart
              goal={selectedGoal || goals[0]}
              logs={logs}
              daysCount={30}
              showTarget={true}
            />
          )}

          {!selectedGoal && goals.length > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Goal to View Details
              </h3>
              <p className="text-gray-600">
                Choose a goal above to see detailed progress charts and analytics.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{goals.length}</div>
          <div className="text-sm text-gray-600">Total Goals</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {goals.filter(g => g.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Goals</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{logs.length}</div>
          <div className="text-sm text-gray-600">Total Logs</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {logs.filter(log => {
              const today = new Date().toDateString();
              return new Date(log.date).toDateString() === today;
            }).length}
          </div>
          <div className="text-sm text-gray-600">Today's Activities</div>
        </div>
      </div>
    </div>
  );
}
