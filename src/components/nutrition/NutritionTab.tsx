import { useMemo, useState } from 'react';
import {
  GENERAL_PRINCIPLES,
  RACE_WEEK_GUIDANCE,
  longRunFuelingGuidance,
  postEffortGuidance,
  preShortSessionGuidance,
} from '../../lib/nutrition/guidance';
import { filterRecipes } from '../../lib/nutrition/filter';
import { regenerateMeal } from '../../lib/nutrition/menu';
import { MOMENT_LABELS } from '../../lib/nutrition/momentLabels';
import { RECIPES } from '../../lib/nutrition/recipes';
import type { MealMoment, TrainingPlan, UserProfile } from '../../types';
import { RecipeCard } from './RecipeCard';
import { WeeklyMenuGrid } from './WeeklyMenuGrid';

interface Props {
  plan: TrainingPlan;
  profile: UserProfile;
}

const MOMENT_TABS: MealMoment[] = ['petit_dejeuner', 'dejeuner', 'diner', 'collation_pre_course', 'collation_recuperation'];

function currentWeekNumber(plan: TrainingPlan): number {
  const todayIso = new Date().toISOString().slice(0, 10);
  const found = plan.weeks.find((w) => todayIso >= w.startDate && todayIso <= w.endDate);
  return found?.number ?? 1;
}

export function NutritionTab({ plan, profile }: Props) {
  const [moment, setMoment] = useState<MealMoment>('petit_dejeuner');
  // Keyed by `${moment}:${originalRecipeId}` so switching tabs never needs a reset effect.
  const [bankOverrides, setBankOverrides] = useState<Record<string, string>>({});
  const weekNumber = useMemo(() => currentWeekNumber(plan), [plan]);
  const week = plan.weeks.find((w) => w.number === weekNumber) ?? plan.weeks[0];
  const isRaceWeek = weekNumber === plan.weeks.length;

  const recipes = useMemo(
    () => filterRecipes({ diet: profile.diet, excludedFoods: profile.excludedFoods, moment }),
    [profile.diet, profile.excludedFoods, moment],
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Principes généraux</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GENERAL_PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-1 font-semibold text-slate-900">{p.title}</p>
              <p className="text-sm text-slate-600">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Nutrition par séance</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <GuidanceCard title="Avant une séance courte" text={preShortSessionGuidance()} />
          <GuidanceCard title="Avant et pendant la sortie longue (+ de 75 min)" text={longRunFuelingGuidance(90)} />
          <GuidanceCard title="Après l'effort" text={postEffortGuidance()} />
        </div>
      </section>

      {isRaceWeek && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-900">Semaine de course et jour J</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {RACE_WEEK_GUIDANCE.map((g) => (
              <GuidanceCard key={g.title} title={g.title} text={g.text} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Menu type de la semaine</h2>
        <p className="mb-3 text-sm text-slate-600">
          Ajusté au volume de la semaine en cours ({week.totalVolumeKm} km) — davantage de glucides les semaines à gros
          volume.
        </p>
        <WeeklyMenuGrid plan={plan} profile={profile} week={week} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Banque de recettes</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {MOMENT_TABS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMoment(m)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                moment === m ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {MOMENT_LABELS[m]}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => {
            const overrideKey = `${moment}:${r.id}`;
            const shown = RECIPES.find((x) => x.id === bankOverrides[overrideKey]) ?? r;
            return (
              <RecipeCard
                key={r.id}
                recipe={shown}
                onRegenerate={() => {
                  const next = regenerateMeal(moment, profile.diet, profile.excludedFoods, shown.id);
                  if (next) setBankOverrides((prev) => ({ ...prev, [overrideKey]: next.id }));
                }}
              />
            );
          })}
        </div>
        {recipes.length === 0 && (
          <p className="text-sm text-slate-500">Aucune recette ne correspond à ton régime et tes exclusions pour ce moment.</p>
        )}
      </section>
    </div>
  );
}

function GuidanceCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-1 font-semibold text-slate-900">{title}</p>
      <p className="text-sm text-slate-600">{text}</p>
    </div>
  );
}
