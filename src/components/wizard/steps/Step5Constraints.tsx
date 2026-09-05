import type { Diet, InjuryZone, WeekdayIndex } from '../../../types';

const DAYS: { value: WeekdayIndex; label: string }[] = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
];

const DIETS: { value: Diet; label: string }[] = [
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarien', label: 'Végétarien' },
  { value: 'vegan', label: 'Végétalien' },
  { value: 'sans_gluten', label: 'Sans gluten' },
  { value: 'sans_lactose', label: 'Sans lactose' },
];

const INJURIES: { value: InjuryZone; label: string }[] = [
  { value: 'genoux', label: 'Genoux' },
  { value: 'tendon_achille', label: "Tendon d'Achille" },
  { value: 'dos', label: 'Dos' },
  { value: 'hanches', label: 'Hanches' },
  { value: 'chevilles', label: 'Chevilles' },
  { value: 'psoas', label: 'Psoas / fléchisseurs de hanche' },
];

interface Props {
  sessionsPerWeek: number;
  availableDays: WeekdayIndex[];
  diet: Diet | undefined;
  excludedFoods: string;
  injuries: InjuryZone[];
  onChangeDays: (days: WeekdayIndex[]) => void;
  onChangeDiet: (diet: Diet) => void;
  onChangeExcludedFoods: (value: string) => void;
  onChangeInjuries: (injuries: InjuryZone[]) => void;
}

export function Step5Constraints({
  sessionsPerWeek,
  availableDays,
  diet,
  excludedFoods,
  injuries,
  onChangeDays,
  onChangeDiet,
  onChangeExcludedFoods,
  onChangeInjuries,
}: Props) {
  function toggleDay(day: WeekdayIndex) {
    onChangeDays(
      availableDays.includes(day) ? availableDays.filter((d) => d !== day) : [...availableDays, day],
    );
  }

  function toggleInjury(zone: InjuryZone) {
    onChangeInjuries(injuries.includes(zone) ? injuries.filter((z) => z !== zone) : [...injuries, zone]);
  }

  const notEnoughDays = availableDays.length < sessionsPerWeek;

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">Tes contraintes et préférences</h2>
      <p className="mb-5 text-sm text-slate-600">La sortie longue sera placée sur un jour de week-end si possible.</p>

      <fieldset className="mb-6">
        <legend className="mb-2 text-sm font-semibold text-slate-800">Jours disponibles dans la semaine</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DAYS.map((d) => (
            <label
              key={d.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                availableDays.includes(d.value) ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={availableDays.includes(d.value)}
                onChange={() => toggleDay(d.value)}
                className="h-4 w-4 accent-blue-600"
              />
              {d.label}
            </label>
          ))}
        </div>
        {notEnoughDays && (
          <p className="mt-2 text-sm text-amber-700" role="alert">
            Sélectionne au moins {sessionsPerWeek} jour{sessionsPerWeek > 1 ? 's' : ''} pour caler tes {sessionsPerWeek} séances
            hebdomadaires.
          </p>
        )}
      </fieldset>

      <div className="mb-6">
        <label htmlFor="diet" className="mb-2 block text-sm font-semibold text-slate-800">
          Régime alimentaire
        </label>
        <select
          id="diet"
          value={diet ?? 'omnivore'}
          onChange={(e) => onChangeDiet(e.target.value as Diet)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-600 focus:outline-none"
        >
          {DIETS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="excluded" className="mb-2 block text-sm font-semibold text-slate-800">
          Allergies ou aliments exclus
        </label>
        <input
          id="excluded"
          type="text"
          value={excludedFoods}
          onChange={(e) => onChangeExcludedFoods(e.target.value)}
          placeholder="ex : arachide, fruits à coque"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-600 focus:outline-none"
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-800">Blessures ou zones sensibles</legend>
        <div className="grid grid-cols-2 gap-2">
          {INJURIES.map((z) => (
            <label
              key={z.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                injuries.includes(z.value) ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={injuries.includes(z.value)}
                onChange={() => toggleInjury(z.value)}
                className="h-4 w-4 accent-blue-600"
              />
              {z.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
