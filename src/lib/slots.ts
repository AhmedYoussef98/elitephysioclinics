// Shared slot-generation helpers. Previously the 30-minute slot loop was copy-pasted
// into TimeSlotPicker, CreateAppointment, AvailabilityManager and the reschedule UI.

import { SLOT_DURATION_MINUTES } from './constants';
import type { ClinicHours } from './types';

/** Add `minutes` to a "HH:MM" time string, returning "HH:MM". */
export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Generate the list of slot start times ("HH:MM") that fit within the given clinic hours. */
export function generateSlotStartTimes(
  hours: ClinicHours,
  slotMinutes: number = SLOT_DURATION_MINUTES,
): string[] {
  const [sh, sm] = hours.start.split(':').map(Number);
  const [eh, em] = hours.end.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  const times: string[] = [];
  for (let min = startMin; min + slotMinutes <= endMin; min += slotMinutes) {
    times.push(`${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`);
  }
  return times;
}
