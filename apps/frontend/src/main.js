/**
 * Main application logic for Field Uploader PWA
 */

import { capturePhoto } from './camera.js';
import { compressImage, createThumbnail, fileToBase64 } from './compress.js';
import { syncManager } from './sync.js';
import { db } from './db.js';
import './style.css';

// DOM Elements
const captureBtn = document.getElementById('capture-btn');
const titleInput = document.getElementById('title-input');
const uploadBtn = document.getElementById('upload-btn');
const preview = document.getElementById('preview');
const statusDisplay = document.getElementById('status');
const recentList = document.getElementById('recent-list');

let currentPhoto = null;

// Capture button handler
captureBtn.addEventListener('click', async () => {
  try {
    captureBtn.disabled = true;
    captureBtn.textContent = '⏳';

    const file = await capturePhoto();
    const compressed = await compressImage(file);
    const base64 = await fileToBase64(compressed);

    currentPhoto = {
      file: compressed,
      base64
    };

    preview.src = base64;
    preview.style.display = 'block';
    uploadBtn.disabled = false;

    captureBtn.disabled = false;
    captureBtn.textContent = '📷';
  } catch (err) {
    console.error('Capture failed:', err);
    alert('사진 촬영에 실패했습니다');
    captureBtn.disabled = false;
    captureBtn.textContent = '📷';
  }
});

// Upload button handler
uploadBtn.addEventListener('click', async () => {
  const title = titleInput.value.trim();
  if (!title || !currentPhoto) {
    alert('제목을 입력하고 사진을 촬영하세요');
    return;
  }

  try {
    uploadBtn.disabled = true;
    uploadBtn.textContent = '전송 중...';

    const thumbnail = await createThumbnail(currentPhoto.file);
    const thumbBase64 = await fileToBase64(thumbnail);

    await syncManager.addToQueue({
      title,
      image_data: currentPhoto.base64,
      thumbnail_data: thumbBase64
    });

    // Reset UI
    currentPhoto = null;
    preview.style.display = 'none';
    titleInput.value = '';
    uploadBtn.textContent = '전송';

    updateUI();
  } catch (err) {
    console.error('Upload failed:', err);
    alert('업로드에 실패했습니다');
    uploadBtn.disabled = false;
    uploadBtn.textContent = '전송';
  }
});

// Title input handler - enable upload button when photo is ready
titleInput.addEventListener('input', () => {
  if (currentPhoto) {
    uploadBtn.disabled = titleInput.value.trim() === '';
  }
});

// Update UI with current stats and recent uploads
async function updateUI() {
  const stats = await syncManager.getStats();
  statusDisplay.innerHTML = `
    <span class="pending">⏳ ${stats.pending}</span>
    <span class="uploading">📤 ${stats.uploading}</span>
    <span class="completed">✅ ${stats.completed}</span>
    <span class="failed">❌ ${stats.failed}</span>
  `;

  // Recent uploads (last 10)
  const recent = await db.upload_queue
    .orderBy('created_at')
    .reverse()
    .limit(10)
    .toArray();

  recentList.innerHTML = recent.map(item => `
    <div class="recent-item ${item.status}">
      <img src="${item.thumbnail_data || item.image_data}" alt="${item.title}">
      <span>${item.title}</span>
    </div>
  `).join('');

  uploadBtn.disabled = !currentPhoto || titleInput.value.trim() === '';
}

// Initialize app
updateUI();
setInterval(updateUI, 5000); // Update stats every 5 seconds

console.log('📱 Field Uploader initialized');
