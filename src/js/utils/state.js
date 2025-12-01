// Photo Factory - State Management with LocalStorage + IndexedDB
// LocalStorage: 메타데이터만 저장 (quota 초과 방지)
// IndexedDB: 이미지 데이터 저장 (temp_photos 테이블)

import {
  generateSessionId,
  saveTempPhoto,
  getTempPhotos,
  getTempPhotosCount,
  deleteTempPhoto,
  clearTempPhotos
} from '../db.js';

/**
 * Job State Manager
 * Manages current job state with LocalStorage persistence
 * Images are stored separately in IndexedDB to avoid quota issues
 */
export class JobState {
  constructor(storageKey = 'photoFactory_currentJob') {
    this.storageKey = storageKey;
    this._state = this.load();

    // Ensure session ID exists for IndexedDB photo storage
    if (!this._state.sessionId) {
      this._state.sessionId = generateSessionId();
      this.saveMetadata();
    }
  }

  /**
   * Load state from LocalStorage (metadata only)
   * @returns {Object}
   */
  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('✅ State loaded from LocalStorage:', parsed.jobNumber || 'New job');
        return parsed;
      }
    } catch (error) {
      console.error('❌ Failed to load state from LocalStorage:', error);
    }

    return this.getInitialState();
  }

  /**
   * Save metadata to LocalStorage (no image data)
   * Images are stored in IndexedDB via addPhoto()
   */
  saveMetadata() {
    try {
      // Create a copy without image_data to avoid quota issues
      const metadataOnly = {
        ...this._state,
        photos: this._getPhotoMetadataOnly()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(metadataOnly));
      console.log('💾 Metadata saved to LocalStorage');
    } catch (error) {
      console.error('❌ Failed to save metadata to LocalStorage:', error);
      // If still fails, clear photos metadata and try again
      if (error.name === 'QuotaExceededError') {
        console.warn('⚠️ LocalStorage quota exceeded, clearing photo metadata');
        this._state.photos = {};
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(this._state));
        } catch (e) {
          console.error('❌ Still failed after clearing photos:', e);
        }
      }
    }
  }

  /**
   * Get photo metadata only (no image_data or thumbnail_data)
   * @returns {Object}
   */
  _getPhotoMetadataOnly() {
    const metadata = {};
    for (const [category, photos] of Object.entries(this._state.photos || {})) {
      metadata[category] = photos.map(p => ({
        id: p.id,
        file_name: p.file_name,
        file_size: p.file_size,
        sequence: p.sequence,
        // Exclude image_data and thumbnail_data
      }));
    }
    return metadata;
  }

  /**
   * Save state to LocalStorage (legacy - redirects to saveMetadata)
   * @deprecated Use saveMetadata() instead
   */
  save() {
    this.saveMetadata();
  }

  /**
   * Clear state from LocalStorage and IndexedDB
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      // Clear IndexedDB temp photos for this session
      if (this._state.sessionId) {
        await clearTempPhotos(this._state.sessionId);
      }

      localStorage.removeItem(this.storageKey);
      this._state = this.getInitialState();
      console.log('🗑️ State cleared from LocalStorage and IndexedDB');
    } catch (error) {
      console.error('❌ Failed to clear state:', error);
    }
  }

  /**
   * Get initial state
   * @returns {Object}
   */
  getInitialState() {
    return {
      sessionId: generateSessionId(),
      jobNumber: null,
      carModel: '',
      location: '',
      photos: {},  // Only metadata, images in IndexedDB
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  /**
   * Get current state
   * @returns {Object}
   */
  get() {
    return { ...this._state };
  }

  /**
   * Set entire state
   * @param {Object} newState
   */
  set(newState) {
    this._state = {
      ...newState,
      updatedAt: Date.now()
    };
    this.save();
  }

  /**
   * Update state partially (non-photo fields only)
   * Use addPhoto() for adding photos to avoid LocalStorage quota issues
   * @param {Object} updates
   */
  update(updates) {
    // Strip image data from any photos in updates to prevent quota issues
    const safeUpdates = { ...updates };
    if (safeUpdates.photos) {
      console.warn('⚠️ update() called with photos - use addPhoto() instead for image data');
      // Keep only metadata, not image data
      const safePhotos = {};
      for (const [category, photoList] of Object.entries(safeUpdates.photos)) {
        safePhotos[category] = photoList.map(p => ({
          id: p.id,
          file_name: p.file_name || p.filename,
          file_size: p.file_size || p.size,
          sequence: p.sequence
          // Exclude: image_data, thumbnail_data, fullImage, thumbnail
        }));
      }
      safeUpdates.photos = safePhotos;
    }

    this._state = {
      ...this._state,
      ...safeUpdates,
      updatedAt: Date.now()
    };
    this.saveMetadata();
  }

  /**
   * Reset state to initial
   * @returns {Promise<void>}
   */
  async reset() {
    await this.clear();
    this._state = this.getInitialState();
    this.saveMetadata();
  }

  /**
   * Add photo to category
   * Image data is stored in IndexedDB, only metadata in LocalStorage
   * Uses Try-Catch + Rollback pattern to ensure consistency
   * @param {string} category
   * @param {Object} photo - Photo object with image_data
   * @returns {Promise<number>} - Photo ID
   * @throws {Error} - If storage fails
   */
  async addPhoto(category, photo) {
    // Snapshot current state for rollback
    const prevPhotos = this._state.photos[category]
      ? [...this._state.photos[category]]
      : null;

    if (!this._state.photos[category]) {
      this._state.photos[category] = [];
    }

    const sequence = this._state.photos[category].length;
    let photoId = null;

    try {
      // Step 1: Save image data to IndexedDB FIRST
      photoId = await saveTempPhoto(this._state.sessionId, category, {
        image_data: photo.image_data,
        thumbnail_data: photo.thumbnail_data,
        file_name: photo.file_name,
        file_size: photo.file_size,
        sequence
      });

      // Step 2: Update state with metadata
      this._state.photos[category].push({
        id: photoId,  // IndexedDB ID for retrieval
        file_name: photo.file_name,
        file_size: photo.file_size,
        sequence
      });

      this._state.updatedAt = Date.now();

      // Step 3: Save metadata to LocalStorage
      this.saveMetadata();

      return photoId;
    } catch (error) {
      // Rollback: Restore previous state
      if (prevPhotos === null) {
        delete this._state.photos[category];
      } else {
        this._state.photos[category] = prevPhotos;
      }

      // If IndexedDB succeeded but LocalStorage failed, clean up IndexedDB
      if (photoId !== null) {
        try {
          await deleteTempPhoto(photoId);
        } catch (cleanupError) {
          console.error('❌ Failed to cleanup IndexedDB after rollback:', cleanupError);
        }
      }

      console.error('❌ Failed to add photo, rolled back:', error);
      throw error;  // Re-throw for caller to handle
    }
  }

  /**
   * Remove photo from category
   * Also removes from IndexedDB
   * @param {string} category
   * @param {number} index
   * @returns {Promise<void>}
   */
  async removePhoto(category, index) {
    if (this._state.photos[category] && this._state.photos[category][index]) {
      const photo = this._state.photos[category][index];

      // Delete from IndexedDB if we have the ID
      if (photo.id) {
        await deleteTempPhoto(photo.id);
      }

      this._state.photos[category].splice(index, 1);
      this._state.updatedAt = Date.now();
      this.saveMetadata();
    }
  }

  /**
   * Get photos count
   * @returns {number}
   */
  getPhotoCount() {
    return Object.values(this._state.photos).reduce(
      (sum, photos) => sum + photos.length,
      0
    );
  }

  /**
   * Get photos metadata for specific category
   * @param {string} category
   * @returns {Array}
   */
  getCategoryPhotos(category) {
    return this._state.photos[category] || [];
  }

  /**
   * Get photos with image data from IndexedDB
   * @returns {Promise<Object>}
   */
  async getPhotosWithData() {
    return await getTempPhotos(this._state.sessionId);
  }

  /**
   * Get session ID
   * @returns {string}
   */
  getSessionId() {
    return this._state.sessionId;
  }

  /**
   * Check if state is expired
   * - Absolute timeout: 8 hours from creation
   * - Inactivity timeout: 30 minutes since last update
   * @returns {boolean}
   */
  isExpired() {
    const MS_PER_HOUR = 60 * 60 * 1000;
    const MS_PER_MINUTE = 60 * 1000;

    const absoluteTimeout = 8 * MS_PER_HOUR;  // 8 hours
    const inactivityTimeout = 30 * MS_PER_MINUTE;  // 30 minutes

    const now = Date.now();
    const ageFromCreation = now - this._state.createdAt;
    const ageFromUpdate = now - (this._state.updatedAt || this._state.createdAt);

    // Expired if older than 8 hours OR inactive for 30 minutes
    return ageFromCreation > absoluteTimeout || ageFromUpdate > inactivityTimeout;
  }

  /**
   * Get remaining time until expiration (in minutes)
   * @returns {number}
   */
  getRemainingTime() {
    const MS_PER_MINUTE = 60 * 1000;
    const inactivityTimeout = 30 * MS_PER_MINUTE;

    const now = Date.now();
    const ageFromUpdate = now - (this._state.updatedAt || this._state.createdAt);
    const remaining = inactivityTimeout - ageFromUpdate;

    return Math.max(0, Math.floor(remaining / MS_PER_MINUTE));
  }

  /**
   * Auto-save on window unload
   */
  enableAutoSave() {
    window.addEventListener('beforeunload', () => {
      this.save();
    });
  }
}

// Create singleton instance
export const jobState = new JobState();

// Enable auto-save
jobState.enableAutoSave();

// Clean up expired state on load (async)
(async () => {
  if (jobState.isExpired()) {
    console.warn('⚠️ State is expired (>24h), resetting...');
    await jobState.reset();
  }
})();

console.log('📦 State management initialized (LocalStorage + IndexedDB)');
