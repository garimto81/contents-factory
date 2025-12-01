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
| Build | Vite |
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

# E2E Tests (Playwright - requires dev server running first)
npm run dev                              # Start dev server in one terminal
npm test                                 # All browsers (in another terminal)
npx playwright test --project=chromium   # Single browser
npx playwright test --debug              # Debug mode with inspector
```

### Port Configuration

| Purpose | Port |
|---------|------|
| Dev Server | 6010 |
| Preview | 6011 |

**STRICT**: Port 6000-6009 are blocked by Chrome (X11 protocol). Do not use.

---

## Architecture

```
src/
├── public/                    # HTML pages
│   ├── index.html             # Main page
│   ├── upload.html            # Photo upload
│   ├── gallery.html           # Photo gallery
│   └── job-detail.html        # Job details
├── js/
│   ├── db.js                  # IndexedDB (Dexie.js) - tables: jobs, photos, temp_photos, users, settings
│   ├── db-api.js              # Supabase-compatible API layer
│   ├── video-generator.js     # Canvas + MediaRecorder video generation
│   └── utils/
│       ├── errors.js          # AppError, UploadError, NetworkError, ValidationError
│       ├── retry.js           # withRetry(), fetchWithRetry() - exponential backoff
│       └── state.js           # JobState class - hybrid LocalStorage + IndexedDB
tests/
├── setup.js                   # Vitest global setup (mocks fetch, alert)
├── unit/                      # Vitest unit tests
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

// Auto-cleanup: sessions expire after 24 hours
if (jobState.isExpired()) await jobState.reset();
```

### Database Schema (db.js:14-30)

```javascript
db.version(2).stores({
  jobs: '++id, job_number, work_date, car_model, technician_id, status, created_at, updated_at',
  photos: '++id, job_id, category, sequence, uploaded_at',
  temp_photos: '++id, session_id, category, sequence, created_at',  // Upload session storage
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
- Test patterns: `tests/unit/**/*.test.js`, `tests/integration/**/*.test.js`
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

## Known Issues & Technical Debt

코드 리뷰 결과 (2025-12-01) 발견된 주요 이슈입니다. `TODO.md` 참조.

### Critical (즉시 수정 필요)

| 영역 | 이슈 | 파일 |
|------|------|------|
| Security | XSS - innerHTML에 사용자 입력 직접 삽입 | `gallery.html`, `upload.html`, `job-detail.html` |
| Logic | Race Condition - 작업번호 동시 생성 시 중복 | `db-api.js:319-347` |
| Logic | 상태 불일치 - LocalStorage ↔ IndexedDB 동기화 | `state.js:208-232` |
| Performance | N+1 Query - Job 조회 시 Photos 반복 쿼리 | `db-api.js:63-75` |

### Security Checklist (구현 필요)

```javascript
// 1. XSS 방지 - escapeHtml 함수 사용
function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// 2. 입력 검증 - validateJobData 추가 필요
// 3. 파일 업로드 - 크기(10MB), 타입(image/*) 제한 필요
// 4. CSRF 토큰 - 향후 서버 연동 시 필요
```

### Performance Optimization Checklist

- [ ] N+1 Query → `anyOf()` 사용
- [ ] Photo Count → `count()` 직접 사용 (toArray 금지)
- [ ] Bulk Insert → `bulkAdd()` 사용
- [ ] Base64 변환 → `URL.createObjectURL()` 사용
- [ ] DOM 업데이트 → DocumentFragment 사용

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

## Parent Repository

This is a sub-project within `D:\AI\claude01\`. Follow Phase 0-6 workflow from `../CLAUDE.md`:
- PRD in `tasks/prds/`
- 1:1 test pairing
- Commit format: `type: description [PRD-NNNN]`
