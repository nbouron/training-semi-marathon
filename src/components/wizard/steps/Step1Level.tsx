import type { Level } from '../../../types';
import { ChoiceCard } from '../ChoiceCard';

const OPTIONS: { value: Level; title: string; description: string }[] = [
  { value: 'debutant', title: 'Débutant complet', description: 'Je ne cours pas.' },
  { value: 'occasionnel', title: 'Occasionnel', description: 'Je cours de temps en temps, moins de 30 min.' },
  { value: 'regulier', title: 'Régulier', description: 'Je cours 30-45 min sans difficulté.' },
  { value: 'confirme', title: 'Confirmé', description: "J'ai déjà couru un 10 km ou un semi." },
];

interface Props {
  value: Level | undefined;
  onChange: (value: Level) => void;
}

export function Step1Level({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">Quel est ton niveau actuel ?</h2>
      <p className="mb-5 text-sm text-slate-600">Ça détermine le point de départ de ton programme.</p>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <ChoiceCard
            key={opt.value}
            name="level"
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            title={opt.title}
            description={opt.description}
          />
        ))}
      </div>
    </div>
  );
}
