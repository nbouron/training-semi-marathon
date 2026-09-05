import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TrainingPlan } from '../../types';

interface Props {
  plan: TrainingPlan;
}

export function VolumeChart({ plan }: Props) {
  const data = plan.weeks.map((w) => ({
    name: `S${w.number}`,
    km: w.totalVolumeKm,
    phase: w.phase,
  }));

  return (
    <div className="h-56 w-full rounded-xl border border-slate-200 bg-white p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" width={32} />
          <Tooltip
            formatter={(value: number) => [`${value} km`, 'Volume']}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Bar dataKey="km" radius={[4, 4, 0, 0]} fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
