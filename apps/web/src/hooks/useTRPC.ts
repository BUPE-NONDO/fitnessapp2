import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '@/services/goalService';
import { logService } from '@/services/logService';
import { useUser } from '@/hooks/useUser';
import { CreateGoal, CreateLogEntry } from '@fitness-app/shared';

// Custom hooks for common operations
export function useTRPCUtils() {
  const queryClient = useQueryClient();
  return {
    goal: {
      getAll: {
        invalidate: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
      },
    },
    log: {
      getByGoal: {
        invalidate: () => queryClient.invalidateQueries({ queryKey: ['logs'] }),
      },
    },
  };
}

// Health check hook
export function useHealthCheck() {
  return {
    data: { status: 'ok', timestamp: new Date().toISOString() },
    isLoading: false,
    isError: false,
  };
}

// User hooks
export function useUserProfile() {
  return {
    data: null,
    isLoading: false,
    isError: false,
  };
}

// Goal hooks
export function useGoals() {
  const { user } = useUser();

  return useQuery({
    queryKey: ['goals', user?.uid],
    queryFn: async () => {
      if (!user?.uid) {
        return { data: [] };
      }
      const goals = await goalService.getUserGoals(user.uid);
      return { data: goals };
    },
    enabled: !!user?.uid,
  });
}

export function useCreateGoal() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalData: CreateGoal) => {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      return await goalService.createGoal(user.uid, goalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

// Log entry hooks
export function useLogs() {
  const { user } = useUser();

  return useQuery({
    queryKey: ['logs', user?.uid],
    queryFn: async () => {
      if (!user?.uid) {
        return { data: [] };
      }
      const logs = await logService.getUserLogs(user.uid);
      return { data: logs };
    },
    enabled: !!user?.uid,
  });
}

export function useLogsByGoal(goalId: string) {
  return useQuery({
    queryKey: ['logs', 'goal', goalId],
    queryFn: async () => {
      const logs = await logService.getLogsByGoal(goalId);
      return { data: logs };
    },
    enabled: !!goalId,
  });
}

export function useCreateLog() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logData: CreateLogEntry) => {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      return await logService.createLog(user.uid, logData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, updates }: { goalId: string; updates: Partial<CreateGoal> }) => {
      return await goalService.updateGoal(goalId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      return await goalService.deleteGoal(goalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

// Error handling hook
export function useTRPCErrorHandler() {
  return {
    handleError: (error: any) => {
      if (error?.data?.code === 'UNAUTHORIZED') {
        // Handle authentication errors
        console.error('Authentication required');
        // Could redirect to login or show auth modal
      } else if (error?.data?.code === 'FORBIDDEN') {
        // Handle authorization errors
        console.error('Access denied');
      } else if (error?.data?.code === 'NOT_FOUND') {
        // Handle not found errors
        console.error('Resource not found');
      } else {
        // Handle other errors
        console.error('An error occurred:', error.message);
      }
    },
  };
}
