import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChefHat, User, LogOut } from 'lucide-react';
import { useSession } from '../lib/useSession';
import { auth } from '../lib/auth';

const NAV_ITEMS = [
  { label: 'Inicio', href: '/inicio' },
  { label: 'Recetas', href: '/recetas' },
  { label: 'Planes', href: '/planes' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contacto', href: '/contacto' },
] as const;

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(153, 27, 27, 0.95)',
        borderColor: 'rgba(220, 38, 38, 0.3)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        style={{ gap: '16px' }}
      >
        {/* Logo */}
        <a
          href="/inicio"
          className="flex items-center gap-3 no-underline"
          style={{ gap: '12px' }}
          aria-label="Ir al inicio"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: '#DC2626' }}
            aria-hidden="true"
          >
            <ChefHat size={20} strokeWidth={2.5} />
          </span>
          <span
            className="hidden text-lg font-semibold sm:inline"
            style={{
              color: '#FFFFFF',
              fontFamily: "'Merriweather', serif",
            }}
          >
            Smart Chef
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex" style={{ gap: '24px' }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                color: '#FFFFFF',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                lineHeight: '1.5',
                borderRadius: '4px',
                ringColor: '#EF4444',
              }}
            >
              {item.label}
            </a>
          ))}
          {/* User button */}
          {loading ? (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" aria-hidden="true" />
          ) : user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              title="Cerrar sesión"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </span>
              <LogOut size={16} />
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            >
              <User size={16} />
              Ingresar
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            color: '#FFFFFF',
            minHeight: '44px',
            minWidth: '44px',
            ringColor: '#EF4444',
          }}
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          className="border-t md:hidden"
          style={{
            backgroundColor: 'rgba(153, 27, 27, 0.98)',
            borderColor: 'rgba(220, 38, 38, 0.3)',
          }}
        >
          <div className="space-y-1 px-4 py-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  color: '#FFFFFF',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '16px',
                  lineHeight: '1.5',
                  ringColor: '#EF4444',
                }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            {/* Mobile user section */}
            <div className="border-t border-white/10 pt-3 mt-3">
              {loading ? (
                <div className="flex justify-center py-2">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" aria-hidden="true" />
                </div>
              ) : user ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-white/70">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-300 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <User size={18} />
                  Ingresar
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;