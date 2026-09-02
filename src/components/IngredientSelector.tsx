import { useState, useMemo, memo, useCallback } from 'react';
import { X, Search, ChefHat } from 'lucide-react';

/* ───────────────────────────────────────────────
   Tipos
   ─────────────────────────────────────────────── */
export interface Ingredient {
  id: string;
  name: string;
  category?: string;
}

interface IngredientSelectorProps {
  ingredients: Ingredient[];
  selected: string[];
  onChange: (selectedIds: string[]) => void;
  searchPlaceholder?: string;
  emptyLabel?: string;
  noResultsLabel?: string;
  className?: string;
}

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/* ───────────────────────────────────────────────
   Componente
   ─────────────────────────────────────────────── */
const IngredientSelector = memo(function IngredientSelector({
  ingredients,
  selected,
  onChange,
  searchPlaceholder = 'Buscar ingredientes…',
  emptyLabel = 'No hay ingredientes disponibles.',
  noResultsLabel = 'No se encontraron ingredientes.',
  className,
}: IngredientSelectorProps) {
  const [query, setQuery] = useState('');

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  /* Agrupar por categoría, filtrando por búsqueda */
  const grouped = useMemo(() => {
    const groups = new Map<string, Ingredient[]>();
    const q = query ? normalize(query) : '';

    for (const ing of ingredients) {
      if (q && !normalize(ing.name).includes(q)) continue;
      const cat = ing.category ?? 'Otros';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(ing);
    }
    return groups;
  }, [ingredients, query]);

  /* Alternar selección — estable con useCallback */
  const toggleIngredient = useCallback((id: string) => {
    const next = new Set(selectedSet);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange(Array.from(next));
  }, [selectedSet, onChange]);

  const clearSelection = useCallback(() => {
    onChange([]);
  }, [onChange]);

  /* Ingredientes seleccionados (para los chips de arriba) */
  const selectedIngredients = useMemo(() => {
    const map = new Map(ingredients.map((i) => [i.id, i]));
    return selected.map((id) => map.get(id)).filter(Boolean) as Ingredient[];
  }, [ingredients, selected]);

  return (
    <div className={`space-y-3 ${className ?? ''}`}>
      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Ingredientes
        </h3>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={clearSelection}
            className="flex items-center gap-1 text-sm text-[#E07A5F] hover:text-[#c96a4f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2 rounded-md px-2 py-1"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <X size={14} aria-hidden="true" />
            Limpiar
          </button>
        )}
      </div>

      {/* ── Chips seleccionados ── */}
      {selectedIngredients.length > 0 && (
        <div
          className="flex flex-wrap gap-2 p-3 rounded-lg bg-white"
          style={{ borderRadius: '8px' }}
          aria-label="Ingredientes seleccionados"
        >
          {selectedIngredients.map((ing) => (
            <button
              key={ing.id}
              type="button"
              onClick={() => toggleIngredient(ing.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#E07A5F] rounded-full transition-all hover:bg-[#c96a4f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
              style={{
                fontFamily: 'Inter, sans-serif',
                borderRadius: '9999px',
                minHeight: '32px',
              }}
              title={`Quitar ${ing.name}`}
            >
              <span className="truncate max-w-[160px]">{ing.name}</span>
              <X size={14} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {/* ── Búsqueda ── */}
      <div
        className="relative flex items-center bg-white border border-[#E8DED5] focus-within:border-[#E07A5F] transition-colors"
        style={{ borderRadius: '8px' }}
      >
        <Search
          size={18}
          className="absolute left-3 text-[#2D2A24] opacity-40 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-transparent py-2.5 pl-10 pr-3 text-sm text-[#2D2A24] placeholder:text-[#2D2A24]/40 focus:outline-none"
          style={{ fontFamily: 'Inter, sans-serif', minHeight: '44px' }}
          aria-label="Buscar ingredientes"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mr-2 p-1.5 text-[#2D2A24]/50 hover:text-[#2D2A24] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] rounded-md"
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Lista de ingredientes ── */}
      <div
        className="bg-white overflow-y-auto"
        style={{
          borderRadius: '8px',
          maxHeight: '320px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#E8DED5 transparent',
        }}
      >
        {ingredients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <ChefHat size={40} className="text-[#2D2A24]/20 mb-3" aria-hidden="true" />
            <p className="text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
              {emptyLabel}
            </p>
          </div>
        ) : grouped.size === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <Search size={40} className="text-[#2D2A24]/20 mb-3" aria-hidden="true" />
            <p className="text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
              {noResultsLabel}
            </p>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category}>
              <div
                className="sticky top-0 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#2D2A24]/50 border-b border-[#F0EAE3]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {category}
              </div>
              <div className="flex flex-wrap gap-2 p-3">
                {items.map((ing) => {
                  const isSelected = selectedSet.has(ing.id);
                  return (
                    <button
                      key={ing.id}
                      type="button"
                      onClick={() => toggleIngredient(ing.id)}
                      className={
                        'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all ' +
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2 ' +
                        (isSelected
                          ? 'bg-[#E07A5F] text-white'
                          : 'bg-[#FDF6F0] text-[#2D2A24] hover:bg-[#F5EBE0] border border-[#E8DED5]')
                      }
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        borderRadius: '9999px',
                        minHeight: '32px',
                      }}
                      title={isSelected ? `Quitar ${ing.name}` : `Agregar ${ing.name}`}
                    >
                      <span
                        className={
                          'inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 ' +
                          (isSelected ? 'bg-white/20' : 'bg-[#E07A5F]')
                        }
                        aria-hidden="true"
                      >
                        <span className="block w-2 h-2 rounded-full bg-white" />
                      </span>
                      <span className="truncate max-w-[140px]">{ing.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Contador ── */}
      <div className="flex items-center justify-between text-xs text-[#2D2A24]/50 px-1" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span>
          {selected.length} seleccionado{selected.length !== 1 ? 's' : ''}
        </span>
        <span>
          {ingredients.length} disponible{ingredients.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
});

export default IngredientSelector;