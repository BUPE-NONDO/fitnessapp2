// Placeholder tRPC setup - will be properly implemented once backend is ready
// For now, we'll create mock functions to test the integration

// Get the API URL based on environment
export const getApiUrl = () => {
  if (import.meta.env.DEV) {
    // Development - use Firebase emulator
    return 'http://127.0.0.1:5001/fitness-app-bupe-staging/us-central1/api';
  } else {
    // Production - use deployed Firebase function
    return 'https://us-central1-fitness-app-bupe-staging.cloudfunctions.net/api';
  }
};

// Mock tRPC client for now
export const trpc = {
  health: {
    useQuery: () => ({
      data: { status: 'ok', timestamp: new Date().toISOString() },
      isLoading: false,
      isError: false,
    }),
  },
  user: {
    getProfile: {
      useQuery: () => ({
        data: null,
        isLoading: false,
        isError: false,
      }),
    },
  },
  goal: {
    getAll: {
      useQuery: () => ({
        data: { data: [] },
        isLoading: false,
        isError: false,
      }),
    },
    create: {
      useMutation: () => ({
        mutate: () => {},
        isLoading: false,
        isError: false,
      }),
    },
  },
  log: {
    getByGoal: {
      useQuery: () => ({
        data: { data: [] },
        isLoading: false,
        isError: false,
      }),
    },
    create: {
      useMutation: () => ({
        mutate: () => {},
        isLoading: false,
        isError: false,
      }),
    },
  },
  useUtils: () => ({
    goal: {
      getAll: {
        invalidate: () => {},
      },
    },
    log: {
      getByGoal: {
        invalidate: () => {},
      },
    },
  }),
  Provider: ({ children }: { children: React.ReactNode }) => children,
  createClient: () => ({}),
};

export const trpcClient = {};
export const trpcVanilla = {};

export type AppRouter = any;
