// Note: Using basic date functions instead of date-fns to avoid dependency issues
// This is a simplified implementation for the chart utilities

// Simple date utility functions
export function format(date: Date, formatStr: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  switch (formatStr) {
    case 'MMM dd':
      return `${monthNames[month - 1]} ${day.toString().padStart(2, '0')}`;
    case 'yyyy-MM-dd':
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    case 'EEEE, MMMM dd, yyyy':
      return `${dayNames[date.getDay()]}, ${monthNames[month - 1]} ${day}, ${year}`;
    case 'EEE':
      return shortDayNames[date.getDay()];
    case 'd':
      return day.toString();
    default:
      return date.toLocaleDateString();
  }
}

export function startOfWeek(date: Date, options?: { weekStartsOn?: number }): Date {
  const weekStartsOn = options?.weekStartsOn || 0; // 0 = Sunday, 1 = Monday
  const day = date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  const result = new Date(date);
  result.setDate(date.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfWeek(date: Date, options?: { weekStartsOn?: number }): Date {
  const start = startOfWeek(date, options);
  const result = new Date(start);
  result.setDate(start.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function eachDayOfInterval(interval: { start: Date; end: Date }): Date[] {
  const days: Date[] = [];
  const current = new Date(interval.start);

  while (current <= interval.end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function subWeeks(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(date.getDate() - (amount * 7));
  return result;
}

export function subDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(date.getDate() - amount);
  return result;
}

export function isWithinInterval(date: Date, interval: { start: Date; end: Date }): boolean {
  return date >= interval.start && date <= interval.end;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export interface ChartDataPoint {
  date: Date;
  value: number;
  target: number;
  percentage: number;
  goalId?: string;
  goalTitle?: string;
}

export interface WeeklyData {
  week: string;
  startDate: Date;
  endDate: Date;
  totalValue: number;
  totalTarget: number;
  completionPercentage: number;
  dailyData: ChartDataPoint[];
  goals: {
    goalId: string;
    goalTitle: string;
    value: number;
    target: number;
    percentage: number;
  }[];
}

export interface ChartConfig {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    grid: string;
    text: string;
  };
}

export const defaultChartConfig: ChartConfig = {
  width: 800,
  height: 400,
  margin: {
    top: 20,
    right: 30,
    bottom: 40,
    left: 50
  },
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    grid: '#E5E7EB',
    text: '#374151'
  }
};

export function generateWeeklyData(
  logs: any[],
  goals: any[],
  weeksCount: number = 12
): WeeklyData[] {
  const weeks: WeeklyData[] = [];
  const today = new Date();

  for (let i = weeksCount - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    const weekLogs = logs.filter(log => 
      isWithinInterval(log.date, { start: weekStart, end: weekEnd })
    );

    const dailyData: ChartDataPoint[] = [];
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Calculate daily data
    days.forEach(day => {
      const dayLogs = weekLogs.filter(log => 
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
            return sum + goal.target / 7; // Distribute weekly target across 7 days
          case 'monthly':
            return sum + goal.target / 30; // Approximate monthly target per day
          default:
            return sum;
        }
      }, 0);

      dailyData.push({
        date: day,
        value: totalValue,
        target: totalTarget,
        percentage: totalTarget > 0 ? (totalValue / totalTarget) * 100 : 0
      });
    });

    // Calculate weekly goals data
    const weeklyGoals = goals.map(goal => {
      const goalLogs = weekLogs.filter(log => log.goalId === goal.id);
      const goalValue = goalLogs.reduce((sum, log) => sum + log.value, 0);
      
      let weeklyTarget = goal.target;
      if (goal.frequency === 'daily') {
        weeklyTarget = goal.target * 7;
      } else if (goal.frequency === 'monthly') {
        weeklyTarget = goal.target / 4; // Approximate weekly portion of monthly target
      }

      return {
        goalId: goal.id,
        goalTitle: goal.title,
        value: goalValue,
        target: weeklyTarget,
        percentage: weeklyTarget > 0 ? (goalValue / weeklyTarget) * 100 : 0
      };
    });

    const weekTotalValue = dailyData.reduce((sum, day) => sum + day.value, 0);
    const weekTotalTarget = dailyData.reduce((sum, day) => sum + day.target, 0);

    weeks.push({
      week: format(weekStart, 'MMM dd'),
      startDate: weekStart,
      endDate: weekEnd,
      totalValue: weekTotalValue,
      totalTarget: weekTotalTarget,
      completionPercentage: weekTotalTarget > 0 ? (weekTotalValue / weekTotalTarget) * 100 : 0,
      dailyData,
      goals: weeklyGoals
    });
  }

  return weeks;
}

export function calculateTrendData(weeklyData: WeeklyData[]): {
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  averageCompletion: number;
} {
  if (weeklyData.length < 2) {
    return { trend: 'stable', changePercentage: 0, averageCompletion: 0 };
  }

  const recent = weeklyData.slice(-4); // Last 4 weeks
  const previous = weeklyData.slice(-8, -4); // Previous 4 weeks

  const recentAvg = recent.reduce((sum, week) => sum + week.completionPercentage, 0) / recent.length;
  const previousAvg = previous.length > 0 
    ? previous.reduce((sum, week) => sum + week.completionPercentage, 0) / previous.length 
    : recentAvg;

  const changePercentage = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(changePercentage) > 5) { // 5% threshold for trend detection
    trend = changePercentage > 0 ? 'up' : 'down';
  }

  const overallAverage = weeklyData.reduce((sum, week) => sum + week.completionPercentage, 0) / weeklyData.length;

  return {
    trend,
    changePercentage: Math.abs(changePercentage),
    averageCompletion: overallAverage
  };
}

export function getChartDimensions(containerWidth: number, isMobile: boolean = false): ChartConfig {
  const config = { ...defaultChartConfig };
  
  if (isMobile) {
    config.width = Math.min(containerWidth - 40, 400);
    config.height = 250;
    config.margin = {
      top: 15,
      right: 20,
      bottom: 30,
      left: 40
    };
  } else {
    config.width = Math.min(containerWidth - 40, 800);
    config.height = 400;
  }

  return config;
}

export function formatChartValue(value: number, metric: string): string {
  switch (metric) {
    case 'duration':
      if (value >= 60) {
        return `${Math.round(value / 60)}h ${Math.round(value % 60)}m`;
      }
      return `${Math.round(value)}m`;
    case 'distance':
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}km`;
      }
      return `${Math.round(value)}m`;
    case 'weight':
      return `${value.toFixed(1)}kg`;
    case 'count':
    default:
      return Math.round(value).toString();
  }
}

export function getCompletionColor(percentage: number, colors: ChartConfig['colors']): string {
  if (percentage >= 100) return colors.success;
  if (percentage >= 80) return colors.primary;
  if (percentage >= 60) return colors.warning;
  return colors.danger;
}
