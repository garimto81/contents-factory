# PRD-0001: Photo Factory 보안 강화 및 버그 수정

**작성일**: 2025-01-12
**작성자**: Claude Code
**상태**: 🟡 진행 중 (85% 완료)
**우선순위**: P0 (Critical)

---

## 📋 Executive Summary

Photo Factory 애플리케이션의 보안 취약점 해결 및 주요 버그 수정 프로젝트. API 키 노출 방지, Supabase RLS 정책 적용, 경로 오류 수정 등을 포함.

---

## 🎯 목표 (Goals)

### 주요 목표
1. **보안 강화**: API 키를 환경변수로 분리하여 Git 노출 방지
2. **데이터 보안**: Supabase RLS 정책으로 사용자별 데이터 격리
3. **버그 수정**: 경로 오류 및 기능 버그 3건 해결
4. **모바일 테스트**: 네트워크 노출 및 모바일 접근 가능하도록 설정

### 성공 지표
- ✅ .env 파일로 API 키 분리 완료
- ⏳ Supabase RLS 정책 적용 (SQL 작성 완료, 적용 대기)
- ✅ 주요 버그 3건 수정 완료
- ✅ Playwright 테스트 9/9 통과
- ⚠️ 환경변수 로딩 문제 해결 중

---

## 📊 현재 상태

### ✅ 완료된 작업 (85%)

#### 1. 보안 강화 (100% 완료)
- [x] `.env` 파일 생성 및 API 키 분리
- [x] `.env.example` 템플릿 생성
- [x] `config.js` 환경변수 전환
- [x] `.gitignore` 확인 (.env 이미 포함됨)
- [x] Vite 빌드 시스템 구성
- [x] `package.json` 업데이트

**파일 변경**:
- `src/js/config.js`: API 키 하드코딩 → `import.meta.env` 사용
- `vite.config.js`: 생성 (환경변수 자동 로드)
- `.env`: 생성 (Git에서 제외)
- `.env.example`: 생성 (Git에 포함)

#### 2. Supabase RLS 정책 (90% 완료)
- [x] RLS 정책 8개 작성 (`docs/supabase_rls_policies.sql`)
- [x] 보안 가이드 문서화 (`docs/SECURITY.md`)
- [ ] **⏳ Supabase Dashboard에서 SQL 실행 필요** (사용자 수동 작업)

**정책 내역**:
| 테이블 | 정책 수 | 내용 |
|--------|---------|------|
| jobs | 4개 | SELECT, INSERT, UPDATE, DELETE |
| photos | 4개 | SELECT, INSERT, UPDATE, DELETE (job 소유권 기반) |

#### 3. 버그 수정 (100% 완료)
- [x] **Bug #1**: `gallery.html:447` - job-detail 경로 수정
  - Before: `/job-detail.html`
  - After: `/public/job-detail.html`

- [x] **Bug #2**: `upload.js:279` - removePhoto 로직 개선
  - Before: `.shift()` (무조건 첫 번째 제거)
  - After: photoId 파싱하여 정확한 사진 제거

- [x] **Bug #3**: `auth.js:79` - 리다이렉트 경로 일관성
  - Before: `/index.html`
  - After: `/public/index.html`

#### 4. Vite 설정 및 서버 (95% 완료)
- [x] Vite 5.0 설치
- [x] `vite.config.js` 생성
- [x] 네트워크 노출 설정 (`host: '0.0.0.0'`)
- [x] Root 경로 수정 (`root: 'src/public'`)
- [x] envDir 설정 추가
- [ ] **⚠️ 환경변수 로딩 문제 해결 중**

**현재 서버**:
- Local: http://localhost:3002
- Network: http://10.10.100.90:3002
- Status: 🟢 실행 중

#### 5. 테스트 (100% 완료)
- [x] Playwright 설정 (`playwright.config.cjs`)
- [x] 서버 체크 테스트 작성 (`tests/server-check.spec.cjs`)
- [x] Chromium 브라우저 설치
- [x] 테스트 실행: **9/9 통과**

**테스트 결과**:
```
✅ 9 passed (3.7s)
- Login page loaded
- Upload page loaded
- Gallery page loaded
- Static assets (2 stylesheets)
- Navigation structure
- Network access working
- Mobile meta tags
- JavaScript modules (2 console messages)
- Performance (1495ms)
```

#### 6. 문서화 (100% 완료)
- [x] `README.md` - 프로젝트 가이드
- [x] `docs/SECURITY.md` - 보안 상세 가이드
- [x] `docs/supabase_rls_policies.sql` - RLS SQL
- [x] `SECURITY_SETUP_COMPLETE.md` - 보안 작업 보고서
- [x] `BUGFIXES.md` - 버그 수정 내역
- [x] `NEXT_STEPS.md` - 다음 단계 가이드
- [x] `MOBILE_TESTING.md` - 모바일 테스트 가이드
- [x] `COMPLETION_REPORT.md` - 완료 보고서

---

## ⚠️ 현재 이슈 (Critical)

### Issue #1: 환경변수 로딩 실패
**증상**:
```
Uncaught Error: supabaseUrl is required.
    at auth.js:8:25
```

