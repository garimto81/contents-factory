# PRD-0013: Field Uploader - 현장 사진 촬영 & 클라우드 전송

**작성일**: 2025-12-05
**버전**: 1.0.0
**상태**: Draft
**작성자**: Claude Code

---

## 1. Executive Summary

**Field Uploader**는 현장 작업자(스마트폰)가 사진을 촬영하고 제목을 입력하여 클라우드로 전송하는 **초경량 PWA**입니다.

### 핵심 가치
- **극단적 단순함**: 3단계 워크플로우 (촬영 → 제목 → 전송)
- **오프라인 우선**: 네트워크 없어도 촬영/저장, 복구 시 자동 동기화
- **모바일 최적화**: 스마트폰 카메라 직접 연동, 터치 친화적 UI

### 타겟 사용자
- 휠 복원 기술자 (현장)
- 차량 검수 담당자
- 현장 리포터

---

## 2. 프로젝트 범위

### 2.1 In Scope (MVP)

| 기능 | 설명 |
|------|------|
| 사진 촬영 | 카메라 직접 촬영 또는 갤러리 선택 |
| 제목 입력 | 차량 모델 또는 작업 설명 (필수) |
| 로컬 저장 | IndexedDB 임시 저장 (오프라인) |
| 클라우드 전송 | PocketBase/Supabase로 이미지 업로드 |
| 전송 상태 | 대기/진행/완료/실패 표시 |
| 자동 재시도 | 네트워크 복구 시 자동 재전송 |

### 2.2 Out of Scope (v1.0)

- 사진 편집/필터
- 5개 카테고리 분류 (Photo Factory 기능)
- 비디오 생성 (프로젝트 B 영역)
- 사용자 인증 (v2.0)
- 팀/조직 관리 (v2.0)

---

## 3. 기술 아키텍처

### 3.1 기술 스택

| 레이어 | 기술 | 이유 |
|--------|------|------|
| Frontend | Vanilla JS + Vite | 최소 번들, 빠른 로딩 |
| Storage | IndexedDB (Dexie.js) | 오프라인 이미지 저장 |
| Backend | **PocketBase** (Go) | 단일 바이너리, 5분 배포 |
| 대안 | Supabase | 확장성 필요 시 |
| 압축 | browser-image-compression | EXIF 보정 + 용량 최적화 |

### 3.2 시스템 구성도

```
┌─────────────────────────────────────────────────────────────┐
│                    스마트폰 PWA                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────────────────────┐  │
│  │ Camera  │───▶│ Preview │───▶│ IndexedDB (upload_queue)│  │
│  │   API   │    │ + Title │    │ - image_data (base64)   │  │
│  └─────────┘    └─────────┘    │ - title                 │  │
│                                │ - status: pending       │  │
│                                └───────────┬─────────────┘  │
│                                            │                │
│                                   ┌────────▼────────┐       │
│                                   │  Sync Manager   │       │
│                                   │ (Background)    │       │
│                                   └────────┬────────┘       │
└────────────────────────────────────────────┼────────────────┘
                                             │ HTTPS
                                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    PocketBase Server                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │ REST API    │    │ SQLite DB   │    │ File Storage    │  │
│  │ /api/photos │    │ photos      │    │ /pb_data/storage│  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
                              ┌───────────────────────────────┐
                              │   프로젝트 B (Shorts Generator)│
                              │   이미지 조회 + 영상 생성      │
                              └───────────────────────────────┘
```

### 3.3 디렉토리 구조

```
field-uploader/
├── src/
│   ├── index.html              # 단일 페이지 (촬영 + 목록)
│   ├── js/
│   │   ├── app.js              # 메인 앱 로직
│   │   ├── camera.js           # 카메라 API 래퍼
│   │   ├── db.js               # IndexedDB (Dexie.js)
│   │   ├── sync.js             # 클라우드 동기화
│   │   └── compress.js         # 이미지 압축
│   ├── css/
│   │   └── style.css           # 최소 스타일
│   └── sw.js                   # Service Worker (오프라인)
├── vite.config.js
└── package.json
```

### 3.4 데이터베이스 스키마

