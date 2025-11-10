# ISSUE-0001: 업로드 페이지 UI/UX 및 기능 문제

**작성일**: 2025-11-10
**우선순위**: 🔴 High
**상태**: Open
**GitHub Issue**: [#1](https://github.com/garimto81/contents-factory/issues/1)
**브랜치**: `claude/investigate-issue-fix-011CUySwiVgZBEbUkAPuA1cp`

---

## 📋 문제 요약

업로드 페이지(`upload.html`)에서 3가지 주요 문제 발생:

1. **모바일 반응형**: 스마트폰에서 스크롤 없이 전체가 보여야 하는데 계속 스크롤 필요
2. **Uppy 버튼 표시**: 카메라 캡처 버튼만 보여야 하는데 "내 기기" 버튼도 함께 표시됨
3. **업로드 실패**: 파일 업로드가 성공적으로 완료되지 않음

---

## 🔍 상세 분석

### 문제 1: 모바일 반응형 스크롤 문제

**현상**
- 모바일(스마트폰)에서 페이지 전체를 보기 위해 스크롤이 필요함
- viewport 높이를 초과하여 사용성 저하

**원인 분석**

| 요소 | 파일:라인 | 설정값 | 문제점 |
|------|----------|--------|--------|
| `body` | upload.html:18-19 | `min-height: 100vh` + `padding: 20px 0` | viewport 높이 + 상하 여백 |
| `.tab-content` | upload.html:65 | `min-height: 400px` | 고정 최소 높이 |
| Uppy Dashboard | upload.html:352 | `height: 300px` | 고정 높이 |
| 헤더 | upload.html:31-36 | `padding: 20px` | - |
| 작업 정보 폼 | upload.html:244-265 | - | - |

**총 높이 계산 (모바일)**:
```
헤더 (~80px)
+ 탭 네비게이션 (~60px)
+ tab-content min-height (400px)
  - Uppy Dashboard (300px)
  - 여백 및 텍스트 (~100px)
+ 작업 정보 폼 (~200px)
+ body padding (40px 상하)
= 약 780px (대부분 모바일 viewport 높이 초과)
```

**해결 방안**:
- [ ] `.tab-content` `min-height` 제거 또는 모바일에서 `auto`로 변경
- [ ] Uppy Dashboard `height`를 모바일에서 `200px`로 축소
- [ ] `body` padding을 모바일에서 `10px 0`으로 축소
- [ ] 모바일 미디어 쿼리 추가 (`@media (max-width: 768px)`)

---

### 문제 2: Uppy Dashboard 버튼 표시 문제

**현상**
- 카메라 촬영 버튼(📸 촬영하기)과 "내 기기" 파일 선택 버튼이 **모두** 표시됨
- 요구사항: 카메라 버튼만 표시

**원인 분석**

**코드 위치**: `upload.html:349-371`

```javascript
.use(Dashboard, {
  inline: true,
  target: `#uppy-${category.id}`,
  height: 300,
  proudlyDisplayPoweredByUppy: false,
  note: `${category.label} 사진 (최대 ${APP_CONFIG.photosPerCategory}장)`,
  locale: { ... }
})
.use(Webcam, {
  target: Dashboard,
  modes: ['picture'],
  mirror: false,
  facingMode: 'environment'
})
```

**근본 원인**:
1. `Dashboard` 플러그인은 기본적으로 **파일 선택(Browse files)** 기능을 제공
2. `Webcam` 플러그인 추가 시 **카메라 촬영** 버튼도 추가됨
3. 두 기능이 모두 활성화되어 **2개 버튼이 표시**됨

**Uppy Dashboard 기본 동작**:
- `Browse files` (내 기기에서 파일 선택) - 항상 표시
- `Take Picture` (카메라 촬영) - Webcam 플러그인 추가 시 표시

**해결 방안 (3가지 옵션)**:

#### 옵션 A: Dashboard에서 로컬 파일 선택 비활성화 ⭐ 추천
```javascript
.use(Dashboard, {
  inline: true,
  target: `#uppy-${category.id}`,
  height: 300,
  disableLocalFiles: true,  // ✅ 파일 선택 비활성화
  proudlyDisplayPoweredByUppy: false,
  note: `${category.label} 사진 (카메라로 촬영)`,
  locale: { ... }
})
```

#### 옵션 B: CSS로 파일 선택 버튼 숨기기
```css
.uppy-DashboardTab-btn[data-uppy-acquirer-id="MyDevice"] {
  display: none !important;
}
```

#### 옵션 C: Dashboard 없이 Webcam만 사용
```javascript
// Dashboard 제거하고 Webcam만 사용
const uppy = new Core({ ... })
  .use(Webcam, {
    onBeforeSnapshot: () => Promise.resolve(),
    modes: ['picture'],
    mirror: false,
    facingMode: 'environment'
  })
  .use(XHRUpload, { ... });
