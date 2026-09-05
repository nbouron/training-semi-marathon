import type { Recipe } from '../../types';

interface Props {
  recipe: Recipe;
  onRegenerate?: () => void;
}

export function RecipeCard({ recipe, onRegenerate }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="font-semibold text-slate-900">{recipe.name}</h4>
        <span className="shrink-0 text-xs font-medium text-slate-500">{recipe.prepTimeMin} min</span>
      </div>
      <p className="mb-2 text-xs text-slate-600">
        <strong>Ingrédients :</strong> {recipe.ingredients.join(', ')}
      </p>
      <ol className="mb-2 list-decimal space-y-1 pl-4 text-xs text-slate-700">
        {recipe.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      <p className="text-xs italic text-slate-500">{recipe.whyAdapted}</p>
      {onRegenerate && (
        <button
          type="button"
          onClick={onRegenerate}
          className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Régénérer une proposition
        </button>
      )}
    </div>
  );
}
