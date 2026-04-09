import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { StepIndicator } from './StepIndicator';
import { ConditionSelect } from './ConditionSelect';
import { DatePicker } from './DatePicker';
import { TimeSlotPicker } from './TimeSlotPicker';
import { PatientDetails } from './PatientDetails';
import { Confirmation } from './Confirmation';
import { patientSchema } from '../../lib/validation';
import { supabase } from '../../lib/supabase';
import { CONDITIONS } from '../../lib/constants';
import type { BookingWithCondition, BookAppointmentResponse } from '../../lib/types';

interface BookingFormProps {
  isMobile: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({ isMobile }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [booking, setBooking] = useState<BookingWithCondition | null>(null);

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
  }, []);

  const handlePatientChange = useCallback((field: string, value: string | boolean) => {
    if (field === 'patientName') setPatientName(value as string);
    if (field === 'patientPhone') setPatientPhone(value as string);
    if (field === 'patientEmail') setPatientEmail(value as string);
    if (field === 'consent') setConsent(value as boolean);
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    setSubmitError('');
  }, []);

  const handleDateTimeNext = () => {
    const errs: Record<string, string> = {};
    if (!selectedDate) errs.date = 'Please select a date';
    if (!selectedTime) errs.time = 'Please select a time';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setCurrentStep(3);
  };

  const handleSubmit = async () => {
    const result = patientSchema.safeParse({ patientName, patientPhone, patientEmail, consent });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of result.error.issues) {
        const field = err.path.join('.');
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setErrors({});

    try {
      const conditionTitle = CONDITIONS.find(c => c.slug === selectedCondition)?.title || selectedCondition;

      const { data, error } = await supabase.rpc('book_appointment', {
        p_patient_name: patientName,
        p_patient_phone: patientPhone,
        p_patient_email: patientEmail,
        p_condition_slug: selectedCondition,
        p_condition_title: conditionTitle,
        p_date: selectedDate,
        p_start_time: selectedTime,
      });

      if (error) {
        setSubmitError('Something went wrong. Please try again or contact us directly.');
      } else {
        const response = data as BookAppointmentResponse;
        if (response.success && response.data) {
          // Send email notifications (fire-and-forget — don't block the confirmation)
          fetch('/.netlify/functions/send-booking-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patient_name: response.data.patientName,
              patient_phone: response.data.patientPhone,
              patient_email: response.data.patientEmail,
              condition_title: response.data.conditionTitle,
              date: response.data.date,
              start_time: response.data.startTime,
              end_time: response.data.endTime,
              booking_reference: response.data.bookingReference,
            }),
          }).catch(() => {});

          setBooking({
            id: response.data.id,
            patientName: response.data.patientName,
            patientPhone: response.data.patientPhone,
            patientEmail: response.data.patientEmail,
            conditionSlug: response.data.conditionSlug,
            conditionTitle: response.data.conditionTitle,
            date: response.data.date,
            startTime: response.data.startTime,
            endTime: response.data.endTime,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
          } as BookingWithCondition);
        } else {
          setSubmitError(response.error || 'This time slot is no longer available. Please go back and select a different time.');
        }
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookAnother = () => {
    setCurrentStep(1);
    setSelectedCondition('');
    setSelectedDate('');
    setSelectedTime('');
    setPatientName('');
    setPatientPhone('');
    setPatientEmail('');
    setConsent(false);
    setErrors({});
    setSubmitError('');
    setBooking(null);
  };

  // Confirmation screen
  if (booking) {
    return (
      <Confirmation booking={booking} onBookAnother={handleBookAnother} isMobile={isMobile} />
    );
  }

  return (
    <div>
      <StepIndicator currentStep={currentStep} isMobile={isMobile} />

      <AnimatePresence mode="wait">
        {/* Step 1: Condition */}
        {currentStep === 1 && (
          <ConditionSelect
            key="step1"
            value={selectedCondition}
            onChange={setSelectedCondition}
            onNext={() => setCurrentStep(2)}
            isMobile={isMobile}
          />
        )}

        {/* Step 2: Date & Time */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h3 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: isMobile ? 26 : 32,
              fontWeight: 300,
              color: '#faf6ef',
              marginBottom: 8,
              lineHeight: 1.1,
            }}>
              Choose <em style={{ color: '#c9a042' }}>Date & Time</em>
            </h3>
            <p style={{
              fontSize: 13,
              color: 'rgba(250,246,239,0.45)',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 300,
              marginBottom: 24,
              lineHeight: 1.6,
            }}>
              Pick a convenient date and available time slot.
            </p>

            <DatePicker
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
              isMobile={isMobile}
            />
            <TimeSlotPicker
              date={selectedDate}
              selectedTime={selectedTime}
              onSelect={setSelectedTime}
              isMobile={isMobile}
            />

            {(errors.date || errors.time) && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ fontSize: 12, color: '#e55', fontFamily: 'Outfit, sans-serif', marginTop: 12 }}
              >
                {errors.date || errors.time}
              </motion.p>
            )}

            <div style={{
              display: 'flex',
              gap: 12,
              marginTop: 24,
              flexDirection: isMobile ? 'column' : 'row',
            }}>
              <button
                onClick={() => setCurrentStep(1)}
                className="btn-ghost"
                style={{
                  background: 'transparent',
                  color: '#faf6ef',
                  border: '1px solid rgba(250,246,239,0.2)',
                  padding: '13px 24px',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase' as const,
                  fontFamily: 'Outfit, sans-serif',
                  cursor: 'pointer',
                  borderRadius: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <ArrowLeft size={13} /> Back
              </button>
              <button
                onClick={handleDateTimeNext}
                className="btn-primary"
                style={{
                  flex: isMobile ? undefined : 1,
                  background: '#c9a042',
                  color: '#0a1f13',
                  border: 'none',
                  padding: '14px 32px',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase' as const,
                  fontFamily: 'Outfit, sans-serif',
                  cursor: 'pointer',
                  borderRadius: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                Next <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Patient Details */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <PatientDetails
              name={patientName}
              phone={patientPhone}
              email={patientEmail}
              consent={consent}
              onChange={handlePatientChange}
              errors={errors}
              isMobile={isMobile}
            />

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 16,
                  padding: '12px 16px',
                  background: 'rgba(220,60,60,0.08)',
                  border: '1px solid rgba(220,60,60,0.25)',
                  fontSize: 13,
                  color: '#e55',
                  fontFamily: 'Outfit, sans-serif',
                  lineHeight: 1.5,
                }}
              >
                {submitError}
              </motion.div>
            )}

            <div style={{
              display: 'flex',
              gap: 12,
              marginTop: 24,
              flexDirection: isMobile ? 'column' : 'row',
            }}>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={submitting}
                className="btn-ghost"
                style={{
                  background: 'transparent',
                  color: '#faf6ef',
                  border: '1px solid rgba(250,246,239,0.2)',
                  padding: '13px 24px',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase' as const,
                  fontFamily: 'Outfit, sans-serif',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  borderRadius: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: submitting ? 0.5 : 1,
                }}
              >
                <ArrowLeft size={13} /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary"
                style={{
                  flex: isMobile ? undefined : 1,
                  background: submitting ? 'rgba(36,120,212,0.5)' : '#c9a042',
                  color: '#0a1f13',
                  border: 'none',
                  padding: '14px 32px',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase' as const,
                  fontFamily: 'Outfit, sans-serif',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  borderRadius: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} style={{ animation: 'rotate-slow 1s linear infinite' }} />
                    Booking...
                  </>
                ) : (
                  <>Book Appointment</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
