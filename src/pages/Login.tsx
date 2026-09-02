import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft, Send } from 'lucide-react';
import { auth } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await auth.signInWithPassword(email, password);
      if (err) throw err;
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await auth.sendMagicLink(email);
      if (err) throw err;
      setMagicLinkSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar el magic link';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center justify-center px-4 py-6">
      <div className="w-full rounded-xl bg-[#FDF6F0] p-6 sm:p-8">
        {/* Encabezado */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            Ingresá con tu email y contraseña
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" style={{ fontFamily: 'Inter, sans-serif' }}>
            {error}
          </div>
        )}

        {magicLinkSent ? (
          <div className="text-center py-6">
            <Send size={40} className="mx-auto mb-3 text-[#E07A5F]" />
            <p className="text-sm text-[#2D2A24]/80" style={{ fontFamily: 'Inter, sans-serif' }}>
              Te enviamos un link mágico a <strong>{email}</strong>. Revisá tu bandeja de entrada.
            </p>
            <button
              type="button"
              onClick={() => setMagicLinkSent(false)}
              className="mt-4 text-sm text-[#E07A5F] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] rounded-md px-2 py-1"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Volver
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-[#2D2A24] mb-1">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full rounded-lg border border-[#E8DED5] bg-white px-3 py-2.5 text-sm text-[#2D2A24] placeholder:text-[#2D2A24]/40 focus:border-[#E07A5F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20"
                style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-[#2D2A24] mb-1">
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-[#E8DED5] bg-white px-3 py-2.5 text-sm text-[#2D2A24] placeholder:text-[#2D2A24]/40 focus:border-[#E07A5F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20"
                style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            {/* Botón ingresar */}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full rounded-lg bg-[#E07A5F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#c96a4f] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2 inline-flex items-center justify-center gap-2"
              style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Ingresando…
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Ingresar
                </>
              )}
            </button>

            {/* Magic link */}
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading || !email.trim()}
              className="w-full rounded-lg border border-[#E8DED5] bg-white px-5 py-2.5 text-sm font-medium text-[#2D2A24] transition-colors hover:bg-[#FDF6F0] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2 inline-flex items-center justify-center gap-2"
              style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
            >
              <Send size={18} />
              Enviar link mágico
            </button>

            {/* Registro */}
            <p className="text-center text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
              ¿No tenés cuenta?{' '}
              <Link to="/register" className="text-[#E07A5F] font-medium hover:underline">
                Registrate
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}