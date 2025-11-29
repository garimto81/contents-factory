# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

### 한 줄 정의
**휠 복원 기술자를 위한 모바일 우선 사진 관리 PWA** - 작업 전/중/후 사진을 5개 카테고리로 분류하여 마케팅 콘텐츠 생성을 자동화

### 핵심 워크플로우
```
📸 현장 촬영 (2분)  →  📁 5개 카테고리 분류  →  🎬 마케팅 영상 자동 생성  →  📱 SNS 업로드
     before_car           IndexedDB 저장            15초 Before/After 릴스       Instagram/TikTok
     before_wheel
     during
     after_wheel
     after_car
```

### 타겟 사용자
- **휠 복원 전문점 기술자**: 하루 다수 작업 처리, 현장에서 빠른 촬영 필요
- **소상공인**: SNS 마케팅으로 고객 유치, 최소 시간 투자로 콘텐츠 생성

### 비즈니스 목표
| 기존 방식 | Photo Factory |
|----------|---------------|
| 사진 촬영 후 수동 정리 (30분+) | 카테고리별 자동 분류 (2분) |
| 영상 편집 앱 별도 사용 (1시간+) | 원클릭 릴스 생성 (10분) |
| SNS 개별 업로드 | 다중 플랫폼 자동 배포 |

### 기술 스택
| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| **Frontend** | Vanilla JS (ES6) | 프레임워크 의존성 최소화, PWA 경량화 |
| **Storage** | IndexedDB (Dexie.js) | 오프라인 우선, 대용량 이미지 저장 |
| **Build** | Vite | 빠른 HMR, ES 모듈 네이티브 지원 |
| **Test** | Vitest + Playwright | 단위 테스트 + E2E 테스트 |

### 오프라인 우선 설계
```
┌─────────────────────────────────────────┐
│              Photo Factory PWA           │
├─────────────────────────────────────────┤
│  📷 Camera API    →  🗄️ IndexedDB       │
│  (사진 촬영)          (로컬 저장)         │
│                                          │
│  💾 LocalStorage  →  🔄 Service Worker  │
│  (상태 유지)          (오프라인 캐싱)     │
└─────────────────────────────────────────┘
```
- **네트워크 없이 동작**: 현장(차량 정비소)에서 WiFi 없이 촬영/저장
- **24시간 자동 만료**: 오래된 임시 작업 자동 정리
- **브라우저 스토리지 활용**: 서버 비용 $0

---

## Quick Start

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 열기
# → http://localhost:3001
```

**5분 안에 확인할 것**:
1. 메인 페이지 로드 확인
2. 카테고리 선택 UI 동작
3. 사진 촬영/업로드 테스트 (mockup-camera.html)

---

## Project Info

| 항목 | 값 |
|------|-----|
| **Project** | Photo Factory |
| **Type** | PWA (Progressive Web App) |
| **Stack** | Vanilla JavaScript (ES6), IndexedDB (Dexie.js), Vite |
| **Dev Server** | http://localhost:3001 |
| **Build Output** | `html/` |

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (Vite on port 3001)
npm run dev

# Build for production (output: html/)
npm run build

# Preview production build
npm run preview

# Run unit tests (Vitest)
npx vitest run

# Run single unit test file
npx vitest run tests/unit/upload.test.js

# Run E2E tests (Playwright - requires dev server running)
npm test
npx playwright test --project=chromium    # Single browser
npx playwright test --debug               # Debug mode
npx playwright show-report                # View report

# Run tests with coverage
npx vitest run --coverage
```

---

## Architecture

```
src/
├── public/                 # HTML pages (mockups, debug views)
│   ├── mockup-camera.html
│   ├── mockup-simple.html
│   └── debug-uppy.html
├── js/
│   ├── db.js              # IndexedDB with Dexie.js (tables: jobs, photos, users, settings)
│   ├── db-api.js          # Supabase-compatible API layer over IndexedDB
│   └── utils/
│       ├── errors.js      # Custom error classes (AppError, UploadError, NetworkError, etc.)
│       ├── retry.js       # Exponential backoff retry utility
│       └── state.js       # JobState class with LocalStorage persistence
tests/
├── setup.js               # Vitest global setup (mocks fetch, alert, console)
├── unit/                  # Vitest unit tests
└── server-check.spec.cjs  # Playwright E2E tests
html/                      # Built output directory
```

