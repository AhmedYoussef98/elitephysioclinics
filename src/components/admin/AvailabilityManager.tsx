import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Plus, CalendarOff, Clock, ShieldOff } from 'lucide-react';
import { SLOT_DURATION_MINUTES } from '../../lib/constants';
import { generateSlotStartTimes, addMinutes } from '../../lib/slots';
import { formatTime12h, formatDate } from '../../lib/format';
import { useClinicHours } from '../../context/ClinicHoursContext';

interface BlockedPeriod {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
}

interface BlockedSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
}

export const AvailabilityManager: React.FC = () => {
  const { hours: clinicHours } = useClinicHours();
  const [periods, setPeriods] = useState<BlockedPeriod[]>([]);
  const [slots, setSlots] = useState<BlockedSlot[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [periodReason, setPeriodReason] = useState('');

  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [slotReason, setSlotReason] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchPeriods = async () => {
    setLoadingPeriods(true);
    const { data } = await supabase.from('blocked_periods').select('*').order('start_date');
    if (data) setPeriods(data);
    setLoadingPeriods(false);
  };

  const fetchSlots = async () => {
    setLoadingSlots(true);
    const { data } = await supabase.from('blocked_slots').select('*').order('date').order('start_time');
    if (data) setSlots(data);
    setLoadingSlots(false);
  };

  useEffect(() => { fetchPeriods(); fetchSlots(); }, []);

  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const addPeriod = async () => {
    setError('');
    if (!periodStart || !periodEnd) { setError('Select start and end dates'); return; }
    if (periodEnd < periodStart) { setError('End date must be after start date'); return; }
    const { error: err } = await supabase.from('blocked_periods').insert({
      start_date: periodStart, end_date: periodEnd, reason: periodReason || null,
    });
    if (err) setError('Failed to block period');
    else { setPeriodStart(''); setPeriodEnd(''); setPeriodReason(''); fetchPeriods(); flash('Period blocked successfully'); }
  };

  const deletePeriod = async (id: string) => {
    if (!confirm('Remove this blocked period?')) return;
    await supabase.from('blocked_periods').delete().eq('id', id);
    fetchPeriods();
    flash('Period unblocked');
  };

  const getTimeOptions = () => {
    if (!slotDate) return [];
    const dayName = new Date(slotDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    const hours = clinicHours[dayName];
    return hours ? generateSlotStartTimes(hours) : [];
  };

  const addSlot = async () => {
    setError('');
    if (!slotDate || !slotTime) { setError('Select date and time'); return; }
    const endTime = addMinutes(slotTime, SLOT_DURATION_MINUTES);
    const { error: err } = await supabase.from('blocked_slots').insert({
      date: slotDate, start_time: slotTime, end_time: endTime, reason: slotReason || null,
    });
    if (err) setError('Failed to block slot (may already be blocked)');
    else { setSlotDate(''); setSlotTime(''); setSlotReason(''); fetchSlots(); flash('Slot blocked successfully'); }
  };

  const deleteSlot = async (id: string) => {
    if (!confirm('Remove this blocked slot?')) return;
    await supabase.from('blocked_slots').delete().eq('id', id);
    fetchSlots();
    flash('Slot unblocked');
  };

  const daysDiff = (s: string, e: string) => {
    const diff = (new Date(e).getTime() - new Date(s).getTime()) / 86400000;
    return diff + 1;
  };

  return (
    <div className="avail-page">
      <h2 className="admin-page-title">Availability Management</h2>
      <p className="avail-desc">Control when patients can book. Blocked dates and slots are immediately reflected in the booking form.</p>

      {error && <div className="admin-error" style={{ marginBottom: 16 }}>{error}</div>}
      {successMsg && <div className="admin-success" style={{ marginBottom: 16 }}>{successMsg}</div>}

      <div className="avail-grid">
        {/* Blocked Periods */}
        <div className="avail-card">
          <div className="avail-card-header">
            <div className="avail-card-icon avail-card-icon-red"><CalendarOff size={20} /></div>
            <div>
              <h3 className="avail-card-title">Blocked Periods</h3>
              <p className="avail-card-desc">Block entire date ranges — holidays, vacation, closures</p>
            </div>
          </div>

          <div className="avail-add-form">
            <div className="avail-add-row">
              <div className="avail-add-field">
                <label>Start Date</label>
                <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
              </div>
              <div className="avail-add-field">
                <label>End Date</label>
                <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
              </div>
            </div>
            <div className="avail-add-row">
              <div className="avail-add-field avail-add-field-grow">
                <label>Reason (optional)</label>
                <input type="text" value={periodReason} onChange={e => setPeriodReason(e.target.value)} placeholder="e.g. Annual leave, Bank holiday" />
              </div>
              <button onClick={addPeriod} className="admin-btn-gold avail-add-btn"><Plus size={15} /> Block Period</button>
            </div>
          </div>

          <div className="avail-items">
            {loadingPeriods ? <p className="avail-loading">Loading...</p> : periods.length === 0 ? (
              <div className="avail-empty"><ShieldOff size={24} strokeWidth={1} /><p>No blocked periods</p></div>
            ) : periods.map(p => (
              <div key={p.id} className="avail-item">
                <div className="avail-item-info">
                  <span className="avail-item-dates">{formatDate(p.start_date)} — {formatDate(p.end_date)}</span>
                  <span className="avail-item-meta">{daysDiff(p.start_date, p.end_date)} day{daysDiff(p.start_date, p.end_date) > 1 ? 's' : ''}{p.reason ? ` · ${p.reason}` : ''}</span>
                </div>
                <button onClick={() => deletePeriod(p.id)} className="avail-delete" title="Remove"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Blocked Slots */}
        <div className="avail-card">
          <div className="avail-card-header">
            <div className="avail-card-icon avail-card-icon-amber"><Clock size={20} /></div>
            <div>
              <h3 className="avail-card-title">Blocked Time Slots</h3>
              <p className="avail-card-desc">Block individual slots on specific dates</p>
            </div>
          </div>

          <div className="avail-add-form">
            <div className="avail-add-row">
              <div className="avail-add-field">
                <label>Date</label>
                <input type="date" value={slotDate} onChange={e => { setSlotDate(e.target.value); setSlotTime(''); }} />
              </div>
              <div className="avail-add-field">
                <label>Time Slot</label>
                <select value={slotTime} onChange={e => setSlotTime(e.target.value)} disabled={!slotDate}>
                  <option value="">{!slotDate ? 'Select date first' : 'Select time...'}</option>
                  {getTimeOptions().map(t => <option key={t} value={t}>{formatTime12h(t)}</option>)}
                </select>
              </div>
            </div>
            <div className="avail-add-row">
              <div className="avail-add-field avail-add-field-grow">
                <label>Reason (optional)</label>
                <input type="text" value={slotReason} onChange={e => setSlotReason(e.target.value)} placeholder="e.g. Lunch break, Maintenance" />
              </div>
              <button onClick={addSlot} className="admin-btn-gold avail-add-btn"><Plus size={15} /> Block Slot</button>
            </div>
          </div>

          <div className="avail-items">
            {loadingSlots ? <p className="avail-loading">Loading...</p> : slots.length === 0 ? (
              <div className="avail-empty"><ShieldOff size={24} strokeWidth={1} /><p>No blocked slots</p></div>
            ) : slots.map(s => (
              <div key={s.id} className="avail-item">
                <div className="avail-item-info">
                  <span className="avail-item-dates">{formatDate(s.date)} at {formatTime12h(s.start_time)}</span>
                  <span className="avail-item-meta">{formatTime12h(s.start_time)} — {formatTime12h(s.end_time)}{s.reason ? ` · ${s.reason}` : ''}</span>
                </div>
                <button onClick={() => deleteSlot(s.id)} className="avail-delete" title="Remove"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
