import { addDays } from 'date-fns';
import { describe, expect, it } from 'vitest';
import type { Level, UserProfile } from '../../../types';
import { toISODate } from '../dateUtils';
import { generatePlan } from '../index';

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    level: 'occasionnel',
    raceDate: toISODate(addDays(new Date(), 12 * 7)),
    sessionsPerWeek: 3,
    optionalSession: false,
    goal: { type: '2h15' },
    availableDays: [1, 3, 6],
    diet: 'omnivore',
    excludedFoods: '',
    injuries: [],
    ...overrides,
  };
}

describe('generatePlan', () => {
  it('produces one week per available week, ending on race day', () => {
    const plan = generatePlan(makeProfile());
    expect(plan.weeks.length).toBe(plan.weeksAvailable);
    const lastWeek = plan.weeks[plan.weeks.length - 1];
    expect(lastWeek.endDate).toBe(plan.profile.raceDate);
    const raceSession = lastWeek.sessions.find((s) => s.distanceKm === 21.1);
    expect(raceSession).toBeTruthy();
    expect(raceSession?.date).toBe(plan.profile.raceDate);
  });

  it('never schedules a long run over 18km', () => {
    const plan = generatePlan(makeProfile({ level: 'confirme', sessionsPerWeek: 5, goal: { type: '1h40' } }));
    for (const week of plan.weeks) {
      for (const s of week.sessions) {
        if (s.type === 'sortie_longue' && s.distanceKm !== 21.1) {
          expect(s.distanceKm).toBeLessThanOrEqual(18);
        }
      }
    }
  });

  it('never grows weekly volume by more than 10% week over week (outside recovery/taper)', () => {
    const plan = generatePlan(makeProfile({ level: 'regulier', sessionsPerWeek: 4 }));
    for (let i = 1; i < plan.weeks.length; i += 1) {
      const prev = plan.weeks[i - 1];
      const curr = plan.weeks[i];
      if (!curr.isRecoveryWeek && !curr.isTaperWeek && !prev.isRecoveryWeek && !prev.isTaperWeek) {
        expect(curr.totalVolumeKm).toBeLessThanOrEqual(prev.totalVolumeKm * 1.101);
      }
    }
  });

  it('never places two hard sessions on consecutive calendar days when alternatives exist', () => {
    const plan = generatePlan(
      makeProfile({ sessionsPerWeek: 4, availableDays: [1, 2, 3, 4, 5, 6, 0] }),
    );
    for (const week of plan.weeks) {
      const hardDates = week.sessions.filter((s) => s.isHard).map((s) => s.date).sort();
      for (let i = 1; i < hardDates.length; i += 1) {
        const diffDays =
          (new Date(hardDates[i]).getTime() - new Date(hardDates[i - 1]).getTime()) / 86400000;
        expect(diffDays).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('applies a taper in the final two weeks', () => {
    const plan = generatePlan(makeProfile());
    const weeks = plan.weeks;
    expect(weeks[weeks.length - 1].isTaperWeek).toBe(true);
    if (weeks.length >= 5) expect(weeks[weeks.length - 2].isTaperWeek).toBe(true);
  });

  it('flags short-notice beginner plans', () => {
    const plan = generatePlan(
      makeProfile({ level: 'debutant', raceDate: toISODate(addDays(new Date(), 6 * 7)) }),
    );
    expect(plan.shortNotice).toBe(true);
  });

  it('computes feasibility deterministically', () => {
    const levels: Level[] = ['debutant', 'occasionnel', 'regulier', 'confirme'];
    for (const level of levels) {
      const plan = generatePlan(makeProfile({ level, goal: { type: 'terminer' } }));
      expect(plan.feasibility).toBe('realiste');
    }
  });
});
