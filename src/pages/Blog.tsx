import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Salad, Snowflake, RefreshCw, Timer, ShoppingCart, Leaf } from 'lucide-react';

/* ───────────────────────────────────────────────
   Tipos
   ─────────────────────────────────────────────── */

interface Articulo {
  id: number;
  icon: React.ReactNode;
  titulo: string;
  contenido: React.ReactNode;
}

/* ───────────────────────────────────────────────
   Datos de los artículos
   ─────────────────────────────────────────────── */

const BLOG_ARTICULOS: Articulo[] = [
  {
    id: 1,
    icon: <Salad size={22} className="text-[#E07A5F]" aria-hidden="true" />,
    titulo: 'Cómo aprovechar las sobras de comida',
    contenido: (
      <>
        <p className="mb-3 text-sm leading-relaxed text-[#2D2A24]/80">
          Tirar comida no solo es un gasto de dinero, también es un desperdicio de tiempo y esfuerzo. Con un poco de creatividad, casi cualquier sobra puede transformarse en una comida nueva.
        </p>
        <p className="mb-2 text-sm font-semibold text-[#2D2A24]">Tips prácticos:</p>
        <ul className="mb-3 space-y-1.5 pl-4 text-sm leading-relaxed text-[#2D2A24]/80">
          <li><strong>Arroz o pastas sobrantes</strong> → salteados con verduras y huevo, o base para tortillas</li>
          <li><strong>Verduras cocidas</strong> → se pueden licuar para hacer sopas o cremas</li>
          <li><strong>Pan duro</strong> → rallado para empanar, o remojado para pan rallado casero</li>
          <li><strong>Carnes cocidas</strong> → picadas para rellenos de empanadas, tartas o sándwiches</li>
          <li><strong>Puré de papas</strong> → base para croquetas o tortillas de papa</li>
        </ul>
        <p className="text-sm leading-relaxed text-[#2D2A24]/80">
          <strong>Tip extra:</strong> Guardá las sobras en recipientes transparentes y etiquetados con la fecha. Así es más fácil acordarte de usarlas antes de que se echen a perder.
        </p>
      </>
    ),
  },
  {
    id: 2,
    icon: <Snowflake size={22} className="text-[#E07A5F]" aria-hidden="true" />,
    titulo: 'Guía de conservación de alimentos',
    contenido: (
      <>
        <p className="mb-3 text-sm leading-relaxed text-[#2D2A24]/80">
          Saber dónde y cómo guardar cada alimento hace la diferencia entre que dure una semana o se eche a perder en dos días.
        </p>
        <p className="mb-2 text-sm font-semibold text-[#2D2A24]">En la heladera:</p>
        <ul className="mb-3 space-y-1.5 pl-4 text-sm leading-relaxed text-[#2D2A24]/80">
          <li><strong>Verduras de hoja</strong> (lechuga, espinaca) → en bolsas con un papel de cocina para absorber humedad</li>
          <li><strong>Lácteos y huevos</strong> → en los estantes del medio, no en la puerta</li>
          <li><strong>Carnes crudas</strong> → en la parte más fría, separadas de otros alimentos</li>
        </ul>
        <p className="mb-2 text-sm font-semibold text-[#2D2A24]">En el freezer:</p>
        <ul className="mb-3 space-y-1.5 pl-4 text-sm leading-relaxed text-[#2D2A24]/80">
          <li>Se pueden congelar caldos, salsas, panes, y porciones individuales de guisos</li>
          <li>Usá recipientes o bolsas herméticas, sacando todo el aire posible</li>
        </ul>
        <p className="mb-2 text-sm font-semibold text-[#2D2A24]">En la alacena:</p>
        <ul className="space-y-1.5 pl-4 text-sm leading-relaxed text-[#2D2A24]/80">
          <li><strong>Legumbres y cereales secos</strong> → en frascos cerrados, lejos de la humedad</li>
          <li><strong>Papas y cebollas</strong> → en un lugar oscuro y ventilado, nunca en la heladera</li>
        </ul>
      </>
    ),
  },
  {
    id: 3,
    icon: <RefreshCw size={22} className="text-[#E07A5F]" aria-hidden="true" />,
    titulo: 'Sustituciones inteligentes de ingredientes',
    contenido: (
      <>
        <p className="mb-3 text-sm leading-relaxed text-[#2D2A24]/80">
          ¿Te quedaste sin un ingrediente a mitad de la receta? No pasa nada, con estos reemplazos podés seguir cocinando.
        </p>
        <p className="mb-2 text-sm font-semibold text-[#2D2A24]">Reemplazos comunes:</p>
        <ul className="mb-3 space-y-1.5 pl-4 text-sm leading-relaxed text-[#2D2A24]/80">
          <li><strong>1 huevo</strong> → 1 cucharada de semillas de chía + 3 de agua (dejar reposar 5 min)</li>
          <li><strong>Manteca</strong> → aceite neutro en la misma cantidad (para tortas y bizcochuelos)</li>
          <li><strong>Leche</strong> → agua + un chorrito de aceite, o leche vegetal si tenés</li>
          <li><strong>Polvo de hornear</strong> → mezcla de bicarbonato + jugo de limón</li>
          <li><strong>Azúcar</strong> → miel o dulce en la misma proporción (reduciendo un poco el líquido de la receta)</li>
        </ul>
        <p className="text-sm leading-relaxed text-[#2D2A24]/80">
          <strong>Tip extra:</strong> Estas sustituciones no siempre dan el mismo resultado exacto, pero funcionan muy bien para el día a día.
        </p>
      </>
    ),
  },
  {
    id: 4,
    icon: <Timer size={22} className="text-[#E07A5F]" aria-hidden="true" />,
    titulo: 'Recetas rápidas para el día a día',
    contenido: (
      <>
        <p className="mb-3 text-sm leading-relaxed text-[#2D2A24]/80">
          No siempre hay tiempo para cocinar algo elaborado, pero eso no significa resignarse a comer mal.
        </p>
        <p className="mb-2 text-sm font-semibold text-[#2D2A24]">Estrategias para ganar tiempo:</p>
        <ul className="mb-3 space-y-1.5 pl-4 text-sm leading-relaxed text-[#2D2A24]/80">
          <li><strong>Cociná de más y guardá porciones</strong> → duplicá la cantidad y congelá la mitad para otro día</li>
          <li><strong>Preparación adelantada</strong> → cortar verduras o marinar carnes el día anterior ahorra tiempo</li>
          <li><strong>Recetas de una sola olla o sartén</strong> → menos platos para lavar</li>
          <li><strong>Combos rápidos:</strong> huevo + verdura salteada + pan; o pasta + salsa + queso</li>
        </ul>
        <p className="text-sm leading-relaxed text-[#2D2A24]/80">
          <strong>Tip extra:</strong> Tené siempre a mano 3-4 ingredientes 'comodín' (huevos, arroz, alguna verdura congelada) para armar algo rápido cualquier día.
        </p>
      </>
    ),
  },
  {
    id: 5,
    icon: <ShoppingCart size={22} className="text-[#E07A5F]" aria-hidden="true" />,
    titulo: 'Cómo armar una lista de compras inteligente',
    contenido: (
      <>
        <p className="mb-3 text-sm leading-relaxed text-[#2D2A24]/80">
          Ir al supermercado sin un plan es la forma más fácil de gastar de más.
        </p>
        <p className="mb-2 text-sm font-semibold text-[#2D2A24]">Pasos para una lista eficiente:</p>
        <ul className="mb-3 space-y-1.5 pl-4 text-sm leading-relaxed text-[#2D2A24]/80">
          <li>Revisá qué tenés en casa antes de salir (heladera, freezer y alacena)</li>
          <li>Planificá tus comidas de la semana (¡para eso está la sección Planes de Smart Chef!)</li>
          <li>Agrupá la lista por categorías: verduras, lácteos, carnes, almacén</li>
          <li>Evitá ir con hambre: es más probable comprar de más</li>
          <li>Priorizá ingredientes versátiles que sirvan para varias recetas</li>
        </ul>
        <p className="text-sm leading-relaxed text-[#2D2A24]/80">
          <strong>Tip extra:</strong> Usá tu Plan Semanal de Smart Chef como base para armar la lista de compras.
        </p>
      </>
    ),
  },
  {
    id: 6,
    icon: <Leaf size={22} className="text-[#E07A5F]" aria-hidden="true" />,
    titulo: 'Beneficios de cocinar con lo que tenés en casa',
    contenido: (
      <>
        <p className="mb-3 text-sm leading-relaxed text-[#2D2A24]/80">
          Cocinar con lo que ya tenés a mano no es solo una cuestión de practicidad, tiene un montón de beneficios reales.
        </p>
        <p className="mb-2 text-sm font-semibold text-[#2D2A24]">Principales ventajas:</p>
        <ul className="mb-3 space-y-1.5 pl-4 text-sm leading-relaxed text-[#2D2A24]/80">
          <li><strong>💰 Ahorro de dinero</strong> → menos compras impulsivas, mejor aprovechamiento</li>
          <li><strong>⏱️ Ahorro de tiempo</strong> → no hace falta ir de urgencia al supermercado</li>
          <li><strong>🥬 Más variedad</strong> → te anima a combinaciones que quizás no habías probado</li>
          <li><strong>🗑️ Menos desperdicio</strong> → los alimentos se usan antes de vencerse</li>
          <li><strong>🌍 Más sustentable</strong> → menos consumo, menos residuos</li>
        </ul>
        <p className="text-sm leading-relaxed text-[#2D2A24]/80">
          Por eso existe Smart Chef: para ayudarte a transformar lo que ya tenés en tu casa en la próxima comida rica, sin desperdiciar nada.
        </p>
      </>
    ),
  },
];

