import type { Feasibility, Goal, Level } from '../../types';

const HALF_MARATHON_KM = 21.1;

/** Assumed current half-marathon-equivalent pace (min/km) for each level, used only
 * to estimate feasibility of a goal — never shown to the user as a "current pace". */
const LEVEL_BASE_PACE_MIN_KM: Record<Level, number> = {
  debutant: 7.75,
  occasionnel: 7.0,
  regulier: 6.25,
  confirme: 5.5,
};

const GOAL_TOTAL_MINUTES: Partial<Record<Goal['type'], number>> = {
  '2h30': 150,
  '2h15': 135,
  '2h00': 120,
  '1h50': 110,
  '1h40': 100,
};

/** Returns the target pace in decimal minutes/km, or null for "terminer" (no chrono goal). */
export function levelBasePaceMinKm(level: Level): number {
  return LEVEL_BASE_PACE_MIN_KM[level];
}

/** Reference pace used to derive every session's target pace: the goal pace when the
 * user set one, otherwise the level's assumed base pace. */
export function referencePaceMinKm(level: Level, goal: Goal): number {
  return goalPaceMinKm(goal) ?? LEVEL_BASE_PACE_MIN_KM[level];
}

export function goalPaceMinKm(goal: Goal): number | null {
  if (goal.type === 'terminer') return null;
  if (goal.type === 'custom') {
    if (!goal.customMinutes || goal.customMinutes <= 0) return null;
    return goal.customMinutes / HALF_MARATHON_KM;
  }
  const minutes = GOAL_TOTAL_MINUTES[goal.type];
  return minutes ? minutes / HALF_MARATHON_KM : null;
}

export function formatPace(paceMinKm: number): string {
  const minutes = Math.floor(paceMinKm);
  const seconds = Math.round((paceMinKm - minutes) * 60);
  const mm = seconds === 60 ? minutes + 1 : minutes;
  const ss = seconds === 60 ? 0 : seconds;
  return `${mm}:${ss.toString().padStart(2, '0')} /km`;
}

export function goalLabel(goal: Goal): string {
  switch (goal.type) {
    case 'terminer':
      return 'Terminer la course';
    case 'custom':
      return goal.customMinutes ? `Objectif personnalisé (${formatMinutesAsClock(goal.customMinutes)})` : 'Objectif personnalisé';
    default:
      return `Sous ${goal.type.replace('h', 'h')}`;
  }
}

export function formatMinutesAsClock(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m} min`;
}

export interface FeasibilityInput {
  level: Level;
  goal: Goal;
  weeksAvailable: number;
  sessionsPerWeek: number;
}

export function computeFeasibility({
  level,
  goal,
  weeksAvailable,
  sessionsPerWeek,
}: FeasibilityInput): Feasibility {
  if (goal.type === 'terminer') return 'realiste';

  const target = goalPaceMinKm(goal);
  if (target === null) return 'realiste';

  const base = LEVEL_BASE_PACE_MIN_KM[level];
  // Positive delta = goal pace is faster (harder) than the level's assumed base pace.
  const deltaRatio = (base - target) / base;

  let score = 0;
  if (deltaRatio > 0.18) score = 2;
  else if (deltaRatio > 0.08) score = 1;
  else score = 0;

  if (weeksAvailable < 8) score += 1;
  else if (weeksAvailable >= 16 && sessionsPerWeek >= 4) score -= 1;

  if (sessionsPerWeek <= 2 && score > 0) score += 1;

  score = Math.max(0, Math.min(2, score));

  return (['realiste', 'ambitieux', 'tres_ambitieux'] as const)[score];
}
