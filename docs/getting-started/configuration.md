# Configuration Guide

## Environment Variables

### Production Build

`vite.config.js`에서 자동 설정되는 빌드 변수:

| 변수 | 설명 | 예시 |
|------|------|------|
| `__NETWORK_IP__` | 로컬 네트워크 IP | `"192.168.1.100"` |
| `__DEV_PORT__` | 개발 서버 포트 | `6010` |
| `__GIT_HASH__` | Git 커밋 해시 | `"a1b2c3d"` |
| `__GIT_MESSAGE__` | 마지막 커밋 메시지 | `"feat: add..."` |
| `__APP_VERSION__` | 앱 버전 | `"1.0.0"` |

### API Configuration

Field Uploader API 설정 (`apps/frontend/src/sync.js`):

```javascript
// 개발 환경
const API_URL = 'http://localhost:8090';

// 프로덕션 환경
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090';
```

`.env.production` 파일:

```bash
VITE_API_URL=https://your-api-domain.com
```

## Port Configuration

| 서비스 | 포트 | 용도 |
|--------|------|------|
| Photo Factory Dev | 6010 | 메인 앱 개발 서버 |
| Photo Factory Preview | 6011 | 빌드 프리뷰 |
| Field Uploader | 5173 | 스마트폰 PWA |
| PocketBase | 8090 | API 서버 |

**주의**: Port 6000-6009는 Chrome에서 차단됨 (X11 프로토콜)

## Storage Settings

### Session Timeout

`src/js/utils/state.js`에서 설정:

```javascript
// 절대 만료: 8시간
const SESSION_ABSOLUTE_TIMEOUT = 8 * 60 * 60 * 1000;

// 비활성 만료: 30분
const SESSION_INACTIVITY_TIMEOUT = 30 * 60 * 1000;
```

### File Limits

`src/js/db-api.js`에서 설정:

```javascript
// 최대 파일 크기: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 허용 파일 타입
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// 최대 파일 수: 50장
const MAX_FILES = 50;
```

### Image Compression

`src/js/utils/image-compressor.js`에서 설정:

```javascript
const DEFAULT_OPTIONS = {
  maxSizeMB: 1,           // 최대 크기: 1MB
  maxWidthOrHeight: 1920, // 최대 해상도
  useWebWorker: true,     // Web Worker 사용
  fileType: 'image/jpeg'  // 출력 포맷
};
```

## PWA Settings

`vite.config.js`의 PWA 설정:

```javascript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'cdn-cache',
          expiration: { maxAgeSeconds: 30 * 24 * 60 * 60 }
        }
      }
    ]
  }
})
```

## Security Headers

개발 서버 CSP 헤더 (`vite.config.js`):

```javascript
server: {
  headers: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  }
}
```

## Next Steps

- [Architecture](../development/architecture.md) - 시스템 구조
- [Testing](../development/testing.md) - 테스트 설정
