// Photo Factory - HTML Sanitizer
// XSS 방지를 위한 HTML 이스케이프 유틸리티

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} unsafe - Untrusted user input
 * @returns {string} Escaped safe string
 */
export function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) {
    return '';
  }

  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize object properties for safe HTML rendering
 * @param {Object} obj - Object with potentially unsafe values
 * @param {string[]} keys - Keys to sanitize
 * @returns {Object} Object with sanitized values
 */
export function sanitizeObject(obj, keys) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj };
  for (const key of keys) {
    if (sanitized[key] !== undefined) {
      sanitized[key] = escapeHtml(sanitized[key]);
    }
  }
  return sanitized;
}

/**
 * Validate and sanitize filename
 * @param {string} filename - File name to sanitize
 * @returns {string} Safe filename
 */
export function sanitizeFilename(filename) {
  if (!filename) return 'unnamed';

  return String(filename)
    .replace(/[<>:"/\\|?*]/g, '_')  // Remove invalid characters
    .replace(/\.\./g, '_')          // Prevent directory traversal
    .slice(0, 255);                 // Limit length
}
