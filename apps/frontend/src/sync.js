/**
 * Sync manager for offline-first upload queue
 */

import { db } from './db.js';

const API_URL = 'http://localhost:8090';

class SyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    window.addEventListener('online', () => this.onOnline());
    window.addEventListener('offline', () => this.onOffline());
  }

  onOnline() {
    this.isOnline = true;
    console.log('📶 Online - starting sync');
    this.syncAll();
  }

  onOffline() {
    this.isOnline = false;
    console.log('📵 Offline - queuing uploads');
  }

  /**
   * Add photo to upload queue
   * @param {Object} photo - { title, image_data, thumbnail_data }
   * @returns {Promise<number>} Queue item ID
   */
  async addToQueue(photo) {
    const id = await db.upload_queue.add({
      ...photo,
      status: 'pending',
      created_at: new Date().toISOString(),
      retry_count: 0
    });

    console.log(`📥 Queued: ${photo.title} (ID: ${id})`);

    if (this.isOnline) {
      this.uploadOne(id);
    }

    return id;
  }

  /**
   * Sync all pending/failed items
   */
  async syncAll() {
    const pending = await db.upload_queue
      .where('status')
      .anyOf(['pending', 'failed'])
      .toArray();

    console.log(`🔄 Syncing ${pending.length} items`);

    for (const item of pending) {
      await this.uploadOne(item.id);
    }
  }

  /**
   * Upload single item from queue
   * @param {number} id - Queue item ID
   */
  async uploadOne(id) {
    const item = await db.upload_queue.get(id);
    if (!item) return;

    try {
      await db.upload_queue.update(id, { status: 'uploading' });

      const formData = new FormData();
      formData.append('title', item.title);
      formData.append('image', this.dataURLtoBlob(item.image_data), 'photo.jpg');
      if (item.thumbnail_data) {
        formData.append('thumbnail', this.dataURLtoBlob(item.thumbnail_data), 'thumb.jpg');
      }

      const response = await fetch(`${API_URL}/api/collections/photos/records`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      await db.upload_queue.update(id, {
        status: 'completed',
        synced_at: new Date().toISOString()
      });

      console.log(`✅ Uploaded: ${item.title}`);
    } catch (error) {
      console.error(`❌ Upload failed: ${item.title}`, error);

      await db.upload_queue.update(id, {
        status: 'failed',
        retry_count: (item.retry_count || 0) + 1,
        error: error.message
      });
    }
  }

  /**
   * Convert data URL to Blob
   * @param {string} dataURL - Base64 data URL
   * @returns {Blob}
   */
  dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Get upload queue statistics
   * @returns {Promise<Object>} { pending, uploading, completed, failed }
   */
  async getStats() {
    const all = await db.upload_queue.toArray();
    return {
      pending: all.filter(x => x.status === 'pending').length,
      uploading: all.filter(x => x.status === 'uploading').length,
      completed: all.filter(x => x.status === 'completed').length,
      failed: all.filter(x => x.status === 'failed').length
    };
  }
}

export const syncManager = new SyncManager();
