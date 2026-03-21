-- ============================================================
-- Elite Physio Clinics — Supabase Database Schema
-- ============================================================
-- Run this ENTIRE script in the Supabase SQL Editor (one go).
-- It creates all tables, indexes, RLS policies, and functions.
-- ============================================================


-- ============================================================
-- 1. TABLES
-- ============================================================

-- Appointments: stores every patient booking
CREATE TABLE public.appointments (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_reference TEXT      UNIQUE NOT NULL,
  patient_name    TEXT        NOT NULL,
  patient_phone   TEXT        NOT NULL,
  patient_email   TEXT        NOT NULL,
  condition_slug  TEXT        NOT NULL
    CHECK (condition_slug IN (
      'back-pain-sciatica',
      'neck-pain-whiplash',
      'arthritis',
      'sports-injuries',
      'work-related-injury',
      'muscle-tendon-ligament',
      'ankle-knee',
      'frozen-shoulder',
      'tennis-elbow',
      'post-surgery-rehab',
      'disc-prolapses',
      'other'
    )),
  condition_title TEXT        NOT NULL,
  date            DATE        NOT NULL,
  start_time      TIME        NOT NULL,
  end_time        TIME        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'cancelled', 'completed', 'rescheduled')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent double-booking: only one active (non-cancelled) appointment per slot
CREATE UNIQUE INDEX idx_unique_active_slot
  ON public.appointments (date, start_time)
  WHERE status NOT IN ('cancelled');

-- Performance indexes
CREATE INDEX idx_appointments_date        ON public.appointments (date);
CREATE INDEX idx_appointments_status      ON public.appointments (status);
CREATE INDEX idx_appointments_date_status ON public.appointments (date, status);


