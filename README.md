# Qué Cocino Hoy

## Descripción

// ---------- Tipos ---------- export interface Receta { id: number; nombre: string; tiempo: number; // en minutos dificultad: 'Muy fácil' | 'Fácil' | 'Media' | 'Difícil'; ingredientes: string[]; pasos: string[]; sustituciones?: Record<string, string>; // ingrediente -> alternativa categoria?: 'Desayuno' | 'Almuerzo' | 'Cena' | 'Snack'; } // ---------- Ingredientes disponibles (para los chips de s

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · PWA

## Estructura

- `/src/App.tsx` — punto de entrada
- `/src/components/Header.tsx` — Barra superior con logo y navegación simple.
- `/src/components/IngredientSelector.tsx` — Selector de ingredientes disponibles mediante chips clickeables.
- `/src/components/RecipeList.tsx` — Lista de recetas filtradas según ingredientes seleccionados.
- `/src/components/RecipeCard.tsx` — Tarjeta individual de receta con nombre, tiempo, dificultad y botón de ver detalles.
- `/src/components/RecipeDetail.tsx` — Modal o vista expandida con ingredientes, pasos y sustituciones.

## Instalación

```bash
npm install
npm run dev    # desarrollo (Vite)
npm run build  # build de producción → dist/
```

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

- `VITE_SUPABASE_URL` — URL de tu proyecto Supabase (Settings → API).
- `VITE_SUPABASE_ANON_KEY` — anon/publishable key del mismo proyecto.

Las variables `VITE_*` son públicas en el navegador: **nunca** pongas la `service_role` ni otros secretos aquí.

## Deploy en Vercel

1. Importa el repositorio en [vercel.com](https://vercel.com) (framework: Vite).
2. Build command `npm run build`, output `dist/`.
3. Carga las variables `VITE_*` de `.env.example` en Settings → Environment Variables.
4. En Supabase → Auth → URL Configuration agrega el dominio de Vercel a los redirects si tu app usa login.

## Integración continua

El workflow `.github/workflows/cosmos-build.yml` valida el build en cada push y, si falta `package-lock.json`, lo genera y propone un PR con el lockfile.

## Navegación

SPA con React Router y fallback de navegación para publicación.

---

_Generado con Cosmos Code_
