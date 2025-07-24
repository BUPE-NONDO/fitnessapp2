import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock data generators
export const createMockGoal = (overrides = {}) => ({
  id: 'test-goal-1',
  userId: 'test-user-id',
  title: 'Test Goal',
  description: 'A test goal for unit testing',
  metric: 'count',
  target: 10,
  frequency: 'daily',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockLog = (overrides = {}) => ({
  id: 'test-log-1',
  userId: 'test-user-id',
  goalId: 'test-goal-1',
  date: new Date(),
  value: 5,
  notes: 'Test log entry',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  ...overrides,
});

export const createMockAchievement = (overrides = {}) => ({
  id: 'test-achievement-1',
  type: 'goal_completed' as const,
  title: 'Goal Achieved!',
  description: 'You completed your test goal',
  icon: '🎉',
  earnedAt: new Date(),
  celebrated: false,
  ...overrides,
});

// Test wrapper with providers
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock Firebase functions
export const mockFirebaseAuth = {
  currentUser: createMockUser(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
};

export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({
    exists: () => true,
    data: () => createMockGoal(),
    id: 'test-goal-1',
  })),
  getDocs: vi.fn(() => Promise.resolve({
    docs: [
      {
        id: 'test-goal-1',
        data: () => createMockGoal(),
      },
    ],
  })),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-doc-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
};

// Mock tRPC procedures
export const mockTRPCProcedures = {
  goals: {
    getAll: vi.fn(() => Promise.resolve({ data: [createMockGoal()] })),
    create: vi.fn(() => Promise.resolve(createMockGoal())),
    update: vi.fn(() => Promise.resolve(createMockGoal())),
    delete: vi.fn(() => Promise.resolve({ success: true })),
  },
  logs: {
    getAll: vi.fn(() => Promise.resolve({ data: [createMockLog()] })),
    create: vi.fn(() => Promise.resolve(createMockLog())),
    update: vi.fn(() => Promise.resolve(createMockLog())),
    delete: vi.fn(() => Promise.resolve({ success: true })),
  },
};

// Test data sets
export const testGoals = [
  createMockGoal({
    id: 'goal-1',
    title: 'Daily Push-ups',
    metric: 'count',
    target: 50,
    frequency: 'daily',
  }),
  createMockGoal({
    id: 'goal-2',
    title: 'Weekly Running',
    metric: 'distance',
    target: 10,
    frequency: 'weekly',
  }),
  createMockGoal({
    id: 'goal-3',
    title: 'Monthly Weight Loss',
    metric: 'weight',
    target: 2,
    frequency: 'monthly',
  }),
];

export const testLogs = [
  createMockLog({
    id: 'log-1',
    goalId: 'goal-1',
    value: 55,
    date: new Date(),
  }),
  createMockLog({
    id: 'log-2',
    goalId: 'goal-1',
    value: 48,
    date: new Date(Date.now() - 86400000),
  }),
  createMockLog({
    id: 'log-3',
    goalId: 'goal-2',
    value: 12,
    date: new Date(),
  }),
];

// Assertion helpers
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent(text);
};

export const expectButtonToBeEnabled = (button: HTMLElement) => {
  expect(button).toBeInTheDocument();
  expect(button).toBeEnabled();
};

export const expectButtonToBeDisabled = (button: HTMLElement) => {
  expect(button).toBeInTheDocument();
  expect(button).toBeDisabled();
};

// Wait utilities
export const waitForLoadingToFinish = async () => {
  const { waitForElementToBeRemoved, queryByText } = await import('@testing-library/react');
  const loadingElement = queryByText(/loading/i);
  if (loadingElement) {
    await waitForElementToBeRemoved(loadingElement);
  }
};

// Form testing utilities
export const fillForm = async (fields: Record<string, string>) => {
  const { screen } = await import('@testing-library/react');
  const userEvent = (await import('@testing-library/user-event')).default;
  const user = userEvent.setup();

  for (const [fieldName, value] of Object.entries(fields)) {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'));
    await user.clear(field);
    await user.type(field, value);
  }
};

export const submitForm = async () => {
  const { screen } = await import('@testing-library/react');
  const userEvent = (await import('@testing-library/user-event')).default;
  const user = userEvent.setup();

  const submitButton = screen.getByRole('button', { name: /submit|save|create|add/i });
  await user.click(submitButton);
};

// Date utilities for testing
export const createDateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const createDateDaysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
