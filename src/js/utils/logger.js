// Photo Factory - Logger Utility
// Disables console.log in production, keeps errors visible

/**
 * Check if running in development mode
 */
const isDevelopment = () => {
  return import.meta.env?.DEV === true ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
};

/**
 * Logger levels
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

/**
 * Current log level (production = ERROR only, dev = all)
 */
const currentLevel = isDevelopment() ? LogLevel.DEBUG : LogLevel.ERROR;

/**
 * Logger utility
 * In production, only errors are logged
 */
export const logger = {
  /**
   * Debug level log (dev only)
   */
  debug(...args) {
    if (currentLevel <= LogLevel.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info level log (dev only)
   */
  info(...args) {
    if (currentLevel <= LogLevel.INFO) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Warning level log (dev only)
   */
  warn(...args) {
    if (currentLevel <= LogLevel.WARN) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Error level log (always shown)
   */
  error(...args) {
    if (currentLevel <= LogLevel.ERROR) {
      console.error('[ERROR]', ...args);
    }
  },

  /**
   * Log with emoji prefix
   */
  success(...args) {
    if (currentLevel <= LogLevel.INFO) {
      console.log('✅', ...args);
    }
  },

  storage(...args) {
    if (currentLevel <= LogLevel.DEBUG) {
      console.log('💾', ...args);
    }
  },

  db(...args) {
    if (currentLevel <= LogLevel.DEBUG) {
      console.log('📊', ...args);
    }
  },

  /**
   * Log object as table (dev only)
   */
  table(data, columns) {
    if (currentLevel <= LogLevel.DEBUG) {
      console.table(data, columns);
    }
  },

  /**
   * Group logs (dev only)
   */
  group(label) {
    if (currentLevel <= LogLevel.DEBUG) {
      console.group(label);
    }
  },

  groupEnd() {
    if (currentLevel <= LogLevel.DEBUG) {
      console.groupEnd();
    }
  },

  /**
   * Time measurement (dev only)
   */
  time(label) {
    if (currentLevel <= LogLevel.DEBUG) {
      console.time(label);
    }
  },

  timeEnd(label) {
    if (currentLevel <= LogLevel.DEBUG) {
      console.timeEnd(label);
    }
  }
};

/**
 * Sanitize sensitive data from logs
 * @param {Object} data - Data to sanitize
 * @param {string[]} sensitiveKeys - Keys to redact
 * @returns {Object}
 */
export function sanitizeForLog(data, sensitiveKeys = ['image_data', 'thumbnail_data', 'password', 'token']) {
  if (!data || typeof data !== 'object') return data;

  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.includes(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForLog(sanitized[key], sensitiveKeys);
    }
  }

  return sanitized;
}

export default logger;