```

**권장**: **옵션 A** (가장 간단하고 명확한 해결책)

---

### 문제 3: 업로드 실패 문제

**현상**
- 파일 업로드가 성공적으로 완료되지 않음

**원인 분석 (추정)**

#### 가능성 1: Cloudinary Upload Preset 설정 오류 ⚠️ 최고 가능성

**현재 설정**: `config.js:10`
```javascript
export const CLOUDINARY_UPLOAD_PRESET = 'photo-factory'; // unsigned preset
```

**문제점**:
- Cloudinary에서 `photo-factory` preset이 **unsigned**로 설정되어 있지 않을 수 있음
- unsigned preset이 아니면 클라이언트에서 직접 업로드 불가능 (서명 필요)

**확인 방법**:
1. Cloudinary 대시보드 → Settings → Upload
2. Upload presets → `photo-factory` 존재 여부 확인
3. Signing Mode가 **Unsigned**로 설정되어 있는지 확인

**Cloudinary 설정 예시**:
```
Upload Preset Name: photo-factory
Signing Mode: Unsigned ✅
Folder: photo-factory
Allowed formats: jpg, png, webp
```

#### 가능성 2: CORS 설정 문제

**현재 설정**: `upload.html:372-379`
```javascript
.use(XHRUpload, {
  endpoint: `https://api.cloudinary.com/v1_1/${window.CLOUDINARY_CLOUD_NAME}/image/upload`,
  formData: true,
  fieldName: 'file',
  method: 'POST',
  headers: {},  // ❌ 빈 헤더
  bundle: false
})
```

**문제점**:
- Cloudinary API는 기본적으로 CORS를 허용하지만, 일부 브라우저에서 문제 발생 가능
- 특히 모바일 브라우저에서 CORS 에러 가능성

#### 가능성 3: 전역 변수 타이밍 이슈

**코드 흐름**: `upload.html:495-501`
```javascript
// 1. 전역 Cloudinary 설정
window.CLOUDINARY_CLOUD_NAME = CLOUDINARY_CLOUD_NAME;        // Line 495
window.CLOUDINARY_UPLOAD_PRESET = CLOUDINARY_UPLOAD_PRESET;  // Line 496

