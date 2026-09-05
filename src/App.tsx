import { useState } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { DisclaimerGate } from './components/layout/DisclaimerGate';
import { NavBar, type Tab } from './components/layout/NavBar';
import { NutritionTab } from './components/nutrition/NutritionTab';
import { PlanTab } from './components/plan/PlanTab';
import { Wizard } from './components/wizard/Wizard';
import { useAppStore } from './store/useAppStore';

function App() {
  const disclaimerAcknowledged = useAppStore((s) => s.disclaimerAcknowledged);
  const profile = useAppStore((s) => s.profile);
  const plan = useAppStore((s) => s.plan);
  const [tab, setTab] = useState<Tab>('plan');

  if (!disclaimerAcknowledged) return <DisclaimerGate />;
  if (!profile || !plan) return <Wizard />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <DisclaimerBanner />
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <p className="text-sm font-bold text-slate-900">Semi-Marathon Coach</p>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-5">
        {tab === 'plan' && <PlanTab plan={plan} />}
        {tab === 'nutrition' && <NutritionTab plan={plan} profile={profile} />}
        {tab === 'dashboard' && <Dashboard plan={plan} />}
      </main>
      <NavBar active={tab} onChange={setTab} />
    </div>
  );
}

export default App;
