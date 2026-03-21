import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useClinicHours } from '../../context/ClinicHoursContext';
import { Clock, Save, RotateCcw } from 'lucide-react';

interface DaySettings {
  day_of_week: string;
  is_open: boolean;
  start_time: string | null;
  end_time: string | null;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULTS: DaySettings[] = [
  { day_of_week: 'Monday', is_open: true, start_time: '16:30', end_time: '21:00' },
  { day_of_week: 'Tuesday', is_open: true, start_time: '16:30', end_time: '21:00' },
  { day_of_week: 'Wednesday', is_open: true, start_time: '16:30', end_time: '21:00' },
  { day_of_week: 'Thursday', is_open: true, start_time: '16:30', end_time: '21:00' },
  { day_of_week: 'Friday', is_open: true, start_time: '16:30', end_time: '21:00' },
  { day_of_week: 'Saturday', is_open: true, start_time: '08:00', end_time: '21:00' },
  { day_of_week: 'Sunday', is_open: false, start_time: null, end_time: null },
];

export const WorkingHours: React.FC = () => {
  const { refresh } = useClinicHours();
  const [days, setDays] = useState<DaySettings[]>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('clinic_settings')
        .select('day_of_week, is_open, start_time, end_time');

      if (data && data.length > 0) {
        const mapped = DAYS.map(day => {
          const row = data.find((r: any) => r.day_of_week === day);
          if (row) {
            return {
              day_of_week: day,
              is_open: row.is_open,
              start_time: row.start_time ? row.start_time.substring(0, 5) : null,
              end_time: row.end_time ? row.end_time.substring(0, 5) : null,
            };
          }
          const def = DEFAULTS.find(d => d.day_of_week === day)!;
          return { ...def };
        });
        setDays(mapped);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const updateDay = (dayName: string, field: keyof DaySettings, value: any) => {
    setDays(prev => prev.map(d => {
      if (d.day_of_week !== dayName) return d;
      const updated = { ...d, [field]: value };
      if (field === 'is_open' && !value) {
        updated.start_time = null;
        updated.end_time = null;
      }
      if (field === 'is_open' && value && !updated.start_time) {
        updated.start_time = '09:00';
        updated.end_time = '17:00';
      }
      return updated;
    }));
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    for (const day of days) {
      if (day.is_open && (!day.start_time || !day.end_time)) {
        setError(`${day.day_of_week}: Please set both start and end times`);
        setSaving(false);
        return;
      }
      if (day.is_open && day.start_time && day.end_time && day.start_time >= day.end_time) {
        setError(`${day.day_of_week}: End time must be after start time`);
        setSaving(false);
        return;
      }
    }

    for (const day of days) {
      const { error: err } = await supabase
        .from('clinic_settings')
        .update({
          is_open: day.is_open,
          start_time: day.start_time,
          end_time: day.end_time,
        })
        .eq('day_of_week', day.day_of_week);

      if (err) {
        setError(`Failed to update ${day.day_of_week}`);
        setSaving(false);
        return;
      }
    }

    await refresh();
    setSuccess('Working hours updated successfully. Changes are live on the booking form.');
    setSaving(false);
  };

  const handleReset = () => {
    setDays(DEFAULTS.map(d => ({ ...d })));
    setSuccess('');
    setError('');
  };

  const formatTimeLabel = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const p = h >= 12 ? 'PM' : 'AM';
    return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${p}`;
  };

  if (loading) {
    return <div className="wh-loading"><div className="admin-spinner" /> Loading hours...</div>;
  }

  return (
    <div className="wh-page">
      <h2 className="admin-page-title">Working Hours</h2>
      <p className="wh-desc">Set the clinic's operating hours. Changes are immediately reflected in the patient booking form across the website.</p>

      {error && <div className="admin-error" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="admin-success" style={{ marginBottom: 16 }}>{success}</div>}

      <div className="wh-card">
        <div className="wh-card-header">
          <Clock size={18} />
          <span>Weekly Schedule</span>
        </div>

        <div className="wh-table">
          <div className="wh-table-header">
            <span className="wh-col-day">Day</span>
            <span className="wh-col-status">Status</span>
            <span className="wh-col-start">Opens</span>
            <span className="wh-col-end">Closes</span>
            <span className="wh-col-preview">Preview</span>
          </div>

          {days.map(day => (
            <div key={day.day_of_week} className={`wh-row ${!day.is_open ? 'wh-row-closed' : ''}`}>
              <span className="wh-col-day wh-day-name">{day.day_of_week}</span>

              <div className="wh-col-status">
                <button
                  className={`wh-toggle ${day.is_open ? 'wh-toggle-on' : ''}`}
                  onClick={() => updateDay(day.day_of_week, 'is_open', !day.is_open)}
                >
                  <span className="wh-toggle-thumb" />
                </button>
                <span className={`wh-toggle-label ${day.is_open ? '' : 'wh-closed-label'}`}>
                  {day.is_open ? 'Open' : 'Closed'}
                </span>
              </div>

              <div className="wh-col-start">
                {day.is_open ? (
                  <input
                    type="time"
                    value={day.start_time || ''}
                    onChange={e => updateDay(day.day_of_week, 'start_time', e.target.value)}
                    className="wh-time-input"
                  />
                ) : (
                  <span className="wh-na">—</span>
                )}
              </div>

              <div className="wh-col-end">
                {day.is_open ? (
                  <input
                    type="time"
                    value={day.end_time || ''}
                    onChange={e => updateDay(day.day_of_week, 'end_time', e.target.value)}
                    className="wh-time-input"
                  />
                ) : (
                  <span className="wh-na">—</span>
                )}
              </div>

              <div className="wh-col-preview">
                {day.is_open && day.start_time && day.end_time ? (
                  <span className="wh-preview-text">{formatTimeLabel(day.start_time)} – {formatTimeLabel(day.end_time)}</span>
                ) : (
                  <span className="wh-preview-closed">Closed</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="wh-actions">
          <button onClick={handleReset} className="admin-btn-ghost-v2">
            <RotateCcw size={14} /> Reset to Defaults
          </button>
          <button onClick={handleSave} disabled={saving} className="admin-btn-gold">
            <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
