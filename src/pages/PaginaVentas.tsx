import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, CheckCircle, Star, Shield,
  ChevronDown, ChefHat, BookOpen, Calendar,
  Zap, RefreshCw, Loader2, AlertCircle, Lock, Sparkles
} from 'lucide-react';
import { useSession } from '../lib/useSession';
import { createPaymentPreference, openMercadoPagoCheckout, checkPaymentAccess, createPaymentPreferenceAnon } from '../lib/mercadopago';

/* ───────────────────────────────────────────────
   FAQ data
   ─────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: '¿Es pago único o mensual?',
    a: 'Es pago único de $7.999 ARS. No hay mensualidades, ni suscripciones, ni cargos ocultos. Pagás una sola vez y tenés acceso de por vida a todas las funcionalidades de Smart Chef.',
  },
  {
    q: '¿Cómo accedo después de pagar?',
    a: 'Una vez que el pago se aprueba, tu cuenta se activa automáticamente. Si ya tenías una cuenta en Smart Chef, se habilita al instante. Si no, te creamos una cuenta con el mismo email que usaste en Mercado Pago y te enviamos un email con instrucciones para acceder.',
  },
  {
    q: '¿Necesito experiencia cocinando?',
    a: 'Para nada. Smart Chef está diseñado tanto para principiantes como para cocineros experimentados. Las recetas tienen pasos claros, tiempos estimados y sustituciones de ingredientes por si no tenés algo.',
  },
  {
    q: '¿Funciona en el celular?',
    a: 'Sí, Smart Chef está optimizada para funcionar perfectamente en celulares, tablets y computadoras. Podés usarla desde cualquier dispositivo con conexión a internet.',
  },
  {
    q: '¿Qué pasa si tengo un problema con el pago?',
    a: 'Si el pago no se procesa correctamente, el dinero no se debita (Mercado Pago lo maneja). Si pagaste y no se activó tu acceso después de unos minutos, escribinos a marcezesp@gmail.com y lo resolvemos al instante.',
  },
];

/* ───────────────────────────────────────────────
   Testimonios placeholder
   ─────────────────────────────────────────────── */
const TESTIMONIOS = [
  {
    nombre: 'María Fernanda',
    texto: 'Desde que uso Smart Chef dejé de pedir delivery entre semana. Ahorro plata, como más sano y no pierdo tiempo pensando qué cocinar.',
    estrellas: 5,
  },
  {
    nombre: 'Carlos Andrés',
    texto: 'La lista de compras automática me cambió la vida. Voy al super con todo lo que necesito y no compro de más. Súper recomendable.',
    estrellas: 5,
  },
];

/* ───────────────────────────────────────────────
   Componente: Acordeón FAQ
   ─────────────────────────────────────────────── */
