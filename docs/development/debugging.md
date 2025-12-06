# Debugging Guide

## Browser Console Commands

### IndexedDB 확인

```javascript
// DB 모듈 로드
const { db } = await import('/src/js/db.js');

// 테이블 내용 확인
console.log('Jobs:', await db.jobs.toArray());
console.log('Photos:', await db.photos.toArray());
console.log('Temp Photos:', await db.temp_photos.toArray());
console.log('Settings:', await db.settings.toArray());

// 특정 세션의 사진
const sessionId = localStorage.getItem('photoFactory_sessionId');
const tempPhotos = await db.temp_photos
  .where('session_id')
  .equals(sessionId)
  .toArray();
console.log('Session Photos:', tempPhotos);
```

### LocalStorage 확인

```javascript
// 현재 작업 상태
console.log(JSON.parse(localStorage.getItem('photoFactory_currentJob')));

// 세션 정보
console.log('Session ID:', localStorage.getItem('photoFactory_sessionId'));
console.log('Session Start:', localStorage.getItem('photoFactory_sessionStart'));
console.log('Last Activity:', localStorage.getItem('photoFactory_lastActivity'));
```

### Storage Quota 확인

```javascript
navigator.storage.estimate().then(estimate => {
  const usedMB = (estimate.usage / 1024 / 1024).toFixed(1);
  const quotaMB = (estimate.quota / 1024 / 1024).toFixed(0);
  console.log(`Storage: ${usedMB}MB / ${quotaMB}MB`);
});
```

### 데이터 초기화

```javascript
// 전체 데이터 삭제
const { clearAllData } = await import('/src/js/db.js');
await clearAllData();

// LocalStorage만 삭제
localStorage.clear();

// IndexedDB만 삭제
const { db } = await import('/src/js/db.js');
await db.delete();
```

## Network Debugging

### Fetch 요청 모니터링

```javascript
// 원본 fetch 저장
const originalFetch = window.fetch;

// 래핑된 fetch
window.fetch = async (...args) => {
  console.log('[Fetch]', args[0], args[1]);
  const response = await originalFetch(...args);
  console.log('[Response]', response.status, response.url);
  return response;
};
```

### Service Worker 상태

```javascript
// SW 등록 상태
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});

// SW 캐시 목록
caches.keys().then(keys => {
  console.log('Cache Keys:', keys);
});

// 특정 캐시 내용
caches.open('workbox-precache-v2').then(cache => {
  cache.keys().then(keys => {
    console.log('Cached URLs:', keys.map(k => k.url));
  });
});
```

## Error Tracking

### AppError 계층 구조

```javascript
import { AppError, UploadError, NetworkError } from '/src/js/utils/errors.js';

try {
  await uploadFile(file);
} catch (error) {
  if (error instanceof NetworkError) {
    console.log('Network issue, retry possible');
  } else if (error instanceof UploadError) {
    console.log('Upload failed:', error.message);
  } else {
    console.log('Unknown error:', error);
  }
}
```

### 에러 카테고리 확인

```javascript
import { getErrorCategory } from '/src/js/utils/errors.js';

const category = getErrorCategory(error);
// 'retryable' | 'non_retryable' | 'auth_required' | 'unknown'
```

## Video Generation Debugging

### Canvas 상태

```javascript
// Canvas 요소 확인
const canvas = document.querySelector('canvas');
console.log('Canvas Size:', canvas.width, canvas.height);

// 현재 프레임 저장
const dataUrl = canvas.toDataURL('image/png');
const a = document.createElement('a');
a.href = dataUrl;
a.download = 'debug-frame.png';
a.click();
```

### MediaRecorder 상태

```javascript
// MediaRecorder 지원 확인
console.log('WebM VP9:', MediaRecorder.isTypeSupported('video/webm;codecs=vp9'));
console.log('WebM VP8:', MediaRecorder.isTypeSupported('video/webm;codecs=vp8'));
console.log('MP4 H264:', MediaRecorder.isTypeSupported('video/mp4;codecs=h264'));
```

## Performance Debugging

### Memory Usage

```javascript
// 메모리 사용량 (Chrome only)
if (performance.memory) {
  console.log('Heap Used:', (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1), 'MB');
  console.log('Heap Total:', (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(1), 'MB');
}
```

### Image Loading Time

```javascript
const start = performance.now();
const img = new Image();
img.onload = () => {
  console.log('Image load time:', (performance.now() - start).toFixed(0), 'ms');
};
img.src = imageUrl;
```

## Common Issues

### "QuotaExceededError"

IndexedDB 용량 초과:

```javascript
// 용량 확인
navigator.storage.estimate().then(console.log);

// 오래된 데이터 삭제
const { db } = await import('/src/js/db.js');
const oldPhotos = await db.temp_photos
  .where('created_at')
  .below(Date.now() - 24 * 60 * 60 * 1000) // 24시간 이전
  .delete();
```

### "SecurityError" on Camera

HTTPS 또는 localhost 필요:

```bash
# localhost에서 실행
npm run dev
# → http://localhost:6010 (카메라 접근 가능)
```

### Session Expired

```javascript
import { jobState } from '/src/js/utils/state.js';

// 만료 확인
if (jobState.isExpired()) {
  console.log('Session expired, resetting...');
  await jobState.reset();
}

// 남은 시간 확인
const remaining = jobState.getRemainingTime();
console.log('Remaining:', Math.floor(remaining / 60000), 'minutes');
```

## Next Steps

- [Testing Guide](testing.md) - 테스트 방법
- [Architecture](architecture.md) - 시스템 구조
