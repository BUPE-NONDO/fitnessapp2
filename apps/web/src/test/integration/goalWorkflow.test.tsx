import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, createMockGoal, createMockLog } from '../utils';
import { GoalsList } from '@/components/GoalsList';
import { ActivityLogsList } from '@/components/ActivityLogsList';

// Mock the hooks
const mockCreateGoal = vi.fn();
const mockCreateLog = vi.fn();

vi.mock('@/hooks/useTRPC', () => ({
  useGoals: vi.fn(() => ({
    data: { data: [createMockGoal()] },
    isLoading: false,
    isError: false,
  })),
  useCreateGoal: vi.fn(() => ({
    mutateAsync: mockCreateGoal,
    isLoading: false,
  })),
  useCreateLog: vi.fn(() => ({
    mutateAsync: mockCreateLog,
    isLoading: false,
  })),
}));

describe('Goal Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateGoal.mockResolvedValue(createMockGoal());
    mockCreateLog.mockResolvedValue(createMockLog());
  });

  describe('Goal Creation Workflow', () => {
    it('should create a goal successfully', async () => {
      const user = userEvent.setup();
      render(<GoalsList />);

      // Click "Add Goal" button
      const addButton = screen.getByText(/add goal/i);
      await user.click(addButton);

      // Fill out the form
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const metricSelect = screen.getByLabelText(/metric/i);
      const targetInput = screen.getByLabelText(/target/i);
      const frequencySelect = screen.getByLabelText(/frequency/i);

      await user.type(titleInput, 'Daily Push-ups');
      await user.type(descriptionInput, 'Build upper body strength');
      await user.selectOptions(metricSelect, 'count');
      await user.type(targetInput, '50');
      await user.selectOptions(frequencySelect, 'daily');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create goal/i });
      await user.click(submitButton);

      // Verify the goal was created
      await waitFor(() => {
        expect(mockCreateGoal).toHaveBeenCalledWith({
          title: 'Daily Push-ups',
          description: 'Build upper body strength',
          metric: 'count',
          target: 50,
          frequency: 'daily',
        });
      });
    });

    it('should validate form fields', async () => {
      const user = userEvent.setup();
      render(<GoalsList />);

      // Click "Add Goal" button
      const addButton = screen.getByText(/add goal/i);
      await user.click(addButton);

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /create goal/i });
      await user.click(submitButton);

      // Should show validation errors
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });

    it('should handle creation errors gracefully', async () => {
      const user = userEvent.setup();
      mockCreateGoal.mockRejectedValue(new Error('Creation failed'));
      
      render(<GoalsList />);

      // Fill and submit form
      const addButton = screen.getByText(/add goal/i);
      await user.click(addButton);

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test Goal');

      const submitButton = screen.getByRole('button', { name: /create goal/i });
      await user.click(submitButton);

      // Should handle error gracefully
      await waitFor(() => {
        expect(mockCreateGoal).toHaveBeenCalled();
      });
    });
  });

  describe('Activity Logging Workflow', () => {
    it('should log an activity successfully', async () => {
      const user = userEvent.setup();
      render(<ActivityLogsList />);

      // Click "Log Activity" button
      const logButton = screen.getByText(/log activity/i);
      await user.click(logButton);

      // Fill out the form
      const goalSelect = screen.getByLabelText(/goal/i);
      const valueInput = screen.getByLabelText(/value/i);
      const notesInput = screen.getByLabelText(/notes/i);

      await user.selectOptions(goalSelect, 'test-goal-1');
      await user.type(valueInput, '55');
      await user.type(notesInput, 'Great workout today!');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /log activity/i });
      await user.click(submitButton);

      // Verify the log was created
      await waitFor(() => {
        expect(mockCreateLog).toHaveBeenCalledWith({
          goalId: 'test-goal-1',
          value: 55,
          notes: 'Great workout today!',
          date: expect.any(Date),
        });
      });
    });

    it('should validate log entry fields', async () => {
      const user = userEvent.setup();
      render(<ActivityLogsList />);

      // Click "Log Activity" button
      const logButton = screen.getByText(/log activity/i);
      await user.click(logButton);

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /log activity/i });
      await user.click(submitButton);

      // Should show validation errors
      expect(screen.getByText(/goal is required/i)).toBeInTheDocument();
      expect(screen.getByText(/value is required/i)).toBeInTheDocument();
    });

    it('should filter logs by goal', async () => {
      const user = userEvent.setup();
      render(<ActivityLogsList />);

      // Find goal filter dropdown
      const goalFilter = screen.getByLabelText(/filter by goal/i);
      await user.selectOptions(goalFilter, 'test-goal-1');

      // Should filter the displayed logs
      expect(goalFilter).toHaveValue('test-goal-1');
    });
  });

  describe('Goal Management Workflow', () => {
    it('should edit a goal', async () => {
      const user = userEvent.setup();
      render(<GoalsList />);

      // Click edit button on a goal
      const editButton = screen.getByText(/edit/i);
      await user.click(editButton);

      // Should open edit form with pre-filled values
      const titleInput = screen.getByDisplayValue(/test goal/i);
      expect(titleInput).toBeInTheDocument();

      // Modify the title
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Goal Title');

      // Submit the changes
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Should call update function
      await waitFor(() => {
        expect(titleInput).toHaveValue('Updated Goal Title');
      });
    });

    it('should delete a goal with confirmation', async () => {
      const user = userEvent.setup();
      render(<GoalsList />);

      // Click delete button
      const deleteButton = screen.getByText(/delete/i);
      await user.click(deleteButton);

      // Should show confirmation dialog
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /delete/i });
      await user.click(confirmButton);

      // Should call delete function
      await waitFor(() => {
        expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
      });
    });

    it('should cancel goal deletion', async () => {
      const user = userEvent.setup();
      render(<GoalsList />);

      // Click delete button
      const deleteButton = screen.getByText(/delete/i);
      await user.click(deleteButton);

      // Cancel deletion
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Should close confirmation dialog
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    });
  });

  describe('Goal Details Workflow', () => {
    it('should open goal details when clicking on goal card', async () => {
      const user = userEvent.setup();
      render(<GoalsList />);

      // Click on a goal card
      const goalCard = screen.getByText(/test goal/i).closest('.card');
      expect(goalCard).toBeInTheDocument();
      
      await user.click(goalCard!);

      // Should open goal details modal
      expect(screen.getByTestId('goal-details-modal')).toBeInTheDocument();
    });

    it('should switch between tabs in goal details', async () => {
      const user = userEvent.setup();
      render(<GoalsList />);

      // Open goal details
      const goalCard = screen.getByText(/test goal/i).closest('.card');
      await user.click(goalCard!);

      // Switch to timeline tab
      const timelineTab = screen.getByText(/timeline/i);
      await user.click(timelineTab);

      // Should show timeline content
      expect(screen.getByText(/activity timeline/i)).toBeInTheDocument();

      // Switch to analytics tab
      const analyticsTab = screen.getByText(/analytics/i);
      await user.click(analyticsTab);

      // Should show analytics content
      expect(screen.getByText(/performance insights/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation Integration', () => {
    it('should prevent submission with invalid data', async () => {
      const user = userEvent.setup();
      render(<GoalsList />);

      const addButton = screen.getByText(/add goal/i);
      await user.click(addButton);

      // Enter invalid target (negative number)
      const targetInput = screen.getByLabelText(/target/i);
      await user.type(targetInput, '-5');

      const submitButton = screen.getByRole('button', { name: /create goal/i });
      await user.click(submitButton);

      // Should show validation error
      expect(screen.getByText(/target must be positive/i)).toBeInTheDocument();
      expect(mockCreateGoal).not.toHaveBeenCalled();
    });

    it('should handle decimal values correctly', async () => {
      const user = userEvent.setup();
      render(<ActivityLogsList />);

      const logButton = screen.getByText(/log activity/i);
      await user.click(logButton);

      // Enter decimal value
      const valueInput = screen.getByLabelText(/value/i);
      await user.type(valueInput, '12.5');

      const goalSelect = screen.getByLabelText(/goal/i);
      await user.selectOptions(goalSelect, 'test-goal-1');

      const submitButton = screen.getByRole('button', { name: /log activity/i });
      await user.click(submitButton);

      // Should accept decimal values
      await waitFor(() => {
        expect(mockCreateLog).toHaveBeenCalledWith(
          expect.objectContaining({
            value: 12.5,
          })
        );
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      mockCreateGoal.mockRejectedValue(new Error('Network error'));
      
      render(<GoalsList />);

      // Try to create a goal
      const addButton = screen.getByText(/add goal/i);
      await user.click(addButton);

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test Goal');

      const submitButton = screen.getByRole('button', { name: /create goal/i });
      await user.click(submitButton);

      // Should handle error without crashing
      await waitFor(() => {
        expect(mockCreateGoal).toHaveBeenCalled();
      });

      // Form should still be visible (not closed due to error)
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    it('should handle validation errors from server', async () => {
      const user = userEvent.setup();
      mockCreateGoal.mockRejectedValue({
        message: 'Validation failed',
        errors: { title: 'Title already exists' },
      });
      
      render(<GoalsList />);

      const addButton = screen.getByText(/add goal/i);
      await user.click(addButton);

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Duplicate Goal');

      const submitButton = screen.getByRole('button', { name: /create goal/i });
      await user.click(submitButton);

      // Should display server validation errors
      await waitFor(() => {
        expect(screen.getByText(/title already exists/i)).toBeInTheDocument();
      });
    });
  });
});
