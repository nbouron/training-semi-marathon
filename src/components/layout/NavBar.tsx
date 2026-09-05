export type Tab = 'plan' | 'nutrition' | 'dashboard';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { value: Tab; label: string; icon: string }[] = [
  { value: 'plan', label: 'Programme', icon: '📅' },
  { value: 'nutrition', label: 'Nutrition', icon: '🍽️' },
  { value: 'dashboard', label: 'Suivi', icon: '📊' },
];

export function NavBar({ active, onChange }: Props) {
  return (
    <nav
      aria-label="Navigation principale"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white md:hidden"
    >
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          aria-current={active === tab.value ? 'page' : undefined}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold ${
            active === tab.value ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <span aria-hidden="true" className="text-lg leading-none">
            {tab.icon}
          </span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
