import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../lib/useSession';
import { useState, useEffect } from 'react';
import { checkPaymentAccess } from '../lib/mercadopago';

/**
 * PublicRoute: muestra la página de ventas para usuarios no pagados.
 * Si el usuario ya pagó, redirige a /inicio (que es la app real).
 */
export function PublicRoute({ children }: { children: ReactNode }) {
  const { session, user, loading: sessionLoading } = useSession();
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'paid' | 'unpaid'>('checking');

  useEffect(() => {
    if (!user) {
      setPaymentStatus('unpaid');
      return;
    }

    let cancelled = false;

    checkPaymentAccess(user.id).then((paid) => {
      if (!cancelled) {
        setPaymentStatus(paid ? 'paid' : 'unpaid');
      }
    }).catch(() => {
      if (!cancelled) {
        setPaymentStatus('unpaid');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" aria-hidden="true" />
        <span className="sr-only">Cargando…</span>
      </div>
    );
  }

  // Si el usuario está logueado y pagó, redirigir a Inicio
  if (session && paymentStatus === 'paid') {
    return <Navigate to="/inicio" replace />;
  }

  // Si está verificando, mostrar spinner
  if (paymentStatus === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" aria-hidden="true" />
        <span className="sr-only">Verificando acceso…</span>
      </div>
    );
  }

  // No pagó o no está logueado → mostrar página de ventas
  return <>{children}</>;
}