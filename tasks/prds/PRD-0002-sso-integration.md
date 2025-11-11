# PRD-0002: SSO 시스템 통합

**작성일**: 2025-11-11
**버전**: v1.0.0
**상태**: 계획
**우선순위**: High

---

## 📋 개요

Contents Factory를 기존 Google OAuth에서 중앙 집중식 SSO 시스템(garimto81/sso-system)으로 마이그레이션하여, 다중 애플리케이션 환경에서 단일 로그인으로 모든 앱에 접근 가능하도록 구현합니다.

---

## 🎯 목표

### 주요 목표
- ✅ **SSO 통합**: Contents Factory를 SSO 서버에 등록하고 OAuth 2.0 플로우 구현
- ✅ **DB 논리적 분리**: 단일 Supabase DB에서 app_id 기반 데이터 격리
- ✅ **인증 마이그레이션**: Google OAuth → SSO 서버 인증으로 전환
- ✅ **기존 데이터 보존**: 현재 사용자 데이터 마이그레이션

### 비즈니스 가치
- 사용자는 한 번의 로그인으로 모든 앱 사용 가능
- 중앙 집중식 사용자 관리
- 앱 간 권한 및 세션 공유

---

## 🏗️ 아키텍처

### 현재 구조 (AS-IS)

```
┌─────────────────────┐
│ Contents Factory    │
│  (Vercel)           │
│                     │
│  Google OAuth ──────┼────► Google
│  Supabase Auth      │
│  DB (Supabase)      │
└─────────────────────┘
```

### 목표 구조 (TO-BE)

```
┌─────────────────────┐         ┌─────────────────────┐
│ Contents Factory    │         │   SSO System        │
│  (Vercel)           │         │   (Express Server)  │
│                     │         │                     │
│  1. Redirect ───────┼────────►│  /api/v1/authorize  │
│                     │         │                     │
│  3. Auth Code ◄─────┼─────────│  2. Login           │
│                     │         │                     │
│  4. Token Exchange ─┼────────►│  /api/v1/token/     │
│                     │         │      exchange       │
│  5. JWT Token ◄─────┼─────────│                     │
│                     │         │                     │
│  6. Access API      │         └─────────────────────┘
│     with JWT        │                    │
│                     │                    │
└──────────┬──────────┘                    │
           │                               │
           ▼                               ▼
    ┌─────────────────────────────────────────┐
    │        Supabase (Shared DB)             │
    │                                         │
    │  profiles (users)                       │
    │  apps (registered applications)         │
    │  jobs (app_id = 'contents-factory')     │
    │  photos (app_id = 'contents-factory')   │
    └─────────────────────────────────────────┘
```

---

## 📊 데이터 모델 변경

### 1. 앱 등록 (SSO 시스템의 apps 테이블)

**SSO 서버 DB에 Contents Factory 등록**:

```sql
INSERT INTO apps (id, name, redirect_uri, app_secret, created_at)
VALUES (
  'contents-factory',
  'Contents Factory',
  'https://contents-factory.vercel.app/auth/callback',
  'generated_secret_key_here',  -- 생성 필요
  NOW()
);
```

### 2. DB 스키마 수정 (Contents Factory DB)

**기존 테이블에 app_id 컬럼 추가**:

```sql
-- jobs 테이블 수정
ALTER TABLE jobs
ADD COLUMN app_id TEXT DEFAULT 'contents-factory' NOT NULL;

-- photos 테이블 수정
ALTER TABLE photos
ADD COLUMN app_id TEXT DEFAULT 'contents-factory' NOT NULL;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_jobs_app_id ON jobs(app_id);
CREATE INDEX idx_photos_app_id ON photos(app_id);
CREATE INDEX idx_jobs_user_app ON jobs(user_id, app_id);
CREATE INDEX idx_photos_user_app ON photos(user_id, app_id);
```

### 3. RLS (Row Level Security) 정책 업데이트

