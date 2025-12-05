# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Photo Factory** - 휠 복원 기술자를 위한 모바일 우선 사진 관리 PWA

작업 전/중/후 사진을 5개 카테고리로 분류하여 마케팅 콘텐츠 생성을 자동화합니다.

| 레이어 | 기술 |
|--------|------|
| Frontend | Vanilla JS (ES6), PWA |
| Storage | IndexedDB (Dexie.js) + LocalStorage |
| Build | Vite + vite-plugin-pwa |
| Image | browser-image-compression (EXIF 보정) |
| Test | Vitest (unit) + Playwright (E2E) |

---

## Development Commands

```bash
npm install                              # Install dependencies
npm run dev                              # Dev server → http://localhost:6010
npm run build                            # Build → dist/
npm run preview                          # Preview build → http://localhost:6011

# Unit Tests (Vitest)
npm run test:unit                        # Run with watch mode
npx vitest run                           # Run all unit tests once
npx vitest run tests/unit/upload.test.js # Single test file
npx vitest run --coverage                # With coverage (threshold: 70%)

# E2E Tests (Playwright)
# IMPORTANT: Dev server must be running first in a separate terminal
# Terminal 1: npm run dev
# Terminal 2: npm test (or commands below)
npm test                                 # All browsers
npx playwright test --project=chromium   # Single browser
npx playwright test --debug              # Debug mode with inspector
npx playwright test tests/upload-ui.spec.cjs  # Single test file
```

### Port Configuration

| Purpose | Port |
|---------|------|
| Dev Server | 6010 |
| Preview | 6011 |

**STRICT**: Port 6000-6009 are blocked by Chrome (X11 protocol). Do not use.

### Build-time Variables (vite.config.js)

코드에서 사용 가능한 빌드 변수:

| 변수 | 설명 | 예시 |
|------|------|------|
| `__NETWORK_IP__` | 로컬 네트워크 IP | `"192.168.1.100"` |
| `__DEV_PORT__` | 개발 서버 포트 | `6010` |
| `__GIT_HASH__` | Git 커밋 해시 | `"a1b2c3d"` |
| `__GIT_MESSAGE__` | 마지막 커밋 메시지 | `"feat: add..."` |
| `__APP_VERSION__` | 앱 버전 | `"1.0.0"` |

---

## Architecture

```
src/
├── public/                    # HTML pages (Vite root: vite.config.js:52)
│   ├── index.html             # Main page
│   ├── upload.html            # Photo upload
│   ├── gallery.html           # Photo gallery
│   ├── job-detail.html        # Job details
│   └── dev/                   # Development mockups (gitignored)
├── js/
│   ├── db.js                  # IndexedDB (Dexie.js) - tables: jobs, photos, temp_photos, users, settings
│   ├── db-api.js              # Supabase-compatible API layer (validateJobData, validateFile)
│   ├── video-generator.js     # Canvas + MediaRecorder video generation (60s timeout)
│   └── utils/
│       ├── errors.js          # AppError hierarchy + getErrorCategory()
│       ├── image-compressor.js # browser-image-compression wrapper (EXIF fix)
│       ├── logger.js          # Production-safe logging (sanitizeForLog)
│       ├── retry.js           # withRetry() - exponential backoff, 2min total timeout
│       ├── sanitizer.js       # escapeHtml() for XSS prevention
│       └── state.js           # JobState - hybrid LocalStorage + IndexedDB (8h session)
public/                        # Static assets (Vite publicDir: vite.config.js:53)
└── favicon.svg                # PWA icon (SVG)
docs/
├── SECURITY.md                # Security guidelines
└── archive/                   # Legacy documentation
tasks/prds/                    # PRD documents
tests/
├── setup.js                   # Vitest global setup (mocks fetch, alert)
├── unit/                      # Vitest unit tests (*.test.js)
├── debug/                     # Debug scripts
└── *.spec.cjs                 # Playwright E2E tests
```

---

## Key Patterns

### Hybrid Storage (LocalStorage + IndexedDB)

Images are too large for LocalStorage, so the app uses a hybrid approach:

- **LocalStorage**: Job metadata only (carModel, jobNumber, photo counts)
- **IndexedDB**: Image data via `temp_photos` table (session-based)

