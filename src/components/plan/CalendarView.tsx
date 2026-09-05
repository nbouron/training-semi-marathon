import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { PHASE_LABELS } from '../../lib/phaseLabels';
import { SESSION_COLORS } from '../../lib/sessionColors';
import type { TrainingPlan } from '../../types';
import { SessionDetailModal } from './SessionDetailModal';
import { SESSION_ICON } from './sessionIcons';

interface Props {
  plan: TrainingPlan;
}

export function CalendarView({ plan }: Props) {
  const [selection, setSelection] = useState<{ weekNumber: number; sessionId: string } | null>(null);

  const selectedWeek = selection ? plan.weeks.find((w) => w.number === selection.weekNumber) : null;
  const selectedSession = selectedWeek?.sessions.find((s) => s.id === selection?.sessionId) ?? null;

  return (
    <div className="space-y-4">
      {plan.weeks.map((week) => (
        <div key={week.number} className="rounded-xl border border-slate-200 bg-white p-3 md:p-4">
          <div className="mb-2 flex items-center justify-between md:mb-3">
            <p className="text-sm font-semibold text-slate-800 md:text-base">
              Semaine {week.number} · {PHASE_LABELS[week.phase]}
            </p>
            <p className="text-xs font-medium text-slate-500 md:text-sm">{week.totalVolumeKm} km</p>
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {week.sessions.map((session) => {
              const colors = SESSION_COLORS[session.type];
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setSelection({ weekNumber: week.number, sessionId: session.id })}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 text-center md:gap-1.5 md:p-3 ${colors.bg} ${colors.border}`}
                  aria-label={`${session.title} le ${format(parseISO(session.date), 'EEEE d MMMM', { locale: fr })}`}
                >
                  <span className="text-[10px] font-medium text-slate-500 md:text-xs">
                    {format(parseISO(session.date), 'EEEEEE', { locale: fr })}
                  </span>
                  <span aria-hidden="true" className="md:text-lg">
                    {SESSION_ICON[session.type]}
                  </span>
                  <span className={`hidden truncate text-[11px] font-medium md:block ${colors.text}`}>{session.title}</span>
                  {session.completion?.done && <span className="text-[10px] text-green-600">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedSession && selectedWeek && (
        <SessionDetailModal session={selectedSession} week={selectedWeek} onClose={() => setSelection(null)} />
      )}
    </div>
  );
}
