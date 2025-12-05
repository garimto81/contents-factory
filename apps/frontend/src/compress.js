/**
 * Image compression utilities using browser-image-compression
 */

import imageCompression from 'browser-image-compression';

const OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1920,
  useWebWorker: true
};

/**
 * Compress image to ~500KB max
 * @param {File} file - Original image file
 * @returns {Promise<File>} Compressed image file
 */
export async function compressImage(file) {
  const compressed = await imageCompression(file, OPTIONS);
  return compressed;
}

/**
 * Create thumbnail (200px max, ~50KB)
 * @param {File} file - Original image file
 * @returns {Promise<File>} Thumbnail file
 */
export async function createThumbnail(file) {
  const options = { ...OPTIONS, maxWidthOrHeight: 200, maxSizeMB: 0.05 };
  return imageCompression(file, options);
}

/**
 * Convert File to Base64 data URL
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 data URL
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
