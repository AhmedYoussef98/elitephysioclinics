import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { CONDITIONS, SLOT_DURATION_MINUTES } from '../../lib/constants';
import { useClinicHours } from '../../context/ClinicHoursContext';
import { patientSchema } from '../../lib/validation';
import type { BookAppointmentResponse } from '../../lib/types';
import { User, Phone, Mail, Stethoscope, Calendar, Clock, CheckCircle, ArrowLeft } from 'lucide-react';

export const CreateAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { hours: clinicHours } = useClinicHours();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [condition, setCondition] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const getTimeOptions = () => {
    if (!date) return [];
    const d = new Date(date + 'T00:00:00');
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const hours = clinicHours[dayName];
    if (!hours) return [];

    const options: string[] = [];
    const [sh, sm] = hours.start.split(':').map(Number);
    const [eh, em] = hours.end.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    for (let min = startMin; min + SLOT_DURATION_MINUTES <= endMin; min += SLOT_DURATION_MINUTES) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
    return options;
  };

  const formatTimeLabel = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const p = h >= 12 ? 'PM' : 'AM';
    return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${p}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');
    setSuccess('');

    const validation = patientSchema.safeParse({
      patientName: name, patientPhone: phone, patientEmail: email, consent: true,
    });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of validation.error.issues) {
        const field = err.path.join('.');
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }
    if (!condition) { setErrors({ condition: 'Select a condition' }); return; }
    if (!date) { setErrors({ date: 'Select a date' }); return; }
    if (!time) { setErrors({ time: 'Select a time' }); return; }

    setSubmitting(true);
    const conditionTitle = CONDITIONS.find(c => c.slug === condition)?.title || condition;

    const { data, error } = await supabase.rpc('book_appointment', {
      p_patient_name: name,
      p_patient_phone: phone,
      p_patient_email: email,
      p_condition_slug: condition,
      p_condition_title: conditionTitle,
      p_date: date,
      p_start_time: time,
    });

    if (error) {
      setSubmitError('Failed to create appointment.');
    } else {
      const result = data as BookAppointmentResponse;
      if (result.success) {
        setSuccess(`Appointment created successfully! Reference: ${result.data?.bookingReference}`);
        setName(''); setPhone(''); setEmail(''); setCondition(''); setDate(''); setTime('');
      } else {
        setSubmitError(result.error || 'Slot unavailable.');
      }
    }
    setSubmitting(false);
  };

  const timeOptions = getTimeOptions();

  return (
    <div className="create-page">
      <button className="create-back" onClick={() => navigate('/clinic-portal')}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <h2 className="admin-page-title">New Appointment</h2>
      <p className="create-desc">Create an appointment on behalf of a patient — walk-in, phone booking, or referral.</p>

      {success && (
        <div className="create-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-form">
        {/* Patient Info Section */}
        <div className="create-section">
          <h3 className="create-section-title">Patient Information</h3>
          <div className="create-grid">
            <div className="create-field">
              <label><User size={13} /> Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" />
              {errors.patientName && <span className="create-field-error">{errors.patientName}</span>}
            </div>
            <div className="create-field">
              <label><Phone size={13} /> Phone Number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7700 900123" />
              {errors.patientPhone && <span className="create-field-error">{errors.patientPhone}</span>}
            </div>
            <div className="create-field create-field-full">
              <label><Mail size={13} /> Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="patient@email.com" />
              {errors.patientEmail && <span className="create-field-error">{errors.patientEmail}</span>}
            </div>
          </div>
        </div>

        {/* Appointment Details Section */}
        <div className="create-section">
          <h3 className="create-section-title">Appointment Details</h3>
          <div className="create-grid">
            <div className="create-field create-field-full">
              <label><Stethoscope size={13} /> Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value)}>
                <option value="">Select condition...</option>
                {CONDITIONS.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
              </select>
              {errors.condition && <span className="create-field-error">{errors.condition}</span>}
            </div>
            <div className="create-field">
              <label><Calendar size={13} /> Date</label>
              <input type="date" value={date} onChange={e => { setDate(e.target.value); setTime(''); }} />
              {errors.date && <span className="create-field-error">{errors.date}</span>}
            </div>
            <div className="create-field">
              <label><Clock size={13} /> Time Slot</label>
              <select value={time} onChange={e => setTime(e.target.value)} disabled={!date || timeOptions.length === 0}>
                <option value="">{!date ? 'Select date first' : timeOptions.length === 0 ? 'Closed on this day' : 'Select time...'}</option>
                {timeOptions.map(t => <option key={t} value={t}>{formatTimeLabel(t)}</option>)}
              </select>
              {errors.time && <span className="create-field-error">{errors.time}</span>}
            </div>
          </div>
        </div>

        {submitError && <div className="admin-error">{submitError}</div>}

        <div className="create-actions">
          <button type="button" onClick={() => navigate('/clinic-portal')} className="admin-btn-ghost-v2">Cancel</button>
          <button type="submit" className="admin-btn-gold" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};
