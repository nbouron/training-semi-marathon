import { ChoiceCard } from '../ChoiceCard';

interface Props {
  sessionsPerWeek: 2 | 3 | 4 | 5 | undefined;
  optionalSession: boolean;
  onChangeSessions: (value: 2 | 3 | 4 | 5) => void;
  onChangeOptional: (value: boolean) => void;
}

const OPTIONS: { value: 2 | 3 | 4 | 5; title: string; description: string }[] = [
  { value: 2, title: '2 séances', description: 'Une séance courte + la sortie longue.' },
  { value: 3, title: '3 séances', description: 'Un bon équilibre entre volume et récupération.' },
  { value: 4, title: '4 séances', description: 'Fractionné, tempo, footing et sortie longue.' },
  { value: 5, title: '5 séances', description: 'Pour progresser plus vite, avec une séance de récupération en plus.' },
];

export function Step3Sessions({ sessionsPerWeek, optionalSession, onChangeSessions, onChangeOptional }: Props) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">Combien de séances par semaine ?</h2>
      <p className="mb-5 text-sm text-slate-600">Choisis un rythme que tu peux tenir sur toute la préparation.</p>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <ChoiceCard
            key={opt.value}
            name="sessions"
            value={String(opt.value)}
            checked={sessionsPerWeek === opt.value}
            onChange={() => onChangeSessions(opt.value)}
            title={opt.title}
            description={opt.description}
          />
        ))}
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <input
          type="checkbox"
          checked={optionalSession}
          onChange={(e) => onChangeOptional(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
        />
        <span>
          <span className="block font-semibold text-slate-900">+ 1 séance ponctuelle facultative</span>
          <span className="mt-0.5 block text-sm text-slate-600">Renforcement musculaire, vélo ou marche active.</span>
        </span>
      </label>
    </div>
  );
}
