import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useClinicHours } from '../../context/ClinicHoursContext';
import { CLINIC_HOURS, DAYS_OF_WEEK, FALLBACK_OPEN_HOURS } from '../../lib/constants';
import { formatTime12h } from '../../lib/format';
import { Clock, Save, RotateCcw } from 'lucide-react';

interface DaySettings {
  day_of_week: string;
  is_open: boolean;
  start_time: string | null;
  end_time: string | null;
}

// Derived from the single CLINIC_HOURS source of truth so defaults never drift.
const DEFAULTS: DaySettings[] = DAYS_OF_WEEK.map(day => {
  const h = CLINIC_HOURS[day];
  return {
    day_of_week: day,
    is_open: h != null,
    start_time: h ? h.start : null,
    end_time: h ? h.end : null,
  };
});

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
        const mapped = DAYS_OF_WEEK.map(day => {
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
        updated.start_time = FALLBACK_OPEN_HOURS.start;
        updated.end_time = FALLBACK_OPEN_HOURS.end;
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

    // Run the seven per-day updates concurrently — one round-trip of latency, not seven.
    // (RLS on clinic_settings only permits UPDATE, so an upsert would be denied.)
    const results = await Promise.all(days.map(day =>
      supabase
        .from('clinic_settings')
        .update({
          is_open: day.is_open,
          start_time: day.start_time,
          end_time: day.end_time,
        })
        .eq('day_of_week', day.day_of_week)
        .then(res => ({ day: day.day_of_week, error: res.error })),
    ));

    const failed = results.find(r => r.error);
    if (failed) {
      setError(`Failed to update ${failed.day}`);
      setSaving(false);
      return;
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
                  <span className="wh-preview-text">{formatTime12h(day.start_time)} – {formatTime12h(day.end_time)}</span>
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
