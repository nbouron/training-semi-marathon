import { useAppStore } from '../../store/useAppStore';
import { Logo } from './Logo';

export function DisclaimerGate() {
  const acknowledge = useAppStore((s) => s.acknowledgeDisclaimer);

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm md:p-10">
        <div className="mb-6 flex items-center gap-2">
          <Logo />
          <h1 className="text-xl font-bold text-slate-900">Semi-Marathon Coach</h1>
        </div>
        <p className="mb-6 text-sm text-slate-600">Avant de commencer, quelques précisions importantes.</p>

        <div className="mb-6 space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
          <p>
            Cette application <strong>ne remplace pas un avis médical ni l'accompagnement d'un coach professionnel</strong>.
            Elle propose un programme générique adapté à ton profil déclaré.
          </p>
          <p>
            Un <strong>certificat médical ou un avis médical</strong> est recommandé avant de démarrer un programme
            d'entraînement, en particulier si tu es débutant ou si tu reprends une activité physique.
          </p>
          <p>
            En cas de <strong>douleur articulaire ou tendineuse persistante</strong>, arrête l'entraînement et consulte un
            professionnel de santé.
          </p>
        </div>

        <button
          type="button"
          onClick={acknowledge}
          className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          J'ai compris, continuer
        </button>
      </div>
    </div>
  );
}
