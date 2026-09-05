import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generatePlan } from '../lib/planGenerator';
import type { SessionCompletion, TrainingPlan, UserProfile } from '../types';

type MenuOverrideKey = string; // `${weekNumber}-${dayIndex}-${moment}`

interface AppState {
  profile: UserProfile | null;
  plan: TrainingPlan | null;
  menuOverrides: Record<MenuOverrideKey, string>;
  disclaimerAcknowledged: boolean;

  acknowledgeDisclaimer: () => void;
  createPlan: (profile: UserProfile) => void;
  resetPlan: () => void;
  toggleSessionComplete: (sessionId: string, completion: SessionCompletion) => void;
  rescheduleSession: (sessionId: string, newDate: string) => void;
  markWeekDisrupted: (weekNumber: number) => void;
  setMenuOverride: (key: MenuOverrideKey, recipeId: string) => void;
}

export function menuOverrideKey(weekNumber: number, dayIndex: number, moment: string): MenuOverrideKey {
  return `${weekNumber}-${dayIndex}-${moment}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      plan: null,
      menuOverrides: {},
      disclaimerAcknowledged: false,

      acknowledgeDisclaimer: () => set({ disclaimerAcknowledged: true }),

      createPlan: (profile) => {
        const plan = generatePlan(profile);
        set({ profile, plan, menuOverrides: {} });
      },

      resetPlan: () => set({ profile: null, plan: null, menuOverrides: {} }),

      toggleSessionComplete: (sessionId, completion) => {
        const plan = get().plan;
        if (!plan) return;
        const weeks = plan.weeks.map((week) => ({
          ...week,
          sessions: week.sessions.map((s) => (s.id === sessionId ? { ...s, completion } : s)),
        }));
        set({ plan: { ...plan, weeks } });
      },

      rescheduleSession: (sessionId, newDate) => {
        const plan = get().plan;
        if (!plan) return;
        const weeks = plan.weeks.map((week) => {
          const target = week.sessions.find((s) => s.id === sessionId);
          if (!target) return week;
          const oldDate = target.date;
          const occupying = week.sessions.find((s) => s.date === newDate && s.id !== sessionId);
          const sessions = week.sessions.map((s) => {
            if (s.id === sessionId) return { ...s, date: newDate, moved: { fromDate: oldDate } };
            if (occupying && s.id === occupying.id) return { ...s, date: oldDate };
            return s;
          });
          sessions.sort((a, b) => a.date.localeCompare(b.date));
          return { ...week, sessions };
        });
        set({ plan: { ...plan, weeks } });
      },

      markWeekDisrupted: (weekNumber) => {
        const plan = get().plan;
        if (!plan) return;
        const todayIso = new Date().toISOString().slice(0, 10);
        const weekIndex = plan.weeks.findIndex((w) => w.number === weekNumber);
        if (weekIndex === -1) return;
        const week = plan.weeks[weekIndex];
        if (week.disrupted) return;

        const originalVolume = week.totalVolumeKm;
        const sessions = week.sessions.map((s) => {
          if (s.date < todayIso || s.completion?.done || s.type === 'repos') return s;
          return {
            ...s,
            type: 'repos' as const,
            title: 'Repos (semaine perturbée)',
            distanceKm: undefined,
            durationMin: undefined,
            targetPaceMinKm: undefined,
            description: 'Séance annulée suite à une semaine perturbée. Reprends normalement dès que possible.',
            warmup: [],
            cooldown: '',
            stretches: [],
            isHard: false,
          };
        });
        const runningTypes = new Set(['endurance', 'tempo', 'fractionne', 'sortie_longue']);
        const newVolume =
          Math.round(
            sessions
              .filter((s) => !s.optional && runningTypes.has(s.type))
              .reduce((acc, s) => acc + (s.distanceKm ?? 0), 0) * 10,
          ) / 10;

        const weeks = [...plan.weeks];
        weeks[weekIndex] = { ...week, sessions, totalVolumeKm: newVolume, disrupted: true };

        // Soften next week: don't let it progress beyond the disrupted week's original volume.
        const nextIndex = weekIndex + 1;
        if (nextIndex < weeks.length && originalVolume > 0) {
          const nextWeek = weeks[nextIndex];
          if (nextWeek.totalVolumeKm > originalVolume) {
            const factor = originalVolume / nextWeek.totalVolumeKm;
            const nextSessions = nextWeek.sessions.map((s) => {
              if (!runningTypes.has(s.type) || s.optional) return s;
              const distanceKm = s.distanceKm ? Math.min(s.distanceKm, Math.round(s.distanceKm * factor * 2) / 2) : s.distanceKm;
              const durationMin = s.durationMin ? Math.round(s.durationMin * factor) : s.durationMin;
              return { ...s, distanceKm, durationMin };
            });
            const nextVolume =
              Math.round(
                nextSessions
                  .filter((s) => !s.optional && runningTypes.has(s.type))
                  .reduce((acc, s) => acc + (s.distanceKm ?? 0), 0) * 10,
              ) / 10;
            weeks[nextIndex] = { ...nextWeek, sessions: nextSessions, totalVolumeKm: nextVolume };
          }
        }

        set({ plan: { ...plan, weeks } });
      },

      setMenuOverride: (key, recipeId) => {
        set({ menuOverrides: { ...get().menuOverrides, [key]: recipeId } });
      },
    }),
    {
      name: 'semi-marathon-coach-store',
    },
  ),
);
