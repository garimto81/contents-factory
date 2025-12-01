// Photo Factory - Custom Error Classes
// Provides structured error handling with user-friendly messages

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(message, code, userMessage, retry = false) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage; // 사용자에게 표시할 메시지
    this.retry = retry; // 재시도 가능 여부
    this.timestamp = Date.now();
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      retry: this.retry,
      timestamp: this.timestamp
    };
  }
}

/**
 * Upload-related errors
 */
export class UploadError extends AppError {
  constructor(message, originalError = null) {
    super(
      message,
      'UPLOAD_ERROR',
      '업로드에 실패했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.',
      true // 재시도 가능
    );
    this.name = 'UploadError';
    this.originalError = originalError;
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends AppError {
  constructor(message, originalError = null) {
    super(
      message,
      'NETWORK_ERROR',
      '네트워크 연결을 확인해주세요. 잠시 후 다시 시도해주세요.',
      true // 재시도 가능
    );
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

/**
 * Authentication errors
 */
export class AuthError extends AppError {
  constructor(message) {
    super(
      message,
      'AUTH_ERROR',
      '로그인이 필요합니다. 다시 로그인해주세요.',
      false // 재시도 불가 - 로그인 필요
    );
    this.name = 'AuthError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(
      message,
      'VALIDATION_ERROR',
      message, // Validation errors are already user-friendly
      false // 재시도 불가 - 입력 수정 필요
    );
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Database errors
 */
export class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(
      message,
      'DATABASE_ERROR',
      '데이터 저장에 실패했습니다. 잠시 후 다시 시도해주세요.',
      true // 재시도 가능
    );
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

/**
 * Handle different error types and show appropriate user message
 * @param {Error} error - The error to handle
 * @param {Function} showMessage - Function to show message to user (e.g., alert)
 * @param {Function} logError - Optional function to log error (e.g., to Sentry)
 */
export function handleError(error, showMessage = alert, logError = console.error) {
  // Log error for debugging
  logError('[Error Handler]', error);

  // Show user-friendly message
  if (error instanceof AppError) {
    showMessage(error.userMessage);
    return error;
  }

  // Handle unknown errors
  showMessage('알 수 없는 오류가 발생했습니다. 페이지를 새로고침하고 다시 시도해주세요.');
  return new AppError(
    error.message || 'Unknown error',
    'UNKNOWN_ERROR',
    '알 수 없는 오류가 발생했습니다.',
    false
  );
}

// Non-retryable error types (these should fail immediately)
const NON_RETRYABLE_ERRORS = [
  'QuotaExceededError',     // Storage quota exceeded
  'SecurityError',          // Security policy violation
  'NotAllowedError',        // Permission denied
  'NotSupportedError',      // Feature not supported
  'SyntaxError',            // Invalid syntax
  'TypeError',              // Type error (except fetch)
  'ReferenceError',         // Undefined variable
  'RangeError',             // Invalid range
  'ValidationError',        // Invalid input
  'AuthError'               // Authentication required
];

// Non-retryable error messages (substring matches)
const NON_RETRYABLE_MESSAGES = [
  'quota',
  'security',
  'permission',
  'not allowed',
  'invalid',
  'unauthorized',
  'forbidden'
];

/**
 * Determine if an error is retryable
 * @param {Error} error
 * @returns {boolean}
 */
export function isRetryableError(error) {
  if (!error) return false;

  // AppError has explicit retry flag
  if (error instanceof AppError) {
    return error.retry;
  }

  // Check for explicitly non-retryable error types
  if (NON_RETRYABLE_ERRORS.includes(error.name)) {
    // Exception: TypeError from fetch is retryable (network issue)
    if (error.name === 'TypeError' && error.message?.includes('fetch')) {
      return true;
    }
    return false;
  }

  // Check for non-retryable error messages
  const lowerMessage = (error.message || '').toLowerCase();
  if (NON_RETRYABLE_MESSAGES.some(msg => lowerMessage.includes(msg))) {
    return false;
  }

  // Network errors are generally retryable
  if (error.name === 'TypeError' && error.message?.includes('fetch')) {
    return true;
  }

  // Timeout/abort errors are retryable
  if (error.name === 'AbortError' || lowerMessage.includes('timeout')) {
    return true;
  }

  // IndexedDB errors that are retryable
  if (error.name === 'TransactionInactiveError' ||
      error.name === 'ReadOnlyError' ||
      lowerMessage.includes('transaction')) {
    return true;
  }

  // Default: not retryable (fail fast)
  return false;
}

/**
 * Get error category for analytics/logging
 * @param {Error} error
 * @returns {string}
 */
export function getErrorCategory(error) {
  if (error instanceof ValidationError) return 'validation';
  if (error instanceof AuthError) return 'auth';
  if (error instanceof NetworkError) return 'network';
  if (error instanceof UploadError) return 'upload';
  if (error instanceof DatabaseError) return 'database';
  if (error.name === 'QuotaExceededError') return 'quota';
  if (error.name === 'SecurityError') return 'security';
  return 'unknown';
}

/**
 * Create error from fetch response
 * @param {Response} response - Fetch response
 * @returns {Promise<AppError>}
 */
export async function createErrorFromResponse(response) {
  try {
    const data = await response.json();
    const message = data.error?.message || data.message || response.statusText;

    if (response.status === 401 || response.status === 403) {
      return new AuthError(message);
    }

    if (response.status === 400) {
      return new ValidationError(message);
    }

    if (response.status >= 500) {
      return new DatabaseError(message);
    }

    return new NetworkError(message);
  } catch (e) {
    return new NetworkError(response.statusText);
  }
}
