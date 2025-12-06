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
npm test                   # Playwright E2E (dev 서버 먼저 실행)
```

**Port**: 6010 (dev), 6011 (preview). Port 6000-6009는 Chrome 차단됨.

---

## Architecture

```
src/
├── public/                # HTML pages
│   ├── index.html         # 메인
│   ├── upload.html        # 업로드
│   ├── gallery.html       # 갤러리
│   └── job-detail.html    # 작업 상세
└── js/
    ├── db.js              # IndexedDB (Dexie.js)
    ├── db-api.js          # API layer + validation
    ├── video-generator.js # Canvas + MediaRecorder
    └── utils/             # errors, retry, state, sanitizer
apps/
├── frontend/              # Field Uploader (스마트폰 PWA)
└── backend/               # Shorts Generator (PC CLI)
server/                    # PocketBase (Docker)
tests/                     # unit/*.test.js, *.spec.cjs
docs/                      # 상세 문서 (README.md 참조)
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

```
스마트폰 (Field Uploader)  →  PocketBase  →  PC (Shorts Generator)
     📷 촬영                    ☁️ 저장        🎬 영상 생성
```

### apps/frontend - Field Uploader

```bash
cd apps/frontend && npm install && npm run dev  # http://localhost:5173
```

### apps/backend - Shorts Generator

```bash
cd apps/backend && npm install

# 기본 실행
node src/index.js list       # 사진 목록
node src/index.js create     # 영상 생성

# 전역 CLI (선택)
npm link                     # 전역 등록
shorts-gen list              # 전역 명령어
```

**요구사항**: FFmpeg (`winget install FFmpeg`)

### server - PocketBase

```bash
cd server && docker-compose up -d  # http://localhost:8090
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

**GitHub Pages**: `main` push → 자동 배포

```bash
npm run build && npm run preview  # 로컬 테스트
```

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
