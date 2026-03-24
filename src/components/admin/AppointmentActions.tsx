import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { XCircle, CheckCircle, RefreshCw, MoreHorizontal, X, Trash2, RotateCcw } from 'lucide-react';

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  const closeMenu = useCallback(() => {
    setShowMenu(false);
    setShowReschedule(false);
    setError('');
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = showReschedule ? 320 : 220;
    const fitsBelow = rect.bottom + 4 + dropdownHeight < window.innerHeight;

    setDropdownPos({
      top: fitsBelow
        ? rect.bottom + 4 + window.scrollY
        : rect.top - 4 - dropdownHeight + window.scrollY,
      left: Math.max(8, rect.right + window.scrollX - 200),
    });
  }, [showReschedule]);

  useEffect(() => {
    if (showMenu) {
      updatePosition();
      const container = triggerRef.current?.closest('.apt-table-container');
      const handleClose = () => closeMenu();
      container?.addEventListener('scroll', handleClose);
      window.addEventListener('resize', handleClose);
      return () => {
        container?.removeEventListener('scroll', handleClose);
        window.removeEventListener('resize', handleClose);
      };
    }
  }, [showMenu, updatePosition, closeMenu]);

  useEffect(() => {
    if (showMenu) updatePosition();
  }, [showReschedule, showMenu, updatePosition]);

  const status = appointment.status;
  const isConfirmed = status === 'confirmed';

  const handleCancel = async () => {
    if (!confirm(`Cancel appointment for ${appointment.patient_name}?`)) return;
    setActionLoading('cancel');
    setError('');
    const { error: err } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointment.id);
    if (err) setError('Failed to cancel');
    else { onUpdate(); closeMenu(); }
    setActionLoading('');
  };

  const handleComplete = async () => {
    setActionLoading('complete');
    setError('');
    const { error: err } = await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointment.id);
    if (err) setError('Failed to complete');
    else { onUpdate(); closeMenu(); }
    setActionLoading('');
  };

  const handleReconfirm = async () => {
    setActionLoading('reconfirm');
    setError('');
    const { error: err } = await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', appointment.id);
    if (err) setError('Failed to reconfirm');
    else { onUpdate(); closeMenu(); }
    setActionLoading('');
  };

  const handleDelete = async () => {
    if (!confirm(`Permanently delete appointment for ${appointment.patient_name}? This cannot be undone.`)) return;
    setActionLoading('delete');
    setError('');
    const { error: err } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointment.id);
    if (err) setError('Failed to delete');
    else { onUpdate(); closeMenu(); }
    setActionLoading('');
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
      closeMenu();
      onUpdate();
    }
    setActionLoading('');
  };

  return (
    <div className="actions-wrap">
      <button ref={triggerRef} className="actions-trigger" onClick={() => setShowMenu(!showMenu)}>
        <MoreHorizontal size={16} />
      </button>

      {showMenu && dropdownPos && createPortal(
        <>
          <div className="actions-backdrop" onClick={closeMenu} />
          <div
            className="actions-dropdown"
            style={{
              position: 'absolute',
              top: dropdownPos.top,
              left: dropdownPos.left,
            }}
          >
            {/* Confirmed: Complete, Reschedule, Cancel */}
            {isConfirmed && (
              <>
                <button onClick={handleComplete} disabled={!!actionLoading} className="actions-item actions-item-complete">
                  <CheckCircle size={15} /> Mark Complete
                </button>
                <button onClick={() => setShowReschedule(!showReschedule)} disabled={!!actionLoading} className="actions-item actions-item-reschedule">
                  <RefreshCw size={15} /> Reschedule
                </button>
                <button onClick={handleCancel} disabled={!!actionLoading} className="actions-item actions-item-cancel">
                  <XCircle size={15} /> Cancel
                </button>
              </>
            )}

            {/* Cancelled / Completed / Rescheduled: Reconfirm */}
            {!isConfirmed && (
              <button onClick={handleReconfirm} disabled={!!actionLoading} className="actions-item actions-item-complete">
                <RotateCcw size={15} /> Reconfirm
              </button>
            )}

            {/* Always available: Delete */}
            <div className="actions-divider" />
            <button onClick={handleDelete} disabled={!!actionLoading} className="actions-item actions-item-delete">
              <Trash2 size={15} /> Delete Permanently
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
        </>,
        document.body
      )}
    </div>
  );
};
