import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Clock, ChefHat, Users, X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Tipos y datos de demostración                                      */
/* ------------------------------------------------------------------ */

interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'fácil' | 'media' | 'difícil';
  ingredients: string[];
  tags: string[];
}

const DEMO_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Pasta al pesto con tomates cherry',
    description: 'Una receta clásica italiana, fresca y llena de sabor, lista en menos de 20 minutos.',
    image: 'https://placehold.co/600x400/E07A5F/FFFFFF?text=Pasta+al+Pesto',
    prepTime: '10 min',
    cookTime: '10 min',
    servings: 4,
    difficulty: 'fácil',
    ingredients: ['pasta', 'albahaca', 'aceite de oliva', 'tomates cherry', 'ajo', 'piñones', 'queso parmesano'],
    tags: ['italiana', 'rápida', 'vegetariana'],
  },
  {
    id: '2',
    title: 'Ensalada mediterránea de quinoa',
    description: 'Ensalada nutritiva con quinoa, pepino, pimiento y un toque de limón.',
    image: 'https://placehold.co/600x400/2D2A24/FFFFFF?text=Ensalada+Mediterránea',
    prepTime: '15 min',
    cookTime: '15 min',
    servings: 2,
    difficulty: 'fácil',
    ingredients: ['quinoa', 'pepino', 'pimiento', 'tomate', 'aceitunas', 'limón', 'aceite de oliva'],
    tags: ['saludable', 'vegana', 'sin gluten'],
  },
  {
    id: '3',
    title: 'Tacos de pollo con salsa verde',
    description: 'Tacos jugosos con pollo marinado y una salsa verde casera que encantará a todos.',
    image: 'https://placehold.co/600x400/E07A5F/FFFFFF?text=Tacos+de+Pollo',
    prepTime: '20 min',
    cookTime: '15 min',
    servings: 6,
    difficulty: 'media',
    ingredients: ['pollo', 'tortillas de maíz', 'tomate verde', 'cilantro', 'cebolla', 'limón', 'chile serrano'],
    tags: ['mexicana', 'rápida', 'picante'],
  },
  {
    id: '4',
    title: 'Risotto de champiñones y trufa',
    description: 'Un risotto cremoso con champiñones salteados y un toque de aceite de trufa.',
    image: 'https://placehold.co/600x400/2D2A24/FFFFFF?text=Risotto+de+Champiñones',
    prepTime: '10 min',
    cookTime: '30 min',
    servings: 4,
    difficulty: 'difícil',
    ingredients: ['arroz arbóreo', 'champiñones', 'cebolla', 'vino blanco', 'caldo de verduras', 'queso parmesano', 'aceite de trufa'],
    tags: ['italiana', 'cremosa', 'vegetariana'],
  },
  {
    id: '5',
    title: 'Smoothie bowl de frutos rojos',
    description: 'Desayuno energético y colorido con base de frutos rojos, granola y semillas.',
    image: 'https://placehold.co/600x400/E07A5F/FFFFFF?text=Smoothie+Bowl',
    prepTime: '10 min',
    cookTime: '0 min',
    servings: 1,
    difficulty: 'fácil',
    ingredients: ['frutos rojos', 'plátano', 'yogur griego', 'granola', 'semillas de chía', 'miel'],
    tags: ['desayuno', 'saludable', 'rápida'],
  },
  {
    id: '6',
    title: 'Curry de garbanzos con espinacas',
    description: 'Curry vegetariano aromático con garbanzos, espinacas y leche de coco.',
    image: 'https://placehold.co/600x400/2D2A24/FFFFFF?text=Curry+de+Garbanzos',
    prepTime: '15 min',
    cookTime: '25 min',
    servings: 4,
    difficulty: 'media',
    ingredients: ['garbanzos', 'espinacas', 'leche de coco', 'cebolla', 'ajo', 'jengibre', 'curry en polvo'],
    tags: ['india', 'vegana', 'sin gluten'],
  },
];

/* ------------------------------------------------------------------ */
/*  Lista plana de ingredientes únicos                                 */
/* ------------------------------------------------------------------ */

const ALL_INGREDIENTS = Array.from(
  new Set(DEMO_RECIPES.flatMap((r) => r.ingredients)),
).sort();

/* ------------------------------------------------------------------ */
/*  Componente interno: Chip de ingrediente                            */
/* ------------------------------------------------------------------ */

interface IngredientChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const IngredientChip: React.FC<IngredientChipProps> = ({ label, selected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`
        inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium
        transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2
        ${
          selected
            ? 'bg-[#E07A5F] text-white shadow-sm'
            : 'bg-[#FDF6F0] text-[#2D2A24] hover:bg-[#E07A5F]/10 border border-[#E07A5F]/20'
        }
      `}
    >
      {selected && <X size={14} strokeWidth={2} />}
      {label}
    </button>
  );
};

