import type { TrainingPlan, TrainingSession, UserProfile, WeekPlan } from '../../types';
import { buildWeekWindows, fromISODate, weeksAvailableUntil } from './dateUtils';
import { buildStretches, buildWarmup, injuryAdaptationNote } from './exercises';
import { buildOptionalSession } from './optionalSession';
import { computeFeasibility, goalLabel, referencePaceMinKm } from './pace';
import { buildWeekMetas } from './phases';
import { ROLE_IS_HARD, ROLE_WEIGHT, resolveRoles } from './roleTables';
import { assignDaysToRoles, type RoleSlot } from './scheduler';
import { buildFinalWeekEasySession, buildRaceDaySession, buildSessionContent } from './sessionContent';
import { computeWeeklyVolumes } from './volume';

export * from './pace';

// No non-long-run session (easy, tempo, fractionné) should ever rival the long run.
const NON_LONG_RUN_MAX_KM = 16;

function phaseBlockRanges(metas: { phase: string }[]): Map<number, { start: number; length: number }> {
  const map = new Map<number, { start: number; length: number }>();
  let start = 0;
  for (let i = 1; i <= metas.length; i += 1) {
    if (i === metas.length || metas[i].phase !== metas[start].phase) {
      const length = i - start;
      for (let j = start; j < i; j += 1) map.set(j, { start, length });
      start = i;
    }
  }
  return map;
}

let idCounter = 0;
function makeSession(
  base: ReturnType<typeof buildSessionContent>,
  weekNumber: number,
  date: string,
  injuries: UserProfile['injuries'],
  isHard: boolean,
  optional: boolean,
): TrainingSession {
  idCounter += 1;
  const note = injuryAdaptationNote(injuries);
  return {
    id: `s${weekNumber}-${date}-${idCounter}`,
    weekNumber,
    date,
    type: base.type,
    title: base.title,
    durationMin: base.durationMin,
    distanceKm: base.distanceKm,
    targetPaceMinKm: base.targetPaceMinKm,
    description: note && !optional ? `${base.description}\n\n${note}` : base.description,
    warmup: buildWarmup(base.type, injuries),
    cooldown: base.type === 'repos' ? '' : '5 min de footing très lent ou marche.',
    stretches: buildStretches(base.type, injuries),
    isHard,
    optional,
  };
}

function restSession(weekNumber: number, date: string): TrainingSession {
  return {
    id: `s${weekNumber}-${date}-rest`,
    weekNumber,
    date,
    type: 'repos',
    title: 'Repos',
    description: 'Repos complet ou marche légère. Profites-en pour bien récupérer : sommeil, hydratation, alimentation.',
    warmup: [],
    cooldown: '',
    stretches: [],
    isHard: false,
    optional: false,
  };
}

