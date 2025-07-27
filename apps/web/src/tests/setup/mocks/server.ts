// Mock Service Worker setup for API testing
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { createTestUser, createTestWorkoutPlan } from '../test-setup';

// Mock API responses
const mockUsers = [
  createTestUser({ id: '1', email: 'user1@example.com', name: 'User One' }),
  createTestUser({ id: '2', email: 'user2@example.com', name: 'User Two' }),
];

const mockWorkoutPlans = [
  createTestWorkoutPlan({ 
    id: '1', 
    title: 'Beginner Weight Loss',
    goal: 'weight_loss',
    fitnessLevel: 'beginner'
  }),
  createTestWorkoutPlan({ 
    id: '2', 
    title: 'Intermediate Muscle Building',
    goal: 'muscle_building',
    fitnessLevel: 'intermediate'
  }),
];

// API handlers
export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body as any;
    
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          user: mockUsers[0],
          token: 'mock-jwt-token',
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid credentials' })
    );
  }),

  rest.post('/api/auth/register', (req, res, ctx) => {
    const { email, password, name } = req.body as any;
    
    if (email && password && name) {
      const newUser = createTestUser({
        id: Date.now().toString(),
        email,
        name,
      });
      
      return res(
        ctx.status(201),
        ctx.json({
          user: newUser,
          token: 'mock-jwt-token',
        })
      );
    }
    
    return res(
      ctx.status(400),
      ctx.json({ error: 'Missing required fields' })
    );
  }),

  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  // User endpoints
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    const user = mockUsers.find(u => u.id === id);
    
    if (user) {
      return res(ctx.status(200), ctx.json(user));
    }
    
    return res(
      ctx.status(404),
      ctx.json({ error: 'User not found' })
    );
  }),

  rest.put('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    const updates = req.body as any;
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      return res(ctx.status(200), ctx.json(mockUsers[userIndex]));
    }
    
    return res(
      ctx.status(404),
      ctx.json({ error: 'User not found' })
    );
  }),

  // Workout plan endpoints
  rest.get('/api/workout-plans', (req, res, ctx) => {
    const fitnessLevel = req.url.searchParams.get('fitnessLevel');
    const goal = req.url.searchParams.get('goal');
    
    let filteredPlans = mockWorkoutPlans;
    
    if (fitnessLevel) {
      filteredPlans = filteredPlans.filter(p => p.fitnessLevel === fitnessLevel);
    }
    
    if (goal) {
      filteredPlans = filteredPlans.filter(p => p.goal === goal);
    }
    
    return res(ctx.status(200), ctx.json(filteredPlans));
  }),

  rest.get('/api/workout-plans/:id', (req, res, ctx) => {
    const { id } = req.params;
    const plan = mockWorkoutPlans.find(p => p.id === id);
    
    if (plan) {
      return res(ctx.status(200), ctx.json(plan));
    }
    
    return res(
      ctx.status(404),
      ctx.json({ error: 'Workout plan not found' })
    );
  }),

  rest.post('/api/workout-plans', (req, res, ctx) => {
    const planData = req.body as any;
    const newPlan = createTestWorkoutPlan({
      id: Date.now().toString(),
      ...planData,
    });
    
    mockWorkoutPlans.push(newPlan);
    
    return res(ctx.status(201), ctx.json(newPlan));
  }),

  // Progress tracking endpoints
  rest.get('/api/progress/:userId', (req, res, ctx) => {
    const { userId } = req.params;
    
    return res(
      ctx.status(200),
      ctx.json({
        userId,
        totalWorkouts: 15,
        currentStreak: 5,
        weeklyCompletionRate: 85,
        totalCaloriesBurned: 2500,
        averageWorkoutDuration: 45,
        recentMilestones: [
          {
            id: '1',
            type: 'streak',
            title: '5-day streak achieved!',
            date: new Date().toISOString(),
          },
        ],
      })
    );
  }),

  rest.post('/api/progress/:userId/workout', (req, res, ctx) => {
    const { userId } = req.params;
    const workoutData = req.body as any;
    
    return res(
      ctx.status(201),
      ctx.json({
        id: Date.now().toString(),
        userId,
        ...workoutData,
        completedAt: new Date().toISOString(),
      })
    );
  }),

  // Onboarding endpoints
  rest.post('/api/onboarding/:userId', (req, res, ctx) => {
    const { userId } = req.params;
    const onboardingData = req.body as any;
    
    return res(
      ctx.status(200),
      ctx.json({
        userId,
        completed: true,
        workoutPlan: mockWorkoutPlans[0],
        preferences: onboardingData,
      })
    );
  }),

  // Error simulation endpoints for testing
  rest.get('/api/error/500', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ error: 'Internal server error' })
    );
  }),

  rest.get('/api/error/timeout', (req, res, ctx) => {
    return res(
      ctx.delay(10000), // 10 second delay to simulate timeout
      ctx.status(200),
      ctx.json({ message: 'This should timeout' })
    );
  }),

  rest.get('/api/error/network', (req, res, ctx) => {
    return res.networkError('Network error');
  }),

  // Rate limiting simulation
  rest.get('/api/rate-limited', (req, res, ctx) => {
    return res(
      ctx.status(429),
      ctx.json({ 
        error: 'Rate limit exceeded',
        retryAfter: 60 
      })
    );
  }),
];

// Create server instance
export const server = setupServer(...handlers);

// Helper functions for tests
export const mockSuccessfulAuth = () => {
  server.use(
    rest.post('/api/auth/login', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          user: mockUsers[0],
          token: 'mock-jwt-token',
        })
      );
    })
  );
};

export const mockFailedAuth = () => {
  server.use(
    rest.post('/api/auth/login', (req, res, ctx) => {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Invalid credentials' })
      );
    })
  );
};

export const mockNetworkError = () => {
  server.use(
    rest.get('/api/*', (req, res, ctx) => {
      return res.networkError('Network error');
    })
  );
};

export const mockSlowResponse = (delay: number = 5000) => {
  server.use(
    rest.get('/api/*', (req, res, ctx) => {
      return res(
        ctx.delay(delay),
        ctx.status(200),
        ctx.json({ message: 'Slow response' })
      );
    })
  );
};

export default server;