### Database Layer (IndexedDB)

The app uses local browser storage instead of a remote backend:

```javascript
// db.js - Dexie.js schema
db.version(1).stores({
  jobs: '++id, job_number, work_date, car_model, technician_id, status, created_at, updated_at',
  photos: '++id, job_id, category, sequence, uploaded_at',
  users: '++id, &email, display_name, created_at',
  settings: '++id, key'
});

// db-api.js - Usage
import { jobsAPI, photosAPI, generateJobNumber } from './db-api.js';
const { data, error } = await jobsAPI.insert({ job_number: 'WHL250112001', car_model: '제네시스 G80' });
```

### Error Handling Pattern

```javascript
// Custom error classes in src/js/utils/errors.js
import { UploadError, NetworkError, ValidationError, handleError, isRetryableError } from './utils/errors.js';

// Retry utility in src/js/utils/retry.js
import { withRetry, fetchWithRetry } from './utils/retry.js';
const result = await withRetry(() => uploadFile(file), { maxRetries: 3, delayMs: 1000 });
```

### State Management

```javascript
// src/js/utils/state.js - LocalStorage persistence
import { jobState } from './utils/state.js';
jobState.update({ carModel: 'BMW 5시리즈' });
jobState.addPhoto('before_car', { url: '...', thumbnail: '...' });
jobState.isExpired(); // true if >24 hours old
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

## Test Configuration

**Vitest** (`vitest.config.js`):
- Environment: `happy-dom`
- Coverage threshold: 70% (lines, functions, branches, statements)
- Test files: `tests/unit/**/*.test.js`, `tests/integration/**/*.test.js`
- Setup: `tests/setup.js` (mocks `fetch`, `alert`, `console`)

**Playwright** (`playwright.config.cjs`):
- Base URL: `http://localhost:6010`
- Projects: Desktop Chrome/Firefox/Safari + Mobile Chrome/Safari
- Timeout: 30s, Expect timeout: 5s

### Port Configuration

| Purpose | Port | Note |
|---------|------|------|
| Dev Server | **6010** | `npm run dev` |
| Preview | **6011** | `npm run preview` |
| Test | **6010** | Playwright baseURL |

> **STRICT RULE**: Only use 6010+ ports. Port 6000-6009 are blocked by Chrome (X11 protocol). Other ranges (3000, 5000, 8000) are reserved for other projects.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/js/db.js:13-25` | IndexedDB schema definition |
| `src/js/db-api.js:319-347` | Job number generation (WHLYYMMDDNNN format) |
| `src/js/utils/errors.js:7-27` | Base AppError class with retry flag |
| `src/js/utils/retry.js:16-61` | withRetry() exponential backoff implementation |
| `src/js/utils/state.js:8-179` | JobState class with LocalStorage persistence |

---

## Marketing Video Generation (Future Feature)

### Workflow
```
📸 사진 촬영 (2분)  →  🎬 영상 자동 생성 (10분)  →  📱 SNS 업로드
   5개 카테고리           15초 Before/After 릴스        Instagram/TikTok