export function generatePlan(profile: UserProfile): TrainingPlan {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const raceDate = fromISODate(profile.raceDate);

  const weeksAvailable = weeksAvailableUntil(today, raceDate);
  const shortNotice = weeksAvailable < 10 && profile.level === 'debutant';

  const weekMetas = buildWeekMetas(weeksAvailable, profile.level);
  const weekVolumes = computeWeeklyVolumes(weekMetas, profile.level, profile.sessionsPerWeek);
  const weekWindows = buildWeekWindows(today, raceDate, weeksAvailable);
  const blockRanges = phaseBlockRanges(weekMetas);

  const ref = referencePaceMinKm(profile.level, profile.goal);
  const label = goalLabel(profile.goal);

  const weeks: WeekPlan[] = weekMetas.map((meta, i) => {
    const window = weekWindows[i];
    const vol = weekVolumes[i];
    const weekNumber = i + 1;
    const isLastWeek = i === weeksAvailable - 1;
    const block = blockRanges.get(i)!;
    const weekIndexInPhase = i - block.start;

    let sessions: TrainingSession[];

    if (isLastWeek) {
      const raceContent = buildRaceDaySession(ref, label);
      const otherDates = window.dates.filter((d) => d !== window.endDate).sort();
      const restCount = Math.min(2, otherDates.length);
      const easyDates = otherDates.slice(0, Math.max(0, otherDates.length - restCount));

      sessions = [
        makeSession(raceContent, weekNumber, window.endDate, profile.injuries, false, false),
        ...easyDates.map((d, idx) =>
          makeSession(buildFinalWeekEasySession(ref, idx), weekNumber, d, profile.injuries, false, false),
        ),
        ...otherDates.slice(easyDates.length).map((d) => restSession(weekNumber, d)),
      ];
    } else {
      const roles = resolveRoles(profile.sessionsPerWeek, meta.phase, weekIndexInPhase);
      const nonLongRoles = roles.filter((r) => r !== 'sortie_longue');
      const weightSum = nonLongRoles.reduce((acc, r) => acc + ROLE_WEIGHT[r], 0);
      const remainingVol = Math.max(2, vol.totalVolumeKm - vol.longRunKm);

      const slots: RoleSlot[] = roles.map((r) => ({ role: r, isHard: ROLE_IS_HARD[r] }));
      if (profile.optionalSession) slots.push({ role: 'optional', isHard: false });

      const longRunRoleIndex = roles.indexOf('sortie_longue');
      const dateMap = assignDaysToRoles(slots, window.dates, profile.availableDays, longRunRoleIndex);

      const isPeakLongRunStretch = meta.phase === 'specifique' && !meta.isRecoveryWeek && vol.longRunKm >= 14;

      const built: TrainingSession[] = [];
      roles.forEach((role, idx) => {
        const date = dateMap.get(idx);
        if (!date) return;
        let distanceKm =
          role === 'sortie_longue'
            ? vol.longRunKm
            : Math.round((remainingVol * (ROLE_WEIGHT[role] / weightSum)) * 2) / 2;
        // The long run must stay the longest session of the week: cap any other
        // session well below it (and below a sane absolute ceiling regardless).
        if (role !== 'sortie_longue') {
          distanceKm = Math.min(distanceKm, NON_LONG_RUN_MAX_KM, Math.max(3, vol.longRunKm - 1));
        }
        const content = buildSessionContent({
          role,
          phase: meta.phase,
          level: profile.level,
          distanceKm: Math.max(2, distanceKm),
          referencePaceMinKm: ref,
          weekIndexInPhase,
          phaseTotalWeeks: block.length,
          isPeakLongRunStretch: role === 'sortie_longue' && isPeakLongRunStretch,
          isReducedIntensity: meta.isRecoveryWeek || meta.isTaperWeek,
        });
        // Last-resort safety net: tempo/fractionné compute their own distance from a
        // time-based structure, so double-check it didn't end up rivaling the long run.
        if (role !== 'sortie_longue' && content.distanceKm > Math.min(NON_LONG_RUN_MAX_KM, vol.longRunKm - 0.5)) {
          const cappedDistance = Math.max(2, Math.min(NON_LONG_RUN_MAX_KM, vol.longRunKm - 0.5));
          const ratio = cappedDistance / content.distanceKm;
          content.distanceKm = Math.round(cappedDistance * 10) / 10;
          content.durationMin = Math.round(content.durationMin * ratio);
        }
        built.push(makeSession(content, weekNumber, date, profile.injuries, ROLE_IS_HARD[role], false));
      });

      if (profile.optionalSession) {
        const optionalIndex = roles.length;
        const date = dateMap.get(optionalIndex);
        if (date) {
          const content = buildOptionalSession(profile.injuries);
          built.push(makeSession(content, weekNumber, date, profile.injuries, false, true));
        }
      }

      const usedDates = new Set(built.map((s) => s.date));
      const restDates = window.dates.filter((d) => !usedDates.has(d));
      sessions = [...built, ...restDates.map((d) => restSession(weekNumber, d))];
    }

    sessions.sort((a, b) => a.date.localeCompare(b.date));

    const totalVolumeKm = Math.round(
      sessions
        .filter((s) => !s.optional && (s.type === 'endurance' || s.type === 'tempo' || s.type === 'fractionne' || s.type === 'sortie_longue'))
        .reduce((acc, s) => acc + (s.distanceKm ?? 0), 0) * 10,
    ) / 10;

    return {
      number: weekNumber,
      startDate: window.startDate,
      endDate: window.endDate,
      phase: meta.phase,
      isRecoveryWeek: meta.isRecoveryWeek,
      isTaperWeek: meta.isTaperWeek,
      totalVolumeKm,
      sessions,
    };
  });

  const feasibility = computeFeasibility({
    level: profile.level,
    goal: profile.goal,
    weeksAvailable,
    sessionsPerWeek: profile.sessionsPerWeek,
  });

  return {
    id: `plan-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    profile,
    weeks,
    paceTargetMinKm: profile.goal.type === 'terminer' ? null : ref,
    feasibility,
    weeksAvailable,
    shortNotice,
  };
}
