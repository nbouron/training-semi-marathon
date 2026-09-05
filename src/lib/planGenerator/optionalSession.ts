import type { InjuryZone } from '../../types';
import type { SessionContent } from './sessionContent';

export function buildOptionalSession(injuries: InjuryZone[]): SessionContent {
  const lowImpact = injuries.includes('genoux') || injuries.includes('tendon_achille');

  if (lowImpact) {
    return {
      type: 'velo',
      title: 'Vélo (facultatif)',
      distanceKm: 0,
      durationMin: 30,
      targetPaceMinKm: [0, 0],
      description:
        '30 min de vélo à intensité modérée, cadence élevée et souple. Renforce le cardio sans impact — utile si genoux ou tendon d\'Achille sont sensibles.',
    };
  }

  if (injuries.includes('dos')) {
    return {
      type: 'renfo',
      title: 'Renforcement doux (facultatif)',
      distanceKm: 0,
      durationMin: 25,
      targetPaceMinKm: [0, 0],
      description:
        'Gainage (planche, gainage latéral) 3 x 30 sec par côté, mobilité du bassin, étirements doux du bas du dos. Priorité à la stabilité du tronc plutôt qu\'à la charge.',
    };
  }

  return {
    type: 'renfo',
    title: 'Renforcement musculaire (facultatif)',
    distanceKm: 0,
    durationMin: 30,
    targetPaceMinKm: [0, 0],
    description:
      'Circuit : gainage 3 x 30 sec, squats 3 x 15, fentes 3 x 10 par jambe, chaise contre un mur 3 x 30 sec, mollets sur pointes 3 x 20. Renforce les muscles clés du coureur.',
  };
}
