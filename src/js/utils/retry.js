// Photo Factory - Retry Utility
// Provides automatic retry logic with exponential backoff

import { isRetryableError } from './errors.js';

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.delayMs - Initial delay in milliseconds (default: 1000)
 * @param {number} options.backoffMultiplier - Backoff multiplier (default: 2)
 * @param {Function} options.onRetry - Callback called before each retry
 * @returns {Promise<any>}
 */
export async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry = null
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = delayMs * Math.pow(backoffMultiplier, attempt);

      console.warn(
        `[Retry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`,
        error.message
      );

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, delay, error);
      }

      // Wait before next retry
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Retry with specific retry count
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Number of retries
 * @returns {Promise<any>}
 */
export async function retry(fn, retries = 3) {
  return withRetry(fn, { maxRetries: retries });
}

/**
 * Retry with custom delay
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Number of retries
 * @param {number} delayMs - Delay in milliseconds
 * @returns {Promise<any>}
 */
export async function retryWithDelay(fn, retries = 3, delayMs = 1000) {
  return withRetry(fn, { maxRetries: retries, delayMs });
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry fetch with automatic retry on network errors
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} retryOptions - Retry options
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(url, options = {}, retryOptions = {}) {
  return withRetry(
    async () => {
      const controller = new AbortController();
      const timeout = options.timeout || 30000; // 30 seconds default

      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    {
      maxRetries: 3,
      delayMs: 1000,
      ...retryOptions
    }
  );
}

/**
 * Create a retry-enabled version of an async function
 * @param {Function} fn - Async function to wrap
 * @param {Object} retryOptions - Default retry options
 * @returns {Function}
 */
export function withRetryWrapper(fn, retryOptions = {}) {
  return async function(...args) {
    return withRetry(() => fn(...args), retryOptions);
  };
}

/**
 * Exponential backoff calculator
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {number}
 */
export function calculateBackoff(attempt, baseDelay = 1000, maxDelay = 30000) {
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Jittered backoff (adds randomness to prevent thundering herd)
 * @param {number} attempt - Current attempt number
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {number}
 */
export function calculateJitteredBackoff(attempt, baseDelay = 1000) {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * baseDelay;
  return exponentialDelay + jitter;
}
