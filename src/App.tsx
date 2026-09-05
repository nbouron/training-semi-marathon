import { useState } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { DisclaimerGate } from './components/layout/DisclaimerGate';
import { Logo } from './components/layout/Logo';
import { NavBar, type Tab } from './components/layout/NavBar';
import { Sidebar } from './components/layout/Sidebar';
import { NutritionTab } from './components/nutrition/NutritionTab';
import { PlanTab } from './components/plan/PlanTab';
import { Wizard } from './components/wizard/Wizard';
import { useAppStore } from './store/useAppStore';

const TAB_TITLES: Record<Tab, string> = {
  plan: 'Programme',
  nutrition: 'Nutrition',
  dashboard: 'Suivi',
};

function App() {
  const disclaimerAcknowledged = useAppStore((s) => s.disclaimerAcknowledged);
  const profile = useAppStore((s) => s.profile);
  const plan = useAppStore((s) => s.plan);
  const [tab, setTab] = useState<Tab>('plan');

  if (!disclaimerAcknowledged) return <DisclaimerGate />;
  if (!profile || !plan) return <Wizard />;

  return (
    <div className="min-h-screen bg-slate-50">
      <DisclaimerBanner />
      <div className="flex min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-1.75rem)]">
        <Sidebar active={tab} onChange={setTab} plan={plan} />

        <div className="flex-1 pb-20 md:pb-0">
          <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
            <Logo size={22} />
            <p className="text-sm font-bold text-slate-900">Semi-Marathon Coach</p>
          </header>

          <header className="hidden border-b border-slate-200 bg-white px-8 py-5 md:block">
            <h1 className="text-xl font-bold text-slate-900">{TAB_TITLES[tab]}</h1>
          </header>

          <main className="mx-auto max-w-2xl px-4 py-5 md:max-w-6xl md:px-8 md:py-8">
            {tab === 'plan' && <PlanTab plan={plan} />}
            {tab === 'nutrition' && <NutritionTab plan={plan} profile={profile} />}
            {tab === 'dashboard' && <Dashboard plan={plan} />}
          </main>
        </div>
      </div>
      <NavBar active={tab} onChange={setTab} />
    </div>
  );
}

export default App;
