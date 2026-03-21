import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CLINIC_HOURS as DEFAULT_HOURS } from '../lib/constants';
import type { ClinicHours } from '../lib/types';

export interface ClinicHoursMap {
  [day: string]: ClinicHours | null;
}

interface ClinicHoursContextType {
  hours: ClinicHoursMap;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ClinicHoursContext = createContext<ClinicHoursContextType | undefined>(undefined);

export function ClinicHoursProvider({ children }: { children: React.ReactNode }) {
  const [hours, setHours] = useState<ClinicHoursMap>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);

  const fetchHours = async () => {
    const { data, error } = await supabase
      .from('clinic_settings')
      .select('day_of_week, is_open, start_time, end_time');

    if (!error && data && data.length > 0) {
      const map: ClinicHoursMap = {};
      for (const row of data) {
        if (row.is_open && row.start_time && row.end_time) {
          map[row.day_of_week] = {
            start: row.start_time.substring(0, 5),
            end: row.end_time.substring(0, 5),
          };
        } else {
          map[row.day_of_week] = null;
        }
      }
      setHours(map);
    }
    // If fetch fails, keep the hardcoded defaults
    setLoading(false);
  };

  useEffect(() => { fetchHours(); }, []);

  return (
    <ClinicHoursContext.Provider value={{ hours, loading, refresh: fetchHours }}>
      {children}
    </ClinicHoursContext.Provider>
  );
}

export function useClinicHours() {
  const context = useContext(ClinicHoursContext);
  if (context === undefined) {
    throw new Error('useClinicHours must be used within a ClinicHoursProvider');
  }
  return context;
}
