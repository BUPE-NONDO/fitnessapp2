import { useState, useEffect } from 'react';
import { getCompletionColor, defaultChartConfig, format, subDays, eachDayOfInterval, isToday } from '@/utils/chartUtils';

interface DailyProgressChartProps {
  logs: any[];
  goals: any[];
  daysCount?: number;
  compact?: boolean;
}

interface DayData {
  date: Date;
  value: number;
  target: number;
  percentage: number;
  isToday: boolean;
  logs: any[];
}

export function DailyProgressChart({ 
  logs, 
  goals, 
  daysCount = 30,
  compact = false 
}: DailyProgressChartProps) {
  const [dailyData, setDailyData] = useState<DayData[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  useEffect(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, daysCount - 1);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const data: DayData[] = days.map(day => {
      const dayLogs = logs.filter(log => 
        format(log.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );

      const totalValue = dayLogs.reduce((sum, log) => sum + log.value, 0);
      const activeGoals = goals.filter(goal => goal.isActive);
      const totalTarget = activeGoals.reduce((sum, goal) => {
        // Calculate daily target based on frequency
        switch (goal.frequency) {
          case 'daily':
            return sum + goal.target;
          case 'weekly':
            return sum + goal.target / 7;
          case 'monthly':
            return sum + goal.target / 30;
          default:
            return sum;
        }
      }, 0);

      return {
        date: day,
        value: totalValue,
        target: totalTarget,
        percentage: totalTarget > 0 ? (totalValue / totalTarget) * 100 : 0,
        isToday: isToday(day),
        logs: dayLogs
      };
    });

    setDailyData(data);
  }, [logs, goals, daysCount]);

  const maxPercentage = Math.max(...dailyData.map(d => d.percentage), 100);
  const averageCompletion = dailyData.length > 0 
    ? dailyData.reduce((sum, day) => sum + day.percentage, 0) / dailyData.length 
    : 0;

  const streakDays = calculateCurrentStreak(dailyData);

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">Daily Progress</h4>
          <div className="text-xs text-gray-600">
            {streakDays} day streak
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-3">
          {dailyData.slice(-7).map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {format(day.date, 'EEE')}
              </div>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                  day.percentage >= 100 ? 'bg-green-100 text-green-800' :
                  day.percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                  day.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  day.percentage > 0 ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-500'
                } ${day.isToday ? 'ring-2 ring-primary-500' : ''}`}
                title={`${format(day.date, 'MMM dd')}: ${Math.round(day.percentage)}%`}
              >
                {Math.round(day.percentage)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-600 text-center">
          Avg: {Math.round(averageCompletion)}% completion
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Daily Progress</h3>
          <p className="text-sm text-gray-600">Goal completion over the last {daysCount} days</p>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {streakDays} Day Streak
          </div>
          <div className="text-xs text-gray-500">
            Avg: {Math.round(averageCompletion)}%
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dailyData.map((day, index) => (
          <div
            key={index}
            className={`aspect-square rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
              day.percentage >= 100 ? 'bg-green-100 border-green-300' :
              day.percentage >= 80 ? 'bg-blue-100 border-blue-300' :
              day.percentage >= 60 ? 'bg-yellow-100 border-yellow-300' :
              day.percentage > 0 ? 'bg-red-100 border-red-300' :
              'bg-gray-50 border-gray-200'
            } ${day.isToday ? 'ring-2 ring-primary-500' : ''} ${
              selectedDay?.date.getTime() === day.date.getTime() ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => setSelectedDay(selectedDay?.date.getTime() === day.date.getTime() ? null : day)}
          >
            <div className="h-full flex flex-col items-center justify-center p-1">
              <div className="text-xs font-medium text-gray-700">
                {format(day.date, 'd')}
              </div>
              <div className={`text-xs font-bold ${
                day.percentage >= 100 ? 'text-green-700' :
                day.percentage >= 80 ? 'text-blue-700' :
                day.percentage >= 60 ? 'text-yellow-700' :
                day.percentage > 0 ? 'text-red-700' :
                'text-gray-500'
              }`}>
                {day.percentage > 0 ? `${Math.round(day.percentage)}%` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              {format(selectedDay.date, 'EEEE, MMMM dd, yyyy')}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {Math.round(selectedDay.percentage)}%
              </div>
              <div className="text-xs text-gray-600">Completion</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {selectedDay.value.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {selectedDay.logs.length}
              </div>
              <div className="text-xs text-gray-600">Activities</div>
            </div>
          </div>

          {selectedDay.logs.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-2">Activities:</h5>
              <div className="space-y-1">
                {selectedDay.logs.map((log, index) => {
                  const goal = goals.find(g => g.id === log.goalId);
                  return (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-600">{goal?.title || 'Unknown Goal'}</span>
                      <span className="font-medium">{log.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
          <span>100%+</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
          <span>80-99%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
          <span>60-79%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></div>
          <span>&lt;60%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded mr-2"></div>
          <span>No activity</span>
        </div>
      </div>
    </div>
  );
}

function calculateCurrentStreak(dailyData: DayData[]): number {
  let streak = 0;
  
  // Start from the most recent day and work backwards
  for (let i = dailyData.length - 1; i >= 0; i--) {
    if (dailyData[i].percentage >= 80) { // Consider 80%+ as a successful day
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
