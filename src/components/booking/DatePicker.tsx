import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BOOKING_WINDOW_WEEKS } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { useClinicHours } from '../../context/ClinicHoursContext';

interface DatePickerProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  isMobile: boolean;
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onSelect, isMobile }) => {
  const { hours: clinicHours } = useClinicHours();
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());

  const dates = useMemo(() => {
    const result: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(end.getDate() + BOOKING_WINDOW_WEEKS * 7);

    const current = new Date(today);
    while (current <= end) {
      result.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return result;
  }, []);

  useEffect(() => {
    if (dates.length === 0) return;
    const fromDate = formatDateKey(dates[0]);
    const toDate = formatDateKey(dates[dates.length - 1]);

    supabase.rpc('get_blocked_dates', { from_date: fromDate, to_date: toDate })
      .then(({ data }) => {
        if (data) {
          setBlockedDates(new Set(data.map((d: { blocked_date: string }) => d.blocked_date)));
        }
      });
  }, [dates]);

  const weeks = useMemo(() => {
    const grouped: Date[][] = [];
    let week: Date[] = [];
    const firstDay = dates[0].getDay();
    const mondayOffset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < mondayOffset; i++) week.push(null as any);

    for (const d of dates) {
      week.push(d);
      if (week.length === 7) {
        grouped.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null as any);
      grouped.push(week);
    }
    return grouped;
  }, [dates]);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
        Select Date
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 2,
        marginBottom: 4,
      }}>
        {dayLabels.map(d => (
          <div key={d} style={{
            textAlign: 'center',
            fontSize: 10,
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 500,
            color: 'rgba(250,246,239,0.3)',
            letterSpacing: '0.1em',
            padding: '6px 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {week.map((day, di) => {
              if (!day) return <div key={di} />;

              const dateStr = formatDateKey(day);
              const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
              const isClosedDay = clinicHours[dayName] === null || clinicHours[dayName] === undefined;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPast = day < today;
              const isBlocked = blockedDates.has(dateStr);
              const isDisabled = isClosedDay || isPast || isBlocked;
              const isSelected = dateStr === selectedDate;
              const isToday = formatDateKey(today) === dateStr;

              return (
                <button
                  key={di}
                  disabled={isDisabled}
                  onClick={() => onSelect(dateStr)}
                  style={{
                    padding: isMobile ? '8px 0' : '10px 0',
                    border: isSelected
                      ? '1px solid #c9a042'
                      : isToday
                        ? '1px solid rgba(201,160,66,0.3)'
                        : '1px solid rgba(255,255,255,0.04)',
                    background: isSelected
                      ? 'rgba(201,160,66,0.15)'
                      : isBlocked
                        ? 'rgba(220,60,60,0.08)'
                        : 'rgba(255,255,255,0.02)',
                    color: isDisabled
                      ? 'rgba(250,246,239,0.15)'
                      : isSelected
                        ? '#c9a042'
                        : '#faf6ef',
                    fontSize: isMobile ? 12 : 13,
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    textAlign: 'center' as const,
                    transition: 'all 0.2s ease',
                    opacity: isDisabled ? 0.4 : 1,
                  }}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
