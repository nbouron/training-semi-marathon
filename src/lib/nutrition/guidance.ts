export interface PrincipleCard {
  title: string;
  text: string;
}

export const GENERAL_PRINCIPLES: PrincipleCard[] = [
  {
    title: 'Glucides',
    text: "Carburant principal du coureur. Vise 5-7 g/kg de poids corporel par jour en semaine normale, davantage (7-10 g/kg) les 2-3 jours avant la course. Privilégie les glucides complexes (céréales, légumineuses, féculents) au quotidien.",
  },
  {
    title: 'Protéines',
    text: "1,2 à 1,6 g/kg par jour pour réparer les fibres musculaires sollicitées par les séances. Répartis-les sur les repas plutôt que sur un seul.",
  },
  {
    title: 'Hydratation',
    text: "1,5 à 2 L d'eau par jour hors effort, à augmenter les jours de grosse séance. Pendant un effort de plus de 60 min, pense à une boisson contenant des électrolytes.",
  },
  {
    title: 'Fer',
    text: "La course à pied augmente les pertes en fer. Privilégie viandes rouges, légumineuses, épinards, associés à une source de vitamine C pour mieux l'absorber.",
  },
  {
    title: 'Magnésium',
    text: "Utile contre les crampes et la fatigue nerveuse. Présent dans les oléagineux, les légumineuses, le chocolat noir et les céréales complètes.",
  },
];

export function preShortSessionGuidance(): string {
  return "Avant une séance courte (< 1h) : une collation légère et riche en glucides 45-60 min avant suffit (banane, compote, tranche de pain). Pas besoin de gros repas juste avant.";
}

export function longRunFuelingGuidance(durationMin: number): string {
  if (durationMin < 75) {
    return "Sortie de moins de 75 min : de l'eau suffit, pas besoin de ravitaillement solide pendant l'effort.";
  }
  return "Sortie de plus de 75 min : prévois un repas riche en glucides 3h avant, de l'eau régulièrement pendant l'effort, et un gel ou quelques fruits secs toutes les 45-60 min à partir de 45 min de course.";
}

export function postEffortGuidance(): string {
  return "Dans les 30 min après l'effort : associe glucides et protéines (environ 3 pour 1) pour relancer la récupération — yaourt et fruits, smoothie, ou pain et œuf. Continue à bien t'hydrater dans les heures qui suivent.";
}

export const RACE_WEEK_GUIDANCE: PrincipleCard[] = [
  {
    title: 'Recharge glucidique (J-3 à J-1)',
    text: "Augmente progressivement la part de glucides dans tes repas (pâtes, riz, pain, pommes de terre) en réduisant un peu les fibres et les graisses pour rester digeste.",
  },
  {
    title: 'Repas de la veille',
    text: "Un dîner simple et connu (pâtes ou riz, une source de protéines maigres, peu de fibres et de matières grasses). Évite tout aliment inhabituel.",
  },
  {
    title: "Petit-déjeuner d'avant course",
    text: "2h30 à 3h avant le départ : glucides faciles à digérer (pain, banane, compote), peu de fibres et de graisses. Termine de boire environ 1h30 avant le départ.",
  },
  {
    title: 'Pendant les 21,1 km',
    text: "Un gel ou équivalent toutes les 45 min à partir de 45-60 min de course, de l'eau ou boisson isotonique à chaque poste de ravitaillement.",
  },
  {
    title: 'Règle du jour J',
    text: "Rien de nouveau le jour J : ni aliment, ni gel, ni boisson jamais testés à l'entraînement. Tout doit avoir été validé pendant les sorties longues.",
  },
];
