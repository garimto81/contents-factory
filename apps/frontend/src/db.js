/**
 * IndexedDB schema using Dexie.js
 */

import Dexie from 'dexie';

export const db = new Dexie('FieldUploader');

db.version(1).stores({
  upload_queue: '++id, status, created_at',
  settings: 'key'
});

/**
 * Upload queue item schema:
 * {
 *   id: number (auto-increment),
 *   title: string,
 *   image_data: string (base64),
 *   thumbnail_data: string (base64),
 *   status: 'pending' | 'uploading' | 'completed' | 'failed',
 *   created_at: string (ISO date),
 *   synced_at: string (ISO date),
 *   retry_count: number,
 *   error: string
 * }
 */
