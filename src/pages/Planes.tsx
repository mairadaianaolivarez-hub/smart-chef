import { useState, useMemo, useCallback, useEffect } from 'react';
import { X, Check, Coffee, Sun, Cookie, Moon, ShoppingCart, Trash2 } from 'lucide-react';
import RecipeCard, { type Receta } from '../components/RecipeCard';
import RecipeDetail, { type Recipe } from '../components/RecipeDetail';
import { DEMO_RECETAS } from './Inicio';

/* ───────────────────────────────────────────────
   Constantes
   ─────────────────────────────────────────────── */

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;

const CATEGORIAS = [
  { key: 'Desayuno', label: 'Desayuno', icon: Coffee },
  { key: 'Almuerzo', label: 'Almuerzo', icon: Sun },
  { key: 'Merienda', label: 'Merienda', icon: Cookie },
  { key: 'Cena', label: 'Cena', icon: Moon },
] as const;

type Dia = (typeof DIAS)[number];
type Categoria = (typeof CATEGORIAS)[number]['key'];

type PlanSemanal = Record<Dia, Partial<Record<Categoria, Receta>>>;

const LS_PLAN = 'smartchef_planSemanal';

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

function crearPlanVacio(): PlanSemanal {
  const plan = {} as PlanSemanal;
  for (const dia of DIAS) {
    plan[dia] = {};
  }
  return plan;
}

/* ───────────────────────────────────────────────
   Componente: Selector de receta (modal)
   ─────────────────────────────────────────────── */