function FAQItem({ pregunta, respuesta, abierto, onToggle }: {
  pregunta: string;
  respuesta: string;
  abierto: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[#E8DED5] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-[#FDF6F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2 rounded-lg"
        style={{ minHeight: '48px', fontFamily: 'Inter, sans-serif' }}
      >
        <span className="text-sm font-medium text-[#2D2A24]">{pregunta}</span>
        <span className={`shrink-0 text-[#2D2A24]/40 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}>
          <ChevronDown size={18} aria-hidden="true" />
        </span>
      </button>
      {abierto && (
        <div className="px-4 pb-4">
          <p className="text-sm leading-relaxed text-[#2D2A24]/70" style={{ fontFamily: 'Inter, sans-serif' }}>
            {respuesta}
          </p>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Componente principal: PaginaVentas
   ─────────────────────────────────────────────── */
export default function PaginaVentas() {
  const navigate = useNavigate();
  const { user } = useSession();
  const [faqAbierto, setFaqAbierto] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [hasPaid, setHasPaid] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  // Verificar acceso al montar
  const verifyAccess = useCallback(async () => {
    if (!user) {
      setHasPaid(false);
      setChecking(false);
      return;
    }
    try {
      const paid = await checkPaymentAccess(user.id);
      setHasPaid(paid);
    } catch {
      setHasPaid(false);
    } finally {
      setChecking(false);
    }
  }, [user?.id]);

  useEffect(() => {
    verifyAccess();
  }, [verifyAccess]);

  // Detectar si volvemos de Mercado Pago con éxito
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success' && user) {
      window.history.replaceState({}, '', window.location.pathname);
      setPolling(true);
      setError(null);
    }
  }, [user]);

  // Polling post-pago
  useEffect(() => {
    if (!polling || !user) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20;

    const interval = setInterval(async () => {
      if (cancelled || attempts >= maxAttempts) {
        clearInterval(interval);
        if (!cancelled) {
          setPolling(false);
          setError('El pago está siendo procesado. Si ya pagaste, esperá unos minutos y recargá la página.');
        }
        return;
      }

      attempts++;
      try {
        const paid = await checkPaymentAccess(user.id);
        if (paid) {
          clearInterval(interval);
          setHasPaid(true);
          setPolling(false);
          setError(null);
        }
      } catch {
        // ignorar
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [polling, user?.id]);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      let checkoutUrl: string | null = null;

      if (user) {
        // Usuario autenticado: usar la Edge Function con JWT
        checkoutUrl = await createPaymentPreference(user.id, user.email ?? '');
      } else {
        // Usuario no autenticado: usar la Edge Function pública (sin JWT)
        // Mercado Pago ya le pide el email al comprador en el checkout
        checkoutUrl = await createPaymentPreferenceAnon();
      }

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

  return (
    <main className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FDF6F0] to-white py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Titular */}
            <h1 className="text-4xl font-extrabold leading-tight text-[#2D2A24] sm:text-5xl lg:text-6xl" style={{ fontFamily: 'Merriweather, serif' }}>
              Dejá de preguntarte{' '}
              <span className="text-[#E07A5F]">"¿qué cocino hoy?"</span>
              {' '}para siempre
            </h1>

            {/* Subtítulo */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#2D2A24]/70 sm:text-lg">
              Recetas personalizadas, planes semanales y un asistente que organiza tu cocina — todo en una sola app, con pago único, sin mensualidades.
            </p>

            {/* CTA Hero */}
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {checking ? (
                <div className="flex items-center gap-2 text-sm text-[#2D2A24]/60">
                  <Loader2 size={18} className="animate-spin text-[#E07A5F]" />
                  Verificando...
                </div>
              ) : hasPaid ? (
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                  style={{ minHeight: '48px' }}
                >
                  <CheckCircle size={20} />
                  ¡Ya tenés acceso! Ir a la app
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#E07A5F] px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#c96a4f] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
                  style={{ minHeight: '48px' }}
                >
                  {loading ? (
                    <><Loader2 size={20} className="animate-spin" /> Generando pago...</>
                  ) : (
                    <><CreditCard size={20} /> Quiero mi acceso ahora — $7.999 ARS</>
                  )}
                </button>
              )}
            </div>

            {/* Logos de confianza */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#2D2A24]/40">
              <Shield size={14} />
              <span>Pago seguro con Mercado Pago</span>
              <span className="mx-2">·</span>
              <Lock size={14} />
              <span>Datos protegidos</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEMA ── */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#FDF6F0] p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-[#2D2A24] mb-6 text-center" style={{ fontFamily: 'Merriweather, serif' }}>
              ¿Te pasa esto?
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-[#2D2A24]/80">
              <p>
                Llegás cansado del trabajo y no tenés ni la energía ni las ideas para pensar qué cocinar. Terminás pidiendo delivery (otra vez), gastando de más, o cocinando siempre lo mismo porque no se te ocurre nada nuevo.
              </p>
              <p>
                Buscás recetas en internet, pero están desordenadas, en inglés, con ingredientes que no conseguís, o te piden crear cuenta en 5 apps distintas. Perdés tiempo, plata y ganas de cocinar rico.
              </p>
              <p className="font-semibold text-[#2D2A24]">
                La comida casera se volvió una carga en vez de un placer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOLUCIÓN ── */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#2D2A24]" style={{ fontFamily: 'Merriweather, serif' }}>
              Smart Chef es la solución
            </h2>
            <p className="mt-3 text-sm text-[#2D2A24]/60 max-w-2xl mx-auto">
              Con un solo pago, accedés para siempre a un sistema completo de recetas, planes de comidas y contenido pensado para que cocinar deje de ser un problema y vuelva a ser algo simple, rico y sin estrés.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E8DED5] bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E07A5F]/10 mb-4">
                <BookOpen size={24} className="text-[#E07A5F]" />
              </div>
              <h3 className="text-base font-semibold text-[#2D2A24] mb-2">Recetas ilimitadas y organizadas</h3>
              <p className="text-sm text-[#2D2A24]/60">Catálogo completo de +60 recetas, categorizadas por momento del día, con ingredientes, pasos claros y sustituciones inteligentes.</p>
            </div>

            <div className="rounded-xl border border-[#E8DED5] bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E07A5F]/10 mb-4">
                <Calendar size={24} className="text-[#E07A5F]" />
              </div>
              <h3 className="text-base font-semibold text-[#2D2A24] mb-2">Planes de comidas listos</h3>
              <p className="text-sm text-[#2D2A24]/60">Planes semanales armados para ahorrar tiempo. Elegí tus recetas, armá tu semana y generá la lista de compras automáticamente.</p>
            </div>

            <div className="rounded-xl border border-[#E8DED5] bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E07A5F]/10 mb-4">
                <Zap size={24} className="text-[#E07A5F]" />
              </div>
              <h3 className="text-base font-semibold text-[#2D2A24] mb-2">Pago único, sin mensualidades</h3>
              <p className="text-sm text-[#2D2A24]/60">Nada de suscripciones ni cargos recurrentes. Pagás una sola vez y tenés acceso de por vida a todo el contenido.</p>
            </div>

            <div className="rounded-xl border border-[#E8DED5] bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E07A5F]/10 mb-4">
                <Sparkles size={24} className="text-[#E07A5F]" />
              </div>
              <h3 className="text-base font-semibold text-[#2D2A24] mb-2">Acceso inmediato y automático</h3>
              <p className="text-sm text-[#2D2A24]/60">La cuenta se activa sola al aprobarse el pago. No esperás nada, no hacés nada. Entrás y empezás a usar.</p>
            </div>

            <div className="rounded-xl border border-[#E8DED5] bg-white p-6 shadow-sm sm:col-span-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E07A5F]/10 mb-4">
                <ChefHat size={24} className="text-[#E07A5F]" />
              </div>
              <h3 className="text-base font-semibold text-[#2D2A24] mb-2">Contenido que se actualiza</h3>
              <p className="text-sm text-[#2D2A24]/60">Blog con tips y trucos de cocina, guías de conservación de alimentos, sustituciones inteligentes y más contenido nuevo periódicamente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="py-16 bg-[#FDF6F0]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#2D2A24] text-center mb-10" style={{ fontFamily: 'Merriweather, serif' }}>
            Lo que dicen quienes ya lo usan
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {TESTIMONIOS.map((t, i) => (
              <div key={i} className="rounded-xl border border-[#E8DED5] bg-white p-6 shadow-sm">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.estrellas }).map((_, j) => (
                    <Star key={j} size={16} className="fill-[#E07A5F] text-[#E07A5F]" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-[#2D2A24]/80 mb-4">"{t.texto}"</p>
                <p className="text-sm font-semibold text-[#2D2A24]">— {t.nombre}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#2D2A24] text-center mb-8" style={{ fontFamily: 'Merriweather, serif' }}>
            Preguntas frecuentes
          </h2>
          <div className="rounded-xl border border-[#E8DED5] bg-white overflow-hidden">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem
                key={i}
                pregunta={item.q}
                respuesta={item.a}
                abierto={faqAbierto === i}
                onToggle={() => setFaqAbierto(faqAbierto === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── GARANTÍA ── */}
      <section className="py-16 bg-[#FDF6F0]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-2xl bg-white border border-[#E8DED5] p-8 sm:p-12 shadow-sm">
            <Shield size={48} className="mx-auto mb-4 text-[#E07A5F]" />
            <h2 className="text-2xl font-bold text-[#2D2A24] mb-3" style={{ fontFamily: 'Merriweather, serif' }}>
              Probá sin riesgo durante 7 días
            </h2>
            <p className="text-sm text-[#2D2A24]/70 max-w-lg mx-auto leading-relaxed">
              Si en los primeros 7 días no te convence, te devolvemos el 100% de tu dinero. Sin preguntas, sin vueltas. Así de simple.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-16 bg-gradient-to-b from-white to-[#FDF6F0]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[#2D2A24] mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
            Empezá a cocinar sin estrés hoy mismo
          </h2>

          {/* Badge de pago único */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#E07A5F]/10 px-4 py-1.5">
            <Sparkles size={16} className="text-[#E07A5F]" />
            <span className="text-xs font-semibold text-[#E07A5F] tracking-wide uppercase">
              Pago único · Acceso de por vida
            </span>
          </div>

          <p className="text-base text-[#2D2A24]/70 mb-8 max-w-lg mx-auto">
            Un solo pago. Acceso de por vida. Sin vueltas.
          </p>

          {error && (
            <div className="mb-6 mx-auto max-w-md flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {polling ? (
            <div className="mx-auto max-w-md rounded-lg bg-amber-50 border border-amber-200 px-6 py-5 text-center">
              <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-amber-600" />
              <p className="text-sm font-medium text-amber-800">Verificando tu pago...</p>
              <p className="text-xs text-amber-600 mt-1">Esto puede tomar unos segundos. No recargues la página.</p>
            </div>
          ) : checking ? (
            <div className="flex items-center justify-center gap-2 text-sm text-[#2D2A24]/60">
              <Loader2 size={18} className="animate-spin text-[#E07A5F]" />
              Verificando acceso...
            </div>
          ) : hasPaid ? (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              style={{ minHeight: '48px' }}
            >
              <CheckCircle size={20} />
              ¡Ya tenés acceso! Ir a la app
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E07A5F] px-8 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#c96a4f] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
              style={{ minHeight: '48px' }}
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Generando pago...</>
              ) : (
                <><CreditCard size={20} /> Quiero mi acceso ahora — $7.999 ARS</>
              )}
            </button>
          )}

          <p className="mt-4 text-xs text-[#2D2A24]/40 flex items-center justify-center gap-2">
            <Shield size={12} />
            Pago seguro procesado por Mercado Pago
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#E8DED5] bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E07A5F] text-white">
              <ChefHat size={16} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-semibold text-[#2D2A24]" style={{ fontFamily: 'Merriweather, serif' }}>
              Smart Chef
            </span>
          </div>
          <p className="text-xs text-[#2D2A24]/40">
            © 2025 Smart Chef. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[#2D2A24]/40 mt-1">
            Contacto: marcezesp@gmail.com
          </p>
        </div>
      </footer>
    </main>
  );
}