// 2. Uppy 초기화 (forEach)
APP_CONFIG.categories.forEach(category => {
  initializeUppy(category);  // Line 500
});
```

**initializeUppy 함수 내부**: Line 373
```javascript
endpoint: `https://api.cloudinary.com/v1_1/${window.CLOUDINARY_CLOUD_NAME}/image/upload`
```

**분석**:
- ✅ 전역 설정이 Uppy 초기화 **전에** 실행되므로 타이밍은 정상
- ❌ 하지만 모듈 로드 순서에 따라 변수가 `undefined`일 가능성 있음

#### 가능성 4: FormData 구성 오류

**file-added 이벤트**: `upload.html:382-388`
```javascript
uppy.on('file-added', (file) => {
  uppy.setFileMeta(file.id, {
    upload_preset: window.CLOUDINARY_UPLOAD_PRESET,
    folder: 'photo-factory',
    tags: `category:${category.id}`
  });
});
```

**문제점**:
- `setFileMeta`로 설정한 메타데이터가 FormData에 제대로 추가되는지 확인 필요
- Cloudinary API는 `upload_preset` 필드를 **필수**로 요구함

**올바른 FormData 예시** (upload.js:55-58):
```javascript
formData.append('file', file);
formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
formData.append('folder', 'photo-factory');
```

#### 가능성 5: 에러 핸들링 부족

**현재 에러 핸들러**: `upload.html:418-421`
```javascript
uppy.on('upload-error', (file, error) => {
  console.error('업로드 오류:', error);
  alert(`업로드 실패: ${error.message}`);
});
```

**문제점**:
- 에러 로그가 단순하여 **실제 원인 파악 어려움**
- Cloudinary API 응답 상세 내용 확인 불가

**해결 방안**:

#### 1. Cloudinary Upload Preset 확인 및 생성
```bash
# Cloudinary 대시보드에서 수동 확인
# 또는 CLI로 확인 (cloudinary-cli 필요)
cloudinary config:upload_presets
```

#### 2. 에러 로깅 개선
```javascript
uppy.on('upload-error', (file, error, response) => {
  console.error('❌ 업로드 오류 상세:', {
    file: file.name,
    error: error,
    response: response,
    endpoint: uppy.getPlugin('XHRUpload').opts.endpoint
  });

  // Cloudinary 에러 코드 확인
  if (response && response.body) {
    console.error('Cloudinary Error:', response.body.error);
    alert(`업로드 실패: ${response.body.error.message}`);
  } else {
    alert(`업로드 실패: ${error.message}`);
  }
});
```

#### 3. 업로드 전 검증 추가
```javascript
uppy.on('upload', (data) => {
  console.log('📤 업로드 시작:', {
    files: data.fileIDs.length,
    cloudName: window.CLOUDINARY_CLOUD_NAME,
    preset: window.CLOUDINARY_UPLOAD_PRESET
  });

  // 필수 변수 확인
  if (!window.CLOUDINARY_CLOUD_NAME) {
    alert('❌ Cloudinary Cloud Name이 설정되지 않았습니다');
    return false;
  }
  if (!window.CLOUDINARY_UPLOAD_PRESET) {
    alert('❌ Cloudinary Upload Preset이 설정되지 않았습니다');
    return false;
  }
});
```

#### 4. XHRUpload 설정 개선
```javascript
.use(XHRUpload, {
  endpoint: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
  formData: true,
  fieldName: 'file',
  method: 'POST',
  headers: {
    // Cloudinary는 헤더 불필요하지만 명시적으로 설정
  },
  bundle: false,
  // ✅ 타임아웃 추가
  timeout: 60000, // 60초
  // ✅ 재시도 설정
  limit: 5,
  retryDelays: [0, 1000, 3000, 5000]
})
```

---

## 🎯 해결 방안 요약

### Priority 1: 업로드 실패 수정 (Critical)

**즉시 조치 필요**:
1. ✅ Cloudinary 대시보드에서 `photo-factory` upload preset **생성/확인**
   - Signing Mode: **Unsigned**
   - Folder: `photo-factory`
   - Allowed formats: `jpg, png, webp`

2. ✅ 에러 로깅 개선 (상세 에러 정보 출력)
   ```javascript
   uppy.on('upload-error', (file, error, response) => {
     console.error('❌ Upload Error:', { file, error, response });
     if (response?.body?.error) {
       alert(`업로드 실패: ${response.body.error.message}`);
     }
   });
   ```

3. ✅ 업로드 전 검증 추가
   ```javascript
   uppy.on('upload', (data) => {
     if (!window.CLOUDINARY_CLOUD_NAME || !window.CLOUDINARY_UPLOAD_PRESET) {
       alert('Cloudinary 설정 오류');
       return false;
     }
   });
   ```

### Priority 2: Uppy 버튼 표시 수정 (High)

**코드 수정**: `upload.html:349-364`
```javascript
.use(Dashboard, {
  inline: true,
  target: `#uppy-${category.id}`,
  height: 300,
  disableLocalFiles: true,  // ✅ 추가: 파일 선택 비활성화
  proudlyDisplayPoweredByUppy: false,
  note: `${category.label} 사진 (카메라로 촬영)`,
  locale: {
    strings: {
      // ✅ 텍스트 수정
      myDevice: '내 기기',
      takePicture: '📸 촬영하기',
      dropPaste: '사진을 여기에 드롭',
      uploading: '업로드 중...',
      complete: '완료!'
    }
  }
})
```

### Priority 3: 모바일 반응형 수정 (Medium)

**코드 수정**: `upload.html:15-217` (style 태그 내부)

```css
/* 기존 스타일 뒤에 추가 */

