-- Photo Factory - Supabase RLS Policies
-- Execute this SQL in Supabase SQL Editor
-- Last updated: 2025-01-12

-- ==============================================
-- 1. Enable RLS on tables
-- ==============================================

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 2. RLS Policies for 'jobs' table
-- ==============================================

-- Policy: Users can view their own jobs
CREATE POLICY "Users can view their own jobs"
ON jobs FOR SELECT
USING (auth.uid() = technician_id);

-- Policy: Users can insert their own jobs
CREATE POLICY "Users can insert their own jobs"
ON jobs FOR INSERT
WITH CHECK (auth.uid() = technician_id);

-- Policy: Users can update their own jobs
CREATE POLICY "Users can update their own jobs"
ON jobs FOR UPDATE
USING (auth.uid() = technician_id)
WITH CHECK (auth.uid() = technician_id);

-- Policy: Users can delete their own jobs
CREATE POLICY "Users can delete their own jobs"
ON jobs FOR DELETE
USING (auth.uid() = technician_id);

-- ==============================================
-- 3. RLS Policies for 'photos' table
-- ==============================================

-- Policy: Users can view photos from their jobs
CREATE POLICY "Users can view photos from their jobs"
ON photos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = photos.job_id
    AND jobs.technician_id = auth.uid()
  )
);

-- Policy: Users can insert photos to their jobs
CREATE POLICY "Users can insert photos to their jobs"
ON photos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = photos.job_id
    AND jobs.technician_id = auth.uid()
  )
);

-- Policy: Users can update photos from their jobs
CREATE POLICY "Users can update photos from their jobs"
ON photos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = photos.job_id
    AND jobs.technician_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = photos.job_id
    AND jobs.technician_id = auth.uid()
  )
);

-- Policy: Users can delete photos from their jobs
CREATE POLICY "Users can delete photos from their jobs"
ON photos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = photos.job_id
    AND jobs.technician_id = auth.uid()
  )
);

-- ==============================================
-- 4. Verification Queries
-- ==============================================

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('jobs', 'photos');

-- Verify all policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('jobs', 'photos')
ORDER BY tablename, cmd;

-- Test: Check current user
SELECT auth.uid() as current_user_id;

-- Test: Count jobs accessible by current user
SELECT COUNT(*) as my_jobs_count FROM jobs;

-- Test: Count photos accessible by current user
SELECT COUNT(*) as my_photos_count FROM photos;

-- ==============================================
-- 5. Optional: Helper Function for Job Number Generation
-- ==============================================

CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'WHL';
  date_part TEXT;
  sequence_part TEXT;
  max_sequence INT;
BEGIN
  -- Get current date in YYMMDD format
  date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');

  -- Get max sequence for today
  SELECT COALESCE(MAX(
    CASE
      WHEN job_number LIKE prefix || date_part || '%'
      THEN CAST(SUBSTRING(job_number FROM 10 FOR 3) AS INT)
      ELSE 0
    END
  ), 0) + 1
  INTO max_sequence
  FROM jobs
  WHERE created_at::DATE = CURRENT_DATE;

  -- Format sequence with leading zeros
  sequence_part := LPAD(max_sequence::TEXT, 3, '0');

  -- Return formatted job number
  RETURN prefix || date_part || sequence_part;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION generate_job_number() TO authenticated;

-- ==============================================
-- 6. Test RLS Policies
-- ==============================================

-- These tests should be run as a regular authenticated user, not as postgres superuser

-- Test 1: Insert a job (should succeed)
-- INSERT INTO jobs (job_number, work_date, car_model, technician_id, status)
-- VALUES (generate_job_number(), CURRENT_DATE, 'Test Car', auth.uid(), 'uploaded');

-- Test 2: Select only your jobs (should return your jobs only)
-- SELECT * FROM jobs;

-- Test 3: Try to select another user's job (should return empty)
-- SELECT * FROM jobs WHERE technician_id != auth.uid();

-- Test 4: Insert a photo to your job (should succeed)
-- INSERT INTO photos (job_id, category, cloudinary_url, thumbnail_url)
-- VALUES (
--   (SELECT id FROM jobs WHERE technician_id = auth.uid() LIMIT 1),
--   'photos',
--   'https://example.com/photo.jpg',
--   'https://example.com/thumb.jpg'
-- );

-- Test 5: Select photos (should return only photos from your jobs)
-- SELECT * FROM photos;

-- ==============================================
-- 7. Cleanup (Use with caution in production!)
-- ==============================================

-- To drop all policies if you need to recreate them:
-- DROP POLICY IF EXISTS "Users can view their own jobs" ON jobs;
-- DROP POLICY IF EXISTS "Users can insert their own jobs" ON jobs;
-- DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
-- DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;
-- DROP POLICY IF EXISTS "Users can view photos from their jobs" ON photos;
-- DROP POLICY IF EXISTS "Users can insert photos to their jobs" ON photos;
-- DROP POLICY IF EXISTS "Users can update photos from their jobs" ON photos;
-- DROP POLICY IF EXISTS "Users can delete photos from their jobs" ON photos;

-- ==============================================
-- END OF RLS POLICIES
-- ==============================================