/* ------------------------------------------------------------------ */
/*  Componente interno: Tarjeta de receta                              */
/* ------------------------------------------------------------------ */

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const difficultyColor =
    recipe.difficulty === 'fácil'
      ? 'text-green-700 bg-green-50'
      : recipe.difficulty === 'media'
        ? 'text-amber-700 bg-amber-50'
        : 'text-red-700 bg-red-50';

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      {/* Imagen */}
      <div className="relative aspect-[3/2] overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Etiquetas superpuestas */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          {recipe.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-[#2D2A24] shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        {/* Dificultad */}
        <span
          className={`absolute top-2 right-2 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${difficultyColor}`}
        >
          {recipe.difficulty}
        </span>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-[#2D2A24] truncate text-base leading-snug" title={recipe.title}>
          {recipe.title}
        </h3>
        <p className="text-sm text-[#2D2A24]/70 line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>

        {/* Metadatos */}
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-xs text-[#2D2A24]/60">
          <span className="inline-flex items-center gap-1">
            <Clock size={14} strokeWidth={2} />
            {recipe.prepTime} + {recipe.cookTime}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users size={14} strokeWidth={2} />
            {recipe.servings} porc.
          </span>
          <span className="inline-flex items-center gap-1">
            <ChefHat size={14} strokeWidth={2} />
            {recipe.difficulty}
          </span>
        </div>

        {/* Ingredientes */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {recipe.ingredients.slice(0, 4).map((ing) => (
            <span
              key={ing}
              className="rounded-full bg-[#FDF6F0] px-2 py-0.5 text-[11px] font-medium text-[#2D2A24]/80"
            >
              {ing}
            </span>
          ))}
          {recipe.ingredients.length > 4 && (
            <span className="rounded-full bg-[#FDF6F0] px-2 py-0.5 text-[11px] font-medium text-[#2D2A24]/50">
              +{recipe.ingredients.length - 4}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

/* ------------------------------------------------------------------ */
/*  Componente principal: RecipeList                                   */
/* ------------------------------------------------------------------ */

const RecipeList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  /* Alternar selección de ingrediente */
  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient],
    );
  };

  /* Limpiar todos los filtros */
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedIngredients([]);
  };

  const hasActiveFilters = searchQuery.trim().length > 0 || selectedIngredients.length > 0;

  /* Recetas filtradas */
  const filteredRecipes = useMemo(() => {
    let results = DEMO_RECIPES;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.toLowerCase().includes(q)) ||
          r.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (selectedIngredients.length > 0) {
      results = results.filter((r) =>
        selectedIngredients.every((ing) => r.ingredients.includes(ing)),
      );
    }

    return results;
  }, [searchQuery, selectedIngredients]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 font-['Inter',sans-serif] text-[#2D2A24]">
      {/* Encabezado */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2A24]">
            Recetas
          </h1>
          <p className="mt-1 text-sm text-[#2D2A24]/60">
            {filteredRecipes.length} receta{filteredRecipes.length !== 1 ? 's' : ''} encontrada
            {filteredRecipes.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className={`
            inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium
            transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2
            ${
              showFilters || hasActiveFilters
                ? 'bg-[#E07A5F] text-white shadow-sm'
                : 'bg-[#FDF6F0] text-[#2D2A24] hover:bg-[#E07A5F]/10'
            }
          `}
        >
          <SlidersHorizontal size={16} strokeWidth={2} />
          Filtros
          {selectedIngredients.length > 0 && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              {selectedIngredients.length}
            </span>
          )}
        </button>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="mb-6 rounded-xl border border-[#E07A5F]/10 bg-white p-4 shadow-sm transition-all duration-300">
          {/* Búsqueda */}
          <div className="relative mb-4">
            <Search
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#2D2A24]/40"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar recetas por nombre, ingrediente o etiqueta…"
              className="
                w-full rounded-lg border border-[#2D2A24]/10 bg-[#FDF6F0] py-2.5 pl-10 pr-4
                text-sm text-[#2D2A24] placeholder:text-[#2D2A24]/40
                focus:border-[#E07A5F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20
                transition-all duration-200
              "
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D2A24]/40 hover:text-[#2D2A24] transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Ingredientes */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2D2A24]/50">
              Filtrar por ingrediente
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_INGREDIENTS.map((ingredient) => (
                <IngredientChip
                  key={ingredient}
                  label={ingredient}
                  selected={selectedIngredients.includes(ingredient)}
                  onClick={() => toggleIngredient(ingredient)}
                />
              ))}
            </div>
          </div>

          {/* Acciones */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end border-t border-[#2D2A24]/5 pt-3">
              <button
                type="button"
                onClick={clearFilters}
                className="
                  inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium
                  text-[#2D2A24]/60 hover:text-[#E07A5F] transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2
                "
              >
                <X size={14} strokeWidth={2} />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Listado de recetas */}
      {filteredRecipes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl bg-[#FDF6F0] py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E07A5F]/10">
            <ChefHat size={28} strokeWidth={2} className="text-[#E07A5F]" />
          </div>
          <h3 className="text-lg font-semibold text-[#2D2A24]">
            No encontramos recetas con esos ingredientes
          </h3>
          <p className="mt-1 max-w-sm text-sm text-[#2D2A24]/60">
            Prueba seleccionando menos ingredientes o usando otros términos de búsqueda.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="
              mt-6 inline-flex items-center gap-2 rounded-lg bg-[#E07A5F] px-5 py-2.5 text-sm font-medium
              text-white shadow-sm transition-all duration-200 hover:bg-[#E07A5F]/90
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2
            "
          >
            <X size={16} strokeWidth={2} />
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  );
};

export default RecipeList;
