import { addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Level } from '../../../types';
import { weeksAvailableUntil } from '../../../lib/planGenerator/dateUtils';

interface Props {
  level: Level | undefined;
  raceDate: string | undefined;
  onChange: (value: string) => void;
}

export function Step2Date({ level, raceDate, onChange }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = format(addDays(today, 14), 'yyyy-MM-dd');
  const weeksAvailable = raceDate ? weeksAvailableUntil(today, new Date(raceDate)) : null;
  const showWarning = weeksAvailable !== null && weeksAvailable < 10 && level === 'debutant';

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">Quelle est la date de ta course ?</h2>
      <p className="mb-5 text-sm text-slate-600">On calcule le nombre de semaines disponibles pour préparer le programme.</p>

      <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="race-date">
        Date du semi-marathon
      </label>
      <input
        id="race-date"
        type="date"
        min={minDate}
        value={raceDate ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-600 focus:outline-none"
      />

      {weeksAvailable !== null && (
        <p className="mt-3 text-sm text-slate-700">
          Cela te laisse <strong>{weeksAvailable} semaine{weeksAvailable > 1 ? 's' : ''}</strong> de préparation, jusqu'au{' '}
          {format(new Date(raceDate!), 'd MMMM yyyy', { locale: fr })}.
        </p>
      )}

      {showWarning && (
        <div role="alert" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong className="block font-semibold">Délai un peu court pour un premier semi.</strong>
          Avec moins de 10 semaines et un niveau débutant, mieux vaut viser uniquement l'objectif « terminer » — ou envisager
          de reporter la course à une session ultérieure.
        </div>
      )}
    </div>
  );
}
