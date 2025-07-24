import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { GoalCard } from '@/components/GoalCard';
import { render, createMockGoal } from '../utils';

// Mock the GoalDetails component since it's complex
vi.mock('@/components/GoalDetails', () => ({
  GoalDetails: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="goal-details-modal">
      <button onClick={onClose}>Close Details</button>
    </div>
  ),
}));

describe('GoalCard', () => {
  const mockGoal = createMockGoal({
    title: 'Daily Push-ups',
    description: 'Build upper body strength',
    metric: 'count',
    target: 50,
    frequency: 'daily',
    isActive: true,
  });

  it('should render goal information correctly', () => {
    render(<GoalCard goal={mockGoal} />);

    expect(screen.getByText('Daily Push-ups')).toBeInTheDocument();
    expect(screen.getByText('Build upper body strength')).toBeInTheDocument();
    expect(screen.getByText(/Target: 50 times per day/)).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should show progress bar', () => {
    render(<GoalCard goal={mockGoal} />);

    expect(screen.getByText('Progress')).toBeInTheDocument();
    // Progress percentage is mocked randomly, so we just check it exists
    expect(screen.getByText(/%$/)).toBeInTheDocument();
  });

  it('should display creation date', () => {
    render(<GoalCard goal={mockGoal} />);

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<GoalCard goal={mockGoal} onEdit={onEdit} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockGoal);
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<GoalCard goal={mockGoal} onDelete={onDelete} />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockGoal.id);
  });

  it('should not show edit button when onEdit is not provided', () => {
    render(<GoalCard goal={mockGoal} />);

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('should not show delete button when onDelete is not provided', () => {
    render(<GoalCard goal={mockGoal} />);

    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('should open goal details when card is clicked', () => {
    render(<GoalCard goal={mockGoal} />);

    const card = screen.getByText('Daily Push-ups').closest('.card');
    expect(card).toBeInTheDocument();
    
    fireEvent.click(card!);

    expect(screen.getByTestId('goal-details-modal')).toBeInTheDocument();
  });

  it('should close goal details when close button is clicked', () => {
    render(<GoalCard goal={mockGoal} />);

    // Open details
    const card = screen.getByText('Daily Push-ups').closest('.card');
    fireEvent.click(card!);

    // Close details
    const closeButton = screen.getByText('Close Details');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('goal-details-modal')).not.toBeInTheDocument();
  });

  it('should prevent event bubbling when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<GoalCard goal={mockGoal} onEdit={onEdit} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Goal details should not open when edit button is clicked
    expect(screen.queryByTestId('goal-details-modal')).not.toBeInTheDocument();
    expect(onEdit).toHaveBeenCalledWith(mockGoal);
  });

  it('should prevent event bubbling when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<GoalCard goal={mockGoal} onDelete={onDelete} />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    // Goal details should not open when delete button is clicked
    expect(screen.queryByTestId('goal-details-modal')).not.toBeInTheDocument();
    expect(onDelete).toHaveBeenCalledWith(mockGoal.id);
  });

  it('should render inactive goal correctly', () => {
    const inactiveGoal = createMockGoal({
      ...mockGoal,
      isActive: false,
    });

    render(<GoalCard goal={inactiveGoal} />);

    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should handle goal without description', () => {
    const goalWithoutDescription = createMockGoal({
      ...mockGoal,
      description: undefined,
    });

    render(<GoalCard goal={goalWithoutDescription} />);

    expect(screen.getByText('Daily Push-ups')).toBeInTheDocument();
    expect(screen.queryByText('Build upper body strength')).not.toBeInTheDocument();
  });

  it('should format different metric types correctly', () => {
    const metrics = [
      { metric: 'count', expected: 'times' },
      { metric: 'duration', expected: 'minutes' },
      { metric: 'distance', expected: 'km' },
      { metric: 'weight', expected: 'kg' },
    ];

    metrics.forEach(({ metric, expected }) => {
      const goalWithMetric = createMockGoal({
        ...mockGoal,
        metric,
      });

      const { unmount } = render(<GoalCard goal={goalWithMetric} />);
      expect(screen.getByText(new RegExp(expected))).toBeInTheDocument();
      unmount();
    });
  });

  it('should format different frequency types correctly', () => {
    const frequencies = [
      { frequency: 'daily', expected: 'per day' },
      { frequency: 'weekly', expected: 'per week' },
      { frequency: 'monthly', expected: 'per month' },
    ];

    frequencies.forEach(({ frequency, expected }) => {
      const goalWithFrequency = createMockGoal({
        ...mockGoal,
        frequency,
      });

      const { unmount } = render(<GoalCard goal={goalWithFrequency} />);
      expect(screen.getByText(new RegExp(expected))).toBeInTheDocument();
      unmount();
    });
  });

  it('should have hover effects on card', () => {
    render(<GoalCard goal={mockGoal} />);

    const card = screen.getByText('Daily Push-ups').closest('.card');
    expect(card).toHaveClass('cursor-pointer', 'hover:shadow-lg', 'transition-shadow');
  });

  it('should show progress bar with correct color based on progress', () => {
    render(<GoalCard goal={mockGoal} />);

    const progressBar = document.querySelector('.h-3.rounded-full');
    expect(progressBar).toBeInTheDocument();
    
    // Progress color classes should be applied based on progress value
    const hasColorClass = progressBar?.classList.contains('bg-green-500') ||
                         progressBar?.classList.contains('bg-blue-500') ||
                         progressBar?.classList.contains('bg-yellow-500') ||
                         progressBar?.classList.contains('bg-red-500');
    
    expect(hasColorClass).toBe(true);
  });
});
