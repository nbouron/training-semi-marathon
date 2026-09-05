import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { TrainingPlan } from '../../types';
import { goalLabel } from '../../lib/planGenerator/pace';
import { Logo } from './Logo';
import type { Tab } from './NavBar';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
  plan: TrainingPlan;
}

const TABS: { value: Tab; label: string; icon: string }[] = [
  { value: 'plan', label: 'Programme', icon: '📅' },
  { value: 'nutrition', label: 'Nutrition', icon: '🍽️' },
  { value: 'dashboard', label: 'Suivi', icon: '📊' },
];

export function Sidebar({ active, onChange, plan }: Props) {
  const daysToRace = Math.max(0, differenceInCalendarDays(parseISO(plan.profile.raceDate), new Date()));

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-5">
        <Logo />
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-900">Semi-Marathon</p>
          <p className="text-xs font-semibold text-blue-600">Coach</p>
        </div>
      </div>

      <nav aria-label="Navigation principale" className="flex-1 space-y-1 px-3 py-4">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            aria-current={active === tab.value ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
              active === tab.value ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span aria-hidden="true" className="text-base leading-none">
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="m-3 rounded-xl bg-slate-900 p-4 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Compte à rebours</p>
        <p className="mt-1 text-2xl font-bold tabular-nums">{daysToRace}</p>
        <p className="text-xs text-slate-300">jour{daysToRace !== 1 ? 's' : ''} avant la course</p>
        <p className="mt-2 text-xs text-slate-400">{goalLabel(plan.profile.goal)}</p>
      </div>
    </aside>
  );
}
