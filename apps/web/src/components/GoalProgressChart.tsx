import { useState, useEffect } from 'react';
import { formatChartValue, format, subDays, eachDayOfInterval } from '@/utils/chartUtils';

interface GoalProgressChartProps {
  goal: any;
  logs: any[];
  daysCount?: number;
  showTarget?: boolean;
}

interface GoalDayData {
  date: Date;
  value: number;
  target: number;
  percentage: number;
  cumulativeValue: number;
  cumulativeTarget: number;
  cumulativePercentage: number;
}

export function GoalProgressChart({ 
  goal, 
  logs, 
  daysCount = 30,
  showTarget = true 
}: GoalProgressChartProps) {
  const [dailyData, setDailyData] = useState<GoalDayData[]>([]);
  const [viewMode, setViewMode] = useState<'daily' | 'cumulative'>('daily');

  useEffect(() => {
    if (!goal) return;

    const endDate = new Date();
    const startDate = subDays(endDate, daysCount - 1);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const goalLogs = logs.filter(log => log.goalId === goal.id);
    let cumulativeValue = 0;

    const data: GoalDayData[] = days.map((day, index) => {
      const dayLogs = goalLogs.filter(log => 
        format(log.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );

      const dayValue = dayLogs.reduce((sum, log) => sum + log.value, 0);
      cumulativeValue += dayValue;

      // Calculate daily target based on frequency
      let dailyTarget = 0;
      switch (goal.frequency) {
        case 'daily':
          dailyTarget = goal.target;
          break;
        case 'weekly':
          dailyTarget = goal.target / 7;
          break;
        case 'monthly':
          dailyTarget = goal.target / 30;
          break;
      }

      const cumulativeTarget = dailyTarget * (index + 1);

      return {
        date: day,
        value: dayValue,
        target: dailyTarget,
        percentage: dailyTarget > 0 ? (dayValue / dailyTarget) * 100 : 0,
        cumulativeValue,
        cumulativeTarget,
        cumulativePercentage: cumulativeTarget > 0 ? (cumulativeValue / cumulativeTarget) * 100 : 0
      };
    });

    setDailyData(data);
  }, [goal, logs, daysCount]);

  if (!goal || dailyData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No data available for this goal</p>
        </div>
      </div>
    );
  }

  const maxValue = viewMode === 'daily' 
    ? Math.max(...dailyData.map(d => Math.max(d.value, d.target)), 1)
    : Math.max(...dailyData.map(d => Math.max(d.cumulativeValue, d.cumulativeTarget)), 1);

  const chartWidth = 600;
  const chartHeight = 300;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const xScale = innerWidth / Math.max(dailyData.length - 1, 1);
  const yScale = innerHeight / maxValue;

  const currentData = viewMode === 'daily' ? dailyData : dailyData;
  const getValue = (d: GoalDayData) => viewMode === 'daily' ? d.value : d.cumulativeValue;
  const getTarget = (d: GoalDayData) => viewMode === 'daily' ? d.target : d.cumulativeTarget;

  const totalValue = dailyData.reduce((sum, d) => sum + d.value, 0);
  const totalTarget = goal.frequency === 'daily' 
    ? goal.target * daysCount
    : goal.frequency === 'weekly'
    ? goal.target * (daysCount / 7)
    : goal.target * (daysCount / 30);

  const overallPercentage = totalTarget > 0 ? (totalValue / totalTarget) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
          <p className="text-sm text-gray-600">
            {goal.frequency} • Target: {formatChartValue(goal.target, goal.metric)}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {Math.round(overallPercentage)}% Complete
            </div>
            <div className="text-xs text-gray-500">
              {formatChartValue(totalValue, goal.metric)} / {formatChartValue(totalTarget, goal.metric)}
            </div>
          </div>
          
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1 text-xs font-medium ${
                viewMode === 'daily'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('cumulative')}
              className={`px-3 py-1 text-xs font-medium ${
                viewMode === 'cumulative'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Cumulative
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg width={chartWidth} height={chartHeight} className="overflow-visible">
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
              const y = innerHeight - ratio * innerHeight;
              const value = ratio * maxValue;
              return (
                <g key={ratio}>
                  <line
                    x1={0}
                    y1={y}
                    x2={innerWidth}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeWidth={1}
                    strokeDasharray={ratio === 0 ? "none" : "2,2"}
                  />
                  <text
                    x={-10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                  >
                    {formatChartValue(value, goal.metric)}
                  </text>
                </g>
              );
            })}

            {/* Target line */}
            {showTarget && viewMode === 'daily' && (
              <line
                x1={0}
                y1={innerHeight - (goal.target / maxValue) * innerHeight}
                x2={innerWidth}
                y2={innerHeight - (goal.target / maxValue) * innerHeight}
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="4,4"
              />
            )}

            {/* Data line */}
            <path
              d={currentData.map((d, index) => {
                const x = index * xScale;
                const y = innerHeight - (getValue(d) / maxValue) * innerHeight;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke="#3B82F6"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {currentData.map((d, index) => {
              const x = index * xScale;
              const y = innerHeight - (getValue(d) / maxValue) * innerHeight;
              const isAboveTarget = viewMode === 'daily' 
                ? d.percentage >= 100 
                : d.cumulativePercentage >= 100;
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={4}
                  fill={isAboveTarget ? "#10B981" : "#3B82F6"}
                  stroke="white"
                  strokeWidth={2}
                  className="hover:r-6 transition-all duration-200 cursor-pointer"
                  title={`${format(d.date, 'MMM dd')}: ${formatChartValue(getValue(d), goal.metric)}`}
                />
              );
            })}

            {/* X-axis labels */}
            {currentData.filter((_, index) => index % Math.ceil(currentData.length / 6) === 0).map((d, index) => {
              const originalIndex = currentData.findIndex(item => item.date.getTime() === d.date.getTime());
              const x = originalIndex * xScale;
              return (
                <text
                  key={index}
                  x={x}
                  y={innerHeight + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {format(d.date, 'MMM dd')}
                </text>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">
            {formatChartValue(totalValue, goal.metric)}
          </div>
          <div className="text-xs text-gray-600">Total Progress</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {Math.round(overallPercentage)}%
          </div>
          <div className="text-xs text-gray-600">Completion</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {dailyData.filter(d => d.percentage >= 100).length}
          </div>
          <div className="text-xs text-gray-600">Days Above Target</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-orange-600">
            {dailyData.length > 0 
              ? formatChartValue(totalValue / dailyData.filter(d => d.value > 0).length || 0, goal.metric)
              : '0'
            }
          </div>
          <div className="text-xs text-gray-600">Daily Average</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span>Progress</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span>Above Target</span>
        </div>
        {showTarget && viewMode === 'daily' && (
          <div className="flex items-center">
            <div className="w-3 h-1 bg-yellow-500 mr-2"></div>
            <span>Daily Target</span>
          </div>
        )}
      </div>
    </div>
  );
}
