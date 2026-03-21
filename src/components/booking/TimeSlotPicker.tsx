import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useClinicHours } from '../../context/ClinicHoursContext';
import type { TimeSlot, UnavailableSlot } from '../../lib/types';
import { SLOT_DURATION_MINUTES } from '../../lib/constants';

interface TimeSlotPickerProps {
  date: string;
  selectedTime: string;
  onSelect: (time: string) => void;
  isMobile: boolean;
}

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ date, selectedTime, onSelect, isMobile }) => {
  const { hours: clinicHours } = useClinicHours();

  function generateSlots(dateStr: string): TimeSlot[] {
    const dayName = getDayName(dateStr);
    const hours = clinicHours[dayName];
    if (!hours) return [];

    const slots: TimeSlot[] = [];
    const [startH, startM] = hours.start.split(':').map(Number);
    const [endH, endM] = hours.end.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    for (let min = startMin; min + SLOT_DURATION_MINUTES <= endMin; min += SLOT_DURATION_MINUTES) {
      const sh = Math.floor(min / 60);
      const sm = min % 60;
      const eh = Math.floor((min + SLOT_DURATION_MINUTES) / 60);
      const em = (min + SLOT_DURATION_MINUTES) % 60;
      slots.push({
        startTime: `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`,
        endTime: `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`,
        available: true,
      });
    }
    return slots;
  }
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }

    setLoading(true);
    setError('');

    const allSlots = generateSlots(date);

    (async () => {
      try {
        const { data, error: rpcError } = await supabase.rpc('get_unavailable_slots', { booking_date: date });

        if (rpcError) {
          setError('Unable to check availability. Please try again or contact us directly.');
          setSlots(allSlots);
          return;
        }

        const unavailable = (data as UnavailableSlot[]) || [];
        const unavailableTimes = new Set(unavailable.map(s => s.start_time.substring(0, 5)));

        const merged = allSlots.map(slot => ({
          ...slot,
          available: !unavailableTimes.has(slot.startTime),
        }));
        setSlots(merged);
      } catch {
        setError('Unable to check availability. Please try again or contact us directly.');
        setSlots(allSlots);
      } finally {
        setLoading(false);
      }
    })();
  }, [date]);

  if (!date) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      style={{ marginTop: 24 }}
    >
      <div style={{
        fontSize: 11,
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
        color: 'rgba(201,160,66,0.7)',
        letterSpacing: '0.2em',
        textTransform: 'uppercase' as const,
        marginBottom: 14,
      }}>
        Select Time
      </div>

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '24px 0',
          fontSize: 13,
          color: 'rgba(250,246,239,0.4)',
          fontFamily: 'Outfit, sans-serif',
        }}>
          Loading available times...
        </div>
      )}

      {error && (
        <p style={{ fontSize: 12, color: '#e55', fontFamily: 'Outfit, sans-serif' }}>{error}</p>
      )}

      {!loading && !error && slots.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: 6,
        }}>
          {slots.map((slot) => {
            const isSelected = slot.startTime === selectedTime;
            return (
              <button
                key={slot.startTime}
                disabled={!slot.available}
                onClick={() => onSelect(slot.startTime)}
                style={{
                  padding: '10px 8px',
                  border: isSelected
                    ? '1px solid #c9a042'
                    : '1px solid rgba(255,255,255,0.06)',
                  background: isSelected
                    ? 'rgba(201,160,66,0.15)'
                    : slot.available
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(255,255,255,0.01)',
                  color: !slot.available
                    ? 'rgba(250,246,239,0.2)'
                    : isSelected
                      ? '#c9a042'
                      : 'rgba(250,246,239,0.7)',
                  fontSize: 12,
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: slot.available ? 'pointer' : 'not-allowed',
                  textAlign: 'center' as const,
                  transition: 'all 0.2s ease',
                  opacity: slot.available ? 1 : 0.45,
                  textDecoration: slot.available ? 'none' : 'line-through',
                }}
              >
                {formatTime12h(slot.startTime)} – {formatTime12h(slot.endTime)}
              </button>
            );
          })}
        </div>
      )}

      {!loading && !error && slots.length === 0 && date && (
        <p style={{ fontSize: 13, color: 'rgba(250,246,239,0.35)', fontFamily: 'Outfit, sans-serif' }}>
          No time slots available for this date.
        </p>
      )}
    </motion.div>
  );
};
