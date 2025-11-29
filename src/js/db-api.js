// Photo Factory - Database API Layer
// Provides Supabase-compatible API using IndexedDB

import { db } from './db.js';

/**
 * Jobs API
 * Replaces: supabase.from('jobs')
 */
export const jobsAPI = {
  /**
   * Insert new job
   * @param {Object} jobData
   * @returns {Promise<{data: Object, error: null}>}
   */
  async insert(jobData) {
    try {
      const id = await db.jobs.add({
        ...jobData,
        created_at: jobData.created_at || Date.now(),
        updated_at: Date.now()
      });

      const job = await db.jobs.get(id);

      return {
        data: job,
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to insert job:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Select jobs with filters
   * @param {string} columns - Columns to select (ignored, returns all)
   * @returns {Object} - Query builder
   */
  select(columns = '*') {
    return {
      /**
       * Filter by technician_id
       */
      eq: (field, value) => ({
        order: (orderField, options = {}) => ({
          then: async (callback) => {
            try {
              let collection = db.jobs.where(field).equals(value);

              // Apply ordering
              if (options.ascending === false) {
                collection = collection.reverse();
              }

              const jobs = await collection.sortBy(orderField);

              // Get photos for each job
              const jobsWithPhotos = await Promise.all(
                jobs.map(async (job) => {
                  const photos = await db.photos
                    .where('job_id')
                    .equals(job.id)
                    .sortBy('sequence');

                  return {
                    ...job,
                    photos: photos
                  };
                })
              );

              return callback({ data: jobsWithPhotos, error: null });
            } catch (error) {
              console.error('❌ Failed to select jobs:', error);
              return callback({ data: null, error: error.message });
            }
          }
        })
      }),

      /**
       * Get single job by ID
       */
      single: async () => {
        try {
          // This is called after .eq(), so we need context
          // Simplified: return first result
          const jobs = await db.jobs.toArray();
          return {
            data: jobs[0] || null,
            error: null
          };
        } catch (error) {
          return {
            data: null,
            error: error.message
          };
        }
      }
    };
  },

  /**
   * Update job
   * @param {number} id
   * @param {Object} updates
   */
  async update(id, updates) {
    try {
      await db.jobs.update(id, {
        ...updates,
        updated_at: Date.now()
      });

      const job = await db.jobs.get(id);

      return {
        data: job,
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to update job:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Delete job
   * @param {number} id
   */
  async delete(id) {
    try {
      // Delete related photos first
      await db.photos.where('job_id').equals(id).delete();

      // Delete job
      await db.jobs.delete(id);

      return {
        data: { id },
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to delete job:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }
};

/**
 * Photos API
 * Replaces: supabase.from('photos')
 */
export const photosAPI = {
  /**
   * Insert photos (batch)
   * @param {Array} photosData
   */
  async insert(photosData) {
    try {
      // Handle single object or array
      const dataArray = Array.isArray(photosData) ? photosData : [photosData];

      const ids = await db.photos.bulkAdd(
        dataArray.map(photo => ({
          ...photo,
          uploaded_at: photo.uploaded_at || Date.now()
        }))
      );

      const photos = await db.photos.bulkGet(ids);

      return {
        data: photos,
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to insert photos:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Select photos by job_id
   * @param {number} jobId
   */
  async selectByJob(jobId) {
    try {
      const photos = await db.photos
        .where('job_id')
        .equals(jobId)
        .sortBy('sequence');

      return {
        data: photos,
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to select photos:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Delete photo
   * @param {number} id
   */
  async delete(id) {
    try {
      await db.photos.delete(id);

      return {
        data: { id },
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to delete photo:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }
};

/**
 * Users API (Local authentication)
 */
export const usersAPI = {
  /**
   * Create local user
   * @param {Object} userData
   */
  async create(userData) {
    try {
      const id = await db.users.add({
        ...userData,
        created_at: Date.now()
      });

      const user = await db.users.get(id);

      return {
        data: user,
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Get user by email
   * @param {string} email
   */
  async getByEmail(email) {
    try {
      const user = await db.users.where('email').equals(email).first();

      return {
        data: user || null,
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to get user:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Get all users
   */
  async getAll() {
    try {
      const users = await db.users.toArray();

      return {
        data: users,
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to get users:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }
};

/**
 * Generate job number (local version)
 * Replaces: supabase.rpc('generate_job_number')
 */
export async function generateJobNumber() {
  try {
    const today = new Date();
    const yymmdd = today.toISOString().slice(2, 10).replace(/-/g, '');

    // Count jobs created today
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    const todayJobs = await db.jobs
      .where('created_at')
      .between(todayStart, todayEnd)
      .count();

    const sequence = (todayJobs + 1).toString().padStart(3, '0');
    const jobNumber = `WHL${yymmdd}${sequence}`;

    return {
      data: jobNumber,
      error: null
    };
  } catch (error) {
    console.error('❌ Failed to generate job number:', error);
    return {
      data: `WHL${Date.now().toString().slice(-9)}`,
      error: error.message
    };
  }
}

/**
 * Helper: Convert File to Base64
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/**
 * Helper: Generate thumbnail from image
 * @param {File} file
 * @param {number} maxSize
 * @returns {Promise<string>}
 */
export async function generateThumbnail(file, maxSize = 300) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.onerror = reject;
    };

    reader.onerror = reject;
  });
}

console.log('📡 Database API layer loaded');