```sql
-- jobs 테이블 RLS 정책
DROP POLICY IF EXISTS "Users can view their own jobs" ON jobs;
CREATE POLICY "Users can view their own jobs in this app"
ON jobs FOR SELECT
USING (
  auth.uid() = user_id
  AND app_id = 'contents-factory'
);

DROP POLICY IF EXISTS "Users can create their own jobs" ON jobs;
CREATE POLICY "Users can create their own jobs in this app"
ON jobs FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND app_id = 'contents-factory'
);

DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
CREATE POLICY "Users can update their own jobs in this app"
ON jobs FOR UPDATE
USING (
  auth.uid() = user_id
  AND app_id = 'contents-factory'
);

-- photos 테이블 RLS 정책 (동일 패턴)
DROP POLICY IF EXISTS "Users can view their own photos" ON photos;
CREATE POLICY "Users can view their own photos in this app"
ON photos FOR SELECT
USING (
  auth.uid() = user_id
  AND app_id = 'contents-factory'
);

DROP POLICY IF EXISTS "Users can create their own photos" ON photos;
CREATE POLICY "Users can create their own photos in this app"
ON photos FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND app_id = 'contents-factory'
);

DROP POLICY IF EXISTS "Users can update their own photos" ON photos;
CREATE POLICY "Users can update their own photos in this app"
ON photos FOR UPDATE
USING (
  auth.uid() = user_id
  AND app_id = 'contents-factory'
);
```

---

## 🔐 인증 플로우 구현

### OAuth 2.0 Authorization Code Flow

**1단계: 로그인 버튼 클릭** (`src/public/login.html`)

```javascript
// AS-IS: Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});

// TO-BE: SSO 리다이렉트
function loginWithSSO() {
  const ssoUrl = 'https://sso.yourdomain.com/api/v1/authorize';
  const params = new URLSearchParams({
    app_id: 'contents-factory',
    redirect_uri: 'https://contents-factory.vercel.app/auth/callback',
    state: generateRandomState()  // CSRF 방지
  });

  // state를 localStorage에 저장 (CSRF 검증용)
  localStorage.setItem('sso_state', params.get('state'));

  // SSO 서버로 리다이렉트
  window.location.href = `${ssoUrl}?${params.toString()}`;
}
```

**2단계: 사용자가 SSO 서버에서 로그인**

- SSO 서버에서 이메일/비밀번호 입력
- SSO 서버가 사용자 인증 완료

**3단계: 콜백 처리** (새 파일: `src/public/auth/callback.html`)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>로그인 중...</title>
</head>
<body>
  <div style="text-align: center; padding: 50px;">
    <h2>로그인 처리 중...</h2>
    <p>잠시만 기다려주세요.</p>
  </div>

  <script type="module">
    import { SSO_CONFIG } from '/js/config.js';
    import { supabase } from '/js/auth.js';

    async function handleCallback() {
      try {
        // URL에서 authorization code 추출
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        // 에러 체크
        if (error) {
          throw new Error(`SSO 오류: ${error}`);
        }

        // CSRF 검증
        const savedState = localStorage.getItem('sso_state');
        if (state !== savedState) {
          throw new Error('잘못된 state 값 (CSRF 공격 의심)');
        }
        localStorage.removeItem('sso_state');

        if (!code) {
          throw new Error('Authorization code가 없습니다');
        }

        // 4단계: Token Exchange
        const tokenResponse = await fetch(`${SSO_CONFIG.API_URL}/api/v1/token/exchange`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: code,
            app_id: SSO_CONFIG.APP_ID,
            app_secret: SSO_CONFIG.APP_SECRET
          })
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          throw new Error(`토큰 교환 실패: ${errorData.error}`);
        }

        const { access_token, refresh_token, expires_in } = await tokenResponse.json();

        // 5단계: Supabase 세션 설정
        const { data: session, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token
        });

        if (sessionError) {
          throw sessionError;
        }

        console.log('✅ SSO 로그인 성공:', session.user.email);

        // 6단계: 메인 페이지로 리다이렉트
        window.location.href = '/';

      } catch (error) {
        console.error('❌ SSO 콜백 처리 실패:', error);
        alert(`로그인 실패: ${error.message}`);
        window.location.href = '/login.html';
      }
    }

    // 페이지 로드 시 실행
    handleCallback();
  </script>
</body>
</html>
```

---

## 📝 파일 수정 목록

### 1. 환경 설정 (`src/js/config.js`)

```javascript
// SSO 설정 추가
export const SSO_CONFIG = {
  API_URL: import.meta.env.SSO_API_URL || 'https://sso.yourdomain.com',
  APP_ID: 'contents-factory',
  APP_SECRET: import.meta.env.SSO_APP_SECRET,  // 보안: 환경 변수로 관리
  CALLBACK_URI: import.meta.env.SSO_CALLBACK_URI ||
                'https://contents-factory.vercel.app/auth/callback'
};

