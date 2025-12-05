# Field Uploader - 현장 사진 업로드 PWA

스마트폰용 오프라인 우선 사진 업로드 앱

## Features

- 📷 모바일 카메라 직접 촬영
- 🗜️ 자동 이미지 압축 (500KB 목표)
- 📦 오프라인 큐잉 (IndexedDB)
- 🔄 자동 동기화 (온라인 복귀 시)
- 📱 PWA 설치 가능
- 🎨 다크 테마 UI

## Setup

```bash
# Install dependencies
npm install

# Start dev server (네트워크 접근 가능)
npm run dev
# → http://localhost:5173
# → http://<YOUR_IP>:5173 (모바일에서 접속)

# Build for production
npm run build

# Preview production build
npm run preview
```

## PWA Icons

PWA 아이콘을 생성해야 합니다:

1. **온라인 도구 사용** (권장):
   - https://www.pwabuilder.com/imageGenerator
   - 512x512 PNG 업로드 → 자동 생성

2. **수동 생성**:
   - `public/icons/icon-192.png` (192x192)
   - `public/icons/icon-512.png` (512x512)
   - 투명 배경 PNG 권장
   - 카메라 또는 업로드 아이콘 사용

3. **임시 아이콘** (개발용):
```bash
# ImageMagick 설치 후
convert -size 192x192 xc:#667eea -gravity center -pointsize 100 -annotate +0+0 "📷" public/icons/icon-192.png
convert -size 512x512 xc:#667eea -gravity center -pointsize 300 -annotate +0+0 "📷" public/icons/icon-512.png
```

## Architecture

```
Frontend App (PWA)
├── Camera API          # 모바일 카메라 촬영
├── Image Compression   # browser-image-compression
├── IndexedDB           # Dexie.js (upload_queue, settings)
├── Sync Manager        # 오프라인 큐 + 자동 동기화
└── Service Worker      # vite-plugin-pwa (auto-generated)
```

## API Integration

백엔드 API URL 설정 (`src/sync.js:6`):

```javascript
const API_URL = 'http://localhost:8090';
```

프로덕션 배포 시 환경변수로 변경:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090';
```

```bash
# .env.production
VITE_API_URL=https://your-api-domain.com
```

## Upload Queue Schema

IndexedDB `upload_queue` table:

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-increment |
| title | string | 사진 제목 |
| image_data | string | Base64 압축 이미지 |
| thumbnail_data | string | Base64 썸네일 |
| status | string | pending/uploading/completed/failed |
| created_at | string | ISO timestamp |
| synced_at | string | ISO timestamp |
| retry_count | number | 재시도 횟수 |
| error | string | 에러 메시지 |

## Mobile Testing

1. **로컬 네트워크 접속**:
```bash
npm run dev
# → http://192.168.x.x:5173 (콘솔에 표시됨)
```

2. **모바일에서**:
   - 같은 WiFi 연결
   - Chrome/Safari에서 위 URL 접속
   - "홈 화면에 추가" → PWA 설치

3. **오프라인 테스트**:
   - 사진 촬영 + 업로드
   - 비행기 모드 ON
   - 다시 촬영 → 큐에 저장됨
   - 비행기 모드 OFF → 자동 동기화

## Troubleshooting

### 카메라 접근 실패
- HTTPS 필요 (또는 localhost)
- 브라우저 권한 확인

### 업로드 실패
- 백엔드 API 실행 확인
- CORS 설정 확인 (백엔드 `pb_hooks/cors.pb.js`)
- Network 탭에서 요청 확인

### PWA 설치 안됨
- HTTPS 필요 (또는 localhost)
- `manifest.json` 경로 확인
- Service Worker 등록 확인 (DevTools → Application)

## License

MIT
