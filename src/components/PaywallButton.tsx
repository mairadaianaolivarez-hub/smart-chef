import { useState, useEffect } from 'react';
import { CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useSession } from '../lib/useSession';
import { createPaymentPreference, openMercadoPagoCheckout, checkPaymentAccess } from '../lib/mercadopago';

export default function PaywallButton() {
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [hasPaid, setHasPaid] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      setHasPaid(false);
      return;
    }

    let cancelled = false;
    checkPaymentAccess(user.id).then((paid) => {
      if (cancelled) return;
      setHasPaid(paid);
      setChecking(false);
    }).catch(() => {
      if (cancelled) return;
      setHasPaid(false);
      setChecking(false);
    });

    return () => { cancelled = true; };
  }, [user?.id]);

  const handlePayment = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const checkoutUrl = await createPaymentPreference(user.id, user.email ?? '');

      if (!checkoutUrl) {
        setError('No se pudo generar el link de pago. Intentalo de nuevo.');
        setLoading(false);
        return;
      }

      openMercadoPagoCheckout(checkoutUrl);
    } catch (err) {
      console.error('Error al iniciar pago:', err);
      setError('Ocurrió un error al procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 size={20} className="animate-spin text-[#E07A5F]" />
        <span className="ml-2 text-sm text-[#2D2A24]/60">Verificando acceso...</span>
      </div>
    );
  }

  if (hasPaid) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
        <CheckCircle size={20} className="text-green-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-800">¡Acceso completo!</p>
          <p className="text-xs text-green-600">Ya tenés acceso a todas las funcionalidades de Smart Chef.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-[#E8DED5] bg-white p-6 shadow-sm">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E07A5F]/10">
          <CreditCard size={28} className="text-[#E07A5F]" />
        </div>
        <h3 className="text-lg font-bold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Acceso Completo
        </h3>
        <p className="mt-2 text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
          Desbloqueá todas las recetas, planes semanales, lista de compras y más
        </p>
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-[#FDF6F0] px-4 py-3">
          <CheckCircle size={18} className="text-green-600 shrink-0" />
          <span className="text-sm text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
            +60 recetas saludables
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-[#FDF6F0] px-4 py-3">
          <CheckCircle size={18} className="text-green-600 shrink-0" />
          <span className="text-sm text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Plan semanal de comidas
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-[#FDF6F0] px-4 py-3">
          <CheckCircle size={18} className="text-green-600 shrink-0" />
          <span className="text-sm text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Lista de compras automática
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-[#FDF6F0] px-4 py-3">
          <CheckCircle size={18} className="text-green-600 shrink-0" />
          <span className="text-sm text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Blog con consejos y técnicas
          </span>
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-3xl font-bold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
          $7.999
        </p>
        <p className="text-sm text-[#2D2A24]/50" style={{ fontFamily: 'Inter, sans-serif' }}>
          Pago único · Acceso de por vida
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="w-full rounded-lg bg-[#E07A5F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#c96a4f] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2 inline-flex items-center justify-center gap-2"
        style={{ minHeight: '48px', fontFamily: 'Inter, sans-serif' }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Generando pago...
          </>
        ) : (
          <>
            <CreditCard size={18} />
            Pagar ahora
          </>
        )}
      </button>

      <p className="mt-3 text-center text-xs text-[#2D2A24]/40" style={{ fontFamily: 'Inter, sans-serif' }}>
        Pago procesado por Mercado Pago · Datos seguros
      </p>
    </div>
  );
}