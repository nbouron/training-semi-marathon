import { useMemo } from 'react';
import type { Feasibility, Goal, GoalType, Level } from '../../../types';
import { weeksAvailableUntil } from '../../../lib/planGenerator/dateUtils';
import { computeFeasibility, formatPace, goalPaceMinKm } from '../../../lib/planGenerator/pace';
import { ChoiceCard } from '../ChoiceCard';

const OPTIONS: { value: GoalType; title: string }[] = [
  { value: 'terminer', title: 'Terminer sans objectif chrono' },
  { value: '2h30', title: 'Sous 2h30' },
  { value: '2h15', title: 'Sous 2h15' },
  { value: '2h00', title: 'Sous 2h00' },
  { value: '1h50', title: 'Sous 1h50' },
  { value: '1h40', title: 'Sous 1h40' },
  { value: 'custom', title: 'Saisie libre' },
];

const FEASIBILITY_LABEL: Record<Feasibility, { label: string; classes: string }> = {
  realiste: { label: 'Réaliste', classes: 'bg-green-100 text-green-800 border-green-300' },
  ambitieux: { label: 'Ambitieux', classes: 'bg-amber-100 text-amber-800 border-amber-300' },
  tres_ambitieux: { label: 'Très ambitieux', classes: 'bg-red-100 text-red-800 border-red-300' },
};

interface Props {
  level: Level;
  raceDate: string | undefined;
  sessionsPerWeek: 2 | 3 | 4 | 5;
  goal: Goal | undefined;
  onChange: (goal: Goal) => void;
}

export function Step4Goal({ level, raceDate, sessionsPerWeek, goal, onChange }: Props) {
  const pace = goal ? goalPaceMinKm(goal) : null;

  const feasibility = useMemo(() => {
    if (!goal || !raceDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weeksAvailable = weeksAvailableUntil(today, new Date(raceDate));
    return computeFeasibility({ level, goal, weeksAvailable, sessionsPerWeek });
  }, [goal, raceDate, level, sessionsPerWeek]);

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">Quel est ton objectif de temps ?</h2>
      <p className="mb-5 text-sm text-slate-600">On t'indique l'allure moyenne correspondante et sa faisabilité.</p>

      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <div key={opt.value}>
            <ChoiceCard
              name="goal"
              value={opt.value}
              checked={goal?.type === opt.value}
              onChange={() => onChange({ type: opt.value, customMinutes: goal?.customMinutes })}
              title={opt.title}
            />
            {opt.value === 'custom' && goal?.type === 'custom' && (
              <div className="ml-4 mt-2 flex items-center gap-2">
                <label htmlFor="custom-minutes" className="text-sm text-slate-600">
                  Temps visé (minutes) :
                </label>
                <input
                  id="custom-minutes"
                  type="number"
                  min={60}
                  max={360}
                  value={goal.customMinutes ?? ''}
                  onChange={(e) => onChange({ type: 'custom', customMinutes: Number(e.target.value) || undefined })}
                  className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {goal && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {pace !== null ? (
            <p className="text-sm text-slate-700">
              Allure moyenne visée : <strong>{formatPace(pace)}</strong>
            </p>
          ) : (
            <p className="text-sm text-slate-700">Pas d'allure imposée — l'objectif est de franchir la ligne d'arrivée.</p>
          )}
          {feasibility && (
            <p className="mt-2">
              <span
                className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${FEASIBILITY_LABEL[feasibility].classes}`}
              >
                {FEASIBILITY_LABEL[feasibility].label}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
