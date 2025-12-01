// Photo Factory - IndexedDB Database Layer
// Dexie.js wrapper for local storage

import Dexie from 'dexie';

/**
 * IndexedDB Database
 * Replaces Supabase with local browser storage
 */
export const db = new Dexie('PhotoFactoryDB');

// Database Schema - Version 2
// Version 2: Added temp_photos table for upload session storage
db.version(2).stores({
  // Jobs table (작업 정보)
  jobs: '++id, job_number, work_date, car_model, technician_id, status, created_at, updated_at',

  // Photos table (사진 메타데이터 + 이미지 데이터)
  photos: '++id, job_id, category, sequence, uploaded_at',

  // Temp Photos table (업로드 세션 중 임시 저장 - LocalStorage 대체)
  // session_id: 세션별 그룹핑 (새 작업 시작 시 생성)
  temp_photos: '++id, session_id, category, sequence, created_at',

  // Users table (로컬 사용자)
  users: '++id, &email, display_name, created_at',

  // Settings table (앱 설정)
  settings: '++id, key'
});

// Database Schema - Version 3
// Version 3: Added compound indexes for better query performance
db.version(3).stores({
  // Jobs table - added compound index for date+status filtering
  jobs: '++id, job_number, work_date, car_model, technician_id, status, created_at, updated_at, [work_date+status]',

  // Photos table - added compound index for job_id+sequence sorting
  photos: '++id, job_id, category, sequence, uploaded_at, [job_id+sequence]',

  // Temp Photos table - added compound index for session+category queries
  temp_photos: '++id, session_id, category, sequence, created_at, [session_id+category]',

  // Users table (unchanged)
  users: '++id, &email, display_name, created_at',

  // Settings table (unchanged)
  settings: '++id, key'
});

/**
 * Initialize database
 * @returns {Promise<void>}
 */