-- Blocked Periods: full days the clinic is closed (vacation, holidays)
CREATE TABLE public.blocked_periods (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  start_date  DATE        NOT NULL,
  end_date    DATE        NOT NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE INDEX idx_blocked_periods_dates
  ON public.blocked_periods (start_date, end_date);


-- Blocked Slots: individual time slots manually blocked
CREATE TABLE public.blocked_slots (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  date        DATE        NOT NULL,
  start_time  TIME        NOT NULL,
  end_time    TIME        NOT NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_blocked_slot UNIQUE (date, start_time)
);

CREATE INDEX idx_blocked_slots_date ON public.blocked_slots (date);


-- ============================================================
-- 2. AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_appointments_updated
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.appointments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots   ENABLE ROW LEVEL SECURITY;

-- ----- APPOINTMENTS -----

-- Anonymous users can create bookings (INSERT only)
CREATE POLICY "anon_insert_appointments"
  ON public.appointments FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated (admin) has full access
CREATE POLICY "admin_select_appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admin_insert_appointments"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "admin_update_appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "admin_delete_appointments"
  ON public.appointments FOR DELETE
  TO authenticated
  USING (true);

-- NOTE: Anonymous users CANNOT read appointments (protects patient PII).
-- Availability checking is done through database functions (see below).

-- ----- BLOCKED PERIODS -----

-- Anyone can read blocked periods (booking form needs to show blocked dates)
CREATE POLICY "public_select_blocked_periods"
  ON public.blocked_periods FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "admin_insert_blocked_periods"
  ON public.blocked_periods FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "admin_update_blocked_periods"
  ON public.blocked_periods FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "admin_delete_blocked_periods"
  ON public.blocked_periods FOR DELETE
  TO authenticated
  USING (true);

-- ----- BLOCKED SLOTS -----

-- Anyone can read blocked slots (booking form needs to show unavailable slots)
CREATE POLICY "public_select_blocked_slots"
  ON public.blocked_slots FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "admin_insert_blocked_slots"
  ON public.blocked_slots FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "admin_update_blocked_slots"
  ON public.blocked_slots FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "admin_delete_blocked_slots"
  ON public.blocked_slots FOR DELETE
  TO authenticated
  USING (true);


-- ============================================================
-- 4. DATABASE FUNCTIONS (called from the frontend)
-- ============================================================

-- 4a. Get all unavailable slots for a specific date
--     Combines booked appointments + manually blocked slots.
--     Safe for anonymous users — no patient data is returned.

CREATE OR REPLACE FUNCTION public.get_unavailable_slots(booking_date DATE)
RETURNS TABLE (start_time TIME, end_time TIME, reason TEXT)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    -- Booked appointments (active only)
    SELECT a.start_time, a.end_time, 'booked'::TEXT AS reason
    FROM public.appointments a
    WHERE a.date = booking_date
      AND a.status NOT IN ('cancelled')

    UNION ALL

    -- Manually blocked slots
    SELECT bs.start_time, bs.end_time, COALESCE(bs.reason, 'blocked')::TEXT AS reason
    FROM public.blocked_slots bs
    WHERE bs.date = booking_date;
END;
$$ LANGUAGE plpgsql;


-- 4b. Get all fully-blocked dates in a range
--     Returns dates from blocked_periods (entire days the clinic is closed).
--     Used by the calendar to disable dates.

CREATE OR REPLACE FUNCTION public.get_blocked_dates(from_date DATE, to_date DATE)
RETURNS TABLE (blocked_date DATE)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT DISTINCT d::DATE AS blocked_date
    FROM public.blocked_periods bp
    CROSS JOIN generate_series(bp.start_date, bp.end_date, '1 day'::INTERVAL) d
    WHERE d::DATE BETWEEN from_date AND to_date;
END;
$$ LANGUAGE plpgsql;


-- 4c. Book an appointment (atomic operation)
--     Validates blocked dates/slots, prevents double-booking via unique index.
--     Returns JSON with success/error.

CREATE OR REPLACE FUNCTION public.book_appointment(
  p_patient_name    TEXT,
  p_patient_phone   TEXT,
  p_patient_email   TEXT,
  p_condition_slug  TEXT,
  p_condition_title TEXT,
  p_date            DATE,
  p_start_time      TIME
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id        UUID;
  v_reference TEXT;
  v_end_time  TIME;
BEGIN
  -- Calculate end time (30-minute slots)
  v_end_time := p_start_time + INTERVAL '30 minutes';

  -- Generate ID and booking reference
  v_id := gen_random_uuid();
  v_reference := UPPER(SUBSTRING(v_id::TEXT FROM 1 FOR 8));

  -- Check if date is fully blocked (vacation/holiday)
  IF EXISTS (
    SELECT 1 FROM public.blocked_periods bp
    WHERE p_date BETWEEN bp.start_date AND bp.end_date
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'The clinic is closed on this date.'
    );
  END IF;

  -- Check if this specific slot is blocked
  IF EXISTS (
    SELECT 1 FROM public.blocked_slots bs
    WHERE bs.date = p_date AND bs.start_time = p_start_time
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This time slot is not available.'
    );
  END IF;

  -- Try to insert — unique index (idx_unique_active_slot) prevents double-booking
  BEGIN
    INSERT INTO public.appointments (
      id, booking_reference,
      patient_name, patient_phone, patient_email,
      condition_slug, condition_title,
      date, start_time, end_time
    ) VALUES (
      v_id, v_reference,
      p_patient_name, p_patient_phone, p_patient_email,
      p_condition_slug, p_condition_title,
      p_date, p_start_time, v_end_time
    );
  EXCEPTION WHEN unique_violation THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This time slot was just booked by someone else. Please select another time.'
    );
  END;

  -- Return the created booking
  RETURN json_build_object(
    'success', true,
    'data', json_build_object(
      'id', v_id,
      'bookingReference', v_reference,
      'patientName', p_patient_name,
      'patientPhone', p_patient_phone,
      'patientEmail', p_patient_email,
      'conditionSlug', p_condition_slug,
      'conditionTitle', p_condition_title,
      'date', p_date,
      'startTime', p_start_time,
      'endTime', v_end_time,
      'status', 'confirmed'
    )
  );
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 5. GRANT FUNCTION ACCESS TO ANONYMOUS USERS
-- ============================================================
-- These functions use SECURITY DEFINER (run as owner), but
-- anonymous users still need EXECUTE permission to call them.

GRANT EXECUTE ON FUNCTION public.get_unavailable_slots(DATE)                    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_blocked_dates(DATE, DATE)                  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.book_appointment(TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TIME) TO anon, authenticated;
