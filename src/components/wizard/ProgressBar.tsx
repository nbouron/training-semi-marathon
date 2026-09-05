interface Props {
  step: number;
  total: number;
}

export function ProgressBar({ step, total }: Props) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
        <span>
          Étape {step} / {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