**IndexedDB (로컬)**:
```javascript
db.version(1).stores({
  upload_queue: '++id, title, status, created_at, synced_at',
  settings: 'key'
});

// upload_queue 레코드
{
  id: 1,
  title: "BMW 5시리즈 휠 복원",
  image_data: "data:image/jpeg;base64,...",  // 압축된 이미지
  thumbnail: "data:image/jpeg;base64,...",   // 100px 썸네일
  file_size: 512000,
  status: "pending",  // pending | uploading | completed | failed
  retry_count: 0,
  error_message: null,
  created_at: "2025-12-05T10:30:00",
  synced_at: null
}
```

**PocketBase (서버)**:
```javascript
// photos 컬렉션
{
  id: "abc123",
  title: "BMW 5시리즈 휠 복원",
  image: "photo_abc123.jpg",  // 파일 필드
  thumbnail: "thumb_abc123.jpg",
  device_id: "device_xyz",    // 기기 식별
  created: "2025-12-05T10:30:00Z",
  updated: "2025-12-05T10:30:00Z"
}
```

---

## 4. 핵심 기능

### 4.1 사진 촬영 (camera.js)

```javascript
// 카메라 직접 촬영
async function capturePhoto() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';  // 후면 카메라

  return new Promise((resolve) => {
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const compressed = await compressImage(file);
      resolve(compressed);
    };
    input.click();
  });
}
```

**이미지 압축 설정**:
```javascript
const COMPRESS_OPTIONS = {
  maxSizeMB: 0.5,           // 최대 500KB
  maxWidthOrHeight: 1920,   // 최대 1920px
  useWebWorker: true,       // 비차단 압축
  preserveExif: false       // EXIF 제거 (회전 보정 후)
};
```

### 4.2 제목 입력

```html
<!-- 최소 UI -->
<div class="upload-form">
  <img id="preview" src="" alt="미리보기">
  <input type="text"
         id="title"
         placeholder="제목 입력 (예: BMW 5시리즈)"
         maxlength="100"
         required>
  <button id="upload-btn">전송</button>
</div>
```

