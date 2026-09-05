import type { Phase } from '../../types';

export type RoleToken =
  | 'easy_recovery'
  | 'easy_short'
  | 'easy_medium'
  | 'tempo'
  | 'fractionne'
  | 'qualite_alt'
  | 'sortie_longue';

type Table = Record<2 | 3 | 4 | 5, Record<Phase, RoleToken[]>>;

export const ROLE_TABLES: Table = {
  2: {
    fondations: ['easy_short', 'sortie_longue'],
    endurance: ['easy_short', 'sortie_longue'],
    specifique: ['tempo', 'sortie_longue'],
  },
  3: {
    fondations: ['easy_short', 'easy_medium', 'sortie_longue'],
    endurance: ['easy_short', 'tempo', 'sortie_longue'],
    specifique: ['easy_short', 'qualite_alt', 'sortie_longue'],
  },
  4: {
    fondations: ['easy_short', 'easy_medium', 'easy_short', 'sortie_longue'],
    endurance: ['easy_short', 'fractionne', 'tempo', 'sortie_longue'],
    specifique: ['easy_short', 'fractionne', 'tempo', 'sortie_longue'],
  },
  5: {
    fondations: ['easy_recovery', 'easy_short', 'easy_medium', 'easy_short', 'sortie_longue'],
    endurance: ['easy_recovery', 'fractionne', 'tempo', 'easy_short', 'sortie_longue'],
    specifique: ['easy_recovery', 'fractionne', 'tempo', 'easy_short', 'sortie_longue'],
  },
};

export function resolveRoles(
  sessionsPerWeek: 2 | 3 | 4 | 5,
  phase: Phase,
  weekIndexInPhase: number,
): RoleToken[] {
  const base = ROLE_TABLES[sessionsPerWeek][phase];
  return base.map((role) => {
    if (role === 'qualite_alt') return weekIndexInPhase % 2 === 0 ? 'tempo' : 'fractionne';
    return role;
  });
}

export const ROLE_IS_HARD: Record<RoleToken, boolean> = {
  easy_recovery: false,
  easy_short: false,
  easy_medium: false,
  tempo: true,
  fractionne: true,
  qualite_alt: true,
  sortie_longue: true,
};

export const ROLE_WEIGHT: Record<RoleToken, number> = {
  easy_recovery: 0.7,
  easy_short: 1,
  easy_medium: 1.3,
  tempo: 1.1,
  fractionne: 1,
  qualite_alt: 1.05,
  sortie_longue: 0,
};
