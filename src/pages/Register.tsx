import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { auth } from '../lib/auth';

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await auth.signUp(email, password);
      if (err) throw err;
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrarse';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center justify-center px-4 py-6">
        <div className="w-full rounded-xl bg-[#FDF6F0] p-6 sm:p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Mail size={28} className="text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
            ¡Registro exitoso!
          </h1>
          <p className="mt-2 text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            Te enviamos un email de confirmación a <strong>{email}</strong>.
            Revisá tu bandeja de entrada y hacé clic en el enlace para activar tu cuenta.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-lg bg-[#E07A5F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#c96a4f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center justify-center px-4 py-6">
      <div className="w-full rounded-xl bg-[#FDF6F0] p-6 sm:p-8">
        {/* Encabezado */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Crear cuenta
          </h1>
          <p className="mt-2 text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            Registrate para guardar tus planes y recetas favoritas
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" style={{ fontFamily: 'Inter, sans-serif' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="register-name" className="block text-sm font-medium text-[#2D2A24] mb-1">
              Nombre
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              className="w-full rounded-lg border border-[#E8DED5] bg-white px-3 py-2.5 text-sm text-[#2D2A24] placeholder:text-[#2D2A24]/40 focus:border-[#E07A5F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20"
              style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-[#2D2A24] mb-1">
              Email
            </label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="block text-sm font-medium text-[#2D2A24] mb-1">
              Contraseña
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="w-full rounded-lg border border-[#E8DED5] bg-white px-3 py-2.5 text-sm text-[#2D2A24] placeholder:text-[#2D2A24]/40 focus:border-[#E07A5F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20"
              style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {/* Botón registrarse */}
          <button
            type="submit"
            disabled={loading || !name.trim() || !email.trim() || !password.trim()}
            className="w-full rounded-lg bg-[#E07A5F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#c96a4f] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2 inline-flex items-center justify-center gap-2"
            style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Registrando…
              </>
            ) : (
              <>
                <User size={18} />
                Crear cuenta
              </>
            )}
          </button>

          {/* Login */}
          <p className="text-center text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-[#E07A5F] font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}