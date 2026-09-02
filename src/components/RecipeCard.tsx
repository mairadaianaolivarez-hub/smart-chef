import React, { memo } from 'react';
import { Clock, ChefHat, Eye } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Tipos                                                              */
/* ------------------------------------------------------------------ */

export interface Receta {
  id: number;
  nombre: string;
  tiempo: number;
  dificultad: string;
  categoria: string;
  ingredientes: string[];
  pasos: string[];
  sustituciones?: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/*  Helpers inline                                                     */
/* ------------------------------------------------------------------ */

const dificultadColor = (d: string): string => {
  switch (d) {
    case 'Muy fácil':
      return 'bg-green-100 text-green-800';
    case 'Fácil':
      return 'bg-emerald-100 text-emerald-800';
    case 'Media':
      return 'bg-amber-100 text-amber-800';
    case 'Difícil':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const categoriaColor = (c: string): string => {
  switch (c) {
    case 'Desayuno':
      return 'bg-orange-100 text-orange-800';
    case 'Almuerzo':
      return 'bg-sky-100 text-sky-800';
    case 'Cena':
      return 'bg-indigo-100 text-indigo-800';
    case 'Snack':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

interface RecipeCardProps {
  receta: Receta;
  onVerDetalles?: (receta: Receta) => void;
}

const RecipeCard = memo(function RecipeCard({ receta, onVerDetalles }: RecipeCardProps) {
  const { nombre, tiempo, dificultad, categoria, ingredientes } = receta;

  return (
    <article
      className="flex flex-col rounded-xl border bg-white p-3 shadow-sm transition-shadow duration-200 hover:shadow-md"
      style={{
        borderColor: '#E0D6CC',
        borderRadius: '12px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Encabezado con inicial como sello */}
      <div className="mb-3 flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: '#E07A5F' }}
          aria-hidden="true"
        >
          {nombre.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className="truncate text-base font-semibold"
            style={{ color: '#2D2A24' }}
            title={nombre}
          >
            {nombre}
          </h3>
          <span
            className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ color: '#2D2A24', backgroundColor: '#FDF6F0' }}
          >
            {categoria}
          </span>
        </div>
      </div>

      {/* Metadatos: tiempo y dificultad */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm" style={{ color: '#2D2A24' }}>
        <span className="inline-flex items-center gap-1">
          <Clock size={16} style={{ color: '#E07A5F' }} aria-hidden="true" />
          <span>{tiempo} min</span>
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${dificultadColor(dificultad)}`}
        >
          <ChefHat size={14} aria-hidden="true" />
          {dificultad}
        </span>
      </div>

      {/* Ingredientes (primeros 3 + badge) */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {ingredientes.slice(0, 3).map((ing) => (
          <span
            key={ing}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
            style={{
              backgroundColor: '#FDF6F0',
              color: '#2D2A24',
              border: '1px solid #E0D6CC',
            }}
          >
            {/* Círculo terracota simulando sello de cocina */}
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: '#E07A5F' }}
              aria-hidden="true"
            />
            {ing}
          </span>
        ))}
        {ingredientes.length > 3 && (
          <span className="text-xs font-medium" style={{ color: '#E07A5F' }}>
            +{ingredientes.length - 3}
          </span>
        )}
      </div>

      {/* Botón de acción */}
      <button
        type="button"
        onClick={() => onVerDetalles?.(receta)}
        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          backgroundColor: '#E07A5F',
          minHeight: '44px',
          borderRadius: '12px',
        }}
      >
        <Eye size={18} aria-hidden="true" />
        Ver detalles
      </button>
    </article>
  );
});

export default RecipeCard;