**입력 검증**:
- 제목: 필수, 1-100자
- 이미지: 필수, 10MB 이하, image/* 타입

### 4.3 오프라인 큐 (sync.js)

```javascript
class SyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInterval = null;

    window.addEventListener('online', () => this.onOnline());
    window.addEventListener('offline', () => this.onOffline());
  }

  async addToQueue(photo) {
    await db.upload_queue.add({
      ...photo,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    if (this.isOnline) {
      this.syncNow();
    }
  }

  async syncNow() {
    const pending = await db.upload_queue
      .where('status')
      .anyOf(['pending', 'failed'])
      .toArray();

    for (const item of pending) {
      await this.uploadOne(item);
    }
  }

  async uploadOne(item) {
    try {
      await db.upload_queue.update(item.id, { status: 'uploading' });

      const formData = new FormData();
      formData.append('title', item.title);
      formData.append('image', dataURLtoBlob(item.image_data));

      await fetch(`${POCKETBASE_URL}/api/collections/photos/records`, {
        method: 'POST',
        body: formData
      });

      await db.upload_queue.update(item.id, {
        status: 'completed',
        synced_at: new Date().toISOString()
      });
    } catch (error) {
      await db.upload_queue.update(item.id, {
        status: 'failed',
        retry_count: item.retry_count + 1,
        error_message: error.message
      });
    }
  }
}
```

### 4.4 전송 상태 UI

```html
<div class="queue-status">
  <div class="status-item pending">
    <span class="icon">⏳</span>
    <span class="count">3</span> 대기 중
  </div>
  <div class="status-item uploading">
    <span class="icon">📤</span>
    <span class="count">1</span> 전송 중
  </div>
  <div class="status-item completed">
    <span class="icon">✅</span>
    <span class="count">12</span> 완료
  </div>
  <div class="status-item failed">
    <span class="icon">❌</span>
    <span class="count">0</span> 실패
  </div>
</div>
```

---

## 5. 사용자 워크플로우

### 5.1 기본 플로우 (3단계)

```
┌─────────────────┐
│   1. 촬영       │  카메라 버튼 터치
│   [📷]          │  → 사진 촬영/선택
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   2. 제목       │  "BMW 5시리즈" 입력
│   [____]        │  → 엔터 또는 전송 버튼
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   3. 전송       │  자동 또는 수동
│   [전송] ✅     │  → 완료 표시
└─────────────────┘
```

### 5.2 오프라인 시나리오

```
1. 현장에서 사진 촬영 (인터넷 없음)
   ↓
2. 제목 입력 후 "전송" 터치
   ↓
3. "오프라인 - 대기 중" 표시
   ↓
4. 네트워크 복구 시 자동 전송
   ↓
5. "완료" 알림
```

---

## 6. 백엔드 설정

### 6.1 PocketBase 설치 (5분)

```bash
# 1. 다운로드 (Windows)
curl -LO https://github.com/pocketbase/pocketbase/releases/download/v0.23.4/pocketbase_0.23.4_windows_amd64.zip
unzip pocketbase_0.23.4_windows_amd64.zip

# 2. 실행
./pocketbase serve --http="0.0.0.0:8090"

# 3. 관리자 UI 접속
# http://localhost:8090/_/
```

### 6.2 컬렉션 생성

```javascript
// PocketBase Admin UI에서 생성
// Collection: photos
{
  name: "photos",
  type: "base",
  fields: [
    { name: "title", type: "text", required: true, max: 100 },
    { name: "image", type: "file", required: true, maxSize: 10485760 },
    { name: "thumbnail", type: "file" },
    { name: "device_id", type: "text" }
  ],
  listRule: "",      // 모두 조회 가능
  createRule: ""     // 모두 생성 가능 (v1.0)
}
```

### 6.3 Docker 배포

```yaml
# docker-compose.yml
version: '3.8'
services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    ports:
      - "8090:8090"
    volumes:
      - ./pb_data:/pb_data
    restart: unless-stopped
```

---

## 7. 개발 계획

### Phase 1: MVP (3일)

| 일차 | 작업 |
|------|------|
| Day 1 | 프로젝트 초기화, 카메라 API, 이미지 압축 |
| Day 2 | IndexedDB 큐, 동기화 매니저 |
| Day 3 | PocketBase 연동, UI 완성 |

### Phase 2: 안정화 (2일)

| 작업 | 설명 |
|------|------|
| 에러 처리 | 네트워크 실패, 용량 초과 |
| 재시도 로직 | 지수 백오프, 최대 5회 |
| PWA 설정 | manifest.json, Service Worker |

### Phase 3: 테스트 (2일)

| 테스트 | 도구 |
|--------|------|
| Unit | Vitest |
| E2E | Playwright (모바일 에뮬레이션) |
| 오프라인 | Chrome DevTools Network 탭 |

---

## 8. 성공 지표

### 8.1 기능 지표

| 지표 | 목표 |
|------|------|
| 촬영 → 전송 시간 | < 5초 (온라인) |
| 오프라인 저장 | 100장 이상 |
| 자동 재시도 성공률 | > 95% |
| 앱 크기 | < 500KB (gzip) |

### 8.2 UX 지표

| 지표 | 목표 |
|------|------|
| 학습 시간 | < 1분 |
| 터치 횟수 | 3회 이하 (촬영→완료) |
| 로딩 시간 | < 2초 (3G) |

---

## 9. 프로젝트 B 연동

### 9.1 API 인터페이스

**Shorts Generator**가 호출할 API:

```javascript
// 최신 사진 목록 조회
GET /api/collections/photos/records?sort=-created&perPage=50

// 응답
{
  "items": [
    {
      "id": "abc123",
      "title": "BMW 5시리즈 휠 복원",
      "image": "photo_abc123.jpg",
      "created": "2025-12-05T10:30:00Z"
    }
  ]
}

// 이미지 다운로드
GET /api/files/photos/{record_id}/{filename}
```

### 9.2 데이터 흐름

```
Field Uploader (PWA)
       │
       │ 사진 업로드
       ▼
  PocketBase (Storage)
       │
       │ API 조회
       ▼
Shorts Generator (PC)
       │
       │ 영상 생성
       ▼
   WebM/MP4 파일
```

---

## 10. 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 대용량 이미지 | 저장 공간 부족 | 500KB 압축 강제 |
| 네트워크 불안정 | 전송 실패 | 자동 재시도 + 수동 재전송 |
| IndexedDB 용량 | 브라우저 제한 | 완료 항목 30일 후 자동 삭제 |
| PocketBase 다운 | 서비스 중단 | Docker 재시작 정책 |

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2025-12-05 | 1.0.0 | 초안 작성 |

---

**작성자**: Claude Code
**검토자**: -
**승인자**: -
