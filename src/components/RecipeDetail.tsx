import { useState } from 'react';
import {
  X, Clock, Users, ChefHat, Leaf, AlertCircle, Check,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
  substitutions?: string[];
}

export interface RecipeStep {
  id: string;
  title?: string;
  description: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  image?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  difficulty?: 'fácil' | 'media' | 'difícil';
  tags?: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  dietaryNotes?: string[];
}

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

function fmtMin(totalMinutes?: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h} h ${m} min`;
  if (h > 0) return `${h} h`;
  return `${m} min`;
}

function fmtIng(ing: RecipeIngredient): string {
  const parts = [ing.quantity, ing.unit].filter(Boolean);
  return parts.length > 0 ? `${parts.join(' ')} ${ing.name}`.trim() : ing.name;
}

// ---------------------------------------------------------------------------
// Sub-component: IngredientRow
// ---------------------------------------------------------------------------

function IngredientRow({
  ingredient,
  checked,
  onToggle,
  subsOpen,
  onToggleSubs,
}: {
  ingredient: RecipeIngredient;
  checked: boolean;
  onToggle: () => void;
  subsOpen: boolean;
  onToggleSubs: () => void;
}) {
  const hasSubs = ingredient.substitutions && ingredient.substitutions.length > 0;

  return (
    <li className="rounded-lg border border-slate-100 bg-slate-50/60">
      <div className="flex items-start gap-3 px-3 py-2.5">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={checked}
          className={cn(
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600',
            checked
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-slate-300 bg-white text-transparent hover:border-emerald-500',
          )}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </button>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-sm leading-relaxed text-slate-800',
              checked && 'text-slate-400 line-through',
            )}
          >
            {fmtIng(ingredient)}
          </p>
          {hasSubs && (
            <button
              type="button"
              onClick={onToggleSubs}
              aria-expanded={subsOpen}
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 transition hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              {subsOpen ? <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} /> : <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />}
              Sustituciones
            </button>
          )}
        </div>
      </div>
      {hasSubs && subsOpen && (
        <div className="border-t border-slate-100 px-3 py-2.5 pl-12">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <AlertCircle className="h-3.5 w-3.5" strokeWidth={2} />
            Puedes sustituir por:
          </p>
          <ul className="space-y-1">
            {ingredient.substitutions!.map((sub, idx) => (
              <li key={idx} className="text-sm leading-relaxed text-slate-700">• {sub}</li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function RecipeDetail({ recipe, onClose }: RecipeDetailProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [openSubs, setOpenSubs] = useState<Set<string>>(new Set());

  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
  const allChecked = recipe.ingredients.length > 0 && recipe.ingredients.every((i) => checked.has(i.id));

  const toggleIng = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSubs = (id: string) => {
    setOpenSubs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-detail-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / media */}
        <div className="relative shrink-0">
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.name} className="h-44 w-full object-cover sm:h-52" width={672} height={208} />
          ) : (
            <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 sm:h-52">
              <ChefHat className="h-16 w-16 text-white/90" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar receta"
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <h2 id="recipe-detail-title" className="text-xl font-bold leading-tight text-white sm:text-2xl">{recipe.name}</h2>
            {recipe.description && <p className="mt-1 line-clamp-2 text-sm text-white/90">{recipe.description}</p>}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-100 px-4 py-3 sm:px-6">
          {totalTime > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-slate-600">
              <Clock className="h-4 w-4 text-emerald-600" strokeWidth={2} />{fmtMin(totalTime)}
            </span>
          )}
          {recipe.servings !== undefined && recipe.servings > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-slate-600">
              <Users className="h-4 w-4 text-emerald-600" strokeWidth={2} />
              {recipe.servings} {recipe.servings === 1 ? 'ración' : 'raciones'}
            </span>
          )}
          {recipe.difficulty && (
            <span className="flex items-center gap-1.5 text-sm text-slate-600">
              <ChefHat className="h-4 w-4 text-emerald-600" strokeWidth={2} />{recipe.difficulty}
            </span>
          )}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {recipe.dietaryNotes && recipe.dietaryNotes.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {recipe.dietaryNotes.map((note) => (
                <span key={note} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                  <Leaf className="h-4 w-4" strokeWidth={2} />{note}
                </span>
              ))}
            </div>
          )}

          {/* Ingredients */}
          <section aria-labelledby="ingredients-heading" className="mb-8">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 id="ingredients-heading" className="text-base font-semibold text-slate-900">Ingredientes</h3>
              <button
                type="button"
                onClick={() => setChecked(allChecked ? new Set() : new Set(recipe.ingredients.map((i) => i.id)))}
                className="rounded-lg px-2 py-1 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                {allChecked ? 'Desmarcar todo' : 'Marcar todo'}
              </button>
            </div>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing) => (
                <IngredientRow
                  key={ing.id}
                  ingredient={ing}
                  checked={checked.has(ing.id)}
                  onToggle={() => toggleIng(ing.id)}
                  subsOpen={openSubs.has(ing.id)}
                  onToggleSubs={() => toggleSubs(ing.id)}
                />
              ))}
            </ul>
          </section>

          {/* Steps */}
          <section aria-labelledby="steps-heading">
            <h3 id="steps-heading" className="mb-3 text-base font-semibold text-slate-900">Pasos</h3>
            <ol className="space-y-3">
              {recipe.steps.map((step, index) => (
                <li key={step.id} className="flex gap-3 rounded-lg border border-slate-100 bg-white p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">{index + 1}</span>
                  <div className="min-w-0">
                    {step.title && <p className="text-sm font-semibold text-slate-900">{step.title}</p>}
                    <p className="text-sm leading-relaxed text-slate-700">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}