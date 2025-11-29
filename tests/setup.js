// Photo Factory - Test Setup
// Global test configuration and mocks

import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// Mock environment variables
beforeAll(() => {
  // Set up global test environment
  console.log('🧪 Test environment initialized');
});

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks();

  // Clear localStorage
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }
});

// Clean up after all tests
afterAll(() => {
  console.log('✅ All tests completed');
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock alert
global.alert = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
