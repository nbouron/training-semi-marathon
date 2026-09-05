import { addDays, differenceInCalendarDays, formatISO as fnsFormatISO, parseISO } from 'date-fns';

export function toISODate(date: Date): string {
  return fnsFormatISO(date, { representation: 'date' });
}

export function fromISODate(iso: string): Date {
  return parseISO(iso);
}

/** Whole weeks between today and race day, rounded up (a partial week still counts as one). */
export function weeksAvailableUntil(today: Date, raceDate: Date): number {
  const days = differenceInCalendarDays(raceDate, today);
  return Math.max(1, Math.ceil((days + 1) / 7));
}

export interface WeekWindow {
  startDate: string;
  endDate: string;
  dates: string[];
}

/**
 * Splits [today, raceDate] into `totalWeeks` 7-day windows starting at `today`.
 * The final window is truncated so it ends exactly on raceDate.
 */
export function buildWeekWindows(today: Date, raceDate: Date, totalWeeks: number): WeekWindow[] {
  const windows: WeekWindow[] = [];
  let cursor = today;
  for (let i = 0; i < totalWeeks; i += 1) {
    const isLast = i === totalWeeks - 1;
    const naturalEnd = addDays(cursor, 6);
    const end = isLast ? raceDate : naturalEnd;
    const dates: string[] = [];
    let d = cursor;
    while (differenceInCalendarDays(end, d) >= 0) {
      dates.push(toISODate(d));
      d = addDays(d, 1);
    }
    windows.push({ startDate: toISODate(cursor), endDate: toISODate(end), dates });
    cursor = addDays(end, 1);
  }
  return windows;
}
