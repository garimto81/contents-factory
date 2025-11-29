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

/**
 * Determine if an error is retryable
 * @param {Error} error
 * @returns {boolean}
 */
export function isRetryableError(error) {
  if (error instanceof AppError) {
    return error.retry;
  }

  // Network errors are generally retryable
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }

  // Timeout errors are retryable
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return true;
  }

  return false;
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
