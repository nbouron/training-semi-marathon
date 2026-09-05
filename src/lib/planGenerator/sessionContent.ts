import type { Level, Phase, SessionType } from '../../types';
import { formatPace } from './pace';
import type { RoleToken } from './roleTables';

export interface ContentInput {
  role: RoleToken;
  phase: Phase;
  level: Level;
  distanceKm: number;
  referencePaceMinKm: number;
  weekIndexInPhase: number;
  phaseTotalWeeks: number;
  isPeakLongRunStretch: boolean;
  /** Recovery or taper week: quality sessions keep some intensity but get shortened. */
  isReducedIntensity: boolean;
}

export interface SessionContent {
  type: SessionType;
  title: string;
  distanceKm: number;
  durationMin: number;
  targetPaceMinKm: [number, number];
  description: string;
}

function paceText(range: [number, number]): string {
  return `${formatPace(range[0])} - ${formatPace(range[1])}`;
}

function progress(weekIndexInPhase: number, phaseTotalWeeks: number): number {
  if (phaseTotalWeeks <= 1) return 1;
  return Math.min(1, weekIndexInPhase / (phaseTotalWeeks - 1));
}

/** Run/walk ladder used for beginners throughout the "fondations" phase — the
 * running share grows each week until a first continuous run appears. */
export function debutantRunWalk(
  totalMinutes: number,
  weekIndexInPhase: number,
  phaseTotalWeeks: number,
): { text: string; continuous: boolean } {
  const p = progress(weekIndexInPhase, phaseTotalWeeks);
  if (p >= 0.85) {
    return {
      continuous: true,
      text: `${Math.round(totalMinutes)} min de course continue à allure très facile — bravo, c'est le premier footing sans pause marche.`,
    };
  }
  const runMin = Math.max(1, Math.round(1 + p * 4));
  const walkMin = Math.max(1, Math.round(3 - p * 2));
  const reps = Math.max(3, Math.round(totalMinutes / (runMin + walkMin)));
  return {
    continuous: false,
    text: `Alterner ${runMin} min de course lente / ${walkMin} min de marche, x${reps} (environ ${Math.round(
      totalMinutes,
    )} min au total).`,
  };
}

const BLENDED_RUNWALK_PACE = 7.5; // min/km, used only to size run/walk sessions in duration

function easyPaceRange(ref: number, recovery: boolean): [number, number] {
  const offset = recovery ? 1.3 : 1.0;
  return [ref + offset, ref + offset + 0.5];
}

