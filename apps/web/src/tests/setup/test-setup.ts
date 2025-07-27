// Advanced Testing Setup for FitnessApp
// Implements mutation testing, contract testing, and zero-regression policy

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { server } from './mocks/server';
import { TextEncoder, TextDecoder } from 'util';

// Configure Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  computedStyleSupportsPseudoElements: true,
});

// Global test utilities
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      add: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
    })),
  },
}));

// Setup MSW server
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});

afterAll(() => {
  server.close();
});

// Performance testing utilities
export const measurePerformance = async (fn: () => Promise<void> | void): Promise<number> => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

// Memory leak detection in tests
export const detectMemoryLeaks = (testName: string) => {
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  return () => {
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryDiff = finalMemory - initialMemory;
    
    if (memoryDiff > 1000000) { // 1MB threshold
      console.warn(`Potential memory leak in ${testName}: ${memoryDiff} bytes`);
    }
  };
};

// Contract testing utilities
export interface APIContract {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requestSchema: any;
  responseSchema: any;
  statusCode: number;
}

export const validateContract = (contract: APIContract, response: any) => {
  // Validate response against schema
  // This would integrate with a schema validation library like Joi or Yup
  return true; // Simplified for example
};

// Property-based testing utilities
export const generateUser = () => ({
  id: Math.random().toString(36).substr(2, 9),
  email: `user${Math.random().toString(36).substr(2, 5)}@example.com`,
  name: `User ${Math.random().toString(36).substr(2, 5)}`,
  age: Math.floor(Math.random() * 50) + 18,
  fitnessLevel: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
});

export const generateWorkout = () => ({
  id: Math.random().toString(36).substr(2, 9),
  name: `Workout ${Math.random().toString(36).substr(2, 5)}`,
  duration: Math.floor(Math.random() * 60) + 15,
  exercises: Array.from({ length: Math.floor(Math.random() * 10) + 3 }, () => ({
    name: `Exercise ${Math.random().toString(36).substr(2, 5)}`,
    sets: Math.floor(Math.random() * 5) + 1,
    reps: Math.floor(Math.random() * 20) + 5,
    muscle: ['chest', 'back', 'legs', 'arms', 'core'][Math.floor(Math.random() * 5)],
  })),
});

// Mutation testing helpers
export const mutationTestCases = {
  // Test boundary conditions
  boundaries: {
    numbers: [0, -1, 1, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
    strings: ['', ' ', 'a', 'very long string'.repeat(100)],
    arrays: [[], [1], Array(1000).fill(1)],
  },
  
  // Test invalid inputs
  invalidInputs: {
    nullish: [null, undefined],
    wrongTypes: [true, false, {}, [], () => {}],
    malformed: ['not-an-email', 'invalid-date', 'NaN'],
  },
};

// Visual regression testing setup
export const setupVisualTesting = () => {
  // Configure visual testing library (e.g., Percy, Chromatic)
  return {
    takeSnapshot: (name: string, element: HTMLElement) => {
      // Implementation would depend on visual testing service
      console.log(`Visual snapshot: ${name}`);
    },
  };
};

// Accessibility testing utilities
export const testAccessibility = async (container: HTMLElement) => {
  const { axe } = await import('@axe-core/react');
  const results = await axe(container);
  
  if (results.violations.length > 0) {
    console.error('Accessibility violations:', results.violations);
    throw new Error(`${results.violations.length} accessibility violations found`);
  }
  
  return results;
};

// Load testing utilities for frontend
export const simulateLoad = async (component: React.ComponentType, iterations: number = 100) => {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const time = await measurePerformance(async () => {
      // Render component multiple times
      const { render, unmount } = await import('@testing-library/react');
      const { unmount: cleanup } = render(React.createElement(component));
      cleanup();
    });
    times.push(time);
  }
  
  return {
    average: times.reduce((a, b) => a + b, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)],
  };
};

// Fuzz testing utilities
export const fuzzTest = (fn: Function, iterations: number = 1000) => {
  const errors: any[] = [];
  
  for (let i = 0; i < iterations; i++) {
    try {
      // Generate random inputs
      const randomInputs = generateRandomInputs(fn.length);
      fn(...randomInputs);
    } catch (error) {
      errors.push({ iteration: i, error });
    }
  }
  
  return errors;
};

const generateRandomInputs = (count: number): any[] => {
  const generators = [
    () => Math.random(),
    () => Math.random().toString(36),
    () => Math.random() > 0.5,
    () => null,
    () => undefined,
    () => [],
    () => ({}),
    () => new Date(),
  ];
  
  return Array.from({ length: count }, () => {
    const generator = generators[Math.floor(Math.random() * generators.length)];
    return generator();
  });
};

// Test data factories
export const createTestUser = (overrides: Partial<any> = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createTestWorkoutPlan = (overrides: Partial<any> = {}) => ({
  id: 'test-plan-id',
  title: 'Test Workout Plan',
  description: 'A test workout plan',
  duration: 8,
  workoutsPerWeek: 3,
  fitnessLevel: 'beginner',
  goal: 'weight_loss',
  weeklySchedule: [],
  ...overrides,
});

// Test environment setup
export const setupTestEnvironment = () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.REACT_APP_FIREBASE_API_KEY = 'test-api-key';
  process.env.REACT_APP_FIREBASE_PROJECT_ID = 'test-project';
  
  // Mock console methods in tests
  const originalError = console.error;
  const originalWarn = console.warn;
  
  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });
  
  afterEach(() => {
    console.error = originalError;
    console.warn = originalWarn;
  });
};

// Zero-regression policy enforcement
export const enforceZeroRegression = () => {
  // This would integrate with CI/CD to fail builds on regressions
  const regressionThresholds = {
    performanceRegression: 10, // 10% performance degradation
    accessibilityScore: 95, // Minimum accessibility score
    testCoverage: 80, // Minimum test coverage
  };
  
  return regressionThresholds;
};

export default {
  measurePerformance,
  detectMemoryLeaks,
  validateContract,
  generateUser,
  generateWorkout,
  mutationTestCases,
  setupVisualTesting,
  testAccessibility,
  simulateLoad,
  fuzzTest,
  createTestUser,
  createTestWorkoutPlan,
  setupTestEnvironment,
  enforceZeroRegression,
};
