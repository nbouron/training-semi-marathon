import { useMemo, useState } from 'react';
import type { TrainingPlan } from '../../types';
import { CalendarView } from './CalendarView';
import { WeekView } from './WeekView';

interface Props {
  plan: TrainingPlan;
}

function currentWeekNumber(plan: TrainingPlan): number {
  const todayIso = new Date().toISOString().slice(0, 10);
  const found = plan.weeks.find((w) => todayIso >= w.startDate && todayIso <= w.endDate);
  return found?.number ?? 1;
}

export function PlanTab({ plan }: Props) {
  const [view, setView] = useState<'semaine' | 'calendrier'>('semaine');
  const initialWeek = useMemo(() => currentWeekNumber(plan), [plan]);
  const [weekNumber, setWeekNumber] = useState(initialWeek);

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setView('semaine')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold ${
            view === 'semaine' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          Vue semaine
        </button>
        <button
          type="button"
          onClick={() => setView('calendrier')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold ${
            view === 'calendrier' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          Calendrier complet
        </button>
      </div>

      {view === 'semaine' ? (
        <WeekView plan={plan} weekNumber={weekNumber} onChangeWeek={setWeekNumber} />
      ) : (
        <CalendarView plan={plan} />
      )}
    </div>
  );
}
