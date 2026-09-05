import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PHASE_LABELS } from '../../lib/phaseLabels';
import type { TrainingPlan } from '../../types';
import { SessionCard } from './SessionCard';
import { SessionDetailModal } from './SessionDetailModal';

interface Props {
  plan: TrainingPlan;
  weekNumber: number;
  onChangeWeek: (weekNumber: number) => void;
}

export function WeekView({ plan, weekNumber, onChangeWeek }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const markWeekDisrupted = useAppStore((s) => s.markWeekDisrupted);

  const week = plan.weeks.find((w) => w.number === weekNumber) ?? plan.weeks[0];
  const selected = selectedId ? week.sessions.find((s) => s.id === selectedId) ?? null : null;

  return (
    <div className="lg:flex lg:items-start lg:gap-6">
      <aside className="mb-4 rounded-xl border border-slate-200 bg-white p-4 lg:sticky lg:top-8 lg:mb-0 lg:w-64 lg:shrink-0">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onChangeWeek(Math.max(1, weekNumber - 1))}
            disabled={weekNumber <= 1}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-30"
            aria-label="Semaine précédente"
          >
            ←
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-500">
              Semaine {week.number} / {plan.weeks.length}
            </p>
            <p className="text-xs text-slate-500">
              {format(parseISO(week.startDate), 'd MMM', { locale: fr })} – {format(parseISO(week.endDate), 'd MMM', { locale: fr })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChangeWeek(Math.min(plan.weeks.length, weekNumber + 1))}
            disabled={weekNumber >= plan.weeks.length}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-30"
            aria-label="Semaine suivante"
          >
            →
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{PHASE_LABELS[week.phase]}</span>
          {week.isRecoveryWeek && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">Récupération</span>
          )}
          {week.isTaperWeek && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Affûtage</span>
          )}
          {week.disrupted && <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">Perturbée</span>}
        </div>

        <p className="mb-3 text-sm font-semibold text-slate-700">{week.totalVolumeKm} km prévus cette semaine</p>

        {!week.disrupted && (
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  'Marquer cette semaine comme perturbée ? Les séances restantes non réalisées seront annulées et la semaine suivante sera adaptée.',
                )
              ) {
                markWeekDisrupted(week.number);
              }
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Marquer comme perturbée
          </button>
        )}
      </aside>

      <div className="grid flex-1 gap-2 lg:grid-cols-2 lg:content-start lg:gap-3">
        {week.sessions.map((session) => (
          <SessionCard key={session.id} session={session} onClick={() => setSelectedId(session.id)} />
        ))}
      </div>

      {selected && <SessionDetailModal session={selected} week={week} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
