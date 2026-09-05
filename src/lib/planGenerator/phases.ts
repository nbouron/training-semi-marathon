import type { Level, Phase } from '../../types';

export interface WeekMeta {
  index: number; // 0-based
  phase: Phase;
  isRecoveryWeek: boolean;
  isTaperWeek: boolean;
}

const PHASE_RATIOS: Record<Level, { fondations: number; endurance: number; specifique: number }> = {
  debutant: { fondations: 0.4, endurance: 0.35, specifique: 0.25 },
  occasionnel: { fondations: 0.2, endurance: 0.45, specifique: 0.35 },
  regulier: { fondations: 0.1, endurance: 0.45, specifique: 0.45 },
  confirme: { fondations: 0, endurance: 0.4, specifique: 0.6 },
};

/**
 * Distributes `totalWeeks` across the three phases + taper.
 * Taper is always the last 1-2 weeks (2 as soon as there's room for it) and is
 * carved out first; the remainder is split fondations/endurance/specifique by level.
 */
export function buildWeekMetas(totalWeeks: number, level: Level): WeekMeta[] {
  const taperWeeks = totalWeeks >= 5 ? 2 : totalWeeks >= 3 ? 1 : 0;
  const buildWeeks = Math.max(0, totalWeeks - taperWeeks);

  const ratios = PHASE_RATIOS[level];
  const counts = allocateWeeks(buildWeeks, ratios);

  const phases: Phase[] = [
    ...Array(counts.fondations).fill('fondations' as const),
    ...Array(counts.endurance).fill('endurance' as const),
    ...Array(counts.specifique).fill('specifique' as const),
  ];
  // Taper weeks belong to the "specifique" phase (race-specific work continues, at lower volume).
  while (phases.length < totalWeeks) phases.push('specifique');

  const cadence = buildWeeks >= 8 ? 4 : 3;
  return phases.map((phase, index) => {
    const isTaperWeek = index >= totalWeeks - taperWeeks;
    const inBuild = index < buildWeeks;
    const isRecoveryWeek =
      !isTaperWeek &&
      inBuild &&
      index >= 2 &&
      index < buildWeeks - 1 &&
      (index + 1) % cadence === 0;
    return { index, phase, isRecoveryWeek, isTaperWeek };
  });
}

function allocateWeeks(
  total: number,
  ratios: { fondations: number; endurance: number; specifique: number },
): { fondations: number; endurance: number; specifique: number } {
  if (total <= 0) return { fondations: 0, endurance: 0, specifique: 0 };

  const raw = {
    fondations: total * ratios.fondations,
    endurance: total * ratios.endurance,
    specifique: total * ratios.specifique,
  };
  const floored = {
    fondations: Math.floor(raw.fondations),
    endurance: Math.floor(raw.endurance),
    specifique: Math.floor(raw.specifique),
  };
  // Guarantee at least 1 week for any phase with a non-zero ratio, if we can afford it.
  (Object.keys(floored) as Array<keyof typeof floored>).forEach((key) => {
    if (ratios[key] > 0 && floored[key] === 0) floored[key] = 1;
  });

  let remainder =
    total - (floored.fondations + floored.endurance + floored.specifique);

  // Distribute/remove remainder from the phase(s) with the largest weight first.
  const order = (Object.keys(ratios) as Array<keyof typeof ratios>).sort(
    (a, b) => ratios[b] - ratios[a],
  );
  let i = 0;
  while (remainder !== 0 && i < 1000) {
    const key = order[i % order.length];
    if (remainder > 0) {
      floored[key] += 1;
      remainder -= 1;
    } else if (floored[key] > (ratios[key] > 0 ? 1 : 0)) {
      floored[key] -= 1;
      remainder += 1;
    }
    i += 1;
  }

  return floored;
}