```

### Recommended Tech Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Browser-based** | FFmpeg.wasm | MP4 export within PWA |
| **Lightweight** | MediaRecorder + Canvas | Simple slideshow |
| **Desktop** | short-video-factory | GUI app, no API keys |
| **Full automation** | CapCut + Later | Templates + scheduling |

### Implementation Example

```javascript
// Canvas-based video generation (no external dependencies)
async function generateMarketingVideo(photos) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920; // 9:16 vertical
  const ctx = canvas.getContext('2d');

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks = [];

  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.start();

  // Display each photo for 3 seconds (15s total)
  for (const photo of photos) {
    const img = new Image();
    img.src = photo.thumbnail;
    await new Promise(r => img.onload = r);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    await new Promise(r => setTimeout(r, 3000));
  }

  recorder.stop();
  return new Promise(r => recorder.onstop = () =>
    r(new Blob(chunks, { type: 'video/webm' }))
  );
}
```

### Open Source Tools Reference

| Project | Stars | Use Case |
|---------|-------|----------|
| [short-video-factory](https://github.com/YILS-LIN/short-video-factory) | 1.7k | Desktop app, batch rendering |
| [ShortGPT](https://github.com/RayVentura/ShortGPT) | 6.8k | Full automation with AI |
| [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) | - | Browser video processing |
| [auto-subtitle](https://github.com/m1guelpf/auto-subtitle) | 6.4k | Whisper-based subtitles |

---

## Marketing Automation Integration

### Cost Tiers

| Tier | Tools | Monthly Cost | Time/Video |
|------|-------|--------------|------------|
| **Free** | CapCut + Canva + Manual | $0 | 15min |
| **Semi-auto** | Pictory.ai + Later | $54 | 6min |
| **Full-auto** | AutoReels.ai + SendShort | $78 | 2min |

### SNS Automation Workflow

```
Photo Factory (IndexedDB)
        ↓ Webhook trigger
CapCut/Pictory.ai (Video generation)
        ↓ Template: "Before/After Slideshow"
Later/AutoReels (Multi-platform posting)
        ↓ Instagram Reels + TikTok + YouTube Shorts
GPT-4 (Caption generation)
        ↓ "휠 복원 전후 비교 #휠복원 #자동차정비"
```

---

## Troubleshooting

### Common Issues

#### "Cannot find module 'dexie'" or similar import errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Development server not starting
```bash
# Kill existing processes and restart
# Windows:
taskkill /F /IM node.exe
npm run dev

# Linux/Mac:
pkill node
npm run dev
```

#### Camera not working on mobile
- Ensure HTTPS is enabled (camera requires secure context)
- Check browser permissions for camera access
- Use `npm run dev -- --host` for network access

#### Photos not saving to IndexedDB
```javascript
// Debug: Check storage quota
navigator.storage.estimate().then(est => {
  console.log(`Used: ${est.usage / 1024 / 1024}MB / ${est.quota / 1024 / 1024}MB`);
});
```

#### Video generation fails
- Ensure Chrome or Edge browser (WebM encoding support)
- Check console for specific error messages
- Verify photos exist in IndexedDB before generation

#### Tests failing with timeout
```bash
# Ensure dev server is running first
npm run dev &
npm test
```

#### Port already in use
```bash
# Check which process is using the port
# Windows:
netstat -ano | findstr :6010

# Linux/Mac:
lsof -i :6010

# Kill the process (strictPort enabled - won't auto-switch)
# Windows:
taskkill /F /PID <PID>
```

> **IMPORTANT**: This project uses port 6010 exclusively. Do NOT use:
> - Port 6000-6009: Blocked by Chrome/Chromium (X11 protocol security)
> - Port 3000, 5000, 8000, etc.: Reserved for other projects

### Debug Tools

```javascript
// Browser Console - Check IndexedDB contents
const db = (await import('/src/js/db.js')).db;
console.log('Jobs:', await db.jobs.toArray());
console.log('Photos:', await db.photos.toArray());

// Check LocalStorage state
console.log(JSON.parse(localStorage.getItem('photoFactory_currentJob')));

// Reset all data (caution!)
(await import('/src/js/db.js')).clearAllData();
```

---

## Parent Repository Context

This is a sub-project within `D:\AI\claude01\`. Follow the Phase 0-6 workflow from `../CLAUDE.md`:
1. Create PRD in `tasks/prds/`
2. Implement with 1:1 test pairing
3. Commit format: `type: description [PRD-NNNN]`