/* 모바일 최적화 */
@media (max-width: 768px) {
  body {
    padding: 10px 0;  /* 상하 여백 축소 */
  }

  .upload-container {
    border-radius: 10px;
  }

  .header {
    padding: 15px;  /* 헤더 패딩 축소 */
  }

  .header h2 {
    font-size: 1.25rem;
  }

  .tab-content {
    padding: 20px;  /* 패딩 축소 */
    min-height: auto;  /* ✅ 고정 높이 제거 */
  }

  .job-info {
    padding: 15px;
    margin: 15px;
  }

  .submit-btn {
    padding: 12px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  body {
    padding: 5px 0;
  }

  .header {
    padding: 10px;
  }

  .header h2 {
    font-size: 1.1rem;
  }

  .tab-content {
    padding: 15px;
  }

  .nav-tabs .nav-link {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
}
```

**Uppy 높이 조정** (JavaScript 부분):
```javascript
function initializeUppy(category) {
  // ✅ 모바일에서 Uppy 높이 축소
  const isMobile = window.innerWidth <= 768;
  const dashboardHeight = isMobile ? 200 : 300;

  const uppy = new Core({ ... })
    .use(Dashboard, {
      inline: true,
      target: `#uppy-${category.id}`,
      height: dashboardHeight,  // ✅ 동적 높이
      disableLocalFiles: true,
      // ...
    })
}
```

---

## 📝 구현 계획

### Phase 1: 긴급 수정 (1-2시간)
- [ ] Cloudinary upload preset 확인/생성
- [ ] 에러 로깅 개선
- [ ] 업로드 전 검증 추가
- [ ] 테스트: 실제 업로드 성공 여부 확인

### Phase 2: UI 수정 (1시간)
- [ ] Dashboard `disableLocalFiles: true` 추가
- [ ] 버튼 텍스트 수정
- [ ] 테스트: 카메라 버튼만 표시되는지 확인

### Phase 3: 모바일 최적화 (1-2시간)
- [ ] 모바일 미디어 쿼리 추가
- [ ] Uppy 높이 동적 조정
- [ ] 여백 및 패딩 최적화
- [ ] 테스트: 다양한 모바일 기기에서 스크롤 확인

### Phase 4: 검증 및 배포 (30분)
- [ ] 전체 기능 테스트
- [ ] GitHub Issue #1에 댓글 추가
- [ ] 커밋 및 푸시
- [ ] PR 생성

---

## 🧪 테스트 계획

### 테스트 1: 업로드 기능
- [ ] Cloudinary preset 설정 확인
- [ ] 사진 촬영 후 업로드 성공 확인
- [ ] 에러 발생 시 상세 로그 출력 확인
- [ ] Supabase에 데이터 저장 확인

### 테스트 2: UI/UX
- [ ] 모바일(375px, 414px, 768px)에서 스크롤 없이 전체 보이는지 확인
- [ ] 카메라 버튼만 표시되는지 확인
- [ ] 파일 선택 버튼이 숨겨졌는지 확인

### 테스트 3: 브라우저 호환성
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Samsung Internet
- [ ] Firefox Mobile

---

## 🔗 관련 파일

| 파일 | 라인 | 수정 필요 |
|------|------|-----------|
| `upload.html` | 18-19, 65 | ✅ body/tab-content 스타일 |
| `upload.html` | 349-371 | ✅ Dashboard 설정 |
| `upload.html` | 418-421 | ✅ 에러 핸들러 |
| `upload.html` | 15-217 | ✅ 모바일 미디어 쿼리 추가 |
| `config.js` | 9-10 | ⚠️ Cloudinary 설정 확인 |
| `.env` | - | ⚠️ Cloudinary preset 확인 |

---

## 📚 참고 자료

- [Uppy Dashboard Docs](https://uppy.io/docs/dashboard/)
- [Uppy Webcam Plugin](https://uppy.io/docs/webcam/)
- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images)
- [Cloudinary Unsigned Upload](https://cloudinary.com/documentation/upload_images#unsigned_upload)

---

## 🏁 완료 조건

- [x] 3가지 문제 원인 분석 완료
- [ ] Cloudinary upload preset 설정 확인
- [ ] 코드 수정 완료 (upload.html)
- [ ] 모바일/데스크톱 테스트 통과
- [ ] GitHub Issue #1에 해결 내용 보고
- [ ] 커밋 및 PR 생성

---

**Next Steps**:
1. Cloudinary 대시보드에서 `photo-factory` preset 확인/생성
2. `upload.html` 수정 (에러 로깅 + Dashboard 설정 + 모바일 스타일)
3. 테스트 및 검증
4. GitHub Issue 업데이트