export async function initDB() {
  try {
    await db.open();
    console.log('✅ IndexedDB initialized:', db.name);
    console.log('📊 Tables:', db.tables.map(t => t.name).join(', '));

    // Check storage quota
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usage = (estimate.usage / 1024 / 1024).toFixed(2);
      const quota = (estimate.quota / 1024 / 1024).toFixed(2);
      console.log(`💾 Storage: ${usage}MB / ${quota}MB (${(estimate.usage / estimate.quota * 100).toFixed(1)}%)`);
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize IndexedDB:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDB() {
  db.close();
  console.log('🔒 IndexedDB closed');
}

/**
 * Clear all data (for testing/reset)
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  try {
    await db.jobs.clear();
    await db.photos.clear();
    await db.users.clear();
    await db.settings.clear();
    console.log('🗑️ All data cleared');
  } catch (error) {
    console.error('❌ Failed to clear data:', error);
    throw error;
  }
}

/**
 * Export database to JSON (for backup)
 * @returns {Promise<Object>}
 */
export async function exportDatabase() {
  try {
    const data = {
      version: 1,
      timestamp: Date.now(),
      jobs: await db.jobs.toArray(),
      photos: await db.photos.toArray(),
      users: await db.users.toArray(),
      settings: await db.settings.toArray()
    };

    console.log('📤 Database exported:', {
      jobs: data.jobs.length,
      photos: data.photos.length,
      users: data.users.length
    });

    return data;
  } catch (error) {
    console.error('❌ Failed to export database:', error);
    throw error;
  }
}

/**
 * Import database from JSON (for restore)
 * @param {Object} data - Exported data
 * @returns {Promise<void>}
 */
export async function importDatabase(data) {
  try {
    if (data.version !== 1) {
      throw new Error(`Unsupported database version: ${data.version}`);
    }

    // Clear existing data
    await clearAllData();

    // Import data
    await db.jobs.bulkAdd(data.jobs);
    await db.photos.bulkAdd(data.photos);
    await db.users.bulkAdd(data.users);
    if (data.settings) {
      await db.settings.bulkAdd(data.settings);
    }

    console.log('📥 Database imported:', {
      jobs: data.jobs.length,
      photos: data.photos.length,
      users: data.users.length
    });
  } catch (error) {
    console.error('❌ Failed to import database:', error);
    throw error;
  }
}

/**
 * Get database statistics
 * @returns {Promise<Object>}
 */
export async function getDatabaseStats() {
  try {
    const stats = {
      jobs: await db.jobs.count(),
      photos: await db.photos.count(),
      users: await db.users.count(),
      settings: await db.settings.count()
    };

    // Calculate total storage size (approximate)
    const photos = await db.photos.toArray();
    const totalSize = photos.reduce((sum, photo) => {
      if (photo.image_data) {
        return sum + photo.image_data.length;
      }
      return sum;
    }, 0);

    stats.totalStorageBytes = totalSize;
    stats.totalStorageMB = (totalSize / 1024 / 1024).toFixed(2);

    return stats;
  } catch (error) {
    console.error('❌ Failed to get database stats:', error);
    throw error;
  }
}

// ===== Temp Photos API (LocalStorage 대체) =====

/**
 * Generate unique session ID
 * Uses crypto.getRandomValues for better randomness
 * @returns {string}
 */
export function generateSessionId() {
  // Use crypto.getRandomValues if available (more secure)
  let randomPart;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(2);
    crypto.getRandomValues(array);
    randomPart = Array.from(array, n => n.toString(36)).join('');
  } else {
    // Fallback to Math.random (less secure but works everywhere)
    randomPart = Math.random().toString(36).slice(2, 11);  // slice instead of deprecated substr
  }
  return `session_${Date.now()}_${randomPart}`;
}

/**
 * Save temp photo to IndexedDB
 * @param {string} sessionId - Session identifier
 * @param {string} category - Photo category
 * @param {Object} photoData - Photo data including image_data
 * @returns {Promise<number>} - Photo ID
 */
export async function saveTempPhoto(sessionId, category, photoData) {
  try {
    const id = await db.temp_photos.add({
      session_id: sessionId,
      category,
      sequence: photoData.sequence || 0,
      image_data: photoData.image_data,
      thumbnail_data: photoData.thumbnail_data,
      file_name: photoData.file_name,
      file_size: photoData.file_size,
      created_at: Date.now()
    });
    console.log(`💾 Temp photo saved to IndexedDB: ${category} #${id}`);
    return id;
  } catch (error) {
    console.error('❌ Failed to save temp photo:', error);
    throw error;
  }
}

/**
 * Get all temp photos for a session
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} - Photos grouped by category
 */
export async function getTempPhotos(sessionId) {
  try {
    const photos = await db.temp_photos
      .where('session_id')
      .equals(sessionId)
      .toArray();

    // Group by category
    const grouped = {};
    for (const photo of photos) {
      if (!grouped[photo.category]) {
        grouped[photo.category] = [];
      }
      grouped[photo.category].push(photo);
    }

    return grouped;
  } catch (error) {
    console.error('❌ Failed to get temp photos:', error);
    throw error;
  }
}

/**
 * Get temp photos count by category for a session
 * Optimized: Uses filter + count instead of toArray to avoid loading image data
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} - Count per category
 */
export async function getTempPhotosCount(sessionId) {
  const categories = ['before_car', 'before_wheel', 'during', 'after_wheel', 'after_car'];

  try {
    // Count each category in parallel (no image data loaded)
    const countPromises = categories.map(async (category) => {
      const count = await db.temp_photos
        .where('session_id')
        .equals(sessionId)
        .filter(photo => photo.category === category)
        .count();
      return [category, count];
    });

    const results = await Promise.all(countPromises);
    const counts = {};
    for (const [category, count] of results) {
      if (count > 0) {
        counts[category] = count;
      }
    }

    return counts;
  } catch (error) {
    console.error('❌ Failed to get temp photos count:', error);
    return {};
  }
}

/**
 * Delete temp photo by ID
 * @param {number} photoId - Photo ID
 * @returns {Promise<void>}
 */
export async function deleteTempPhoto(photoId) {
  try {
    await db.temp_photos.delete(photoId);
    console.log(`🗑️ Temp photo deleted: #${photoId}`);
  } catch (error) {
    console.error('❌ Failed to delete temp photo:', error);
    throw error;
  }
}

/**
 * Clear all temp photos for a session
 * @param {string} sessionId - Session identifier
 * @returns {Promise<number>} - Number of deleted photos
 */
export async function clearTempPhotos(sessionId) {
  try {
    const count = await db.temp_photos
      .where('session_id')
      .equals(sessionId)
      .delete();
    console.log(`🗑️ Cleared ${count} temp photos for session: ${sessionId}`);
    return count;
  } catch (error) {
    console.error('❌ Failed to clear temp photos:', error);
    throw error;
  }
}

/**
 * Clean up old temp photos (older than 24 hours)
 * @returns {Promise<number>} - Number of deleted photos
 */
export async function cleanupOldTempPhotos() {
  try {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    const count = await db.temp_photos
      .where('created_at')
      .below(cutoff)
      .delete();

    if (count > 0) {
      console.log(`🧹 Cleaned up ${count} old temp photos`);
    }
    return count;
  } catch (error) {
    console.error('❌ Failed to cleanup old temp photos:', error);
    return 0;
  }
}

// Auto-initialize when module loads
initDB().catch(error => {
  console.error('Failed to auto-initialize DB:', error);
});

// Cleanup old temp photos on load
cleanupOldTempPhotos().catch(() => {});

console.log('📦 IndexedDB module loaded');
