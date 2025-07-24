import { describe, it, expect } from 'vitest';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subWeeks,
  subDays,
  isWithinInterval,
  isToday,
  generateWeeklyData,
  calculateTrendData,
  getChartDimensions,
  formatChartValue,
  getCompletionColor,
  defaultChartConfig,
} from '@/utils/chartUtils';
import { createMockGoal, createMockLog, createDateDaysAgo } from '../utils';

describe('Chart Utilities', () => {
  describe('Date formatting', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-07-24T10:30:00');

      expect(format(date, 'MMM dd')).toBe('Jul 24');
      expect(format(date, 'yyyy-MM-dd')).toBe('2024-07-24');
      expect(format(date, 'EEEE, MMMM dd, yyyy')).toBe('Wednesday, Jul 24, 2024');
      expect(format(date, 'EEE')).toBe('Wed');
      expect(format(date, 'd')).toBe('24');
    });

    it('should handle edge cases in date formatting', () => {
      const newYear = new Date('2024-01-01T00:00:00');
      const endYear = new Date('2024-12-31T23:59:59');

      expect(format(newYear, 'MMM dd')).toBe('Jan 01');
      expect(format(endYear, 'MMM dd')).toBe('Dec 31');
    });

    it('should default to locale string for unknown format', () => {
      const date = new Date('2024-07-24');
      const result = format(date, 'unknown-format');
      
      expect(result).toBe(date.toLocaleDateString());
    });
  });

  describe('Week calculations', () => {
    it('should calculate start of week correctly', () => {
      const wednesday = new Date('2024-07-24'); // Wednesday
      
      // Default (Sunday start)
      const sundayStart = startOfWeek(wednesday);
      expect(sundayStart.getDay()).toBe(0); // Sunday
      
      // Monday start
      const mondayStart = startOfWeek(wednesday, { weekStartsOn: 1 });
      expect(mondayStart.getDay()).toBe(1); // Monday
    });

    it('should calculate end of week correctly', () => {
      const wednesday = new Date('2024-07-24');
      
      const sundayEnd = endOfWeek(wednesday);
      expect(sundayEnd.getDay()).toBe(6); // Saturday
      expect(sundayEnd.getHours()).toBe(23);
      expect(sundayEnd.getMinutes()).toBe(59);
      
      const mondayEnd = endOfWeek(wednesday, { weekStartsOn: 1 });
      expect(mondayEnd.getDay()).toBe(0); // Sunday (end of Monday-started week)
    });
  });

  describe('Date intervals', () => {
    it('should generate each day of interval', () => {
      const start = new Date('2024-07-20');
      const end = new Date('2024-07-24');
      
      const days = eachDayOfInterval({ start, end });
      
      expect(days).toHaveLength(5);
      expect(days[0].toDateString()).toBe(start.toDateString());
      expect(days[4].toDateString()).toBe(end.toDateString());
    });

    it('should handle single day interval', () => {
      const date = new Date('2024-07-24');
      const days = eachDayOfInterval({ start: date, end: date });
      
      expect(days).toHaveLength(1);
      expect(days[0].toDateString()).toBe(date.toDateString());
    });
  });

  describe('Date arithmetic', () => {
    it('should subtract weeks correctly', () => {
      const date = new Date('2024-07-24');
      const twoWeeksAgo = subWeeks(date, 2);
      
      const daysDiff = Math.floor((date.getTime() - twoWeeksAgo.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(14);
    });

    it('should subtract days correctly', () => {
      const date = new Date('2024-07-24');
      const threeDaysAgo = subDays(date, 3);
      
      const daysDiff = Math.floor((date.getTime() - threeDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(3);
    });
  });

  describe('Date comparisons', () => {
    it('should check if date is within interval', () => {
      const start = new Date('2024-07-20');
      const end = new Date('2024-07-24');
      const middle = new Date('2024-07-22');
      const outside = new Date('2024-07-25');
      
      expect(isWithinInterval(middle, { start, end })).toBe(true);
      expect(isWithinInterval(outside, { start, end })).toBe(false);
      expect(isWithinInterval(start, { start, end })).toBe(true);
      expect(isWithinInterval(end, { start, end })).toBe(true);
    });

    it('should check if date is today', () => {
      const today = new Date();
      const yesterday = subDays(today, 1);
      
      expect(isToday(today)).toBe(true);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('Weekly data generation', () => {
    it('should generate weekly data correctly', () => {
      const goals = [
        createMockGoal({
          id: 'goal-1',
          target: 10,
          frequency: 'daily',
        }),
      ];

      const logs = [
        createMockLog({
          goalId: 'goal-1',
          value: 12,
          date: new Date(),
        }),
        createMockLog({
          goalId: 'goal-1',
          value: 8,
          date: createDateDaysAgo(1),
        }),
      ];

      const weeklyData = generateWeeklyData(logs, goals, 4);
      
      expect(weeklyData).toHaveLength(4);
      expect(weeklyData[0]).toHaveProperty('week');
      expect(weeklyData[0]).toHaveProperty('totalValue');
      expect(weeklyData[0]).toHaveProperty('totalTarget');
      expect(weeklyData[0]).toHaveProperty('completionPercentage');
      expect(weeklyData[0]).toHaveProperty('dailyData');
      expect(weeklyData[0]).toHaveProperty('goals');
    });

    it('should handle empty logs and goals', () => {
      const weeklyData = generateWeeklyData([], [], 2);
      
      expect(weeklyData).toHaveLength(2);
      expect(weeklyData[0].totalValue).toBe(0);
      expect(weeklyData[0].totalTarget).toBe(0);
      expect(weeklyData[0].completionPercentage).toBe(0);
    });
  });

  describe('Trend calculation', () => {
    it('should calculate trend correctly', () => {
      const weeklyData = [
        { completionPercentage: 60 },
        { completionPercentage: 70 },
        { completionPercentage: 80 },
        { completionPercentage: 90 },
        { completionPercentage: 85 },
        { completionPercentage: 95 },
        { completionPercentage: 100 },
        { completionPercentage: 105 },
      ] as any[];

      const trend = calculateTrendData(weeklyData);
      
      expect(trend).toHaveProperty('trend');
      expect(trend).toHaveProperty('changePercentage');
      expect(trend).toHaveProperty('averageCompletion');
      expect(['up', 'down', 'stable']).toContain(trend.trend);
    });

    it('should handle insufficient data', () => {
      const trend = calculateTrendData([]);
      
      expect(trend.trend).toBe('stable');
      expect(trend.changePercentage).toBe(0);
      expect(trend.averageCompletion).toBe(0);
    });
  });

  describe('Chart dimensions', () => {
    it('should calculate chart dimensions for desktop', () => {
      const dimensions = getChartDimensions(1000, false);
      
      expect(dimensions.width).toBeLessThanOrEqual(800);
      expect(dimensions.height).toBe(400);
      expect(dimensions.margin).toHaveProperty('top');
      expect(dimensions.margin).toHaveProperty('right');
      expect(dimensions.margin).toHaveProperty('bottom');
      expect(dimensions.margin).toHaveProperty('left');
    });

    it('should calculate chart dimensions for mobile', () => {
      const dimensions = getChartDimensions(400, true);
      
      expect(dimensions.width).toBeLessThanOrEqual(400);
      expect(dimensions.height).toBe(250);
      expect(dimensions.margin.top).toBeLessThan(defaultChartConfig.margin.top);
    });

    it('should respect container width limits', () => {
      const smallContainer = getChartDimensions(200, false);
      const largeContainer = getChartDimensions(1200, false);
      
      expect(smallContainer.width).toBeLessThanOrEqual(200);
      expect(largeContainer.width).toBeLessThanOrEqual(800); // Max width
    });
  });

  describe('Value formatting', () => {
    it('should format duration values correctly', () => {
      expect(formatChartValue(30, 'duration')).toBe('30m');
      expect(formatChartValue(90, 'duration')).toBe('1h 30m');
      expect(formatChartValue(120, 'duration')).toBe('2h 0m');
    });

    it('should format distance values correctly', () => {
      expect(formatChartValue(500, 'distance')).toBe('0.5km');
      expect(formatChartValue(1500, 'distance')).toBe('1.5km');
      expect(formatChartValue(100, 'distance')).toBe('100m');
    });

    it('should format weight values correctly', () => {
      expect(formatChartValue(75.5, 'weight')).toBe('75.5kg');
      expect(formatChartValue(80, 'weight')).toBe('80.0kg');
    });

    it('should format count values correctly', () => {
      expect(formatChartValue(25.7, 'count')).toBe('26');
      expect(formatChartValue(10, 'count')).toBe('10');
    });

    it('should handle unknown metrics', () => {
      expect(formatChartValue(42, 'unknown')).toBe('42');
    });
  });

  describe('Completion colors', () => {
    it('should return correct colors for completion percentages', () => {
      const colors = defaultChartConfig.colors;
      
      expect(getCompletionColor(100, colors)).toBe(colors.success);
      expect(getCompletionColor(90, colors)).toBe(colors.primary);
      expect(getCompletionColor(70, colors)).toBe(colors.warning);
      expect(getCompletionColor(50, colors)).toBe(colors.danger);
    });

    it('should handle edge cases', () => {
      const colors = defaultChartConfig.colors;
      
      expect(getCompletionColor(0, colors)).toBe(colors.danger);
      expect(getCompletionColor(150, colors)).toBe(colors.success);
      expect(getCompletionColor(80, colors)).toBe(colors.primary);
      expect(getCompletionColor(60, colors)).toBe(colors.warning);
    });
  });

  describe('Default chart config', () => {
    it('should have valid default configuration', () => {
      expect(defaultChartConfig).toHaveProperty('width');
      expect(defaultChartConfig).toHaveProperty('height');
      expect(defaultChartConfig).toHaveProperty('margin');
      expect(defaultChartConfig).toHaveProperty('colors');
      
      expect(defaultChartConfig.width).toBeGreaterThan(0);
      expect(defaultChartConfig.height).toBeGreaterThan(0);
      
      expect(defaultChartConfig.colors).toHaveProperty('primary');
      expect(defaultChartConfig.colors).toHaveProperty('secondary');
      expect(defaultChartConfig.colors).toHaveProperty('success');
      expect(defaultChartConfig.colors).toHaveProperty('warning');
      expect(defaultChartConfig.colors).toHaveProperty('danger');
    });

    it('should have valid color values', () => {
      const colors = defaultChartConfig.colors;
      
      Object.values(colors).forEach(color => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});
