import { addDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMemo } from 'react';
import { generateWeeklyMenu, regenerateMeal } from '../../lib/nutrition/menu';
import { MOMENT_LABELS } from '../../lib/nutrition/momentLabels';
import { RECIPES } from '../../lib/nutrition/recipes';
import { menuOverrideKey, useAppStore } from '../../store/useAppStore';
import type { MealMoment, TrainingPlan, UserProfile, WeekPlan } from '../../types';

interface Props {
  plan: TrainingPlan;
  profile: UserProfile;
  week: WeekPlan;
}

const MOMENTS: MealMoment[] = ['petit_dejeuner', 'dejeuner', 'diner', 'collation_pre_course', 'collation_recuperation'];

export function WeeklyMenuGrid({ plan, profile, week }: Props) {
  const menuOverrides = useAppStore((s) => s.menuOverrides);
  const setMenuOverride = useAppStore((s) => s.setMenuOverride);

  const avgVolumeKm = useMemo(
    () => plan.weeks.reduce((acc, w) => acc + w.totalVolumeKm, 0) / plan.weeks.length,
    [plan.weeks],
  );

  const baseMenu = useMemo(
    () =>
      generateWeeklyMenu({
        diet: profile.diet,
        excludedFoods: profile.excludedFoods,
        weekVolumeKm: week.totalVolumeKm,
        avgVolumeKm,
        seed: week.number * 977,
      }),
    [profile.diet, profile.excludedFoods, week.totalVolumeKm, avgVolumeKm, week.number],
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3" style={{ minWidth: '840px' }}>
        {baseMenu.map((dayMenu, dayIndex) => {
          const date = addDays(parseISO(week.startDate), dayIndex);
          return (
            <div key={dayIndex} className="w-40 shrink-0 rounded-xl border border-slate-200 bg-white p-3">
              <p className="mb-2 text-center text-xs font-semibold text-slate-700">
                {format(date, 'EEEE d MMM', { locale: fr })}
              </p>
              <div className="space-y-2">
                {MOMENTS.map((moment) => {
                  const key = menuOverrideKey(week.number, dayIndex, moment);
                  const overrideId = menuOverrides[key];
                  const recipe = overrideId ? RECIPES.find((r) => r.id === overrideId) ?? dayMenu[moment] : dayMenu[moment];
                  return (
                    <div key={moment} className="rounded-lg bg-slate-50 p-2">
                      <p className="text-[10px] font-semibold uppercase text-slate-500">{MOMENT_LABELS[moment]}</p>
                      <p className="text-xs text-slate-800">{recipe ? recipe.name : '—'}</p>
                      <button
                        type="button"
                        onClick={() => {
                          const next = regenerateMeal(moment, profile.diet, profile.excludedFoods, recipe?.id ?? null);
                          if (next) setMenuOverride(key, next.id);
                        }}
                        className="mt-1 text-[10px] font-semibold text-blue-600 hover:underline"
                      >
                        Régénérer
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
