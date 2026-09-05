// Domain types shared across the app. The plan generator (src/lib/planGenerator)
// is the single source of truth for how these are populated; UI code only reads them.

export type Level = 'debutant' | 'occasionnel' | 'regulier' | 'confirme';

export type Diet = 'omnivore' | 'vegetarien' | 'vegan' | 'sans_gluten' | 'sans_lactose';

export type GoalType =
  | 'terminer'
  | '2h30'
  | '2h15'
  | '2h00'
  | '1h50'
  | '1h40'
  | 'custom';

export type InjuryZone =
  | 'genoux'
  | 'tendon_achille'
  | 'dos'
  | 'hanches'
  | 'chevilles'
  | 'psoas';

export type Feasibility = 'realiste' | 'ambitieux' | 'tres_ambitieux';

export interface Goal {
  type: GoalType;
  /** Only set when type === 'custom'. Total race time target, in minutes. */
  customMinutes?: number;
}

/** 0 = dimanche ... 6 = samedi, matches Date#getDay() */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface UserProfile {
  level: Level;
  raceDate: string; // ISO yyyy-mm-dd
  sessionsPerWeek: 2 | 3 | 4 | 5;
  optionalSession: boolean;
  goal: Goal;
  availableDays: WeekdayIndex[];
  diet: Diet;
  excludedFoods: string;
  injuries: InjuryZone[];
}

export type SessionType =
  | 'endurance'
  | 'tempo'
  | 'fractionne'
  | 'sortie_longue'
  | 'repos'
  | 'renfo'
  | 'velo'
  | 'marche_active';

export type Phase = 'fondations' | 'endurance' | 'specifique';

export type Feeling = 'facile' | 'correct' | 'difficile';

export interface WarmupExercise {
  name: string;
  detail: string;
}

export interface Stretch {
  muscle: string;
  detail: string;
}

export interface SessionCompletion {
  done: boolean;
  actualDistanceKm?: number;
  actualDurationMin?: number;
  feeling?: Feeling;
  note?: string;
  completedAt?: string;
}

export interface TrainingSession {
  id: string;
  weekNumber: number;
  date: string; // ISO yyyy-mm-dd
  type: SessionType;
  title: string;
  durationMin?: number;
  distanceKm?: number;
  targetPaceMinKm?: [number, number];
  description: string;
  warmup: WarmupExercise[];
  cooldown: string;
  stretches: Stretch[];
  isHard: boolean;
  optional: boolean;
  moved?: { fromDate: string };
  completion?: SessionCompletion;
}

export interface WeekPlan {
  number: number;
  startDate: string;
  endDate: string;
  phase: Phase;
  isRecoveryWeek: boolean;
  isTaperWeek: boolean;
  totalVolumeKm: number;
  sessions: TrainingSession[];
  disrupted?: boolean;
}

export interface TrainingPlan {
  id: string;
  generatedAt: string;
  profile: UserProfile;
  weeks: WeekPlan[];
  paceTargetMinKm: number | null;
  feasibility: Feasibility;
  weeksAvailable: number;
  shortNotice: boolean;
}

// ---- Nutrition ----

export type MealMoment =
  | 'petit_dejeuner'
  | 'dejeuner'
  | 'diner'
  | 'collation_pre_course'
  | 'collation_recuperation';

export interface Recipe {
  id: string;
  name: string;
  moment: MealMoment;
  compatibleDiets: Diet[];
  prepTimeMin: number;
  ingredients: string[];
  steps: string[];
  whyAdapted: string;
  highCarb: boolean;
  containsAllergensKeywords: string[];
}
