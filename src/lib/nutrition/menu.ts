import type { Diet, MealMoment, Recipe } from '../../types';
import { filterRecipes } from './filter';

const MOMENTS: MealMoment[] = ['petit_dejeuner', 'dejeuner', 'diner', 'collation_pre_course', 'collation_recuperation'];

export type DayMenu = Record<MealMoment, Recipe | null>;
export type WeeklyMenu = DayMenu[]; // index 0-6

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRecipe(pool: Recipe[], rng: () => number, avoidIds: Set<string>, preferHighCarb: boolean): Recipe | null {
  if (pool.length === 0) return null;
  let candidates = pool.filter((r) => !avoidIds.has(r.id));
  if (candidates.length === 0) candidates = pool;
  if (preferHighCarb) {
    const highCarbOnly = candidates.filter((r) => r.highCarb);
    if (highCarbOnly.length > 0) candidates = highCarbOnly;
  }
  const index = Math.floor(rng() * candidates.length);
  return candidates[index];
}

export interface MenuOptions {
  diet: Diet;
  excludedFoods: string;
  weekVolumeKm: number;
  avgVolumeKm: number;
  seed: number;
}

export function generateWeeklyMenu(options: MenuOptions): WeeklyMenu {
  const rng = mulberry32(options.seed || 1);
  const preferHighCarb = options.avgVolumeKm > 0 && options.weekVolumeKm > options.avgVolumeKm * 1.05;

  const poolsByMoment: Record<MealMoment, Recipe[]> = MOMENTS.reduce(
    (acc, moment) => {
      acc[moment] = filterRecipes({ diet: options.diet, excludedFoods: options.excludedFoods, moment });
      return acc;
    },
    {} as Record<MealMoment, Recipe[]>,
  );

  const recentByMoment: Record<MealMoment, Set<string>> = MOMENTS.reduce(
    (acc, moment) => {
      acc[moment] = new Set<string>();
      return acc;
    },
    {} as Record<MealMoment, Set<string>>,
  );

  const week: WeeklyMenu = [];
  for (let day = 0; day < 7; day += 1) {
    const dayMenu = {} as DayMenu;
    for (const moment of MOMENTS) {
      const isMainMeal = moment === 'dejeuner' || moment === 'diner';
      const chosen = pickRecipe(
        poolsByMoment[moment],
        rng,
        recentByMoment[moment],
        isMainMeal && preferHighCarb,
      );
      dayMenu[moment] = chosen;
      if (chosen) {
        recentByMoment[moment].add(chosen.id);
        if (recentByMoment[moment].size > Math.max(1, poolsByMoment[moment].length - 1)) {
          recentByMoment[moment].clear();
        }
      }
    }
    week.push(dayMenu);
  }
  return week;
}

export function regenerateMeal(
  moment: MealMoment,
  diet: Diet,
  excludedFoods: string,
  currentRecipeId: string | null,
): Recipe | null {
  const pool = filterRecipes({ diet, excludedFoods, moment });
  if (pool.length === 0) return null;
  const candidates = currentRecipeId ? pool.filter((r) => r.id !== currentRecipeId) : pool;
  const finalPool = candidates.length > 0 ? candidates : pool;
  const rng = mulberry32(Date.now() % 2147483647);
  return finalPool[Math.floor(rng() * finalPool.length)];
}
