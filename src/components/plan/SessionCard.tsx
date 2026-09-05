import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { TrainingSession } from '../../types';
import { SESSION_COLORS } from '../../lib/sessionColors';
import { SESSION_ICON } from './sessionIcons';

interface Props {
  session: TrainingSession;
  onClick: () => void;
  compact?: boolean;
}

export function SessionCard({ session, onClick, compact }: Props) {
  const colors = SESSION_COLORS[session.type];
  const isRest = session.type === 'repos';
  const date = parseISO(session.date);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-shadow hover:shadow-sm ${colors.bg} ${colors.border}`}
    >
      <span aria-hidden="true" className="text-xl leading-none">
        {SESSION_ICON[session.type]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className={`truncate font-semibold ${colors.text}`}>{session.title}</span>
          {session.completion?.done && (
            <span aria-label="Séance réalisée" className="shrink-0 text-green-600">
              ✓
            </span>
          )}
        </span>
        {!compact && (
          <span className="mt-0.5 block text-xs text-slate-600">
            {format(date, 'EEEE d MMM', { locale: fr })}
            {session.distanceKm ? ` · ${session.distanceKm} km` : ''}
            {session.durationMin ? ` · ${session.durationMin} min` : ''}
            {session.optional ? ' · facultatif' : ''}
          </span>
        )}
      </span>
      {!isRest && !compact && (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${colors.text}`}>
          {colors.label}
        </span>
      )}
    </button>
  );
}
