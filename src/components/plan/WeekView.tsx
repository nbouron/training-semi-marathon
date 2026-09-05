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
    <div>
      <div className="mb-4 flex items-center justify-between">
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
          <p className="text-sm font-semibold text-slate-500">Semaine {week.number} / {plan.weeks.length}</p>
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

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{PHASE_LABELS[week.phase]}</span>
        {week.isRecoveryWeek && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">Récupération</span>}
        {week.isTaperWeek && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Affûtage</span>}
        {week.disrupted && <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">Perturbée</span>}
        <span className="ml-auto text-sm font-semibold text-slate-700">{week.totalVolumeKm} km prévus</span>
      </div>

      <div className="space-y-2">
        {week.sessions.map((session) => (
          <SessionCard key={session.id} session={session} onClick={() => setSelectedId(session.id)} />
        ))}
      </div>

      {!week.disrupted && (
        <button
          type="button"
          onClick={() => {
            if (confirm('Marquer cette semaine comme perturbée ? Les séances restantes non réalisées seront annulées et la semaine suivante sera adaptée.')) {
              markWeekDisrupted(week.number);
            }
          }}
          className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Marquer cette semaine comme perturbée
        </button>
      )}

      {selected && <SessionDetailModal session={selected} week={week} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
