import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoalsList } from '@/components/GoalsList';
import { useUser } from '@/hooks/useUser';
import { useGoals } from '@/hooks/useTRPC';
import { useOnboarding } from '@/hooks/useOnboarding';

// Mock the hooks
vi.mock('@/hooks/useUser');
vi.mock('@/hooks/useTRPC');
vi.mock('@/hooks/useOnboarding');
vi.mock('@/services/achievementService');

// Mock the createGoal mutation
const mockCreateGoalMutation = {
  mutateAsync: vi.fn(),
  isLoading: false,
  isError: false,
  error: null,
};

// Mock the OnboardingWizard component
vi.mock('@/components/onboarding/OnboardingWizard', () => ({
  OnboardingWizard: ({ onComplete, onExit }: any) => (
    <div data-testid="onboarding-wizard">
      <h1>Onboarding Wizard</h1>
      <button onClick={() => onComplete({ primaryGoal: 'lose-weight' })}>
        Complete Onboarding
      </button>
      <button onClick={onExit}>Exit</button>
    </div>
  ),
}));

const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
};

const mockUserProfile = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
  onboardingCompleted: false,
  preferences: {},
  stats: {
    totalGoals: 0,
    activeGoals: 0,
    totalLogs: 0,
    streakDays: 0,
    joinedDate: new Date(),
  },
};

describe('Onboarding Flow Integration', () => {
  const mockUseUser = vi.mocked(useUser);
  const mockUseGoals = vi.mocked(useGoals);
  const mockUseOnboarding = vi.mocked(useOnboarding);

  // Mock useCreateGoal hook
  vi.mock('@/hooks/useTRPC', async () => {
    const actual = await vi.importActual('@/hooks/useTRPC');
    return {
      ...actual,
      useCreateGoal: () => mockCreateGoalMutation,
    };
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });

    // Default mock implementations
    mockUseUser.mockReturnValue({
      user: mockUser,
      userProfile: mockUserProfile,
      loading: false,
      error: null,
      updateProfile: vi.fn(),
      refreshProfile: vi.fn(),
      signOut: vi.fn(),
      isAuthenticated: true,
      isEmailVerified: true,
      displayName: 'Test User',
      initials: 'TU',
    });

    mockUseGoals.mockReturnValue({
      data: { data: [] }, // No goals initially
      isLoading: false,
      isError: false,
    });
  });

  it('should trigger onboarding when creating first goal for new user', async () => {
    const mockTriggerOnboarding = vi.fn();
    const mockCompleteOnboarding = vi.fn();
    
    mockUseOnboarding.mockReturnValue({
      isOnboardingCompleted: false,
      shouldShowOnboarding: true,
      isOnboardingRequired: true,
      completeOnboarding: mockCompleteOnboarding,
      saveOnboardingProgress: vi.fn(),
      triggerOnboarding: mockTriggerOnboarding,
      skipOnboarding: vi.fn(),
      isOnboardingOpen: false,
      setIsOnboardingOpen: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<GoalsList />);

    // Should show "Create Your First Goal" button for new users
    expect(screen.getByText('Create Your First Goal')).toBeInTheDocument();

    // Click to create first goal
    fireEvent.click(screen.getByText('Create Your First Goal'));

    // Should show goal form
    expect(screen.getByText('Create New Goal')).toBeInTheDocument();

    // Fill out goal form
    const titleInput = screen.getByLabelText(/Goal Title/i);
    fireEvent.change(titleInput, { target: { value: 'Daily Push-ups' } });

    const targetInput = screen.getByLabelText(/Target/i);
    fireEvent.change(targetInput, { target: { value: '20' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create goal/i });
    fireEvent.click(submitButton);

    // Should trigger onboarding instead of creating goal immediately
    await waitFor(() => {
      expect(mockTriggerOnboarding).toHaveBeenCalled();
    });

    // Should store goal data in sessionStorage
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      'pendingGoal',
      expect.stringContaining('Daily Push-ups')
    );
  });

  it('should show onboarding wizard when triggered', () => {
    mockUseOnboarding.mockReturnValue({
      isOnboardingCompleted: false,
      shouldShowOnboarding: true,
      isOnboardingRequired: true,
      completeOnboarding: vi.fn(),
      saveOnboardingProgress: vi.fn(),
      triggerOnboarding: vi.fn(),
      skipOnboarding: vi.fn(),
      isOnboardingOpen: true, // Onboarding is open
      setIsOnboardingOpen: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<GoalsList />);

    // Should show onboarding wizard
    expect(screen.getByTestId('onboarding-wizard')).toBeInTheDocument();
    expect(screen.getByText('Onboarding Wizard')).toBeInTheDocument();
  });

  it('should not trigger onboarding for users who already have goals', async () => {
    const mockTriggerOnboarding = vi.fn();
    
    // Mock user with existing goals
    mockUseGoals.mockReturnValue({
      data: { 
        data: [
          {
            id: '1',
            userId: 'test-user-123',
            title: 'Existing Goal',
            metric: 'count',
            target: 10,
            frequency: 'daily',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ] 
      },
      isLoading: false,
      isError: false,
    });

    mockUseOnboarding.mockReturnValue({
      isOnboardingCompleted: false,
      shouldShowOnboarding: false, // Should not show for existing users
      isOnboardingRequired: false,
      completeOnboarding: vi.fn(),
      saveOnboardingProgress: vi.fn(),
      triggerOnboarding: mockTriggerOnboarding,
      skipOnboarding: vi.fn(),
      isOnboardingOpen: false,
      setIsOnboardingOpen: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<GoalsList />);

    // Should show existing goals, not onboarding prompt
    expect(screen.getByText('Existing Goal')).toBeInTheDocument();
    expect(screen.queryByText('Create Your First Goal')).not.toBeInTheDocument();
  });

  it('should not trigger onboarding for users who completed it', () => {
    const mockTriggerOnboarding = vi.fn();
    
    // Mock user with completed onboarding
    const completedUserProfile = {
      ...mockUserProfile,
      onboardingCompleted: true,
    };

    mockUseUser.mockReturnValue({
      user: mockUser,
      userProfile: completedUserProfile,
      loading: false,
      error: null,
      updateProfile: vi.fn(),
      refreshProfile: vi.fn(),
      signOut: vi.fn(),
      isAuthenticated: true,
      isEmailVerified: true,
      displayName: 'Test User',
      initials: 'TU',
    });

    mockUseOnboarding.mockReturnValue({
      isOnboardingCompleted: true,
      shouldShowOnboarding: false,
      isOnboardingRequired: false,
      completeOnboarding: vi.fn(),
      saveOnboardingProgress: vi.fn(),
      triggerOnboarding: mockTriggerOnboarding,
      skipOnboarding: vi.fn(),
      isOnboardingOpen: false,
      setIsOnboardingOpen: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<GoalsList />);

    // Should show normal goal creation flow
    expect(screen.getByText('Create Your First Goal')).toBeInTheDocument();
    
    // Clicking should not trigger onboarding
    fireEvent.click(screen.getByText('Create Your First Goal'));
    expect(mockTriggerOnboarding).not.toHaveBeenCalled();
  });
});