```javascript
// src/js/utils/state.js
import { jobState } from './utils/state.js';

// Metadata goes to LocalStorage
jobState.update({ carModel: 'BMW 5시리즈' });

// Photos go to IndexedDB (async) - image_data stored in temp_photos
await jobState.addPhoto('before_car', {
  image_data: base64String,
  thumbnail_data: thumbnailBase64,
  file_name: 'photo.jpg',
  file_size: 1024000
});

// Retrieve photos with image data from IndexedDB
const photosWithData = await jobState.getPhotosWithData();

// Auto-cleanup: 8h absolute timeout, 30min inactivity timeout
if (jobState.isExpired()) await jobState.reset();
```

### Database Schema (db.js:34-49)

```javascript
// Version 3: Compound indexes for better query performance
db.version(3).stores({
  jobs: '++id, job_number, work_date, car_model, technician_id, status, created_at, updated_at, [work_date+status]',
  photos: '++id, job_id, category, sequence, uploaded_at, [job_id+sequence]',
  temp_photos: '++id, session_id, category, sequence, created_at, [session_id+category]',
  users: '++id, &email, display_name, created_at',
  settings: '++id, key'
});
```

### Job Number Format

Pattern: `WHL{YYMMDD}{NNN}` (e.g., `WHL250112001`)
- Generated in `db-api.js:319-347`
- Sequence resets daily

### Error Hierarchy (utils/errors.js)

```
AppError (base)
├── UploadError     - retry: true
├── NetworkError    - retry: true
├── DatabaseError   - retry: true
├── AuthError       - retry: false (requires login)
└── ValidationError - retry: false (requires input fix)
```

### Retry Pattern (utils/retry.js)

```javascript
import { withRetry, fetchWithRetry } from './utils/retry.js';
const result = await withRetry(() => uploadFile(file), { maxRetries: 3, delayMs: 1000 });
```

### Image Compression (utils/image-compressor.js)

Uses `browser-image-compression` for EXIF orientation fix and size optimization:

```javascript
import { processImage, compressImage } from './utils/image-compressor.js';

// Full processing: compress + thumbnail + EXIF fix
const { image_data, thumbnail_data, file_size } = await processImage(file);

// Just compression (returns File object)
const compressedFile = await compressImage(file, { maxSizeMB: 0.5 });
```

Features:
- Auto EXIF orientation correction (fixes rotated mobile photos)
- Web Worker non-blocking compression
- Default: 1MB max, 1920px max dimension

### PWA Offline Support (vite-plugin-pwa)

Service Worker auto-generated at build time:
- All static assets cached for offline use
- CDN resources (jsdelivr) cached for 30 days
- Auto-update when new version deployed

```bash
npm run build    # Generates sw.js + workbox files in dist/
npm run preview  # Test PWA locally at http://localhost:6011
```

---

## Photo Categories

| Category | Korean | Description |
|----------|--------|-------------|
| `before_car` | 입고 | Vehicle arrival, full view |
| `before_wheel` | 문제 | Damaged wheel closeup |
| `during` | 과정 | Work in progress |
| `after_wheel` | 해결 | Restored wheel closeup |
| `after_car` | 출고 | Completed vehicle, full view |

---

## Video Generation

The app generates marketing videos using Canvas + MediaRecorder API:

```javascript
import { generateAndDownloadVideo } from './video-generator.js';

await generateAndDownloadVideo(photos, { car_model: 'BMW', job_number: 'WHL250112001' },
  (progress) => console.log(`${progress}%`)
);
```

Output: 1080x1920 WebM (vertical format for Reels/Shorts)

---

## Test Configuration

**Vitest** (`vitest.config.js`):
- Environment: `happy-dom`
- Coverage threshold: 70% (lines, functions, branches, statements)
- Setup: `tests/setup.js` (mocks `fetch`, `alert`, `console`)
- Test patterns: `tests/unit/*.test.js`, `tests/integration/*.test.js`
- Aliases: `@` → `/src`, `@js` → `/src/js`, `@public` → `/src/public`

