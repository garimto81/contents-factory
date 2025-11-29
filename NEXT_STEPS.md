# 📋 다음 단계 가이드 - Photo Factory

**작업 완료 날짜**: 2025-01-12
**현재 상태**: ✅ 보안 강화 완료, ✅ 주요 버그 수정 완료

---

## 🎉 완료된 작업 요약

### ✅ 보안 강화
1. **환경변수 분리**: .env 파일로 API 키 분리
2. **Vite 빌드 시스템**: 환경변수 자동 로드
3. **RLS 정책 문서화**: Supabase 보안 정책 SQL 작성
4. **문서화**: SECURITY.md, README.md 작성

### ✅ 버그 수정
1. **gallery.html 경로**: `/job-detail.html` → `/public/job-detail.html`
2. **removePhoto 로직**: 클릭한 사진 정확히 제거하도록 개선
3. **auth.js 리다이렉트**: `/index.html` → `/public/index.html`

### ✅ 개발 환경
- Vite 개발 서버 실행 중: http://localhost:3000
- Hot Module Replacement (HMR) 활성화
- 파일 변경 시 자동 리로드

---

## 🚨 즉시 해야 할 작업 (필수)

### 1. **Supabase RLS 정책 적용** ⚠️ CRITICAL

현재 데이터베이스에 보안 정책이 적용되지 않아 **모든 사용자가 모든 데이터에 접근 가능**합니다.

#### 적용 방법:

**Option A: Supabase Dashboard 사용**
```bash
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. SQL Editor 메뉴 클릭
4. 다음 파일 내용 복사 & 실행:
   - docs/supabase_rls_policies.sql
```

**Option B: Supabase CLI 사용**
```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 연결
supabase link --project-ref nuecesgtciziaotdmfhp

# SQL 실행
supabase db push < docs/supabase_rls_policies.sql
```

#### 검증:
```sql
-- Supabase SQL Editor에서 실행
-- RLS 활성화 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('jobs', 'photos');
-- 결과: rowsecurity = true 이어야 함

-- 정책 확인
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('jobs', 'photos');
-- 결과: 8개 정책이 나와야 함
```

---

### 2. **애플리케이션 테스트** 🧪

#### 기본 플로우 테스트:
```bash
1. 브라우저에서 http://localhost:3000/public/index.html 접속
2. Google 로그인
3. 사진 업로드 (최소 3장)
4. 갤러리에서 조회 확인
5. 작업 상세 보기 클릭
6. 사진 삭제 테스트
```

#### RLS 보안 테스트:
```bash
1. 계정 A로 로그인 → 작업 생성
2. 로그아웃
3. 계정 B로 로그인
4. 갤러리에서 계정 A의 작업이 안 보이는지 확인 ✅
5. 브라우저 개발자 도구 → Network 탭에서 API 응답 확인
```

---

## 📈 우선순위별 개선 작업

### 🔴 우선순위 1 (높음) - 1-2주 내

