import { differenceInCalendarDays, getDay, parseISO } from 'date-fns';
import type { WeekdayIndex } from '../../types';

export interface RoleSlot {
  role: string;
  isHard: boolean;
}

/**
 * Picks a calendar date for each role within a week window, honouring:
 * - the long-run role goes on a weekend day when the user made one available
 * - hard sessions (tempo/fractionné/long run) are spread out, never left adjacent
 *   when an alternative slot exists
 */
export function assignDaysToRoles(
  roles: RoleSlot[],
  weekDates: string[],
  availableDays: WeekdayIndex[],
  longRunRoleIndex: number,
): Map<number, string> {
  const byDay = (iso: string) => getDay(parseISO(iso)) as WeekdayIndex;

  let matching = weekDates.filter((d) => availableDays.includes(byDay(d)));
  if (matching.length < roles.length) {
    const extra = weekDates.filter((d) => !matching.includes(d));
    matching = [...matching, ...extra].sort();
  }
  matching = [...new Set(matching)].sort();

  const result = new Map<number, string>();
  if (matching.length === 0) return result;

  const pool = [...matching];

  // 1. Long run: prefer Sunday, then Saturday, else the latest available date.
  let longRunDate: string | undefined;
  if (longRunRoleIndex >= 0) {
    longRunDate =
      pool.find((d) => byDay(d) === 0) ??
      pool.find((d) => byDay(d) === 6) ??
      pool[pool.length - 1];
    if (longRunDate) {
      result.set(longRunRoleIndex, longRunDate);
      pool.splice(pool.indexOf(longRunDate), 1);
    }
  }

  const otherIndices = roles
    .map((_, i) => i)
    .filter((i) => i !== longRunRoleIndex);
  const needed = otherIndices.length;

  let selectedDates: string[];
  if (pool.length <= needed) {
    selectedDates = pool;
  } else {
    selectedDates = otherIndices.map((_, i) => {
      const pos = needed <= 1 ? 0 : Math.round((i * (pool.length - 1)) / (needed - 1));
      return pool[pos];
    });
    selectedDates = [...new Set(selectedDates)];
    // Backfill in case rounding produced duplicates.
    for (const d of pool) {
      if (selectedDates.length >= needed) break;
      if (!selectedDates.includes(d)) selectedDates.push(d);
    }
    selectedDates.sort();
  }

  // 2. Interleave hard/easy roles so consecutive dates don't both get a hard role.
  const hardIdx = otherIndices.filter((i) => roles[i].isHard);
  const easyIdx = otherIndices.filter((i) => !roles[i].isHard);
  const order: number[] = [];
  let hp = 0;
  let ep = 0;
  let turnIsHard = hardIdx.length >= easyIdx.length;
  while (hp < hardIdx.length || ep < easyIdx.length) {
    if (turnIsHard && hp < hardIdx.length) {
      order.push(hardIdx[hp++]);
    } else if (!turnIsHard && ep < easyIdx.length) {
      order.push(easyIdx[ep++]);
    } else if (hp < hardIdx.length) {
      order.push(hardIdx[hp++]);
    } else {
      order.push(easyIdx[ep++]);
    }
    turnIsHard = !turnIsHard;
  }

  order.slice(0, selectedDates.length).forEach((roleIndex, i) => {
    result.set(roleIndex, selectedDates[i]);
  });

  // 3. Post-pass: swap adjacent hard/hard pairs (including the long run date) when a
  // non-adjacent easy slot is available to trade with.
  const allHardIndices = [...(longRunRoleIndex >= 0 ? [longRunRoleIndex] : []), ...hardIdx];
  for (let a = 0; a < allHardIndices.length; a += 1) {
    for (let b = a + 1; b < allHardIndices.length; b += 1) {
      const ia = allHardIndices[a];
      const ib = allHardIndices[b];
      const da = result.get(ia);
      const db = result.get(ib);
      if (!da || !db) continue;
      if (Math.abs(differenceInCalendarDays(parseISO(da), parseISO(db))) !== 1) continue;
      const swapCandidate = easyIdx.find((ei) => {
        const de = result.get(ei);
        if (!de) return false;
        const okVsA = Math.abs(differenceInCalendarDays(parseISO(de), parseISO(da))) !== 1;
        const okVsB = Math.abs(differenceInCalendarDays(parseISO(de), parseISO(db))) !== 1;
        return okVsA && okVsB;
      });
      if (swapCandidate !== undefined) {
        const easyDate = result.get(swapCandidate)!;
        result.set(swapCandidate, db);
        result.set(ib, easyDate);
      }
    }
  }

  return result;
}