**원인**:
- Vite의 `root: 'src/public'` 설정으로 .env 파일 위치 변경
- `envDir: '../../'` 추가했으나 브라우저에서 여전히 undefined

**시도한 해결책**:
1. ✅ `envDir: '../../'` 추가 (vite.config.js)
2. ✅ 서버 재시작 (포트 3002)
3. ⏳ 브라우저에서 확인 필요

**다음 액션**:
```javascript
// config.js에 디버깅 코드 추가하여 확인
console.log('ENV Check:', {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV
});
```

### Issue #2: 서버 포트 중복
**현상**:
- 포트 3000, 3001, 3002에 서버 중복 실행
- 백그라운드 프로세스 정리 필요

**해결 방법**:
```bash
# 모든 Node 프로세스 종료
taskkill //F //IM node.exe

# 깨끗하게 재시작
npm run dev
```

---

## 📋 작업 완료 체크리스트

### Phase 0: 보안 강화
- [x] .env 파일 생성
- [x] config.js 수정
- [x] Vite 설정
- [x] 문서화

### Phase 1: Supabase RLS
- [x] SQL 작성
- [x] 보안 가이드 작성
- [ ] **⏳ SQL 실행 (사용자 수행 필요)**

### Phase 2: 버그 수정
- [x] gallery.html 경로 수정
- [x] upload.js removePhoto 수정
- [x] auth.js 리다이렉트 수정

### Phase 3: 테스트
- [x] Playwright 설정
- [x] 테스트 작성
- [x] 테스트 실행 (9/9 통과)

### Phase 4: 모바일 준비
- [x] 네트워크 노출 설정
- [x] 모바일 테스트 가이드 작성
- [ ] **⏳ 환경변수 로딩 수정**
- [ ] **⏳ 실제 모바일 테스트**

---

## 🚀 다음 단계 (우선순위)

### 즉시 (P0 - Critical)
1. **환경변수 로딩 문제 해결**
   - 브라우저 콘솔에서 `import.meta.env` 확인
   - 필요 시 절대 경로로 .env 파일 위치 지정
   - 또는 config.js에 임시 폴백 추가

2. **서버 프로세스 정리**
   - 중복 실행 중인 서버 종료
   - 단일 서버만 실행

3. **Supabase RLS 정책 적용**
   - Supabase Dashboard 접속
   - `docs/supabase_rls_policies.sql` 실행
   - 정책 활성화 확인

### 단기 (P1 - High)
4. **모바일 실제 테스트**
   - Google OAuth 로그인
   - 카메라 촬영
   - 사진 업로드
   - 갤러리 조회

5. **환경변수 검증**
   - PC 브라우저에서 확인
   - 모바일 브라우저에서 확인
   - 에러 로그 수집

### 중기 (P2 - Medium)
6. **이미지 압축 추가**
   - browser-image-compression 라이브러리
   - 10MB → 1-2MB 압축

7. **에러 처리 개선**
   - Toastify 알림 추가
   - 사용자 친화적 메시지

---

## 📊 진행률

**전체 진행률**: 85%

| 항목 | 진행률 | 상태 |
|------|--------|------|
| 보안 강화 | 100% | ✅ 완료 |
| RLS 정책 | 90% | ⏳ SQL 실행 대기 |
| 버그 수정 | 100% | ✅ 완료 |
| Vite 설정 | 95% | ⚠️ 환경변수 이슈 |
| 테스트 | 100% | ✅ 9/9 통과 |
| 문서화 | 100% | ✅ 완료 |
| 모바일 준비 | 70% | ⏳ 실제 테스트 필요 |

---

## 🔗 관련 문서

- [README.md](../../README.md) - 프로젝트 가이드
- [SECURITY.md](../../docs/SECURITY.md) - 보안 설정
- [BUGFIXES.md](../../BUGFIXES.md) - 버그 수정 내역
- [NEXT_STEPS.md](../../NEXT_STEPS.md) - 다음 단계
- [MOBILE_TESTING.md](../../MOBILE_TESTING.md) - 모바일 테스트
- [COMPLETION_REPORT.md](../../COMPLETION_REPORT.md) - 완료 보고서

---

## 📝 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2025-01-12 | 0.1 | PRD 초안 작성 |
| 2025-01-12 | 0.2 | 보안 강화 완료 |
| 2025-01-12 | 0.3 | 버그 수정 완료 |
| 2025-01-12 | 0.4 | 테스트 9/9 통과 |
| 2025-01-12 | 0.5 | 환경변수 이슈 발견 |

---

## ⚡ Quick Actions

### 지금 바로 해야 할 것:

```bash
# 1. 서버 정리 및 재시작
taskkill //F //IM node.exe
cd d:\AI\claude01\contents-factory
npm run dev

# 2. 브라우저에서 확인
http://localhost:3000/index.html

# 3. 브라우저 콘솔에서 환경변수 확인
import.meta.env
```

### Supabase RLS 적용:
1. https://supabase.com/dashboard 접속
2. SQL Editor 클릭
3. `docs/supabase_rls_policies.sql` 내용 복사 & 실행

---

**마지막 업데이트**: 2025-01-12 18:55 KST
**현재 블로커**: 환경변수 로딩 문제
**다음 마일스톤**: 환경변수 수정 → 모바일 테스트 → 프로덕션 배포
