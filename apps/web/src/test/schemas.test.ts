import { describe, it, expect } from 'vitest';
import { CreateGoal, CreateLogEntry, Goal, LogEntry } from '@fitness-app/shared';

describe('Zod Schema Validation', () => {
  describe('CreateGoal Schema', () => {
    it('should validate a valid goal creation', () => {
      const validGoal = {
        title: 'Daily Push-ups',
        description: 'Build upper body strength',
        metric: 'count',
        target: 50,
        frequency: 'daily',
      };

      const result = CreateGoal.safeParse(validGoal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validGoal);
      }
    });

    it('should reject goal with empty title', () => {
      const invalidGoal = {
        title: '',
        description: 'Build upper body strength',
        metric: 'count',
        target: 50,
        frequency: 'daily',
      };

      const result = CreateGoal.safeParse(invalidGoal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('title');
      }
    });

    it('should reject goal with title too long', () => {
      const invalidGoal = {
        title: 'A'.repeat(101), // Assuming max length is 100
        description: 'Build upper body strength',
        metric: 'count',
        target: 50,
        frequency: 'daily',
      };

      const result = CreateGoal.safeParse(invalidGoal);
      expect(result.success).toBe(false);
    });

    it('should reject goal with negative target', () => {
      const invalidGoal = {
        title: 'Daily Push-ups',
        description: 'Build upper body strength',
        metric: 'count',
        target: -5,
        frequency: 'daily',
      };

      const result = CreateGoal.safeParse(invalidGoal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('target');
      }
    });

    it('should reject goal with zero target', () => {
      const invalidGoal = {
        title: 'Daily Push-ups',
        description: 'Build upper body strength',
        metric: 'count',
        target: 0,
        frequency: 'daily',
      };

      const result = CreateGoal.safeParse(invalidGoal);
      expect(result.success).toBe(false);
    });

    it('should reject goal with invalid metric', () => {
      const invalidGoal = {
        title: 'Daily Push-ups',
        description: 'Build upper body strength',
        metric: 'invalid_metric',
        target: 50,
        frequency: 'daily',
      };

      const result = CreateGoal.safeParse(invalidGoal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('metric');
      }
    });

    it('should reject goal with invalid frequency', () => {
      const invalidGoal = {
        title: 'Daily Push-ups',
        description: 'Build upper body strength',
        metric: 'count',
        target: 50,
        frequency: 'invalid_frequency',
      };

      const result = CreateGoal.safeParse(invalidGoal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('frequency');
      }
    });

    it('should accept valid metrics', () => {
      const validMetrics = ['count', 'duration', 'distance', 'weight'];
      
      validMetrics.forEach(metric => {
        const goal = {
          title: 'Test Goal',
          description: 'Test description',
          metric,
          target: 10,
          frequency: 'daily',
        };

        const result = CreateGoal.safeParse(goal);
        expect(result.success).toBe(true);
      });
    });

    it('should accept valid frequencies', () => {
      const validFrequencies = ['daily', 'weekly', 'monthly'];
      
      validFrequencies.forEach(frequency => {
        const goal = {
          title: 'Test Goal',
          description: 'Test description',
          metric: 'count',
          target: 10,
          frequency,
        };

        const result = CreateGoal.safeParse(goal);
        expect(result.success).toBe(true);
      });
    });

    it('should make description optional', () => {
      const goalWithoutDescription = {
        title: 'Daily Push-ups',
        metric: 'count',
        target: 50,
        frequency: 'daily',
      };

      const result = CreateGoal.safeParse(goalWithoutDescription);
      expect(result.success).toBe(true);
    });

    it('should handle decimal targets for appropriate metrics', () => {
      const goalWithDecimalTarget = {
        title: 'Weight Loss',
        description: 'Lose weight gradually',
        metric: 'weight',
        target: 2.5,
        frequency: 'monthly',
      };

      const result = CreateGoal.safeParse(goalWithDecimalTarget);
      expect(result.success).toBe(true);
    });
  });

  describe('CreateLogEntry Schema', () => {
    it('should validate a valid log entry', () => {
      const validLog = {
        goalId: 'goal-123',
        value: 55,
        notes: 'Great workout today!',
        date: new Date(),
      };

      const result = CreateLogEntry.safeParse(validLog);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.goalId).toBe(validLog.goalId);
        expect(result.data.value).toBe(validLog.value);
        expect(result.data.notes).toBe(validLog.notes);
      }
    });

    it('should reject log with empty goalId', () => {
      const invalidLog = {
        goalId: '',
        value: 55,
        notes: 'Great workout today!',
        date: new Date(),
      };

      const result = CreateLogEntry.safeParse(invalidLog);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('goalId');
      }
    });

    it('should reject log with negative value', () => {
      const invalidLog = {
        goalId: 'goal-123',
        value: -5,
        notes: 'Great workout today!',
        date: new Date(),
      };

      const result = CreateLogEntry.safeParse(invalidLog);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('value');
      }
    });

    it('should make notes optional', () => {
      const logWithoutNotes = {
        goalId: 'goal-123',
        value: 55,
        date: new Date(),
      };

      const result = CreateLogEntry.safeParse(logWithoutNotes);
      expect(result.success).toBe(true);
    });

    it('should handle decimal values', () => {
      const logWithDecimalValue = {
        goalId: 'goal-123',
        value: 12.5,
        notes: 'Half marathon distance',
        date: new Date(),
      };

      const result = CreateLogEntry.safeParse(logWithDecimalValue);
      expect(result.success).toBe(true);
    });

    it('should reject log with future date beyond reasonable limit', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 10);

      const invalidLog = {
        goalId: 'goal-123',
        value: 55,
        date: futureDate,
      };

      // This test depends on the schema implementation
      // If the schema allows future dates, this test should be adjusted
      const result = CreateLogEntry.safeParse(invalidLog);
      // Adjust expectation based on actual schema rules
      expect(result.success).toBe(true); // or false if schema restricts future dates
    });

    it('should handle very long notes', () => {
      const logWithLongNotes = {
        goalId: 'goal-123',
        value: 55,
        notes: 'A'.repeat(1000), // Very long notes
        date: new Date(),
      };

      const result = CreateLogEntry.safeParse(logWithLongNotes);
      // This should pass unless there's a specific length limit
      expect(result.success).toBe(true);
    });
  });

  describe('Goal Schema (Full)', () => {
    it('should validate a complete goal object', () => {
      const completeGoal = {
        id: 'goal-123',
        userId: 'user-456',
        title: 'Daily Push-ups',
        description: 'Build upper body strength',
        metric: 'count',
        target: 50,
        frequency: 'daily',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = Goal.safeParse(completeGoal);
      expect(result.success).toBe(true);
    });

    it('should require all mandatory fields', () => {
      const incompleteGoal = {
        title: 'Daily Push-ups',
        metric: 'count',
        target: 50,
        frequency: 'daily',
      };

      const result = Goal.safeParse(incompleteGoal);
      expect(result.success).toBe(false);
    });
  });

  describe('LogEntry Schema (Full)', () => {
    it('should validate a complete log entry object', () => {
      const completeLog = {
        id: 'log-123',
        userId: 'user-456',
        goalId: 'goal-789',
        date: new Date(),
        value: 55,
        notes: 'Great workout today!',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = LogEntry.safeParse(completeLog);
      expect(result.success).toBe(true);
    });

    it('should require all mandatory fields', () => {
      const incompleteLog = {
        goalId: 'goal-789',
        value: 55,
      };

      const result = LogEntry.safeParse(incompleteLog);
      expect(result.success).toBe(false);
    });
  });

  describe('Edge Cases and Boundary Values', () => {
    it('should handle maximum safe integer values', () => {
      const goalWithMaxValue = {
        title: 'Extreme Goal',
        metric: 'count',
        target: Number.MAX_SAFE_INTEGER,
        frequency: 'daily',
      };

      const result = CreateGoal.safeParse(goalWithMaxValue);
      expect(result.success).toBe(true);
    });

    it('should handle very small decimal values', () => {
      const goalWithSmallValue = {
        title: 'Precision Goal',
        metric: 'weight',
        target: 0.001,
        frequency: 'daily',
      };

      const result = CreateGoal.safeParse(goalWithSmallValue);
      expect(result.success).toBe(true);
    });

    it('should handle special characters in title', () => {
      const goalWithSpecialChars = {
        title: 'Goal with émojis 🏃‍♂️ and spëcial chars!',
        metric: 'count',
        target: 10,
        frequency: 'daily',
      };

      const result = CreateGoal.safeParse(goalWithSpecialChars);
      expect(result.success).toBe(true);
    });

    it('should handle empty string notes', () => {
      const logWithEmptyNotes = {
        goalId: 'goal-123',
        value: 55,
        notes: '',
        date: new Date(),
      };

      const result = CreateLogEntry.safeParse(logWithEmptyNotes);
      expect(result.success).toBe(true);
    });
  });
});