// 기존 Supabase 설정 유지
export const SUPABASE_URL = import.meta.env.SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY;
// ...
```

### 2. 로그인 페이지 (`src/public/login.html`)

**변경 전**:
```javascript
// Google OAuth 버튼
document.getElementById('googleLoginBtn').addEventListener('click', async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/upload.html'
    }
  });
  // ...
});
```

**변경 후**:
```javascript
// SSO 로그인 버튼
document.getElementById('ssoLoginBtn').addEventListener('click', () => {
  loginWithSSO();
});

function loginWithSSO() {
  const state = crypto.randomUUID();
  localStorage.setItem('sso_state', state);

  const params = new URLSearchParams({
    app_id: SSO_CONFIG.APP_ID,
    redirect_uri: SSO_CONFIG.CALLBACK_URI,
    state: state
  });

  window.location.href = `${SSO_CONFIG.API_URL}/api/v1/authorize?${params}`;
}
```

**HTML 버튼 수정**:
```html
<!-- AS-IS -->
<button id="googleLoginBtn" class="btn btn-primary btn-lg">
  <i class="bi bi-google"></i> Google로 로그인
</button>

<!-- TO-BE -->
<button id="ssoLoginBtn" class="btn btn-primary btn-lg">
  <i class="bi bi-shield-lock"></i> SSO 로그인
</button>
```

### 3. 인증 모듈 (`src/js/auth.js`)

**JWT 토큰 검증 함수 추가**:
```javascript
import { SSO_CONFIG } from './config.js';

// 기존 Supabase 클라이언트 유지
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// SSO JWT 토큰 검증
export async function validateSSOToken() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return false;
  }

  // JWT 만료 시간 확인
  const token = session.access_token;
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiresAt = payload.exp * 1000;  // 밀리초로 변환

  if (Date.now() > expiresAt) {
    console.log('⏰ 토큰 만료, 갱신 필요');
    return await refreshSSOToken(session.refresh_token);
  }

  return true;
}

