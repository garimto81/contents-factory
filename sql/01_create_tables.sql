-- Photo Factory MVP Database Schema
-- Supabase PostgreSQL
-- Created: 2025-01-12

-- =====================================================
-- 1. jobs 테이블 (작업 관리)
-- =====================================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number TEXT UNIQUE NOT NULL,          -- 'WHL001', 'WHL002'...
  created_at TIMESTAMP DEFAULT NOW(),
  work_date DATE NOT NULL,                  -- 작업일
  car_model TEXT NOT NULL,                  -- '제네시스 G80'
  work_type TEXT DEFAULT '휠 복원',         -- 작업 유형
  technician_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'uploaded',           -- 'uploaded', 'processing', 'published'

  -- 메타데이터
  location TEXT,                            -- '강남구'
  notes TEXT,

  -- 타임스탬프
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_jobs_date ON jobs(work_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_technician ON jobs(technician_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- =====================================================
-- 2. photos 테이블 (사진 메타데이터)
-- =====================================================
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  category TEXT NOT NULL,                   -- 'before_car', 'before_wheel', 'during', 'after_wheel', 'after_car'
  cloudinary_url TEXT NOT NULL,             -- 'https://res.cloudinary.com/...'
  cloudinary_public_id TEXT,                -- Cloudinary 삭제/변환용 ID
  thumbnail_url TEXT,                       -- Cloudinary 썸네일 URL
  file_size INTEGER,                        -- 파일 크기 (bytes)
  uploaded_at TIMESTAMP DEFAULT NOW(),
  sequence INTEGER DEFAULT 1,               -- 카테고리 내 순서 (1, 2, 3...)

  -- 복합 제약조건: 같은 job에서 카테고리+순서 중복 방지
  UNIQUE(job_id, category, sequence)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_photos_job ON photos(job_id);
CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category);

-- =====================================================
-- 3. Row Level Security (RLS) 정책
-- =====================================================

-- jobs 테이블 RLS 활성화
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 정책 1: 사용자는 본인 작업만 조회 가능
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = technician_id);

-- 정책 2: 사용자는 본인 작업만 생성 가능
CREATE POLICY "Users can insert own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = technician_id);

-- 정책 3: 사용자는 본인 작업만 수정 가능
CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = technician_id)
  WITH CHECK (auth.uid() = technician_id);

-- photos 테이블 RLS 활성화
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 정책 4: 사용자는 본인 작업의 사진만 조회
CREATE POLICY "Users can view own photos"
  ON photos FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM jobs WHERE technician_id = auth.uid()
    )
  );

-- 정책 5: 사용자는 본인 작업에만 사진 추가
CREATE POLICY "Users can insert own photos"
  ON photos FOR INSERT
  WITH CHECK (
    job_id IN (
      SELECT id FROM jobs WHERE technician_id = auth.uid()
    )
  );

-- 정책 6: 사용자는 본인 사진만 삭제
CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE
  USING (
    job_id IN (
      SELECT id FROM jobs WHERE technician_id = auth.uid()
    )
  );

-- =====================================================
-- 4. 유틸리티 함수
-- =====================================================

-- 작업번호 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  new_number TEXT;
BEGIN
  -- 오늘 날짜의 작업 개수 조회
  SELECT COUNT(*) + 1 INTO next_num
  FROM jobs
  WHERE DATE(created_at) = CURRENT_DATE;

  -- WHL + YYMMDD + 시퀀스
  new_number := 'WHL' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || LPAD(next_num::TEXT, 3, '0');

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 5. 초기 데이터 (테스트용, 선택)
-- =====================================================

-- 샘플 작업 (실제 운영 시 삭제)
-- INSERT INTO jobs (job_number, work_date, car_model, location, technician_id)
-- VALUES ('WHL001', CURRENT_DATE, '제네시스 G80', '강남구', auth.uid());

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Photo Factory 데이터베이스 스키마 생성 완료!';
  RAISE NOTICE '📊 생성된 테이블: jobs, photos';
  RAISE NOTICE '🔐 RLS 정책: 6개 활성화';
  RAISE NOTICE '⚡ 인덱스: 5개 생성';
  RAISE NOTICE '🔧 유틸리티 함수: 2개';
END $$;
