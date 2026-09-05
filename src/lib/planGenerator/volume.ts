import type { Level } from '../../types';
import type { WeekMeta } from './phases';

const START_VOLUME_KM: Record<Level, number> = {
  debutant: 8,
  occasionnel: 12,
  regulier: 18,
  confirme: 25,
};

// Baseline ceiling assuming 5 sessions/week to spread the volume across.
const MAX_VOLUME_KM_AT_5_SESSIONS: Record<Level, number> = {
  debutant: 32,
  occasionnel: 42,
  regulier: 52,
  confirme: 62,
};

// With fewer sessions, the same weekly volume would have to be crammed into fewer,
// unrealistically long non-long-run sessions — so the ceiling scales down with them.
const VOLUME_CAP_FACTOR_BY_SESSIONS: Record<number, number> = {
  2: 0.5,
  3: 0.7,
  4: 0.85,
  5: 1,
};

function maxVolumeKm(level: Level, sessionsPerWeek: number): number {
  const factor = VOLUME_CAP_FACTOR_BY_SESSIONS[sessionsPerWeek] ?? 1;
  return MAX_VOLUME_KM_AT_5_SESSIONS[level] * factor;
}

const MIN_LONG_RUN_KM: Record<Level, number> = {
  debutant: 3,
  occasionnel: 5,
  regulier: 8,
  confirme: 10,
};

const MAX_PROGRESSION = 1.1; // +10% per week hard cap
const RECOVERY_FACTOR = 0.7; // ~30% volume cut
const TAPER_FACTORS_2W = [0.6, 0.35];
const TAPER_FACTORS_1W = [0.45];

const LONG_RUN_RATIO_BY_SESSIONS: Record<number, number> = {
  2: 0.55,
  3: 0.45,
  4: 0.4,
  5: 0.35,
};

export interface WeekVolume {
  totalVolumeKm: number;
  longRunKm: number;
}

export function computeWeeklyVolumes(
  weekMetas: WeekMeta[],
  level: Level,
  sessionsPerWeek: number,
): WeekVolume[] {
  const cap = maxVolumeKm(level, sessionsPerWeek);
  const longRunRatio = LONG_RUN_RATIO_BY_SESSIONS[sessionsPerWeek] ?? 0.4;
  const minLongRun = MIN_LONG_RUN_KM[level];

  let peak = START_VOLUME_KM[level];
  const taperWeekCount = weekMetas.filter((w) => w.isTaperWeek).length;
  const taperFactors = taperWeekCount >= 2 ? TAPER_FACTORS_2W : TAPER_FACTORS_1W;
  let taperIndex = 0;

  return weekMetas.map((meta, index) => {
    let volume: number;

    if (meta.isTaperWeek) {
      const factor = taperFactors[Math.min(taperIndex, taperFactors.length - 1)];
      taperIndex += 1;
      volume = peak * factor;
    } else if (meta.isRecoveryWeek) {
      volume = peak * RECOVERY_FACTOR;
    } else if (index === 0) {
      volume = peak;
    } else {
      volume = Math.min(peak * MAX_PROGRESSION, cap);
      peak = volume;
    }

    volume = Math.round(volume * 10) / 10;

    let longRun = Math.round(Math.min(volume * longRunRatio, 18));
    longRun = Math.max(longRun, meta.isTaperWeek ? 4 : minLongRun);
    longRun = Math.min(longRun, 18, volume - 2 > 0 ? volume - 2 : longRun);

    return { totalVolumeKm: volume, longRunKm: longRun };
  });
}
