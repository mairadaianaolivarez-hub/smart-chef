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
import { PublicRoute } from './components/PublicRoute';

function AppLayout() {
  const location = useLocation();
  const isVentasPage = location.pathname === '/' || location.pathname === '/ventas';

  return (
    <div className="relative min-h-screen">
      {/* Fondo de pantalla fijo - imagen de comida saludable */}
      <div
        className="fixed inset-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat opacity-40"
        style={{
          backgroundImage: `url('https://fzfncffjekempswnjilr.supabase.co/storage/v1/object/public/cosmos-code-sites/_assets/Ws3HONfaS0dZKNnL4oNlI9ZGSV23/2d2e2c17-e36b-4321-a51f-77fab61d3ff7/40ca46ec3c7e09da6993c7ad.png')`,
        }}
        aria-hidden="true"
      />
      {/* Ocultar Header en la página de ventas */}
      {!isVentasPage && <Header />}
      <Routes>
        {/* Ruta raíz: si no pagó ve la página de ventas, si pagó ve Inicio */}
        <Route path="/" element={<PublicRoute><PaginaVentas /></PublicRoute>} />
        <Route path="/inicio" element={<ProtectedRoute><Inicio /></ProtectedRoute>} />
        <Route path="/recetas" element={<ProtectedRoute><Recetas /></ProtectedRoute>} />
        <Route path="/planes" element={<ProtectedRoute><Planes /></ProtectedRoute>} />
        <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
        <Route path="/contacto" element={<ProtectedRoute><Contacto /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ventas" element={<PaginaVentas />} />
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