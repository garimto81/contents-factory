# System Architecture

## Overview

**Photo Factory**는 휠 복원 기술자를 위한 모바일 우선 사진 관리 PWA입니다.

| 레이어 | 기술 |
|--------|------|
| Frontend | Vanilla JS (ES6), PWA |
| Storage | IndexedDB (Dexie.js) + LocalStorage |
| Build | Vite + vite-plugin-pwa |
| Image | browser-image-compression (EXIF 보정) |
| Test | Vitest (unit) + Playwright (E2E) |

## Directory Structure

```
contents-factory/
├── src/
│   ├── public/                    # HTML pages (Vite root)
│   │   ├── index.html             # 메인 페이지
│   │   ├── upload.html            # 사진 업로드
│   │   ├── gallery.html           # 사진 갤러리
│   │   └── job-detail.html        # 작업 상세
│   └── js/
│       ├── db.js                  # IndexedDB (Dexie.js)
│       ├── db-api.js              # API 레이어
│       ├── video-generator.js     # 영상 생성
│       └── utils/
│           ├── errors.js          # 에러 계층
│           ├── image-compressor.js # 이미지 압축
│           ├── logger.js          # 로깅
│           ├── retry.js           # 재시도 로직
│           ├── sanitizer.js       # XSS 방지
│           └── state.js           # 상태 관리
├── apps/
│   ├── frontend/                  # Field Uploader (스마트폰 PWA)
│   └── backend/                   # Shorts Generator (PC CLI)
├── server/                        # PocketBase (Docker)
├── tests/                         # 테스트 파일
└── docs/                          # 문서
```

## Hybrid Storage Pattern

이미지는 LocalStorage에 저장하기엔 너무 크므로 하이브리드 접근 방식 사용:

```
┌─────────────────────┐     ┌─────────────────────┐
│    LocalStorage     │     │      IndexedDB      │
├─────────────────────┤     ├─────────────────────┤
│ • Job 메타데이터    │     │ • 이미지 데이터     │
│   - carModel        │     │   - image_data      │
│   - jobNumber       │     │   - thumbnail_data  │
│   - photo counts    │     │ • temp_photos 테이블│
└─────────────────────┘     └─────────────────────┘
```

### Usage Example

```javascript
import { jobState } from './utils/state.js';

// 메타데이터 → LocalStorage
jobState.update({ carModel: 'BMW 5시리즈' });

// 이미지 → IndexedDB
await jobState.addPhoto('before_car', {
  image_data: base64String,
  thumbnail_data: thumbnailBase64,
  file_name: 'photo.jpg',
  file_size: 1024000
});

// 이미지 포함 조회
const photosWithData = await jobState.getPhotosWithData();
```

## Database Schema

`db.js` (Version 3):

```javascript
db.version(3).stores({
  jobs: '++id, job_number, work_date, car_model, technician_id, status, [work_date+status]',
  photos: '++id, job_id, category, sequence, [job_id+sequence]',
  temp_photos: '++id, session_id, category, sequence, [session_id+category]',
  users: '++id, &email, display_name',
  settings: '++id, key'
});
```

### Compound Indexes

성능 최적화를 위한 복합 인덱스:
- `[session_id+category]` - 세션별 카테고리 조회
- `[job_id+sequence]` - 작업별 사진 순서
- `[work_date+status]` - 날짜별 작업 상태 필터

## Error Hierarchy

```
AppError (base)
├── UploadError     - retry: true
├── NetworkError    - retry: true
├── DatabaseError   - retry: true
├── AuthError       - retry: false (로그인 필요)
└── ValidationError - retry: false (입력 수정 필요)
```

## Distributed Architecture (PRD-0013/0014)

```
┌──────────────────┐     ┌──────────────┐     ┌──────────────────┐
│  스마트폰        │     │  PocketBase  │     │  PC             │
│  Field Uploader  │────▶│  Cloud       │────▶│  Shorts         │
│  📷 촬영 + 전송  │     │  ☁️ 저장소   │     │  Generator      │
│                  │     │              │     │  🎬 영상 생성   │
└──────────────────┘     └──────────────┘     └──────────────────┘
```

## Video Generation Flow

```
Photos → Canvas Rendering → MediaRecorder → WebM Output
   │           │                │              │
   │           │                │              └─ 1080x1920 vertical
   │           │                └─ VP9 codec
   │           └─ Frame-by-frame drawing
   └─ Category-sorted images
```

## Next Steps

- [Testing Guide](testing.md) - 테스트 방법
- [Debugging Guide](debugging.md) - 디버깅 방법
