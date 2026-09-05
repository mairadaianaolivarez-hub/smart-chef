import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../lib/useSession';
import { useState, useEffect } from 'react';
import { checkPaymentAccess } from '../lib/mercadopago';
import { Loader2, CreditCard } from 'lucide-react';
import PaywallButton from './PaywallButton';

// Envolvé rutas autenticadas: <Route element={<ProtectedRoute><Panel /></ProtectedRoute>} />
export function ProtectedRoute({ children, redirectTo = '/login' }: { children: ReactNode; redirectTo?: string }) {
  const { session, user, loading: sessionLoading } = useSession();
  const location = useLocation();

  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'paid' | 'unpaid'>('checking');

  useEffect(() => {
    if (!user) {
      setPaymentStatus('unpaid');
      return;
    }

    let cancelled = false;
    checkPaymentAccess(user.id).then((paid) => {
      if (cancelled) return;
      setPaymentStatus(paid ? 'paid' : 'unpaid');
    }).catch(() => {
      if (cancelled) return;
      setPaymentStatus('unpaid');
    });

    return () => { cancelled = true; };
  }, [user?.id]);

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" aria-hidden="true" />
        <span className="sr-only">Cargando…</span>
      </div>
    );
  }

  if (!session) return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;

  // Mientras verificamos el pago, mostramos un spinner
  if (paymentStatus === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" aria-hidden="true" />
        <span className="sr-only">Verificando acceso…</span>
      </div>
    );
  }

  // Si no pagó, mostrar el PaywallButton
  if (paymentStatus === 'unpaid') {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center justify-center px-4 py-6">
        <PaywallButton />
      </div>
    );
  }

  // Pagó → mostrar el contenido
  return <>{children}</>;
}