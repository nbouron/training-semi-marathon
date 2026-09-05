interface Props {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description?: string;
}

export function ChoiceCard({ name, value, checked, onChange, title, description }: Props) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
        checked ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
      />
      <span>
        <span className="block font-semibold text-slate-900">{title}</span>
        {description && <span className="mt-0.5 block text-sm text-slate-600">{description}</span>}
      </span>
    </label>
  );
}
