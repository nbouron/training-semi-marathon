# Semi-Marathon Coach

Application web qui génère un programme d'entraînement personnalisé pour préparer un semi-marathon (21,1 km) : plan semaine par semaine, détail de chaque séance (échauffement, corps de séance, étirements) et accompagnement nutritionnel avec des recettes concrètes.

100 % côté client (React + TypeScript + Tailwind CSS), aucune donnée n'est envoyée à un serveur — tout est conservé dans le `localStorage` du navigateur.

## Démarrer

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production (typecheck + build Vite)
- `npm test` — tests unitaires du moteur de génération (Vitest)
- `npm run lint` — lint (oxlint)

## Structure

- `src/lib/planGenerator/` — moteur de génération du plan d'entraînement, isolé et testable, indépendant de l'UI (règles de progression, phases, allures, calendrier des séances).
- `src/lib/nutrition/` — banque de recettes, filtrage par régime/allergies, génération de menu hebdomadaire, conseils nutritionnels.
- `src/store/` — état de l'application (profil, plan, suivi) persisté en `localStorage` via Zustand.
- `src/components/` — wizard d'onboarding, vues du programme (semaine/calendrier), module nutrition, tableau de bord.

Le moteur de génération ne connaît que le semi-marathon aujourd'hui, mais son architecture (phases, allures, distances) est pensée pour accueillir d'autres distances (10 km, marathon) sans réécriture.

## Avertissement

Cette application ne remplace pas un avis médical ni l'accompagnement d'un coach professionnel.
