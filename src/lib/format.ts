// Shared date/time formatting helpers used across the booking flow and admin portal.
// Kept in one place so a formatting or timezone change is made once, not in 6+ copies.

/** Format a 24h "HH:MM[:SS]" time string as 12-hour "h:MM AM/PM". */
export function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

/** Format a "YYYY-MM-DD" date string as a localized en-GB date. */
export function formatDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' },
): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-GB', options);
}

/**
 * Local calendar date as "YYYY-MM-DD".
 * Uses local getFullYear/getMonth/getDate rather than toISOString(), which would
 * shift the date across the UTC boundary and mismatch locally-stored appointment dates.
 */
export function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