#### 1. **이미지 압축 추가**
- **목적**: 업로드 속도 개선, 대역폭 절약
- **라이브러리**: [browser-image-compression](https://www.npmjs.com/package/browser-image-compression)

```bash
npm install browser-image-compression
```

**구현 예시** (upload.js):
```javascript
import imageCompression from 'browser-image-compression';

async function compressImage(file) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('압축 실패:', error);
    return file; // 원본 반환
  }
}

// uploadToCloudinary 호출 전에 압축
const compressedFile = await compressImage(file);
const result = await uploadToCloudinary(compressedFile);
```

#### 2. **Cloudinary 보안 강화**
- **문제**: [upload.html:571-573](src/public/upload.html#L571)에서 window 전역 노출
- **해결**: 모듈 스코프로 변경

**현재**:
```javascript
window.CLOUDINARY_CLOUD_NAME = CLOUDINARY_CLOUD_NAME;  // ❌
```

**개선**:
```javascript
// upload.html의 script에서 직접 import 사용
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../js/config.js';

// Uppy 설정에서 직접 사용 (window 노출 제거)
.use(XHRUpload, {
  endpoint: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
  // ...
});
```

#### 3. **에러 처리 개선**
- **목적**: 사용자 친화적인 에러 메시지
- **라이브러리**: [Toastify](https://apvarun.github.io/toastify-js/)

```bash
npm install toastify-js
```

---

### 🟡 우선순위 2 (중간) - 2-4주 내

#### 4. **페이지네이션 구현**
- **목적**: 작업 목록이 많을 때 성능 개선

**gallery.js 수정**:
```javascript
export async function fetchJobs(filters = {}, page = 1, pageSize = 20) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('jobs')
    .select(`*, photos(*)`, { count: 'exact' })
    .range(from, to);

  // ...
}
```

#### 5. **오프라인 지원 (PWA)**
- **목적**: 네트워크 불안정 환경에서도 사용 가능

**필요 파일**:
- `manifest.json`: 앱 메타데이터
- `service-worker.js`: 오프라인 캐싱
- `src/js/offline-sync.js`: IndexedDB 동기화

#### 6. **사진 순서 변경**
- **라이브러리**: [SortableJS](https://sortablejs.github.io/Sortable/)

---

### 🟢 우선순위 3 (낮음) - 여유 있을 때

#### 7. **다크 모드**
- Bootstrap 5 다크 테마 활용

#### 8. **다국어 지원 (i18n)**
- 한국어/영어 전환

#### 9. **통계 대시보드 강화**
- Chart.js로 시각화

#### 10. **일괄 다운로드 (ZIP)**
- JSZip 라이브러리 사용

---

## 🔧 개발 워크플로우

### 일상 개발
```bash
# 1. 개발 서버 시작
npm run dev

# 2. 브라우저에서 http://localhost:3000/public/index.html
# 3. 코드 수정 → 자동 리로드 확인

# 4. Git 커밋
git add .
git commit -m "feat: Add image compression"
git push
```

### 프로덕션 배포
```bash
# 1. 빌드
npm run build

# 2. 결과물 확인
npm run preview

# 3. Vercel 배포 (또는 다른 플랫폼)
vercel

# 4. 환경변수 설정
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_CLOUDINARY_CLOUD_NAME
vercel env add VITE_CLOUDINARY_UPLOAD_PRESET
```

---

## 📚 참고 문서

### 프로젝트 문서
- [README.md](README.md) - 프로젝트 개요 및 시작 가이드
- [SECURITY.md](docs/SECURITY.md) - 보안 설정 상세
- [BUGFIXES.md](BUGFIXES.md) - 수정된 버그 목록
- [SECURITY_SETUP_COMPLETE.md](SECURITY_SETUP_COMPLETE.md) - 보안 작업 보고서

### 외부 문서
- [Vite 공식 문서](https://vitejs.dev/)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Cloudinary Upload](https://cloudinary.com/documentation/upload_images)
- [Uppy File Uploader](https://uppy.io/docs/)

---

## 🎯 단기 로드맵 (1개월)

### Week 1: 필수 작업
- [ ] Supabase RLS 정책 적용
- [ ] 전체 기능 테스트
- [ ] 이미지 압축 구현

### Week 2: 보안 & 성능
- [ ] Cloudinary 보안 강화
- [ ] 에러 처리 개선
- [ ] 페이지네이션 구현

### Week 3: UX 개선
- [ ] 로딩 인디케이터 추가
- [ ] Toast 알림 통합
- [ ] 업로드 진행률 표시

### Week 4: 배포 준비
- [ ] 프로덕션 테스트
- [ ] 성능 최적화
- [ ] 문서 최종 검토

---

## 💡 개발 팁

### Vite 환경변수 디버깅
```javascript
// config.js에서
console.log('ENV:', {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV
});
```

### Supabase 쿼리 디버깅
```javascript
// gallery.js에서
const { data, error, count } = await query;
console.log('Query result:', { data, error, count });
```

### Cloudinary 업로드 디버깅
```javascript
// upload.js에서
uppy.on('upload', () => {
  console.log('Upload started');
});

uppy.on('complete', (result) => {
  console.log('Upload complete:', result);
});
```

---

## 🆘 문제 해결

### "import.meta.env is undefined"
```bash
# .env 파일 확인
cat .env

# Vite 서버 재시작
npm run dev
```

### "RLS policy violation"
```sql
-- Supabase SQL Editor에서
-- 현재 사용자 확인
SELECT auth.uid();

-- jobs 테이블 technician_id 확인
SELECT id, job_number, technician_id FROM jobs LIMIT 5;

-- 두 값이 일치하지 않으면 데이터 수정 필요
```

### "Cloudinary upload failed"
```javascript
// 브라우저 개발자 도구 → Network 탭
// Cloudinary API 응답 확인
// - 401: Upload Preset 설정 확인
// - 413: 파일 크기 제한 초과
```

---

## 📞 지원

### 커뮤니티
- [Supabase Discord](https://discord.supabase.com/)
- [Vite Discord](https://chat.vitejs.dev/)

### 이슈 보고
- GitHub Issues: (프로젝트 URL)

---

**작성자**: Claude Code
**마지막 업데이트**: 2025-01-12
**다음 리뷰**: 2025-01-19
