-- ============================================================
-- Migration: booking review fixes
-- Apply to an EXISTING Elite Physio Clinics database (run once in the
-- Supabase SQL Editor). New installs get these fixes from schema.sql directly.
-- ============================================================

-- 1. Allow paediatric condition slugs (the CHECK previously listed adult slugs only,
--    so every paediatric booking failed with a check_violation).
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_condition_slug_check;
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_condition_slug_check CHECK (condition_slug IN (
    -- Adult
    'back-pain-sciatica','neck-pain-whiplash','arthritis','sports-injuries',
    'work-related-injury','muscle-tendon-ligament','ankle-knee','frozen-shoulder',
    'tennis-elbow','post-surgery-rehab','disc-prolapses',
    -- Paediatric
    'torticollis','flat-head-syndrome','delayed-milestones','cerebral-palsy',
    'balance-coordination','genetic-neurological','clubfoot','gait-disorders',
    'child-musculoskeletal','osgood-schlatter','severs-disease','osteochondritis-dissecans',
    -- General
    'other'
  ));

-- 2. Free a slot when its appointment is rescheduled (not just cancelled).
DROP INDEX IF EXISTS idx_unique_active_slot;
CREATE UNIQUE INDEX idx_unique_active_slot
  ON public.appointments (date, start_time)
  WHERE status NOT IN ('cancelled', 'rescheduled');

-- 3. Exclude rescheduled appointments from the unavailable-slots view too.
CREATE OR REPLACE FUNCTION public.get_unavailable_slots(booking_date DATE)
RETURNS TABLE (start_time TIME, end_time TIME, reason TEXT)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT a.start_time, a.end_time, 'booked'::TEXT AS reason
    FROM public.appointments a
    WHERE a.date = booking_date
      AND a.status NOT IN ('cancelled', 'rescheduled')
    UNION ALL
    SELECT bs.start_time, bs.end_time, COALESCE(bs.reason, 'blocked')::TEXT AS reason
    FROM public.blocked_slots bs
    WHERE bs.date = booking_date;
END;
$$ LANGUAGE plpgsql;

-- 4. Enforce booking window, slot alignment and working hours server-side
--    (the deleted Express backend used to enforce these). Also handle check_violation.
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
  v_id          UUID;
  v_reference   TEXT;
  v_end_time    TIME;
  v_day_name    TEXT;
  v_is_open     BOOLEAN;
  v_open_time   TIME;
  v_close_time  TIME;
  v_window_days CONSTANT INT := 28;  -- BOOKING_WINDOW_WEEKS (4) * 7
BEGIN
  v_end_time := p_start_time + INTERVAL '30 minutes';

  -- Public (anon) callers only — admins may book further ahead.
  IF COALESCE(auth.role(), 'anon') <> 'authenticated'
     AND (p_date < CURRENT_DATE OR p_date > CURRENT_DATE + v_window_days) THEN
    RETURN json_build_object('success', false, 'error', 'That date is outside the booking window.');
  END IF;

  IF EXTRACT(SECOND FROM p_start_time) <> 0
     OR MOD(EXTRACT(MINUTE FROM p_start_time)::INT, 30) <> 0 THEN
    RETURN json_build_object('success', false, 'error', 'Please select a valid time slot.');
  END IF;

  IF to_regclass('public.clinic_settings') IS NOT NULL THEN
    v_day_name := CASE EXTRACT(DOW FROM p_date)::INT
      WHEN 0 THEN 'Sunday'    WHEN 1 THEN 'Monday'   WHEN 2 THEN 'Tuesday'
      WHEN 3 THEN 'Wednesday' WHEN 4 THEN 'Thursday' WHEN 5 THEN 'Friday'
      WHEN 6 THEN 'Saturday'
    END;

    SELECT is_open, start_time, end_time
      INTO v_is_open, v_open_time, v_close_time
      FROM public.clinic_settings
     WHERE day_of_week = v_day_name;

    IF NOT FOUND OR v_is_open IS NOT TRUE OR v_open_time IS NULL OR v_close_time IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'The clinic is closed on this day.');
    END IF;

    IF p_start_time < v_open_time OR v_end_time > v_close_time THEN
      RETURN json_build_object('success', false, 'error', 'That time is outside the clinic''s opening hours.');
    END IF;
  END IF;

  v_id := gen_random_uuid();
  v_reference := UPPER(SUBSTRING(v_id::TEXT FROM 1 FOR 8));

  IF EXISTS (
    SELECT 1 FROM public.blocked_periods bp
    WHERE p_date BETWEEN bp.start_date AND bp.end_date
  ) THEN
    RETURN json_build_object('success', false, 'error', 'The clinic is closed on this date.');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.blocked_slots bs
    WHERE bs.date = p_date AND bs.start_time = p_start_time
  ) THEN
    RETURN json_build_object('success', false, 'error', 'This time slot is not available.');
  END IF;

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
  EXCEPTION
    WHEN unique_violation THEN
      RETURN json_build_object('success', false, 'error', 'This time slot was just booked by someone else. Please select another time.');
    WHEN check_violation THEN
      RETURN json_build_object('success', false, 'error', 'Those booking details are not valid. Please review and try again.');
  END;

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

-- 5. Booking-existence check used by the email function to prevent an open relay.
CREATE OR REPLACE FUNCTION public.verify_booking(p_reference TEXT, p_email TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.appointments
    WHERE booking_reference = p_reference
      AND lower(patient_email) = lower(p_email)
      AND created_at > NOW() - INTERVAL '15 minutes'
  );
$$ LANGUAGE sql;

GRANT EXECUTE ON FUNCTION public.verify_booking(TEXT, TEXT) TO anon, authenticated;
