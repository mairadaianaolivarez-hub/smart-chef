import { useState, useMemo, useCallback } from 'react';
import { Search, X, Coffee, Sun, Cookie, Moon } from 'lucide-react';
import RecipeCard, { type Receta } from '../components/RecipeCard';
import RecipeDetail, { type Recipe } from '../components/RecipeDetail';
import { DEMO_RECETAS } from './Inicio';

/* ───────────────────────────────────────────────
   Constantes
   ─────────────────────────────────────────────── */

const CATEGORIAS = [
  { key: 'Desayuno', label: 'Desayuno', icon: Coffee },
  { key: 'Almuerzo', label: 'Almuerzo', icon: Sun },
  { key: 'Merienda', label: 'Merienda', icon: Cookie },
  { key: 'Cena', label: 'Cena', icon: Moon },
] as const;

/* ───────────────────────────────────────────────
   Helper
   ─────────────────────────────────────────────── */

function toDetailRecipe(r: Receta): Recipe {
  return {
    id: String(r.id),
    name: r.nombre,
    prepTimeMinutes: r.tiempo,
    cookTimeMinutes: 0,
    servings: 4,
    difficulty: r.dificultad === 'Muy fácil' ? 'fácil' : r.dificultad.toLowerCase() as 'fácil' | 'media' | 'difícil',
    tags: [r.categoria ?? 'General'],
    ingredients: r.ingredientes.map((name, i) => ({
      id: `ing-${r.id}-${i}`,
      name,
      substitutions: r.sustituciones?.[name] ? [r.sustituciones[name]] : undefined,
    })),
    steps: r.pasos.map((desc, i) => ({
      id: `step-${r.id}-${i}`,
      description: desc,
    })),
    dietaryNotes: r.dificultad === 'Muy fácil' ? ['Rápida'] : undefined,
  };
}

/* ───────────────────────────────────────────────
   Componente
   ─────────────────────────────────────────────── */

export default function Recetas() {
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const hasActiveFilters = searchQuery.trim().length > 0 || selectedCategory !== null;

  /* ── Recetas filtradas ── */
  const filteredRecetas = useMemo(() => {
    let results = DEMO_RECETAS;

    if (selectedCategory) {
      results = results.filter((r) => r.categoria === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      results = results.filter(
        (r) =>
          r.nombre.toLowerCase().includes(q) ||
          r.ingredientes.some((i) => i.toLowerCase().includes(q)),
      );
    }

    return results;
  }, [searchQuery, selectedCategory]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* ── Encabezado ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Todas las recetas
          </h1>
          <p className="mt-1 text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            {filteredRecetas.length} de {DEMO_RECETAS.length} receta{DEMO_RECETAS.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ── Búsqueda ── */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#2D2A24]/40"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar recetas por nombre o ingrediente…"
          className="w-full rounded-lg border border-[#E8DED5] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2D2A24] placeholder:text-[#2D2A24]/40 focus:border-[#E07A5F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20 transition-all"
          style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
          aria-label="Buscar recetas"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D2A24]/40 hover:text-[#2D2A24] transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Filtros de categoría ── */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIAS.map(({ key, label, icon: Icon }) => {
          const isActive = selectedCategory === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory((prev) => (prev === key ? null : key))}
              className={
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ' +
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2 ' +
                (isActive
                  ? 'bg-[#E07A5F] text-white shadow-sm'
                  : 'bg-[#FDF6F0] text-[#2D2A24] hover:bg-[#F5EBE0] border border-[#E8DED5]')
              }
              style={{ minHeight: '40px', fontFamily: 'Inter, sans-serif' }}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </button>
          );
        })}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#2D2A24]/50 hover:text-[#E07A5F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
            style={{ minHeight: '40px', fontFamily: 'Inter, sans-serif' }}
          >
            <X size={16} aria-hidden="true" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Grid de recetas ── */}
      {filteredRecetas.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecetas.map((receta) => (
            <RecipeCard
              key={receta.id}
              receta={receta}
              onVerDetalles={(r) => setDetailRecipe(toDetailRecipe(r))}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl bg-[#FDF6F0] py-16 text-center">
          <p className="text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            No se encontraron recetas con esos filtros.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#E07A5F] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#E07A5F]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
            style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
          >
            <X size={16} />
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Modal de detalle */}
      {detailRecipe && (
        <RecipeDetail
          recipe={detailRecipe}
          onClose={() => setDetailRecipe(null)}
        />
      )}
    </main>
  );
}