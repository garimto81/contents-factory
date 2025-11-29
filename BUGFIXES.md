# 🐛 Bug Fixes - Photo Factory

**날짜**: 2025-01-12
**버전**: 1.1.0

---

## ✅ 수정된 버그

### 1. **gallery.html - job-detail 경로 오류**

#### 문제:
[gallery.html:447](src/public/gallery.html#L447)에서 잘못된 경로 사용
```javascript
window.location.href = `/job-detail.html?id=${jobId}`;  // ❌ 404 오류
```

#### 해결:
```javascript
window.location.href = `/public/job-detail.html?id=${jobId}`;  // ✅
```

#### 영향:
- 갤러리에서 작업 상세 보기 클릭 시 404 오류 발생
- 사용자가 작업 상세를 볼 수 없음

---

### 2. **upload.js - removePhoto 로직 오류**

#### 문제:
[upload.js:286](src/js/upload.js#L286)에서 `.shift()` 사용으로 항상 첫 번째 사진만 제거
```javascript
currentJob.photos[category].shift();  // ❌ 무조건 첫 번째 제거
```

#### 해결:
photoId를 파싱하여 실제 클릭한 사진 찾아서 제거
```javascript
// photoId format: photo-{category}-{timestamp}
const timestamp = photoId.split('-').pop();

const index = currentJob.photos[category].findIndex(photo => {
  return photo.file && photo.file.lastModified &&
         photo.file.lastModified.toString().endsWith(timestamp.slice(-6));
});

if (index !== -1) {
  currentJob.photos[category].splice(index, 1);  // ✅ 정확한 사진 제거
} else {
  currentJob.photos[category].pop();  // Fallback
}

// 배지 업데이트
const badge = document.getElementById(`badge-${category}`);
if (badge) {
  badge.textContent = currentJob.photos[category].length;
}
```

#### 영향:
- 사용자가 특정 사진 삭제 시 다른 사진이 삭제됨
- 업로드 전 사진 관리 불가능

---

### 3. **auth.js - 리다이렉트 경로 불일치**

#### 문제:
[auth.js:79](src/js/auth.js#L79)에서 `/index.html` 사용 (Vite에서 `/public/index.html` 필요)

```javascript
export async function requireAuth(redirectIfNotAuth = '/index.html') {  // ❌
```

#### 해결:
```javascript
export async function requireAuth(redirectIfNotAuth = '/public/index.html') {  // ✅
```

#### 영향:
- 미로그인 상태에서 보호된 페이지 접근 시 404 오류
- 로그인 페이지로 리다이렉트 실패

---

## 🔍 테스트 방법

### 1. gallery.html 경로 수정 테스트
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서:
1. http://localhost:3000/public/gallery.html 접속
2. 작업 카드 클릭
3. job-detail 페이지로 이동되는지 확인
```

### 2. removePhoto 로직 테스트
```bash
1. http://localhost:3000/public/upload.html 접속
2. 여러 장의 사진 업로드
3. 중간 사진의 X 버튼 클릭
4. 정확히 해당 사진만 삭제되는지 확인
5. 배지 숫자가 감소하는지 확인
```

### 3. auth.js 리다이렉트 테스트
```bash
1. 로그아웃 상태에서
2. http://localhost:3000/public/upload.html 직접 접속
3. /public/index.html로 리다이렉트되는지 확인
```

---

## 📊 수정 전후 비교

| 항목 | Before | After |
|------|--------|-------|
| **job-detail 경로** | `/job-detail.html` (404) | `/public/job-detail.html` (✅) |
| **사진 삭제** | 첫 번째만 삭제 | 클릭한 사진 삭제 |
| **로그인 리다이렉트** | `/index.html` (404) | `/public/index.html` (✅) |

---

## ⚠️ 남은 알려진 이슈

### 1. 이미지 압축 없음
- **문제**: 10MB 원본 사진을 그대로 업로드
- **영향**: 대역폭 낭비, 느린 업로드
- **해결 방안**: Browser-Image-Compression 라이브러리 추가

### 2. 오프라인 지원 없음
- **문제**: 네트워크 없으면 앱 사용 불가
- **영향**: 현장에서 네트워크 불안정 시 사용 어려움
- **해결 방안**: Service Worker + IndexedDB

### 3. Cloudinary 설정 전역 노출
- **문제**: [upload.html:571-573](src/public/upload.html#L571)에서 `window.CLOUDINARY_*` 노출
- **영향**: 브라우저 콘솔에서 API 키 접근 가능
- **해결 방안**: 모듈 스코프로 변경

### 4. 페이지네이션 없음
- **문제**: 작업 목록 전체 로드
- **영향**: 작업이 많아지면 느려짐
- **해결 방안**: Supabase Pagination 구현

---

## 🚀 다음 권장 작업

### 우선순위 높음
1. [ ] 이미지 압축 추가
2. [ ] Cloudinary 설정 보안 강화
3. [ ] 페이지네이션 구현

### 우선순위 중간
4. [ ] Service Worker (PWA)
5. [ ] 오류 처리 개선 (Toast UI)
6. [ ] 사진 순서 변경 (Drag & Drop)

### 우선순위 낮음
7. [ ] 다크 모드
8. [ ] 다국어 지원
9. [ ] 통계 대시보드 강화

---

## 📚 참고 코드

### removePhoto 개선 버전 (upload.js)

```javascript
/**
 * 더 나은 구현: publicId를 사용한 삭제
 */
window.removePhoto = function(category, publicId) {
  // UI에서 제거
  const preview = document.querySelector(`[data-public-id="${publicId}"]`);
  if (preview) {
    preview.remove();
  }

  // 상태에서 제거 - publicId로 정확히 찾기
  if (currentJob.photos[category]) {
    currentJob.photos[category] = currentJob.photos[category].filter(
      photo => photo.publicId !== publicId
    );

    // 배지 업데이트
    updateCategoryBadge(category);
  }
};

function updateCategoryBadge(category) {
  const badge = document.getElementById(`badge-${category}`);
  if (badge && currentJob.photos[category]) {
    badge.textContent = currentJob.photos[category].length;
  }
}
```

---

## 🎯 버전 이력

### v1.1.0 (2025-01-12)
- ✅ 3개 주요 버그 수정
- ✅ 보안 강화 (환경변수, RLS)
- ✅ Vite 빌드 시스템 도입

### v1.0.0 (초기 버전)
- 기본 기능 구현

---

**작성자**: Claude Code
**마지막 업데이트**: 2025-01-12
