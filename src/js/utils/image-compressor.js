// Photo Factory - Image Compression Utility
// Uses browser-image-compression for EXIF correction and size optimization

import imageCompression from 'browser-image-compression';

/**
 * Default compression options
 * Optimized for mobile photos with EXIF orientation fix
 */
const DEFAULT_OPTIONS = {
  maxSizeMB: 1,              // Max file size in MB
  maxWidthOrHeight: 1920,    // Max dimension (maintains aspect ratio)
  useWebWorker: true,        // Non-blocking compression
  preserveExif: false,       // Don't preserve EXIF (already applied to image)
  fileType: 'image/jpeg',    // Output format
  initialQuality: 0.8        // JPEG quality (0-1)
};

/**
 * Thumbnail generation options
 */
const THUMBNAIL_OPTIONS = {
  maxSizeMB: 0.1,            // 100KB max for thumbnails
  maxWidthOrHeight: 300,     // Thumbnail size
  useWebWorker: true,
  preserveExif: false,
  fileType: 'image/jpeg',
  initialQuality: 0.7
};

/**
 * Compress an image file with EXIF orientation correction
 * @param {File} file - Original image file
 * @param {Object} options - Compression options (optional)
 * @returns {Promise<File>} - Compressed file
 */
export async function compressImage(file, options = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    console.log(`🖼️ Compressing: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    const compressedFile = await imageCompression(file, mergedOptions);

    const ratio = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
    console.log(`✅ Compressed: ${(compressedFile.size / 1024).toFixed(0)}KB (${ratio}% reduction)`);

    return compressedFile;
  } catch (error) {
    console.error('❌ Compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Generate a thumbnail from an image file
 * @param {File} file - Original image file
 * @returns {Promise<string>} - Base64 data URL of thumbnail
 */
export async function generateThumbnail(file) {
  try {
    const thumbnailFile = await imageCompression(file, THUMBNAIL_OPTIONS);
    const base64 = await fileToBase64(thumbnailFile);
    return base64;
  } catch (error) {
    console.error('❌ Thumbnail generation failed:', error);
    throw error;
  }
}

/**
 * Convert File to Base64 data URL
 * @param {File} file - File to convert
 * @returns {Promise<string>} - Base64 data URL
 */
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image and generate thumbnail in one operation
 * Returns both compressed image as base64 and thumbnail
 * @param {File} file - Original image file
 * @param {Object} options - Compression options (optional)
 * @returns {Promise<{image_data: string, thumbnail_data: string, file_name: string, file_size: number}>}
 */
export async function processImage(file, options = {}) {
  // Run compression and thumbnail generation in parallel
  const [compressedFile, thumbnailData] = await Promise.all([
    compressImage(file, options),
    generateThumbnail(file)
  ]);

  const imageData = await fileToBase64(compressedFile);

  return {
    image_data: imageData,
    thumbnail_data: thumbnailData,
    file_name: file.name,
    file_size: compressedFile.size,
    original_size: file.size
  };
}

/**
 * Get compression statistics
 * @param {number} originalSize - Original file size in bytes
 * @param {number} compressedSize - Compressed file size in bytes
 * @returns {Object} - Statistics object
 */
export function getCompressionStats(originalSize, compressedSize) {
  const reduction = originalSize - compressedSize;
  const ratio = (reduction / originalSize) * 100;

  return {
    originalMB: (originalSize / 1024 / 1024).toFixed(2),
    compressedKB: (compressedSize / 1024).toFixed(0),
    reductionPercent: ratio.toFixed(1),
    savedBytes: reduction
  };
}

console.log('📦 Image compression module loaded (browser-image-compression)');
