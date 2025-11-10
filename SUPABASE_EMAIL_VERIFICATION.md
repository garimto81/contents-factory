# 📧 Supabase 이메일 검증 설정 가이드

Photo Factory - Google OAuth 이메일 검증 활성화

---

## 🎯 목적

Google 로그인 시 이메일 검증을 강제하여 보안을 강화합니다.

---

## 📋 설정 방법

### 1단계: Supabase Dashboard 접속

```
https://supabase.com/dashboard/project/nuecesgtciziaotdmfhp
```

---

### 2단계: Authentication 설정

```
왼쪽 메뉴 → Authentication → Settings
```

---

### 3단계: Email Confirmation 활성화

**Confirm email** 섹션에서:

✅ **Enable email confirmations** 체크

**설정**:
```
✅ Confirm email
   사용자는 이메일을 확인해야 로그인할 수 있습니다
```

---

### 4단계: Google Provider 설정 확인

```
Authentication → Providers → Google
```

**Skip nonce check** (선택사항):
- ✅ 체크 해제 (보안 강화)

---

## 🔧 작동 방식

### Google 로그인 플로우

```
1. 사용자가 "구글로 시작하기" 클릭
2. Google 계정 선택
3. ✅ 이메일 자동 검증 (Google이 이미 검증함)
4. Supabase로 리디렉션
5. 로그인 완료 → /public/upload.html
```

### 이메일 검증 상태

**Google OAuth 사용 시**:
- ✅ **자동 검증**: Google에서 이미 이메일을 검증했으므로 추가 검증 불필요
- `email_confirmed_at` 자동 설정

**일반 이메일/비밀번호 가입 시** (향후):
- 📧 검증 이메일 발송
- 사용자가 링크 클릭하여 확인
- 확인 후 로그인 가능

---

## 📊 데이터베이스 확인

### users 테이블 (auth.users)

```sql
SELECT
  email,
  email_confirmed_at,
  created_at
FROM auth.users;
```

**결과**:
```
email                    | email_confirmed_at      | created_at
-------------------------|-------------------------|-------------------
user@gmail.com          | 2025-01-07 12:00:00    | 2025-01-07 12:00:00
```

---

## 🚫 미검증 사용자 차단

### RLS 정책에 이메일 검증 조건 추가 (선택사항)

```sql
-- jobs 테이블 RLS 정책 수정
CREATE POLICY "Only verified users can insert jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    auth.uid() = technician_id
    AND
    (SELECT email_confirmed_at FROM auth.users WHERE id = auth.uid()) IS NOT NULL
  );
```

---

## ✅ 테스트

### 1. 신규 사용자 로그인
```
1. 시크릿 모드로 http://10.10.100.90:8080/public/index.html 접속
2. "구글로 시작하기" 클릭
3. Google 계정 선택
4. ✅ 즉시 로그인 (이메일 이미 검증됨)
```

### 2. Dashboard에서 확인
```
Supabase Dashboard → Authentication → Users
→ 새 사용자의 "Email Confirmed" 확인
```

---

## 🔐 보안 설정

### 추가 보안 옵션

**Email Rate Limits** (이메일 발송 제한):
```
Authentication → Settings → Rate Limits
→ Maximum emails per hour: 3
```

**Session Settings** (세션 시간):
```
JWT expiry time: 3600 (1시간)
Refresh token expiry time: 2592000 (30일)
```

---

## 📧 이메일 템플릿 커스터마이징 (향후)

```
Authentication → Email Templates
→ Confirm signup
```

**기본 템플릿**:
```html
<h2>이메일 주소 확인</h2>
<p>아래 링크를 클릭하여 이메일을 확인하세요:</p>
<a href="{{ .ConfirmationURL }}">이메일 확인</a>
```

---

## 🎯 현재 Photo Factory 설정

### Google OAuth 전용
- ✅ **이메일 자동 검증**: Google OAuth 사용 시 자동
- ✅ **추가 설정 불필요**: 현재 구현으로 충분

### 향후 확장 시
- 📧 이메일/비밀번호 가입 추가
- 📧 검증 이메일 발송 기능
- 📧 이메일 템플릿 커스터마이징

---

## 📞 문제 해결

### "이메일이 확인되지 않았습니다"
→ Google OAuth 사용 시 자동 확인됨. Dashboard에서 확인

### "검증 이메일이 오지 않습니다"
→ Google OAuth는 이메일 발송 불필요 (자동 검증)

### "로그인 후 즉시 로그아웃됨"
→ RLS 정책에서 `email_confirmed_at` 조건 제거

---

## ✅ 권장 설정 (현재)

```
✅ Enable email confirmations: ON
✅ Google OAuth: Enabled
✅ Skip nonce check: OFF
✅ JWT expiry: 3600 (1시간)
✅ Refresh token expiry: 2592000 (30일)
```

---

**이메일 검증 설정 완료!** 📧✅