// SSO 토큰 갱신
export async function refreshSSOToken(refreshToken) {
  try {
    const response = await fetch(`${SSO_CONFIG.API_URL}/api/v1/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
        app_id: SSO_CONFIG.APP_ID
      })
    });

    if (!response.ok) {
      throw new Error('토큰 갱신 실패');
    }

    const { access_token, refresh_token } = await response.json();

    await supabase.auth.setSession({
      access_token,
      refresh_token
    });

    return true;
  } catch (error) {
    console.error('❌ 토큰 갱신 실패:', error);
    return false;
  }
}

// 로그아웃 (SSO 서버에도 알림)
export async function logout() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    // SSO 서버에 로그아웃 요청
    try {
      await fetch(`${SSO_CONFIG.API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('SSO 로그아웃 실패:', error);
    }
  }

  // Supabase 세션 종료
  await supabase.auth.signOut();
  window.location.href = '/login.html';
}
```

### 4. 업로드 페이지 (`src/public/upload.html`)

**인증 체크 로직 수정**:
```javascript
import { validateSSOToken } from '/js/auth.js';

// 페이지 로드 시 인증 확인
async function checkAuth() {
  const isValid = await validateSSOToken();

  if (!isValid) {
    alert('로그인이 필요합니다');
    window.location.href = '/login.html';
    return;
  }

  // 인증 완료 후 페이지 초기화
  initializePage();
}

checkAuth();
```

### 5. 데이터베이스 쿼리 수정 (모든 페이지)

**app_id 필드 추가**:
```javascript
// AS-IS: jobs 생성
const { data, error } = await supabase
  .from('jobs')
  .insert({
    job_number: jobNumber,
    user_id: user.id,
    status: 'active'
  });

// TO-BE: app_id 추가
const { data, error } = await supabase
  .from('jobs')
  .insert({
    job_number: jobNumber,
    user_id: user.id,
    app_id: 'contents-factory',  // ✅ 추가
    status: 'active'
  });
```

---

## 🗄️ 데이터베이스 마이그레이션

### 마이그레이션 스크립트 (`sql/02_sso_migration.sql`)

```sql
-- ============================================
-- Contents Factory SSO 통합 마이그레이션
-- 버전: v1.0.0
-- 작성일: 2025-11-11
-- ============================================

-- 1. app_id 컬럼 추가
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS app_id TEXT DEFAULT 'contents-factory' NOT NULL;

ALTER TABLE photos
ADD COLUMN IF NOT EXISTS app_id TEXT DEFAULT 'contents-factory' NOT NULL;

-- 2. 기존 데이터에 app_id 설정 (이미 DEFAULT로 설정됨)
-- UPDATE jobs SET app_id = 'contents-factory' WHERE app_id IS NULL;
-- UPDATE photos SET app_id = 'contents-factory' WHERE app_id IS NULL;

-- 3. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_jobs_app_id ON jobs(app_id);
CREATE INDEX IF NOT EXISTS idx_photos_app_id ON photos(app_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_app ON jobs(user_id, app_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_app ON photos(user_id, app_id);

-- 4. RLS 정책 업데이트 - jobs 테이블
DROP POLICY IF EXISTS "Users can view their own jobs" ON jobs;
CREATE POLICY "Users can view their own jobs in this app"
ON jobs FOR SELECT
USING (
  auth.uid() = user_id
  AND app_id = 'contents-factory'
);

DROP POLICY IF EXISTS "Users can create their own jobs" ON jobs;
CREATE POLICY "Users can create their own jobs in this app"
ON jobs FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND app_id = 'contents-factory'
);

DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
CREATE POLICY "Users can update their own jobs in this app"
ON jobs FOR UPDATE
USING (
  auth.uid() = user_id
  AND app_id = 'contents-factory'
);

DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;
CREATE POLICY "Users can delete their own jobs in this app"
ON jobs FOR DELETE
USING (
  auth.uid() = user_id
  AND app_id = 'contents-factory'
);

-- 5. RLS 정책 업데이트 - photos 테이블
DROP POLICY IF EXISTS "Users can view their own photos" ON photos;
CREATE POLICY "Users can view their own photos in this app"
ON photos FOR SELECT
USING (
  auth.uid() = user_id
  AND app_id = 'contents-factory'
);

DROP POLICY IF EXISTS "Users can create their own photos" ON photos;
CREATE POLICY "Users can create their own photos in this app"
ON photos FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND app_id = 'contents-factory'
);

DROP POLICY IF EXISTS "Users can update their own photos" ON photos;
CREATE POLICY "Users can update their own photos in this app"
ON photos FOR UPDATE
USING (
  auth.uid() = user_id
  AND app_id = 'contents-factory'
);

DROP POLICY IF EXISTS "Users can delete their own photos" ON photos;
CREATE POLICY "Users can delete their own photos in this app"
ON photos FOR DELETE
USING (
  auth.uid() = user_id
  AND app_id = 'contents-factory'
);

-- 6. 마이그레이션 완료 확인
DO $$
BEGIN
  RAISE NOTICE '✅ SSO 마이그레이션 완료';
  RAISE NOTICE '   - app_id 컬럼 추가됨';
  RAISE NOTICE '   - 인덱스 생성됨';
  RAISE NOTICE '   - RLS 정책 업데이트됨';
END $$;
```

---

## 🔧 환경 변수 설정

### Vercel 환경 변수 추가

**Vercel Dashboard → Settings → Environment Variables**:

```bash
# 기존 환경 변수 유지
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=photo-factory

# 새로 추가할 SSO 환경 변수
SSO_API_URL=https://sso.yourdomain.com
SSO_APP_SECRET=your_app_secret_from_sso_system
SSO_CALLBACK_URI=https://contents-factory.vercel.app/auth/callback
```

### `.env.example` 업데이트

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=photo-factory

# SSO System (NEW)
SSO_API_URL=https://sso.yourdomain.com
SSO_APP_SECRET=your_app_secret_here
SSO_CALLBACK_URI=http://localhost:8000/auth/callback
```

---

## 📋 구현 단계

### Phase 0: 준비 (1일)
- [ ] SSO 시스템에 Contents Factory 앱 등록
- [ ] `app_secret` 생성 및 환경 변수 설정
- [ ] PRD 문서 검토 및 승인

### Phase 1: DB 마이그레이션 (1일)
- [ ] `sql/02_sso_migration.sql` 스크립트 작성
- [ ] 로컬 Supabase에서 마이그레이션 테스트
- [ ] 프로덕션 Supabase에서 마이그레이션 실행
- [ ] RLS 정책 동작 확인

### Phase 2: 인증 로직 구현 (2일)
- [ ] `src/js/config.js` - SSO 설정 추가
- [ ] `src/public/auth/callback.html` - 콜백 페이지 생성
- [ ] `src/js/auth.js` - SSO 인증 함수 구현
  - `validateSSOToken()`
  - `refreshSSOToken()`
  - `logout()`
- [ ] 로컬 테스트 (Mock SSO 서버 사용)

### Phase 3: 프론트엔드 수정 (2일)
- [ ] `src/public/login.html` - SSO 로그인 버튼으로 변경
- [ ] `src/public/upload.html` - SSO 토큰 검증 추가
- [ ] `src/public/gallery.html` - SSO 토큰 검증 추가
- [ ] `src/public/job-detail.html` - SSO 토큰 검증 추가
- [ ] 모든 DB 쿼리에 `app_id: 'contents-factory'` 추가

### Phase 4: Vercel 설정 (1일)
- [ ] `vercel.json` - `/auth/callback` 라우팅 추가
- [ ] Vercel 환경 변수 설정 (SSO_API_URL, SSO_APP_SECRET)
- [ ] 배포 테스트

### Phase 5: 통합 테스트 (2일)
- [ ] 로그인 플로우 전체 테스트
- [ ] 토큰 갱신 테스트
- [ ] 로그아웃 테스트
- [ ] 데이터 격리 테스트 (app_id 기준)
- [ ] 모바일 브라우저 테스트

### Phase 6: 프로덕션 배포 (1일)
- [ ] PR 생성 및 코드 리뷰
- [ ] 프로덕션 배포
- [ ] 모니터링 및 버그 수정

**총 예상 기간**: 10일

---

## ✅ 테스트 계획

### 1. 인증 플로우 테스트

| 테스트 케이스 | 예상 결과 |
|--------------|----------|
| SSO 로그인 버튼 클릭 | SSO 서버로 리다이렉트 |
| SSO 서버에서 로그인 | Authorization code와 함께 콜백 |
| 콜백 페이지에서 토큰 교환 | JWT 토큰 획득 및 Supabase 세션 설정 |
| 메인 페이지 접속 | 인증된 사용자로 페이지 로드 |
| 토큰 만료 후 페이지 접속 | 자동으로 토큰 갱신 |
| 로그아웃 | SSO 서버 및 Supabase 세션 모두 종료 |

### 2. 데이터 격리 테스트

| 테스트 케이스 | 예상 결과 |
|--------------|----------|
| Contents Factory에서 job 생성 | `app_id = 'contents-factory'` |
| 다른 앱에서 같은 user_id로 job 조회 | Contents Factory의 job이 보이지 않음 |
| RLS 정책 우회 시도 | 403 Forbidden 오류 |

### 3. 에러 처리 테스트

| 테스트 케이스 | 예상 결과 |
|--------------|----------|
| 잘못된 authorization code | 토큰 교환 실패, 로그인 페이지로 리다이렉트 |
| 만료된 authorization code | 오류 메시지 표시, 재로그인 요청 |
| 잘못된 state 값 (CSRF) | 오류 메시지 표시, 로그인 페이지로 리다이렉트 |
| SSO 서버 다운 | 사용자 친화적인 오류 메시지 |

---

## 🚨 위험 요소 및 대응

| 위험 요소 | 영향도 | 대응 방안 |
|----------|--------|----------|
| SSO 서버 장애 시 모든 앱 로그인 불가 | High | SSO 서버 이중화, Health Check 모니터링 |
| 토큰 갱신 실패 시 사용자 세션 끊김 | Medium | Refresh Token 자동 재시도, 실패 시 재로그인 안내 |
| DB 마이그레이션 중 데이터 손실 | High | 마이그레이션 전 백업, 롤백 스크립트 준비 |
| 기존 사용자 데이터 마이그레이션 실패 | Medium | `app_id` DEFAULT 값으로 자동 설정 |
| CORS 오류로 SSO API 호출 실패 | Low | SSO 서버에 Contents Factory 도메인 화이트리스트 추가 |

---

## 📚 참고 문서

- [SSO System Repository](https://github.com/garimto81/sso-system)
- [SSO API Reference](https://github.com/garimto81/sso-system/blob/master/docs/api-reference.md)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

## 📝 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0.0 | 2025-11-11 | 초안 작성 - SSO 통합 계획 수립 |

---

**승인 필요**: 사용자 확인 후 구현 시작
