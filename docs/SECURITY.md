# Photo Factory - Security Guide

## 🔐 보안 구성

### 1. Environment Variables (.env)

**설정 방법:**
```bash
# 1. .env.example을 복사
cp .env.example .env

# 2. 실제 API 키 입력
# - Supabase: https://supabase.com/dashboard/project/_/settings/api
# - Cloudinary: https://console.cloudinary.com/
```

**주의사항:**
- ❌ `.env` 파일을 Git에 커밋하지 마세요
- ✅ `.env.example`만 커밋하세요
- ✅ 프로덕션 환경에서는 호스팅 플랫폼의 환경변수 설정 사용

---

## 🛡️ Supabase Row Level Security (RLS)

### 개요
RLS는 데이터베이스 레벨에서 사용자별 데이터 접근을 제어합니다.

### 필수 정책

#### 1. **jobs 테이블** (작업 정보)
- ✅ 사용자는 자신의 작업만 조회 가능
- ✅ 사용자는 자신의 작업만 생성 가능
- ✅ 사용자는 자신의 작업만 수정/삭제 가능

#### 2. **photos 테이블** (사진 메타데이터)
- ✅ 사용자는 자신의 작업에 속한 사진만 조회 가능
- ✅ 사용자는 자신의 작업에만 사진 추가 가능
- ✅ 사용자는 자신의 사진만 삭제 가능

---

## 📋 RLS 정책 적용 방법

### Option 1: Supabase Dashboard
1. [Supabase Dashboard](https://supabase.com/dashboard) 로그인
2. 프로젝트 선택 → **Authentication** → **Policies**
3. `jobs` 테이블 선택 → **Enable RLS**
4. **New Policy** 클릭 후 아래 SQL 입력

### Option 2: SQL Editor
1. Supabase Dashboard → **SQL Editor**
2. `/docs/supabase_rls_policies.sql` 파일 내용 복사
3. **Run** 실행

---

## 🔍 RLS 정책 상세

### jobs 테이블

#### SELECT (조회)
```sql
-- 사용자는 자신이 생성한 작업만 조회 가능
CREATE POLICY "Users can view their own jobs"
ON jobs FOR SELECT
USING (auth.uid() = technician_id);
```

#### INSERT (생성)
```sql
-- 사용자는 자신의 작업만 생성 가능
CREATE POLICY "Users can insert their own jobs"
ON jobs FOR INSERT
WITH CHECK (auth.uid() = technician_id);
```

#### UPDATE (수정)
```sql
-- 사용자는 자신의 작업만 수정 가능
CREATE POLICY "Users can update their own jobs"
ON jobs FOR UPDATE
USING (auth.uid() = technician_id);
```

#### DELETE (삭제)
```sql
-- 사용자는 자신의 작업만 삭제 가능
CREATE POLICY "Users can delete their own jobs"
ON jobs FOR DELETE
USING (auth.uid() = technician_id);
```

---

### photos 테이블

#### SELECT (조회)
```sql
-- 사용자는 자신의 작업에 속한 사진만 조회 가능
CREATE POLICY "Users can view photos from their jobs"
ON photos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = photos.job_id
    AND jobs.technician_id = auth.uid()
  )
);
```

#### INSERT (생성)
```sql
-- 사용자는 자신의 작업에만 사진 추가 가능
CREATE POLICY "Users can insert photos to their jobs"
ON photos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = photos.job_id
    AND jobs.technician_id = auth.uid()
  )
);
```

#### DELETE (삭제)
```sql
-- 사용자는 자신의 작업에 속한 사진만 삭제 가능
CREATE POLICY "Users can delete photos from their jobs"
ON photos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = photos.job_id
    AND jobs.technician_id = auth.uid()
  )
);
```

---

## ✅ RLS 정책 테스트

### 1. Supabase SQL Editor에서 테스트
```sql
-- 현재 사용자 확인
SELECT auth.uid();

-- 현재 사용자의 작업만 조회되는지 확인
SELECT * FROM jobs;

-- 다른 사용자의 작업 접근 시도 (실패해야 정상)
SELECT * FROM jobs WHERE technician_id != auth.uid();
```

### 2. 애플리케이션에서 테스트
1. 두 개의 다른 Google 계정으로 로그인
2. 각각 작업 생성
3. 각 계정에서 자신의 작업만 보이는지 확인

---

## 🚨 보안 체크리스트

### 개발 환경
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] `.env.example`에 실제 키가 없는지 확인
- [ ] `config.js`에 하드코딩된 API 키가 없는지 확인

### Supabase 설정
- [ ] RLS가 `jobs` 테이블에 활성화되어 있는지 확인
- [ ] RLS가 `photos` 테이블에 활성화되어 있는지 확인
- [ ] 모든 정책이 적용되었는지 확인 (SELECT, INSERT, UPDATE, DELETE)

### Cloudinary 설정
- [ ] Upload Preset이 **unsigned**로 설정되어 있는지 확인
- [ ] 폴더 제한이 설정되어 있는지 확인 (`photo-factory` 폴더만 허용)
- [ ] 파일 크기 제한 설정 확인 (10MB)

### 프로덕션 배포
- [ ] 호스팅 플랫폼에서 환경변수 설정
- [ ] HTTPS 강제 적용
- [ ] CORS 정책 확인
- [ ] Rate Limiting 설정

---

## 📚 참고 자료

- [Supabase RLS 공식 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [Cloudinary Security Best Practices](https://cloudinary.com/documentation/upload_images#security)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## 🆘 문제 해결

### RLS 정책 적용 후 데이터가 안 보일 때
```sql
-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename IN ('jobs', 'photos');

-- 현재 사용자 확인
SELECT auth.uid();

-- jobs 테이블의 technician_id 확인
SELECT id, job_number, technician_id FROM jobs;
```

### 환경변수가 undefined일 때
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. Vite 서버를 재시작 (`npm run dev`)
3. 변수 이름이 `VITE_` 접두사로 시작하는지 확인

---

**마지막 업데이트:** 2025-01-12