export function buildSessionContent(input: ContentInput): SessionContent {
  const { role, phase, level, referencePaceMinKm: ref, weekIndexInPhase, phaseTotalWeeks } = input;
  const isDebutantFondations = level === 'debutant' && phase === 'fondations';

  switch (role) {
    case 'easy_recovery':
    case 'easy_short':
    case 'easy_medium': {
      const label = role === 'easy_recovery' ? 'Footing de récupération' : role === 'easy_medium' ? 'Footing moyen' : 'Footing';
      if (isDebutantFondations) {
        const totalMinutes = Math.max(15, input.distanceKm * BLENDED_RUNWALK_PACE);
        const rw = debutantRunWalk(totalMinutes, weekIndexInPhase, phaseTotalWeeks);
        return {
          type: 'endurance',
          title: label,
          distanceKm: Math.round((totalMinutes / BLENDED_RUNWALK_PACE) * 10) / 10,
          durationMin: Math.round(totalMinutes),
          targetPaceMinKm: [BLENDED_RUNWALK_PACE - 0.5, BLENDED_RUNWALK_PACE + 1],
          description: rw.text,
        };
      }
      const range = easyPaceRange(ref, role === 'easy_recovery');
      const durationMin = Math.round(input.distanceKm * ((range[0] + range[1]) / 2));
      const strides =
        role === 'easy_short' && (phase === 'endurance' || phase === 'specifique')
          ? " Termine par 4 x 20 sec d'accélérations progressives (retour marche entre chaque), pour garder de la vivacité dans les jambes."
          : '';
      return {
        type: 'endurance',
        title: label,
        distanceKm: input.distanceKm,
        durationMin,
        targetPaceMinKm: range,
        description: `${input.distanceKm} km à allure facile (${paceText(range)}), en continu.${strides}`,
      };
    }

    case 'tempo': {
      const isSpecific = phase === 'specifique';
      const range: [number, number] = isSpecific ? [ref, ref + 0.15] : [ref + 0.4, ref + 0.6];
      const p = progress(weekIndexInPhase, phaseTotalWeeks);
      let coreMin = Math.round((isSpecific ? 20 : 15) + p * 10);
      if (input.isReducedIntensity) coreMin = Math.max(8, Math.round(coreMin * 0.5));
      return {
        type: 'tempo',
        title: isSpecific ? 'Allure course' : 'Tempo modéré',
        distanceKm: Math.round((coreMin / ((range[0] + range[1]) / 2)) * 10) / 10,
        durationMin: coreMin + 20,
        targetPaceMinKm: range,
        description: `Footing d'approche 10 min à allure facile, puis ${coreMin} min à ${
          isSpecific ? 'allure course' : 'allure tempo (soutenue mais contrôlée)'
        } (${paceText(range)}), enchaînés sans pause.${
          input.isReducedIntensity ? ' Séance raccourcie (semaine allégée) : on garde le rythme, pas le volume.' : ''
        }`,
      };
    }

    case 'fractionne': {
      const isSpecific = phase === 'specifique';
      const range: [number, number] = [ref - 0.25, ref - 0.1];
      const p = progress(weekIndexInPhase, phaseTotalWeeks);
      let reps = isSpecific ? Math.round(4 + p * 2) : Math.round(6 + p * 4);
      if (input.isReducedIntensity) reps = Math.max(3, Math.round(reps * 0.5));
      const intervalM = isSpecific ? 1000 : 400;
      const recoveryText = isSpecific ? '2 min de trot' : '1 min de trot';
      const totalIntervalKm = (intervalM * reps) / 1000;
      const durationMin = Math.round(20 + totalIntervalKm * ((range[0] + range[1]) / 2) + reps * 1.2);
      return {
        type: 'fractionne',
        title: 'Fractionné',
        distanceKm: Math.round((totalIntervalKm + 3) * 10) / 10,
        durationMin,
        targetPaceMinKm: range,
        description: `10 min de footing d'échauffement, puis ${reps} x ${intervalM} m ${
          isSpecific ? 'proche allure objectif' : 'allure vive'
        } (${paceText(range)}), récupération ${recoveryText} entre chaque. Finir par 10 min de footing très facile.${
          input.isReducedIntensity ? ' Séance raccourcie (semaine allégée) : on garde le rythme, pas le volume.' : ''
        }`,
      };
    }

    case 'sortie_longue': {
      if (isDebutantFondations) {
        const totalMinutes = input.distanceKm * BLENDED_RUNWALK_PACE;
        const rw = debutantRunWalk(totalMinutes, weekIndexInPhase, phaseTotalWeeks);
        return {
          type: 'sortie_longue',
          title: 'Sortie longue',
          distanceKm: input.distanceKm,
          durationMin: Math.round(totalMinutes),
          targetPaceMinKm: [BLENDED_RUNWALK_PACE - 0.5, BLENDED_RUNWALK_PACE + 1],
          description: rw.text,
        };
      }
      const range: [number, number] = [ref + 0.75, ref + 1.25];
      let description = `${input.distanceKm} km à allure facile (${paceText(range)}), en continu.`;
      if (input.isPeakLongRunStretch) {
        const raceSegment = Math.min(5, Math.round(input.distanceKm * 0.25));
        const goalRange: [number, number] = [ref, ref + 0.15];
        description += ` Termine les ${raceSegment} derniers km à allure objectif (${paceText(
          goalRange,
        )}) pour habituer le corps au rythme de course.`;
      }
      const durationMin = Math.round(input.distanceKm * ((range[0] + range[1]) / 2));
      return {
        type: 'sortie_longue',
        title: 'Sortie longue',
        distanceKm: input.distanceKm,
        durationMin,
        targetPaceMinKm: range,
        description,
      };
    }

    default:
      throw new Error(`Unknown role: ${role}`);
  }
}

export function buildFinalWeekEasySession(ref: number, index: number): SessionContent {
  const range: [number, number] = [ref + 1.0, ref + 1.5];
  const durationMin = index === 0 ? 20 : 15;
  return {
    type: 'endurance',
    title: "Footing d'affûtage",
    distanceKm: Math.round((durationMin / ((range[0] + range[1]) / 2)) * 10) / 10,
    durationMin,
    targetPaceMinKm: range,
    description: `${durationMin} min très facile (${paceText(
      range,
    )}) + 4 x 20 sec d'accélérations progressives, retour marche. De quoi rester affûté sans fatigue.`,
  };
}

export function buildRaceDaySession(ref: number, goalLabel: string): SessionContent {
  const range: [number, number] = [ref - 0.1, ref + 0.2];
  return {
    type: 'sortie_longue',
    title: 'Jour J — Semi-marathon (21,1 km)',
    distanceKm: 21.1,
    durationMin: Math.round(21.1 * ref),
    targetPaceMinKm: range,
    description: `Objectif : ${goalLabel}. Pars 10-15 sec/km plus lent que ton allure cible sur les 2 premiers kilomètres, puis stabilise sur ton allure. Ravitaillement à chaque poste (eau, isotonique), un gel toutes les 45 min à partir de 45-60 min de course. Règle du jour J : rien de nouveau — chaussures, tenue et nutrition déjà testées à l'entraînement.`,
  };
}
