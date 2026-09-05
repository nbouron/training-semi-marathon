import type { InjuryZone, SessionType, Stretch, WarmupExercise } from '../../types';

// All warmup drills are dynamic on purpose — never static stretching before running.
const BASE_WARMUP: WarmupExercise[] = [
  { name: 'Marche rapide', detail: '2 min' },
  { name: 'Talons-fesses', detail: '2 x 20 m' },
  { name: 'Montées de genoux', detail: '2 x 20 m' },
  { name: 'Pas chassés', detail: '2 x 20 m (chaque sens)' },
  { name: 'Fentes marchées', detail: '10 par jambe' },
  { name: 'Gainage dynamique (mountain climbers)', detail: '20 sec' },
];

const HARD_SESSION_EXTRA_WARMUP: WarmupExercise[] = [
  { name: 'Accélérations progressives', detail: '3 x 80 m, retour marche' },
];

const LOW_IMPACT_WARMUP: WarmupExercise[] = [
  { name: 'Marche rapide', detail: '3 min' },
  { name: 'Rotations de chevilles et hanches', detail: '30 sec chaque' },
  { name: 'Montées de genoux modérées', detail: '2 x 15 m' },
  { name: 'Pas chassés', detail: '2 x 15 m' },
];

export function buildWarmup(type: SessionType, injuries: InjuryZone[]): WarmupExercise[] {
  if (type === 'repos') return [];
  const hasAchillesOrKnee = injuries.includes('tendon_achille') || injuries.includes('genoux');
  const base = hasAchillesOrKnee ? LOW_IMPACT_WARMUP : BASE_WARMUP;
  if (type === 'tempo' || type === 'fractionne') {
    return [...base, ...HARD_SESSION_EXTRA_WARMUP];
  }
  return base;
}

const STRETCH_LIBRARY: Record<string, Stretch> = {
  mollets: { muscle: 'Mollets', detail: '20-30 sec x2 par jambe, contre un mur' },
  ischios: { muscle: 'Ischio-jambiers', detail: '20-30 sec x2 par jambe, jambe tendue' },
  quadriceps: { muscle: 'Quadriceps', detail: '20-30 sec x2 par jambe, debout, talon vers la fesse' },
  fessiers: { muscle: 'Fessiers', detail: '20-30 sec x2 par jambe, cheville sur le genou opposé' },
  psoas: { muscle: 'Psoas / fléchisseurs de hanche', detail: '20-30 sec x2 par jambe, fente basse' },
  bas_du_dos: { muscle: 'Bas du dos', detail: '20-30 sec x2, genoux vers la poitrine allongé' },
  tibial_anterieur: { muscle: 'Tibial antérieur', detail: '20-30 sec x2 par jambe, dessus du pied au sol' },
};

/** Standard post-run stretch routine, adapted (never removed) when a zone is sensitive:
 * sensitive zones get gentler holds called out explicitly rather than being skipped. */
export function buildStretches(type: SessionType, injuries: InjuryZone[]): Stretch[] {
  if (type === 'repos') return [];
  const list: Stretch[] = [
    STRETCH_LIBRARY.mollets,
    STRETCH_LIBRARY.ischios,
    STRETCH_LIBRARY.quadriceps,
    STRETCH_LIBRARY.fessiers,
  ];
  if (injuries.includes('psoas')) list.push(STRETCH_LIBRARY.psoas);
  if (injuries.includes('dos')) list.push(STRETCH_LIBRARY.bas_du_dos);
  if (injuries.includes('tendon_achille')) list.push(STRETCH_LIBRARY.tibial_anterieur);

  return list.map((s) => adaptStretchForInjuries(s, injuries));
}

function adaptStretchForInjuries(stretch: Stretch, injuries: InjuryZone[]): Stretch {
  if (stretch.muscle === 'Mollets' && injuries.includes('tendon_achille')) {
    return {
      ...stretch,
      detail: `${stretch.detail} — étirement doux, sans forcer sur le tendon d'Achille, arrêter en cas de douleur`,
    };
  }
  if (stretch.muscle === 'Quadriceps' && injuries.includes('genoux')) {
    return {
      ...stretch,
      detail: `${stretch.detail} — amplitude réduite si le genou est sensible`,
    };
  }
  if (stretch.muscle === 'Fessiers' && injuries.includes('hanches')) {
    return { ...stretch, detail: `${stretch.detail} — rester dans une amplitude confortable` };
  }
  return stretch;
}

export function injuryAdaptationNote(injuries: InjuryZone[]): string | null {
  if (injuries.length === 0) return null;
  const labels: Record<InjuryZone, string> = {
    genoux: 'genoux',
    tendon_achille: "tendon d'Achille",
    dos: 'dos',
    hanches: 'hanches',
    chevilles: 'chevilles',
    psoas: 'psoas',
  };
  const zones = injuries.map((z) => labels[z]).join(', ');
  return `Séance adaptée : zone(s) sensible(s) déclarée(s) — ${zones}. Réduis l'amplitude ou arrête en cas de douleur.`;
}
