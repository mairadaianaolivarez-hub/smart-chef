import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../lib/useSession';

// Envolvé rutas autenticadas: <Route element={<ProtectedRoute><Panel /></ProtectedRoute>} />
export function ProtectedRoute({ children, redirectTo = '/login' }: { children: ReactNode; redirectTo?: string }) {
  const { session, loading } = useSession();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" aria-hidden="true" />
        <span className="sr-only">Cargando…</span>
      </div>
    );
  }
  if (!session) return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
