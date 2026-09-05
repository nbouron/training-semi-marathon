import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { Diet, Goal, InjuryZone, Level, UserProfile, WeekdayIndex } from '../../types';
import { ProgressBar } from './ProgressBar';
import { Step1Level } from './steps/Step1Level';
import { Step2Date } from './steps/Step2Date';
import { Step3Sessions } from './steps/Step3Sessions';
import { Step4Goal } from './steps/Step4Goal';
import { Step5Constraints } from './steps/Step5Constraints';

type Draft = Partial<UserProfile>;

const TOTAL_STEPS = 5;

export function Wizard() {
  const createPlan = useAppStore((s) => s.createPlan);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>({
    sessionsPerWeek: 3,
    optionalSession: false,
    availableDays: [],
    diet: 'omnivore',
    excludedFoods: '',
    injuries: [],
  });

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return !!draft.level;
      case 2:
        return !!draft.raceDate;
      case 3:
        return !!draft.sessionsPerWeek;
      case 4:
        return !!draft.goal && (draft.goal.type !== 'custom' || !!draft.goal.customMinutes);
      case 5:
        return (draft.availableDays?.length ?? 0) >= (draft.sessionsPerWeek ?? 1) && !!draft.diet;
      default:
        return false;
    }
  }

  function next() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    createPlan(draft as UserProfile);
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-8">
      <header className="mb-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Semi-Marathon Coach</p>
      </header>

      <ProgressBar step={step} total={TOTAL_STEPS} />

      <div className="flex-1">
        {step === 1 && <Step1Level value={draft.level} onChange={(v: Level) => update('level', v)} />}
        {step === 2 && (
          <Step2Date level={draft.level} raceDate={draft.raceDate} onChange={(v) => update('raceDate', v)} />
        )}
        {step === 3 && (
          <Step3Sessions
            sessionsPerWeek={draft.sessionsPerWeek}
            optionalSession={draft.optionalSession ?? false}
            onChangeSessions={(v) => update('sessionsPerWeek', v)}
            onChangeOptional={(v) => update('optionalSession', v)}
          />
        )}
        {step === 4 && draft.level && (
          <Step4Goal
            level={draft.level}
            raceDate={draft.raceDate}
            sessionsPerWeek={(draft.sessionsPerWeek ?? 3) as 2 | 3 | 4 | 5}
            goal={draft.goal}
            onChange={(g: Goal) => update('goal', g)}
          />
        )}
        {step === 5 && (
          <Step5Constraints
            sessionsPerWeek={draft.sessionsPerWeek ?? 3}
            availableDays={draft.availableDays ?? []}
            diet={draft.diet}
            excludedFoods={draft.excludedFoods ?? ''}
            injuries={draft.injuries ?? []}
            onChangeDays={(v: WeekdayIndex[]) => update('availableDays', v)}
            onChangeDiet={(v: Diet) => update('diet', v)}
            onChangeExcludedFoods={(v) => update('excludedFoods', v)}
            onChangeInjuries={(v: InjuryZone[]) => update('injuries', v)}
          />
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={back}
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Retour
          </button>
        )}
        <button
          type="button"
          onClick={next}
          disabled={!canProceed()}
          className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {step < TOTAL_STEPS ? 'Suivant' : 'Générer mon programme'}
        </button>
      </div>
    </div>
  );
}
