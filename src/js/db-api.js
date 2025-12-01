// Photo Factory - Database API Layer
// Provides Supabase-compatible API using IndexedDB

import { db } from './db.js';
import { ValidationError } from './utils/errors.js';

// Constants
const MAX_CAR_MODEL_LENGTH = 100;
const JOB_NUMBER_PATTERN = /^WHL\d{6}\d{3}$/;
const VALID_STATUSES = ['uploaded', 'processing', 'published'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Validate job data before insert/update
 * @param {Object} jobData - Job data to validate
 * @param {boolean} isUpdate - Whether this is an update (some fields optional)
 * @throws {ValidationError} If validation fails
 */
export function validateJobData(jobData, isUpdate = false) {
  if (!jobData || typeof jobData !== 'object') {
    throw new ValidationError('작업 데이터가 올바르지 않습니다.');
  }

  // Required fields for insert
  if (!isUpdate) {
    if (!jobData.job_number) {
      throw new ValidationError('작업번호는 필수입니다.', 'job_number');
    }
    if (!jobData.car_model) {
      throw new ValidationError('차량 모델은 필수입니다.', 'car_model');
    }
  }

  // job_number format validation
  if (jobData.job_number && !JOB_NUMBER_PATTERN.test(jobData.job_number)) {
    throw new ValidationError('작업번호 형식이 올바르지 않습니다. (예: WHL250112001)', 'job_number');
  }

  // car_model length validation
  if (jobData.car_model && jobData.car_model.length > MAX_CAR_MODEL_LENGTH) {
    throw new ValidationError(`차량 모델명은 ${MAX_CAR_MODEL_LENGTH}자를 초과할 수 없습니다.`, 'car_model');
  }

  // status validation
  if (jobData.status && !VALID_STATUSES.includes(jobData.status)) {
    throw new ValidationError(`상태값이 올바르지 않습니다. (${VALID_STATUSES.join(', ')})`, 'status');
  }

  return true;
}

/**
 * Validate file for upload
 * @param {File} file - File to validate
 * @throws {ValidationError} If validation fails
 */
export function validateFile(file) {
  if (!file) {
    throw new ValidationError('파일이 없습니다.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(`파일 크기가 너무 큽니다. (최대: ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new ValidationError(`지원하지 않는 파일 형식입니다. (${ALLOWED_FILE_TYPES.join(', ')})`);
  }

  return true;
}

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
      // Validate job data
      validateJobData(jobData);

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

              // Bulk fetch all photos for all jobs (N+1 Query 해결)
              const jobIds = jobs.map(j => j.id);
              const allPhotos = jobIds.length > 0
                ? await db.photos.where('job_id').anyOf(jobIds).toArray()
                : [];

              // Group photos by job_id (in-memory)
              const photosByJob = allPhotos.reduce((acc, photo) => {
                if (!acc[photo.job_id]) acc[photo.job_id] = [];
                acc[photo.job_id].push(photo);
                return acc;
              }, {});

              // Attach photos to jobs (sorted by sequence)
              const jobsWithPhotos = jobs.map(job => ({
                ...job,
                photos: (photosByJob[job.id] || []).sort((a, b) => a.sequence - b.sequence)
              }));

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
   * Delete job with photos (atomic transaction)
   * @param {number} id
   */
  async delete(id) {
    try {
      // Use transaction for atomic deletion (photos + job)
      await db.transaction('rw', db.jobs, db.photos, async () => {
        // Delete related photos first
        await db.photos.where('job_id').equals(id).delete();

        // Delete job
        await db.jobs.delete(id);
      });

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
 * Uses optimistic locking with retry to prevent race conditions
 */
export async function generateJobNumber(maxRetries = 5) {
  const today = new Date();

  // Use local date format (not UTC) to avoid timezone issues
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const yymmdd = `${year}${month}${day}`;

  // Calculate today's range in local time
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Count jobs created today
      const todayJobs = await db.jobs
        .where('created_at')
        .between(todayStart, todayEnd)
        .count();

      const sequence = (todayJobs + 1).toString().padStart(3, '0');
      const jobNumber = `WHL${yymmdd}${sequence}`;

      // Check if this job number already exists (race condition check)
      const existing = await db.jobs.where('job_number').equals(jobNumber).first();

      if (existing) {
        console.warn(`⚠️ Job number ${jobNumber} already exists, retrying... (attempt ${attempt + 1})`);
        // Small delay before retry to reduce collision chance
        await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)));
        continue;
      }

      return {
        data: jobNumber,
        error: null
      };
    } catch (error) {
      console.error(`❌ Failed to generate job number (attempt ${attempt + 1}):`, error);
      if (attempt === maxRetries - 1) {
        // Fallback: use timestamp-based unique number
        return {
          data: `WHL${Date.now().toString().slice(-9)}`,
          error: error.message
        };
      }
    }
  }

  // Should not reach here, but fallback just in case
  return {
    data: `WHL${Date.now().toString().slice(-9)}`,
    error: 'Max retries exceeded'
  };
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
 * Uses URL.createObjectURL instead of FileReader to avoid double Base64 conversion
 * @param {File} file
 * @param {number} maxSize
 * @returns {Promise<string>}
 */
export async function generateThumbnail(file, maxSize = 300) {
  return new Promise((resolve, reject) => {
    // Use Blob URL instead of Base64 for initial image load (more efficient)
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      // Release blob URL immediately after image loads
      URL.revokeObjectURL(blobUrl);

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

      // Clear image reference for GC
      img.src = '';

      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };

    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error('Failed to load image for thumbnail'));
    };

    img.src = blobUrl;
  });
}

console.log('📡 Database API layer loaded');
