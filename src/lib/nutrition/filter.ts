import type { Diet, MealMoment, Recipe } from '../../types';
import { RECIPES } from './recipes';

function matchesDiet(recipe: Recipe, diet: Diet): boolean {
  if (diet === 'omnivore') return true;
  return recipe.compatibleDiets.includes(diet);
}

function excludedTokens(excludedFoods: string): string[] {
  return excludedFoods
    .split(/[,;]/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function isExcluded(recipe: Recipe, tokens: string[]): boolean {
  if (tokens.length === 0) return false;
  const haystack = [
    ...recipe.ingredients,
    ...recipe.containsAllergensKeywords,
    recipe.name,
  ]
    .join(' | ')
    .toLowerCase();
  return tokens.some((token) => haystack.includes(token));
}

export interface RecipeFilters {
  diet: Diet;
  excludedFoods: string;
  moment?: MealMoment;
}

export function filterRecipes(filters: RecipeFilters, pool: Recipe[] = RECIPES): Recipe[] {
  const tokens = excludedTokens(filters.excludedFoods);
  return pool.filter(
    (r) =>
      (!filters.moment || r.moment === filters.moment) &&
      matchesDiet(r, filters.diet) &&
      !isExcluded(r, tokens),
  );
}
