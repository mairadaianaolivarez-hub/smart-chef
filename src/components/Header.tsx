import { useState } from 'react';
import { Menu, X, ChefHat } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Inicio', href: '/' },
  { label: 'Recetas', href: '/recetas' },
  { label: 'Planes', href: '/planes' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contacto', href: '/contacto' },
] as const;

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E8E0D8',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        style={{ gap: '16px' }}
      >
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-3 no-underline"
          style={{ gap: '12px' }}
          aria-label="Ir al inicio"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-white"
            style={{
              backgroundColor: '#E07A5F',
            }}
            aria-hidden="true"
          >
            <ChefHat size={20} strokeWidth={2.5} />
          </span>
          <span
            className="hidden text-lg font-semibold sm:inline"
            style={{
              color: '#2D2A24',
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
                color: '#2D2A24',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                lineHeight: '1.5',
                borderRadius: '4px',
                ringColor: '#E07A5F',
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            color: '#2D2A24',
            minHeight: '44px',
            minWidth: '44px',
            ringColor: '#E07A5F',
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
            backgroundColor: '#FFFFFF',
            borderColor: '#E8E0D8',
          }}
        >
          <div className="space-y-1 px-4 py-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  color: '#2D2A24',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '16px',
                  lineHeight: '1.5',
                  ringColor: '#E07A5F',
                }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;