import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState, type ReactNode } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SESSION_COLORS } from '../../lib/sessionColors';
import type { Feeling, TrainingSession, WeekPlan } from '../../types';
import { Modal } from '../layout/Modal';
import { DynamicPictogram, StretchPictogram } from './ExercisePictograms';
import { SESSION_ICON } from './sessionIcons';

interface Props {
  session: TrainingSession;
  week: WeekPlan;
  onClose: () => void;
}

const FEELING_OPTIONS: { value: Feeling; label: string }[] = [
  { value: 'facile', label: 'Facile' },
  { value: 'correct', label: 'Correct' },
  { value: 'difficile', label: 'Difficile' },
];

export function SessionDetailModal({ session, week, onClose }: Props) {
  const toggleSessionComplete = useAppStore((s) => s.toggleSessionComplete);
  const rescheduleSession = useAppStore((s) => s.rescheduleSession);

  const [done, setDone] = useState(session.completion?.done ?? false);
  const [distanceKm, setDistanceKm] = useState(session.completion?.actualDistanceKm ?? session.distanceKm ?? 0);
  const [durationMin, setDurationMin] = useState(session.completion?.actualDurationMin ?? session.durationMin ?? 0);
  const [feeling, setFeeling] = useState<Feeling | undefined>(session.completion?.feeling);
  const [note, setNote] = useState(session.completion?.note ?? '');

  const colors = SESSION_COLORS[session.type];
  const isRest = session.type === 'repos';
  const isRace = session.distanceKm === 21.1 && session.type === 'sortie_longue';

  function saveCompletion() {
    toggleSessionComplete(session.id, {
      done,
      actualDistanceKm: distanceKm || undefined,
      actualDurationMin: durationMin || undefined,
      feeling,
      note: note || undefined,
      completedAt: new Date().toISOString(),
    });
    onClose();
  }

  const weekDates: string[] = [];
  {
    let cursor = parseISO(week.startDate);
    const end = parseISO(week.endDate);
    while (cursor <= end) {
      weekDates.push(format(cursor, 'yyyy-MM-dd'));
      cursor = new Date(cursor.getTime() + 86400000);
    }
  }

  return (
    <Modal title={session.title} onClose={onClose}>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <span aria-hidden="true">{SESSION_ICON[session.type]}</span>
        <span>{format(parseISO(session.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text}`}>{colors.label}</span>
        {session.optional && <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">Facultatif</span>}
        {session.moved && <span className="text-xs italic text-slate-500">Décalée depuis le {session.moved.fromDate}</span>}
      </div>

      {!isRest && session.warmup.length > 0 && (
        <Section title="Échauffement (8-10 min, dynamique)">
          <ul className="space-y-2">
            {session.warmup.map((w) => (
              <li key={w.name} className="flex items-center gap-3 text-sm text-slate-700">
                <DynamicPictogram />
                <span>
                  <strong>{w.name}</strong> — {w.detail}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={isRest ? 'Aujourd\'hui' : 'Corps de séance'}>
        <p className="whitespace-pre-line text-sm text-slate-800">{session.description}</p>
      </Section>

      {!isRest && session.cooldown && (
        <Section title="Retour au calme (5 min)">
          <p className="text-sm text-slate-700">{session.cooldown}</p>
        </Section>
      )}

      {!isRest && session.stretches.length > 0 && (
        <Section title="Étirements (statiques, 20-30 sec x2)">
          <ul className="space-y-2">
            {session.stretches.map((st) => (
              <li key={st.muscle} className="flex items-center gap-3 text-sm text-slate-700">
                <StretchPictogram />
                <span>
                  <strong>{st.muscle}</strong> — {st.detail}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {!isRest && (
        <div role="note" className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          Douleur articulaire ou tendineuse persistante ? Arrête la séance et consulte un professionnel de santé.
        </div>
      )}

      {!isRace && (
        <Section title="Décaler cette séance">
          <select
            value={session.date}
            onChange={(e) => rescheduleSession(session.id, e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          >
            {weekDates.map((d) => (
              <option key={d} value={d}>
                {format(parseISO(d), 'EEEE d MMMM', { locale: fr })}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">Choisis un autre jour de la même semaine ; le jour occupé sera échangé.</p>
        </Section>
      )}

      {!isRest && (
        <Section title="Marquer comme réalisée">
          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
            <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} className="h-4 w-4 accent-blue-600" />
            Séance réalisée
          </label>

          {done && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <label className="flex-1 text-sm text-slate-700">
                  Distance (km)
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
                  />
                </label>
                <label className="flex-1 text-sm text-slate-700">
                  Durée (min)
                  <input
                    type="number"
                    min={0}
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
                  />
                </label>
              </div>
              <div>
                <span className="mb-1 block text-sm text-slate-700">Sensation</span>
                <div className="flex gap-2">
                  {FEELING_OPTIONS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFeeling(f.value)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                        feeling === f.value ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-300 text-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block text-sm text-slate-700">
                Note (optionnel)
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
                />
              </label>
            </div>
          )}

          <button
            type="button"
            onClick={saveCompletion}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Enregistrer
          </button>
        </Section>
      )}
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </div>
  );
}
