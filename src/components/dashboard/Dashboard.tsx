import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { exportPlanToPdf } from '../../lib/exportPdf';
import { useAppStore } from '../../store/useAppStore';
import type { TrainingPlan } from '../../types';
import { VolumeChart } from './VolumeChart';

interface Props {
  plan: TrainingPlan;
}

export function Dashboard({ plan }: Props) {
  const resetPlan = useAppStore((s) => s.resetPlan);

  const stats = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const runningSessions = plan.weeks
      .flatMap((w) => w.sessions)
      .filter((s) => s.type !== 'repos' && !s.optional);
    const pastDue = runningSessions.filter((s) => s.date <= todayIso);
    const completed = runningSessions.filter((s) => s.completion?.done);
    const completedPastDue = pastDue.filter((s) => s.completion?.done);
    const completedKm = completed.reduce((acc, s) => acc + (s.completion?.actualDistanceKm ?? s.distanceKm ?? 0), 0);
    const adherencePct = pastDue.length > 0 ? Math.round((completedPastDue.length / pastDue.length) * 100) : 0;
    const daysToRace = differenceInCalendarDays(parseISO(plan.profile.raceDate), new Date());

    return {
      totalSessions: runningSessions.length,
      completedCount: completed.length,
      completedKm: Math.round(completedKm * 10) / 10,
      adherencePct,
      daysToRace,
    };
  }, [plan]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Jours avant la course" value={stats.daysToRace >= 0 ? String(stats.daysToRace) : '0'} />
        <StatTile label="Séances réalisées" value={`${stats.completedCount} / ${stats.totalSessions}`} />
        <StatTile label="Kilomètres cumulés" value={`${stats.completedKm} km`} />
        <StatTile label="Adhérence au plan" value={`${stats.adherencePct}%`} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Volume hebdomadaire</h2>
        <VolumeChart plan={plan} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-1 text-lg font-bold text-slate-900">Ton programme</h2>
        <p className="mb-3 text-sm text-slate-600">
          Objectif : {plan.profile.goal.type === 'terminer' ? 'terminer la course' : plan.profile.goal.type} · Niveau de
          faisabilité : <strong>{plan.feasibility.replace('_', ' ')}</strong>
        </p>
        <button
          type="button"
          onClick={() => exportPlanToPdf(plan)}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Exporter le programme en PDF
        </button>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <h2 className="mb-1 font-semibold text-red-900">Recommencer</h2>
        <p className="mb-3 text-sm text-red-800">
          Efface le programme actuel et relance le questionnaire depuis le début.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm('Supprimer le programme actuel et recommencer ?')) resetPlan();
          }}
          className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 font-semibold text-red-700 hover:bg-red-100"
        >
          Recommencer le questionnaire
        </button>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
