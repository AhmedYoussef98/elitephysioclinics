-- ============================================================
-- Clinic Settings — Working Hours
-- Run this in the Supabase SQL Editor AFTER schema.sql
-- ============================================================

CREATE TABLE public.clinic_settings (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week TEXT        NOT NULL UNIQUE
    CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  is_open     BOOLEAN     NOT NULL DEFAULT true,
  start_time  TIME,
  end_time    TIME,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clinic_settings_day ON public.clinic_settings (day_of_week);

-- Auto-update updated_at
CREATE TRIGGER on_clinic_settings_updated
  BEFORE UPDATE ON public.clinic_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read (booking form needs clinic hours)
CREATE POLICY "public_select_clinic_settings"
  ON public.clinic_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated (admin) can update
CREATE POLICY "admin_update_clinic_settings"
  ON public.clinic_settings FOR UPDATE
  TO authenticated
  USING (true);

-- Seed with current default hours
INSERT INTO public.clinic_settings (day_of_week, is_open, start_time, end_time) VALUES
  ('Monday',    true,  '16:30', '21:00'),
  ('Tuesday',   true,  '16:30', '21:00'),
  ('Wednesday', true,  '16:30', '21:00'),
  ('Thursday',  true,  '16:30', '21:00'),
  ('Friday',    true,  '16:30', '21:00'),
  ('Saturday',  true,  '08:00', '21:00'),
  ('Sunday',    false, NULL,    NULL);
