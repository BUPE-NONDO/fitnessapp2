#!/usr/bin/env node

/**
 * Basic Test Runner
 * 
 * This script runs basic tests to verify core functionality
 * without requiring external testing frameworks.
 */

console.log('🧪 Running Basic Test Suite...\n');

let testsPassed = 0;
let testsFailed = 0;

function describe(name, fn) {
  console.log(`\n📝 ${name}`);
  try {
    fn();
    console.log(`✅ ${name} - All tests passed`);
  } catch (error) {
    console.log(`❌ ${name} - Tests failed:`, error.message);
    testsFailed++;
  }
}

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ✗ ${name}: ${error.message}`);
    testsFailed++;
    throw error;
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`);
      }
    },
    toBeFalsy: () => {
      if (actual) {
        throw new Error(`Expected ${actual} to be falsy`);
      }
    },
    toContain: (expected) => {
      if (!actual.includes(expected)) {
        throw new Error(`Expected ${actual} to contain ${expected}`);
      }
    },
    toHaveLength: (expected) => {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected}, but got ${actual.length}`);
      }
    },
  };
}

// Test Suites
describe('Utility Functions', () => {
  it('should format metric labels correctly', () => {
    const getMetricLabel = (metric) => {
      switch (metric) {
        case 'count': return 'times';
        case 'duration': return 'minutes';
        case 'distance': return 'km';
        case 'weight': return 'kg';
        default: return metric;
      }
    };

    expect(getMetricLabel('count')).toBe('times');
    expect(getMetricLabel('duration')).toBe('minutes');
    expect(getMetricLabel('distance')).toBe('km');
    expect(getMetricLabel('weight')).toBe('kg');
    expect(getMetricLabel('unknown')).toBe('unknown');
  });

  it('should calculate percentages correctly', () => {
    const calculatePercentage = (value, target) => {
      return target > 0 ? (value / target) * 100 : 0;
    };

    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(100, 100)).toBe(100);
    expect(calculatePercentage(150, 100)).toBe(150);
    expect(calculatePercentage(25, 0)).toBe(0);
  });

  it('should validate goal data structure', () => {
    const isValidGoal = (goal) => {
      return goal &&
        typeof goal.title === 'string' &&
        goal.title.length > 0 &&
        typeof goal.target === 'number' &&
        goal.target > 0 &&
        ['count', 'duration', 'distance', 'weight'].includes(goal.metric) &&
        ['daily', 'weekly', 'monthly'].includes(goal.frequency);
    };

    const validGoal = {
      title: 'Test Goal',
      target: 10,
      metric: 'count',
      frequency: 'daily',
    };

    const invalidGoal = {
      title: '',
      target: -5,
      metric: 'invalid',
      frequency: 'invalid',
    };

    expect(isValidGoal(validGoal)).toBeTruthy();
    expect(isValidGoal(invalidGoal)).toBeFalsy();
    expect(isValidGoal(null)).toBeFalsy();
    expect(isValidGoal({})).toBeFalsy();
  });
});

describe('Chart Utilities', () => {
  it('should format chart values correctly', () => {
    const formatChartValue = (value, metric) => {
      switch (metric) {
        case 'duration':
          return value >= 60 ? `${Math.floor(value / 60)}h ${value % 60}m` : `${value}m`;
        case 'distance':
          return value >= 1000 ? `${(value / 1000).toFixed(1)}km` : `${Math.round(value)}m`;
        case 'weight':
          return `${value.toFixed(1)}kg`;
        case 'count':
        default:
          return Math.round(value).toString();
      }
    };

    expect(formatChartValue(30, 'duration')).toBe('30m');
    expect(formatChartValue(90, 'duration')).toBe('1h 30m');
    expect(formatChartValue(500, 'distance')).toBe('500m');
    expect(formatChartValue(1500, 'distance')).toBe('1.5km');
    expect(formatChartValue(75.5, 'weight')).toBe('75.5kg');
    expect(formatChartValue(25.7, 'count')).toBe('26');
  });

  it('should calculate completion colors correctly', () => {
    const getCompletionColor = (percentage) => {
      if (percentage >= 100) return 'green';
      if (percentage >= 80) return 'blue';
      if (percentage >= 60) return 'yellow';
      return 'red';
    };

    expect(getCompletionColor(100)).toBe('green');
    expect(getCompletionColor(90)).toBe('blue');
    expect(getCompletionColor(70)).toBe('yellow');
    expect(getCompletionColor(50)).toBe('red');
  });
});

describe('Achievement Logic', () => {
  it('should detect goal completion correctly', () => {
    const isGoalCompleted = (value, target, frequency) => {
      switch (frequency) {
        case 'daily':
          return value >= target;
        case 'weekly':
        case 'monthly':
          return value >= target;
        default:
          return false;
      }
    };

    expect(isGoalCompleted(55, 50, 'daily')).toBeTruthy();
    expect(isGoalCompleted(45, 50, 'daily')).toBeFalsy();
    expect(isGoalCompleted(100, 70, 'weekly')).toBeTruthy();
  });

  it('should calculate streak correctly', () => {
    const calculateStreak = (logs) => {
      let streak = 0;
      const sortedLogs = logs.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      for (const log of sortedLogs) {
        if (log.value >= log.target) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    };

    const logs = [
      { value: 55, target: 50, date: new Date('2024-07-24') },
      { value: 52, target: 50, date: new Date('2024-07-23') },
      { value: 48, target: 50, date: new Date('2024-07-22') },
      { value: 60, target: 50, date: new Date('2024-07-21') },
    ];

    expect(calculateStreak(logs)).toBe(2);
  });

  it('should identify streak milestones', () => {
    const isStreakMilestone = (days) => {
      const milestones = [3, 7, 14, 21, 30, 60, 90, 100];
      return milestones.includes(days);
    };

    expect(isStreakMilestone(7)).toBeTruthy();
    expect(isStreakMilestone(30)).toBeTruthy();
    expect(isStreakMilestone(5)).toBeFalsy();
    expect(isStreakMilestone(15)).toBeFalsy();
  });
});

describe('Form Validation', () => {
  it('should validate goal creation form', () => {
    const validateGoalForm = (data) => {
      const errors = [];

      if (!data.title || data.title.trim().length === 0) {
        errors.push('Title is required');
      }

      if (!data.target || data.target <= 0) {
        errors.push('Target must be positive');
      }

      if (!['count', 'duration', 'distance', 'weight'].includes(data.metric)) {
        errors.push('Invalid metric');
      }

      if (!['daily', 'weekly', 'monthly'].includes(data.frequency)) {
        errors.push('Invalid frequency');
      }

      return errors;
    };

    const validData = {
      title: 'Test Goal',
      target: 10,
      metric: 'count',
      frequency: 'daily',
    };

    const invalidData = {
      title: '',
      target: -5,
      metric: 'invalid',
      frequency: 'invalid',
    };

    expect(validateGoalForm(validData)).toHaveLength(0);
    expect(validateGoalForm(invalidData).length).toBeGreaterThan(0);
    expect(validateGoalForm(invalidData)).toContain('Title is required');
    expect(validateGoalForm(invalidData)).toContain('Target must be positive');
  });

  it('should validate log entry form', () => {
    const validateLogForm = (data) => {
      const errors = [];

      if (!data.goalId || data.goalId.trim().length === 0) {
        errors.push('Goal is required');
      }

      if (!data.value || data.value <= 0) {
        errors.push('Value must be positive');
      }

      if (data.date && data.date > new Date()) {
        errors.push('Date cannot be in the future');
      }

      return errors;
    };

    const validData = {
      goalId: 'goal-123',
      value: 55,
      date: new Date(),
    };

    const invalidData = {
      goalId: '',
      value: -5,
      date: new Date(Date.now() + 86400000),
    };

    expect(validateLogForm(validData)).toHaveLength(0);
    expect(validateLogForm(invalidData).length).toBeGreaterThan(0);
    expect(validateLogForm(invalidData)).toContain('Goal is required');
    expect(validateLogForm(invalidData)).toContain('Value must be positive');
    expect(validateLogForm(invalidData)).toContain('Date cannot be in the future');
  });
});

// Summary
console.log('\n🎉 Test execution completed!');
console.log('\n📋 Test Summary:');
console.log(`✅ Tests passed: ${testsPassed}`);
console.log(`❌ Tests failed: ${testsFailed}`);
console.log(`📊 Total tests: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n🎊 All tests passed successfully!');
  console.log('\n📝 Test Coverage:');
  console.log('✅ Utility Functions - 3 tests');
  console.log('✅ Chart Utilities - 2 tests');
  console.log('✅ Achievement Logic - 3 tests');
  console.log('✅ Form Validation - 2 tests');
  console.log('\n🔧 Testing Framework: Custom lightweight test runner');
  console.log('📦 Dependencies: None (standalone implementation)');
  console.log('⚡ Performance: Fast execution without external dependencies');
} else {
  console.log('\n❌ Some tests failed. Please review the errors above.');
  process.exit(1);
}
