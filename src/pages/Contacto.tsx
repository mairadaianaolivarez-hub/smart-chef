import { useState } from 'react';
import { Mail, MessageSquare, CheckCircle } from 'lucide-react';

export default function Contacto() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !mensaje.trim()) return;
    setEnviado(true);
  };

  const handleOtroMensaje = () => {
    setEnviado(false);
    setNombre('');
    setEmail('');
    setMensaje('');
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="rounded-xl bg-white/90 backdrop-blur-sm p-6 sm:p-8">
        {/* Encabezado */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E07A5F]/10">
            <MessageSquare size={28} strokeWidth={2} className="text-[#E07A5F]" />
          </div>
          <h1 className="text-2xl font-bold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Contacto
          </h1>
          <p className="mt-2 max-w-md text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            Escribinos a{' '}
            <a href="mailto:marcezesp@gmail.com" className="text-[#E07A5F] underline font-medium">
              marcezesp@gmail.com
            </a>
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm text-[#E07A5F]">
            <Mail size={16} strokeWidth={2} />
            <span>Te responderemos en menos de 24 horas</span>
          </div>
        </div>

        {/* Formulario o mensaje de confirmación */}
        {enviado ? (
          <div className="flex flex-col items-center py-10 text-center">
            <CheckCircle size={48} className="text-green-500 mb-4" strokeWidth={2} />
            <p className="text-lg font-semibold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
              ¡Mensaje enviado!
            </p>
            <p className="mt-1 text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
              Gracias por contactarnos, {nombre}. Te responderemos pronto.
            </p>
            <button
              type="button"
              onClick={handleOtroMensaje}
              className="mt-6 rounded-lg bg-[#E07A5F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#c96a4f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
              style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="contacto-nombre" className="block text-sm font-medium text-[#2D2A24] mb-1">
                Nombre
              </label>
              <input
                id="contacto-nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required
                className="w-full rounded-lg border border-[#E8DED5] bg-white px-3 py-2.5 text-sm text-[#2D2A24] placeholder:text-[#2D2A24]/40 focus:border-[#E07A5F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20"
                style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="contacto-email" className="block text-sm font-medium text-[#2D2A24] mb-1">
                Email
              </label>
              <input
                id="contacto-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full rounded-lg border border-[#E8DED5] bg-white px-3 py-2.5 text-sm text-[#2D2A24] placeholder:text-[#2D2A24]/40 focus:border-[#E07A5F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20"
                style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            {/* Mensaje */}
            <div>
              <label htmlFor="contacto-mensaje" className="block text-sm font-medium text-[#2D2A24] mb-1">
                Mensaje
              </label>
              <textarea
                id="contacto-mensaje"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribí tu mensaje acá…"
                required
                rows={5}
                className="w-full rounded-lg border border-[#E8DED5] bg-white px-3 py-2.5 text-sm text-[#2D2A24] placeholder:text-[#2D2A24]/40 focus:border-[#E07A5F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20 resize-y"
                style={{ minHeight: '100px', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            {/* Botón Enviar */}
            <button
              type="submit"
              disabled={!nombre.trim() || !email.trim() || !mensaje.trim()}
              className="w-full rounded-lg bg-[#E07A5F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#c96a4f] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
              style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
            >
              Enviar
            </button>
          </form>
        )}
      </div>
    </main>
  );
}