**Playwright** (`playwright.config.cjs`):
- Base URL: `http://localhost:6010`
- Projects: Desktop Chrome/Firefox/Safari + Mobile Chrome/Safari
- Timeout: 30s (test), 5s (expect)
- Test files: `tests/*.spec.cjs`

---

## Debug (Browser Console)

```javascript
// Check IndexedDB contents
const { db } = await import('/src/js/db.js');
console.log('Jobs:', await db.jobs.toArray());
console.log('Temp Photos:', await db.temp_photos.toArray());

// Check LocalStorage state
console.log(JSON.parse(localStorage.getItem('photoFactory_currentJob')));

// Check storage quota
navigator.storage.estimate().then(e =>
  console.log(`${(e.usage/1024/1024).toFixed(1)}MB / ${(e.quota/1024/1024).toFixed(0)}MB`)
);

// Reset all data
(await import('/src/js/db.js')).clearAllData();
```

---

## Roadmap

미래 기능 및 아키텍처 계획은 `TODO.md` 참조:

| PRD | 설명 | 상태 |
|-----|------|------|
| PRD-0011 | 쇼츠 품질 향상 (BGM, 자막, 로고) | 계획됨 |
| PRD-0012 | 분산 아키텍처 (Supabase, Push) | 계획됨 |
| **PRD-0013** | **Field Uploader** - 현장 사진 촬영 → 클라우드 전송 | ✅ MVP 완료 |
| **PRD-0014** | **Shorts Generator** - 클라우드 이미지 → 쇼츠 영상 생성 | 🚧 구조 생성 |

### 분산 아키텍처 (PRD-0013 + PRD-0014)

```
스마트폰 (Field Uploader)     PocketBase        PC (Shorts Generator)
     📷 촬영                      ☁️                 🎬 영상
     📝 제목          ────▶     저장소     ────▶    생성
     📤 전송                                        다운로드
```

### 프로젝트 구조

```
contents-factory/
├── src/                    # 기존 Photo Factory PWA
├── apps/
│   ├── frontend/           # PRD-0013: Field Uploader (Vite + PWA)
│   │   ├── src/
│   │   │   ├── main.js, camera.js, compress.js
│   │   │   ├── db.js, api.js, sync.js
│   │   │   └── style.css
│   │   ├── tests/upload.spec.js
│   │   └── playwright.config.js
│   └── backend/            # PRD-0014: Shorts Generator (Node.js CLI)
│       └── src/
│           ├── api/pocketbase.js
│           └── video/generator.js
└── server/                 # PocketBase (Docker)
    ├── docker-compose.yml
    └── pb_migrations/
```

### Implemented Security Features

- XSS 방지: `sanitizer.js` - `escapeHtml()` 적용
- 입력 검증: `db-api.js` - `validateJobData()`, `validateFile()`
- 파일 제한: 10MB, `image/jpeg|png|webp`, 최대 50장
- CSP 헤더: `vite.config.js` - 서버 응답 헤더 설정
- 세션 관리: 8시간 절대 만료 + 30분 비활성 타임아웃 (`state.js:337-346`)
- 상세: `docs/SECURITY.md`

---

## Naming Convention

프로젝트 내 명명 규칙:

| 컨텍스트 | 규칙 | 예시 |
|----------|------|------|
| DB 필드 | snake_case | `image_data`, `file_name`, `session_id` |
| JS 변수/함수 | camelCase | `storageKey`, `getPhotosWithData` |
| 상수 | UPPER_SNAKE | `MAX_FILE_SIZE`, `CATEGORIES` |
| 클래스 | PascalCase | `JobState`, `AppError` |

---

## Deployment

### GitHub Pages (자동)

GitHub Actions가 `main` 브랜치 push 시 자동 배포:

```bash
# 배포 URL
https://<username>.github.io/content-factory/

# Base path (vite.config.js:48)
# GitHub Actions에서 자동 설정: /content-factory/
```

### 수동 배포

```bash
npm run build        # dist/ 생성
npm run preview      # 로컬 테스트 (http://localhost:6011)
```

---

## Parent Repository

This is a sub-project within `D:\AI\claude01\`. Follow Phase 0-6 workflow from `../CLAUDE.md`:
- PRD in `tasks/prds/`
- 1:1 test pairing
- Commit format: `type: description [PRD-NNNN]`
