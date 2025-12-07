# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Photo Factory** - 휠 복원 기술자를 위한 모바일 우선 사진 관리 PWA

| 레이어 | 기술 |
|--------|------|
| Frontend | Vanilla JS (ES6), PWA |
| Storage | IndexedDB (Dexie.js) + LocalStorage |
| Build | Vite + vite-plugin-pwa |
| Image | browser-image-compression |
| Test | Vitest (unit) + Playwright (E2E) |

---

## Commands

```bash
npm install                # Install dependencies
npm run dev                # Dev server → http://localhost:6010
npm run build              # Build → dist/
npm run preview            # Preview → http://localhost:6011

# Tests
npm run test:unit          # Vitest (watch mode)
npx vitest run --coverage  # Coverage (threshold: 70%)

# E2E (Playwright) - dev 서버 먼저 실행 필수
npm run dev                # 터미널 1: 서버 시작
npm test                   # 터미널 2: E2E 실행

# 단일 테스트 실행
npx vitest run tests/unit/upload.test.js                        # 특정 unit
npx playwright test tests/upload-ui.spec.cjs --project=chromium # 특정 E2E
```

**Port**: 6010 (dev), 6011 (preview). Port 6000-6009는 Chrome 차단됨.

### Test Environment

| Framework | Environment | Timeout | Note |
|-----------|-------------|---------|------|
| Vitest | happy-dom | 10s | `globals: true` |
| Playwright | Real browsers | 30s | baseURL: localhost:6010 |

**Playwright Projects**: chromium, firefox, webkit, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)

### Path Aliases

| Alias | Path | Available In |
|-------|------|--------------|
| `@` | `/src` | Vite, Vitest |
| `@js` | `/src/js` | Vite, Vitest |
| `@css` | `/src/css` | Vite only |

---

## Architecture

### 메인 PWA (src/)

```
src/
├── public/                # HTML pages (Vite root)
│   ├── index.html         # 메인 (작업 목록)
│   ├── upload.html        # 5-Category 사진 업로드
│   ├── gallery.html       # 갤러리
│   └── job-detail.html    # 작업 상세 + 영상 생성
└── js/
    ├── db.js              # IndexedDB (Dexie.js v3 schema)
    ├── db-api.js          # API layer + validation
    ├── video-generator.js # Canvas + MediaRecorder (1080x1920 WebM)
    └── utils/             # 공용 유틸리티
```

### Data Flow

```
LocalStorage (메타데이터)     IndexedDB (이미지)
      carModel, jobNumber  →  temp_photos 테이블
             ↓                      ↓
      작업 완료 시 jobs 테이블 + photos 테이블로 이동
```

### 분산 시스템 (apps/, server/)

```
스마트폰 (apps/frontend)  →  PocketBase (server/)  →  PC (apps/backend)
     📷 촬영                    ☁️ 동기화               🎬 FFmpeg 영상
```

> 상세: [docs/development/architecture.md](docs/development/architecture.md)

---

## Photo Categories

| Category | Korean | Description |
|----------|--------|-------------|
| `before_car` | 입고 | 차량 전체 |
| `before_wheel` | 문제 | 손상 휠 클로즈업 |
| `during` | 과정 | 작업 중 |
| `after_wheel` | 해결 | 복원 휠 클로즈업 |
| `after_car` | 출고 | 완료 차량 |

---

## Key Patterns

### Hybrid Storage
- **LocalStorage**: 메타데이터 (carModel, jobNumber)
- **IndexedDB**: 이미지 데이터 (temp_photos 테이블)

### Job Number
Pattern: `WHL{YYMMDD}{NNN}` (e.g., `WHL250112001`)

### Error Hierarchy
```
AppError
├── UploadError/NetworkError/DatabaseError (retry: true)
├── AuthError (retry: false, login required)
└── ValidationError (retry: false, input fix required)
```

### IndexedDB Schema (Version 3)

```javascript
// db.js - Dexie.js
jobs: '++id, job_number, work_date, car_model, status, [work_date+status]'
photos: '++id, job_id, category, sequence, [job_id+sequence]'
temp_photos: '++id, session_id, category, sequence, [session_id+category]'
users: '++id, &email, display_name'
settings: '++id, key'
```

> 상세: [docs/development/architecture.md](docs/development/architecture.md)

---

## Video Generation

Canvas + MediaRecorder → 1080x1920 WebM (vertical)

```javascript
import { generateAndDownloadVideo } from './video-generator.js';
await generateAndDownloadVideo(photos, { car_model: 'BMW', job_number: 'WHL250112001' });
```

---

## Sub-Projects

| 프로젝트 | 경로 | 포트 | 용도 |
|----------|------|------|------|
| Field Uploader | `apps/frontend` | 5173 | 스마트폰 촬영 PWA |
| Shorts Generator | `apps/backend` | - | PC CLI (FFmpeg) |
| PocketBase | `server` | 8090 | 동기화 서버 (Docker) |

```bash
# Field Uploader
cd apps/frontend && npm install && npm run dev

# Shorts Generator (FFmpeg 필요: winget install FFmpeg)
cd apps/backend && npm install
node src/index.js list       # 사진 목록
node src/index.js create     # 영상 생성

# PocketBase (Docker 필요)
cd server && docker-compose up -d
```

---

## Security

- XSS: `escapeHtml()` in `sanitizer.js`
- Validation: `validateJobData()`, `validateFile()` in `db-api.js`
- File limits: 10MB, JPEG/PNG/WebP, max 50
- Session: 8h absolute + 30min inactivity timeout

> 상세: [docs/deployment/security.md](docs/deployment/security.md)

---

## Naming Convention

| Context | Rule | Example |
|---------|------|---------|
| DB fields | snake_case | `image_data`, `session_id` |
| JS vars | camelCase | `storageKey` |
| Constants | UPPER_SNAKE | `MAX_FILE_SIZE` |
| Classes | PascalCase | `JobState` |

---

## Deployment

**GitHub Pages**: `main` push → 자동 배포 → `/content-factory/` 경로

```bash
npm run build && npm run preview  # 로컬 테스트
```

- Build base path: `/content-factory/` (GitHub Actions에서 자동 설정)
- 로컬 개발: `/` (기본값)

> 상세: [docs/deployment/github-pages.md](docs/deployment/github-pages.md)

---

## Documentation Index

| 문서 | 내용 |
|------|------|
| [docs/README.md](docs/README.md) | 문서 인덱스 (진입점) |
| [docs/getting-started/](docs/getting-started/) | 설치, 빠른 시작, 설정 |
| [docs/development/](docs/development/) | 아키텍처, 테스트, 디버깅 |
| [docs/deployment/](docs/deployment/) | GitHub Pages, Docker, 보안 |
| [docs/research/](docs/research/) | 2025년 기술 리서치 |

---

## Parent Repository

Sub-project of `D:\AI\claude01\`. Follow Phase 0-6 workflow from `../CLAUDE.md`.