function SelectorReceta({
  categoria,
  onSelect,
  onClose,
}: {
  categoria: Categoria;
  onSelect: (receta: Receta) => void;
  onClose: () => void;
}) {
  const recetasDisponibles = useMemo(
    () => DEMO_RECETAS.filter((r) => r.categoria === categoria),
    [categoria],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Elegir receta para ${categoria}`}
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8DED5] px-5 py-4">
          <h2 className="text-lg font-semibold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Elegí una receta de {categoria}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#2D2A24]/50 hover:text-[#2D2A24] hover:bg-[#FDF6F0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F]"
            aria-label="Cerrar selector"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4">
          {recetasDisponibles.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
              No hay recetas disponibles para {categoria}.
            </p>
          ) : (
            <div className="space-y-2">
              {recetasDisponibles.map((receta) => (
                <button
                  key={receta.id}
                  type="button"
                  onClick={() => onSelect(receta)}
                  className="flex w-full items-center gap-3 rounded-xl border border-[#E8DED5] bg-white p-3 text-left transition-all hover:border-[#E07A5F] hover:bg-[#FDF6F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: '#E07A5F' }}
                    aria-hidden="true"
                  >
                    {receta.nombre.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#2D2A24]">{receta.nombre}</p>
                    <p className="text-xs text-[#2D2A24]/50">{receta.tiempo} min · {receta.dificultad}</p>
                  </div>
                  <Check size={18} className="shrink-0 text-[#E07A5F]" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Componente: Celda del plan
   ─────────────────────────────────────────────── */

function CeldaPlan({
  receta,
  categoria,
  onElegir,
  onQuitar,
}: {
  receta: Receta | undefined;
  categoria: Categoria;
  onElegir: () => void;
  onQuitar: () => void;
}) {
  return (
    <div
      className="flex min-h-[80px] flex-col items-center justify-center rounded-lg border border-[#E8DED5] bg-white p-2 transition-colors"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {receta ? (
        <div className="flex w-full flex-col items-center gap-1">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: '#E07A5F' }}
            aria-hidden="true"
          >
            {receta.nombre.charAt(0).toUpperCase()}
          </span>
          <p
            className="w-full truncate text-center text-xs font-medium text-[#2D2A24]"
            title={receta.nombre}
          >
            {receta.nombre}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onElegir}
              className="rounded-md px-2 py-1 text-[10px] font-medium text-[#E07A5F] hover:bg-[#FDF6F0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F]"
              title="Cambiar receta"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={onQuitar}
              className="rounded-md px-2 py-1 text-[10px] font-medium text-red-500 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              title="Quitar receta"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onElegir}
          className="flex h-full w-full items-center justify-center rounded-md px-2 py-3 text-xs font-medium text-[#2D2A24]/50 hover:text-[#E07A5F] hover:bg-[#FDF6F0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-1"
          style={{ minHeight: '44px' }}
        >
          + Elegir receta
        </button>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Componente principal: Planes
   ─────────────────────────────────────────────── */

export default function Planes() {
  const [plan, setPlan] = useState<PlanSemanal>(() => {
    try {
      const stored = localStorage.getItem(LS_PLAN);
      if (stored) {
        const parsed = JSON.parse(stored) as PlanSemanal;
        // Validar estructura básica
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch {
      // ignorar
    }
    return crearPlanVacio();
  });

  const [selectorOpen, setSelectorOpen] = useState<{ dia: Dia; categoria: Categoria } | null>(null);
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);

  /* ── Persistir en localStorage ── */
  useEffect(() => {
    localStorage.setItem(LS_PLAN, JSON.stringify(plan));
  }, [plan]);

  /* ── Elegir receta en una celda ── */
  const handleSelect = useCallback(
    (receta: Receta) => {
      if (!selectorOpen) return;
      const { dia, categoria } = selectorOpen;
      setPlan((prev) => ({
        ...prev,
        [dia]: { ...prev[dia], [categoria]: receta },
      }));
      setSelectorOpen(null);
    },
    [selectorOpen],
  );

  /* ── Quitar receta de una celda ── */
  const handleQuitar = useCallback((dia: Dia, categoria: Categoria) => {
    setPlan((prev) => {
      const next = { ...prev, [dia]: { ...prev[dia] } };
      delete next[dia][categoria];
      return next;
    });
  }, []);

  /* ── Contar celdas llenas ── */
  const totalCeldas = DIAS.length * CATEGORIAS.length;
  const celdasLlenas = useMemo(() => {
    let count = 0;
    for (const dia of DIAS) {
      for (const { key } of CATEGORIAS) {
        if (plan[dia]?.[key]) count++;
      }
    }
    return count;
  }, [plan]);

  /* ── Limpiar todo el plan ── */
  const handleLimpiarTodo = useCallback(() => {
    setPlan(crearPlanVacio());
  }, []);

  /* ── Lista de compras ── */
  const [listaCompraAbierta, setListaCompraAbierta] = useState(false);
  const [comprados, setComprados] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('smartchef_listaCompra');
      if (stored) return new Set(JSON.parse(stored) as string[]);
    } catch { /* ignorar */ }
    return new Set();
  });

  const ingredientesLista = useMemo(() => {
    const items: string[] = [];
    for (const dia of DIAS) {
      for (const { key } of CATEGORIAS) {
        const receta = plan[dia]?.[key as Categoria];
        if (receta) {
          for (const ing of receta.ingredientes) {
            items.push(ing);
          }
        }
      }
    }
    return items;
  }, [plan]);

  const toggleComprado = useCallback((ingrediente: string) => {
    setComprados((prev) => {
      const next = new Set(prev);
      if (next.has(ingrediente)) {
        next.delete(ingrediente);
      } else {
        next.add(ingrediente);
      }
      localStorage.setItem('smartchef_listaCompra', JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* ── Encabezado ── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Mi Plan Semanal
          </h1>
          <p className="mt-1 text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            {celdasLlenas} de {totalCeldas} comidas planificadas
          </p>
        </div>
        {celdasLlenas > 0 && (
          <button
            type="button"
            onClick={handleLimpiarTodo}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
            style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
          >
            <Trash2 size={16} />
            Limpiar todo
          </button>
        )}
      </div>

      {/* ── Grilla responsive ── */}
      <div className="overflow-x-auto rounded-xl border border-[#E8DED5] bg-[#FDF6F0]">
        <table className="w-full min-w-[600px] border-collapse" style={{ fontFamily: 'Inter, sans-serif' }}>
          <thead>
            <tr>
              <th
                className="sticky left-0 z-10 border-b border-r border-[#E8DED5] bg-[#F5EBE0] px-3 py-3 text-left text-sm font-semibold text-[#2D2A24]"
                style={{ minWidth: '90px' }}
              >
                Día
              </th>
              {CATEGORIAS.map(({ key, label, icon: Icon }) => (
                <th
                  key={key}
                  className="border-b border-r border-[#E8DED5] bg-[#F5EBE0] px-2 py-3 text-center text-sm font-semibold text-[#2D2A24] last:border-r-0"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Icon size={16} aria-hidden="true" />
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIAS.map((dia) => (
              <tr key={dia}>
                <td
                  className="sticky left-0 z-10 border-b border-r border-[#E8DED5] bg-[#FDF6F0] px-3 py-3 text-sm font-semibold text-[#2D2A24]"
                >
                  {dia}
                </td>
                {CATEGORIAS.map(({ key: categoria }) => (
                  <td
                    key={`${dia}-${categoria}`}
                    className="border-b border-r border-[#E8DED5] p-2 last:border-r-0"
                  >
                    <CeldaPlan
                      receta={plan[dia]?.[categoria]}
                      categoria={categoria}
                      onElegir={() => setSelectorOpen({ dia, categoria })}
                      onQuitar={() => handleQuitar(dia, categoria)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Selector de receta (modal) ── */}
      {selectorOpen && (
        <SelectorReceta
          categoria={selectorOpen.categoria}
          onSelect={handleSelect}
          onClose={() => setSelectorOpen(null)}
        />
      )}

      {/* Modal de detalle */}
      {detailRecipe && (
        <RecipeDetail
          recipe={detailRecipe}
          onClose={() => setDetailRecipe(null)}
        />
      )}

      {/* ── Lista de compras ── */}
      <div className="mt-8">
        <button
          type="button"
          onClick={() => setListaCompraAbierta((prev) => !prev)}
          disabled={celdasLlenas === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-[#E07A5F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#c96a4f] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
          style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
        >
          <ShoppingCart size={18} aria-hidden="true" />
          {listaCompraAbierta ? 'Cerrar lista de compras' : 'Generar lista de compras'}
        </button>

        {listaCompraAbierta && (
          <div className="mt-4 rounded-xl border border-[#E8DED5] bg-white p-5">
            {celdasLlenas === 0 ? (
              <p className="text-sm text-[#2D2A24]/60 text-center py-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Primero armá tu plan semanal para generar la lista de compras
              </p>
            ) : ingredientesLista.length === 0 ? (
              <p className="text-sm text-[#2D2A24]/60 text-center py-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                No se encontraron ingredientes en las recetas seleccionadas
              </p>
            ) : (
              <>
                <h3 className="mb-3 text-base font-semibold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Lista de compras ({ingredientesLista.length} ingredientes)
                </h3>
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                  {ingredientesLista.map((ingrediente, idx) => {
                    const estaComprado = comprados.has(ingrediente);
                    return (
                      <label
                        key={`${ingrediente}-${idx}`}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors hover:bg-[#FDF6F0] ${estaComprado ? 'opacity-50' : ''}`}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <input
                          type="checkbox"
                          checked={estaComprado}
                          onChange={() => toggleComprado(ingrediente)}
                          className="h-5 w-5 rounded border-[#E8DED5] text-[#E07A5F] focus:ring-[#E07A5F] focus:ring-offset-1"
                        />
                        <span className={`text-sm ${estaComprado ? 'line-through text-[#2D2A24]/40' : 'text-[#2D2A24]'}`}>
                          {ingrediente}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}