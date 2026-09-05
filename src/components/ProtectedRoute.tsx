import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../lib/useSession';
import { useState, useEffect, useCallback } from 'react';
import { checkPaymentAccess } from '../lib/mercadopago';
import { Loader2, RefreshCw } from 'lucide-react';
import PaywallButton from './PaywallButton';

// Envolvé rutas autenticadas: <Route element={<ProtectedRoute><Panel /></ProtectedRoute>} />
export function ProtectedRoute({ children, redirectTo = '/login' }: { children: ReactNode; redirectTo?: string }) {
  const { session, user, loading: sessionLoading } = useSession();
  const location = useLocation();

  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'paid' | 'unpaid'>('checking');
  const [polling, setPolling] = useState(false);

  const checkAccess = useCallback(async () => {
    if (!user) {
      setPaymentStatus('unpaid');
      return;
    }

    try {
      const paid = await checkPaymentAccess(user.id);
      setPaymentStatus(paid ? 'paid' : 'unpaid');
    } catch {
      setPaymentStatus('unpaid');
    }
  }, [user?.id]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Detectar si volvemos de Mercado Pago con éxito
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatusParam = params.get('payment');

    if (paymentStatusParam === 'success' && user) {
      // Limpiar el parámetro de la URL sin recargar
      window.history.replaceState({}, '', window.location.pathname);
      
      // Iniciar polling para verificar que el webhook ya actualizó el acceso
      setPolling(true);
    }
  }, [user]);

  // Polling: cada 3 segundos verificar si el pago ya se acreditó
  useEffect(() => {
    if (!polling || !user) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20; // 60 segundos máximo

    const interval = setInterval(async () => {
      if (cancelled || attempts >= maxAttempts) {
        clearInterval(interval);
        if (!cancelled) {
          setPolling(false);
          setPaymentStatus('unpaid');
        }
        return;
      }

      attempts++;
      try {
        const paid = await checkPaymentAccess(user.id);
        if (paid) {
          clearInterval(interval);
          setPaymentStatus('paid');
          setPolling(false);
        }
      } catch {
        // Ignorar errores durante polling
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [polling, user?.id]);

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

  // Si está haciendo polling post-pago
  if (polling) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center justify-center px-4 py-6">
        <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
          <RefreshCw size={32} className="mx-auto mb-3 animate-spin text-amber-600" />
          <h2 className="text-lg font-bold text-amber-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            ¡Gracias por tu pago!
          </h2>
          <p className="text-sm text-amber-700" style={{ fontFamily: 'Inter, sans-serif' }}>
            Estamos verificando tu pago. En unos segundos tendrás acceso automático a todo el contenido.
          </p>
          <p className="text-xs text-amber-500 mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            No recargues la página, esto se actualiza solo.
          </p>
        </div>
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