/* ───────────────────────────────────────────────
   Componente: Acordeón
   ─────────────────────────────────────────────── */

function Acordeon({ articulo, abierto, onToggle }: { articulo: Articulo; abierto: boolean; onToggle: () => void }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-[#E8DED5] bg-white transition-all duration-200"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#FDF6F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
        style={{ minHeight: '56px' }}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDF6F0]">
          {articulo.icon}
        </span>
        <span className="flex-1 text-base font-semibold text-[#2D2A24]">
          {articulo.titulo}
        </span>
        <span className="shrink-0 text-[#2D2A24]/40 transition-transform duration-200" style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDown size={20} aria-hidden="true" />
        </span>
      </button>
      {abierto && (
        <div className="border-t border-[#E8DED5] px-5 py-4">
          {articulo.contenido}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Componente principal: Blog
   ─────────────────────────────────────────────── */

export default function Blog() {
  const [articuloAbierto, setArticuloAbierto] = useState<number | null>(null);

  const handleToggle = useCallback((id: number) => {
    setArticuloAbierto((prev) => (prev === id ? null : id));
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      {/* ── Encabezado ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Blog
        </h1>
        <p className="mt-1 text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
          Consejos, técnicas y artículos sobre cocina casera
        </p>
      </div>

      {/* ── Lista de artículos ── */}
      <div className="space-y-3">
        {BLOG_ARTICULOS.map((articulo) => (
          <Acordeon
            key={articulo.id}
            articulo={articulo}
            abierto={articuloAbierto === articulo.id}
            onToggle={() => handleToggle(articulo.id)}
          />
        ))}
      </div>
    </main>
  );
}