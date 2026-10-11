-- ==============================================================================
-- LEARNLOOT: CLOUD-ONLY DATABASE SETUP & FULL PERMISSIONS SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR TO MAKE YOUR PROJECT FULLY CLOUD-ONLY
-- ==============================================================================

-- 1. Ensure UUID extension is active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Make user_id nullable or defaulted so inserts succeed without auth.uid()
ALTER TABLE IF EXISTS public.study_logs ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS public.chapters ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS public.subjects ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS public.redemption_requests ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS public.user_settings ALTER COLUMN user_id DROP NOT NULL;

-- 3. Also ensure foreign keys subject_id in study_logs is nullable if not selected
ALTER TABLE IF EXISTS public.study_logs ALTER COLUMN subject_id DROP NOT NULL;

-- 4. Enable full access for public/anon key on all personal tracking tables
ALTER TABLE public.study_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings DISABLE ROW LEVEL SECURITY;

-- 5. Grant complete read/write/update/delete permissions to anon and authenticated roles
GRANT ALL ON TABLE public.study_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.chapters TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.subjects TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.redemption_requests TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_settings TO anon, authenticated, service_role;

-- 6. Insert initial subjects if empty
INSERT INTO public.subjects (id, name, code, color, icon, target_hours)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'General Studies', 'GS', '#6366F1', 'BookOpen', 50.0),
  ('22222222-2222-2222-2222-222222222222', 'Core Technical', 'TECH', '#10B981', 'Code', 50.0)
ON CONFLICT (id) DO NOTHING;
