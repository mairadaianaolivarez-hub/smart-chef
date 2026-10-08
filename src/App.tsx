import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Inicio from './pages/Inicio';
import Recetas from './pages/Recetas';
import Planes from './pages/Planes';
import Blog from './pages/Blog';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import Register from './pages/Register';
import PaginaVentas from './pages/PaginaVentas';
import { ProtectedRoute } from './components/ProtectedRoute';

function AppLayout() {
  const location = useLocation();
  const isVentasPage = location.pathname === '/' || location.pathname === '/ventas';

  return (
    <div className="relative min-h-screen">
      {/* Fondo degradado rojo oscuro fijo */}
      <div
        className="fixed inset-0 -z-10 h-full w-full"
        style={{
          background: 'linear-gradient(180deg, #DC2626 0%, #991B1B 40%, #1F0000 100%)',
        }}
        aria-hidden="true"
      />
      {/* Ocultar Header en la página de ventas */}
      {!isVentasPage && <Header />}
      <Routes>
        {/* Ruta raíz: SIEMPRE muestra la página de ventas (landing pública) */}
        <Route path="/" element={<PaginaVentas />} />
        <Route path="/ventas" element={<PaginaVentas />} />
        <Route path="/inicio" element={<ProtectedRoute><Inicio /></ProtectedRoute>} />
        <Route path="/recetas" element={<ProtectedRoute><Recetas /></ProtectedRoute>} />
        <Route path="/planes" element={<ProtectedRoute><Planes /></ProtectedRoute>} />
        <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
        <Route path="/contacto" element={<ProtectedRoute><Contacto /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}