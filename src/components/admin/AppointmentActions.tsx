import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { XCircle, CheckCircle, RefreshCw, MoreHorizontal, X } from 'lucide-react';

interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  condition_slug: string;
  condition_title: string;
  date: string;
  start_time: string;
  status: string;
}

interface AppointmentActionsProps {
  appointment: Appointment;
  onUpdate: () => void;
}

export const AppointmentActions: React.FC<AppointmentActionsProps> = ({ appointment, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  if (appointment.status !== 'confirmed') return <span className="apt-actions-none">--</span>;

  const handleCancel = async () => {
    if (!confirm(`Cancel appointment for ${appointment.patient_name}?`)) return;
    setActionLoading('cancel');
    setError('');
    const { error: err } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointment.id);
    if (err) setError('Failed to cancel');
    else onUpdate();
    setActionLoading('');
    setShowMenu(false);
  };

  const handleComplete = async () => {
    setActionLoading('complete');
    setError('');
    const { error: err } = await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointment.id);
    if (err) setError('Failed to complete');
    else onUpdate();
    setActionLoading('');
    setShowMenu(false);
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) { setError('Select new date and time'); return; }
    setActionLoading('reschedule');
    setError('');

    const { error: updateErr } = await supabase
      .from('appointments')
      .update({ status: 'rescheduled' })
      .eq('id', appointment.id);

    if (updateErr) { setError('Failed to reschedule'); setActionLoading(''); return; }

    const { data } = await supabase.rpc('book_appointment', {
      p_patient_name: appointment.patient_name,
      p_patient_phone: appointment.patient_phone,
      p_patient_email: appointment.patient_email,
      p_condition_slug: appointment.condition_slug,
      p_condition_title: appointment.condition_title,
      p_date: newDate,
      p_start_time: newTime,
    });

    const result = data as any;
    if (result && !result.success) {
      await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', appointment.id);
      setError(result.error || 'Slot unavailable');
    } else {
      setShowReschedule(false);
      setShowMenu(false);
      onUpdate();
    }
    setActionLoading('');
  };

  return (
    <div className="actions-wrap">
      <button className="actions-trigger" onClick={() => setShowMenu(!showMenu)}>
        <MoreHorizontal size={16} />
      </button>

      {showMenu && (
        <>
          <div className="actions-backdrop" onClick={() => { setShowMenu(false); setShowReschedule(false); }} />
          <div className="actions-dropdown">
            <button onClick={handleComplete} disabled={!!actionLoading} className="actions-item actions-item-complete">
              <CheckCircle size={15} /> Mark Complete
            </button>
            <button onClick={() => setShowReschedule(!showReschedule)} disabled={!!actionLoading} className="actions-item actions-item-reschedule">
              <RefreshCw size={15} /> Reschedule
            </button>
            <div className="actions-divider" />
            <button onClick={handleCancel} disabled={!!actionLoading} className="actions-item actions-item-cancel">
              <XCircle size={15} /> Cancel Appointment
            </button>

            {showReschedule && (
              <div className="actions-reschedule">
                <div className="actions-reschedule-header">
                  <span>Reschedule to:</span>
                  <button onClick={() => setShowReschedule(false)} className="actions-reschedule-close"><X size={14} /></button>
                </div>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} step="1800" />
                <button onClick={handleReschedule} disabled={!!actionLoading} className="admin-btn-gold actions-confirm-btn">
                  {actionLoading === 'reschedule' ? 'Saving...' : 'Confirm Reschedule'}
                </button>
              </div>
            )}

            {error && <div className="actions-error">{error}</div>}
          </div>
        </>
      )}
    </div>
  );
};
