import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Inicio from './pages/Inicio';
import Recetas from './pages/Recetas';
import Planes from './pages/Planes';
import Blog from './pages/Blog';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        {/* Fondo de pantalla fijo - imagen de comida saludable */}
        <div
          className="fixed inset-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: `url('https://fzfncffjekempswnjilr.supabase.co/storage/v1/object/public/cosmos-code-sites/_assets/Ws3HONfaS0dZKNnL4oNlI9ZGSV23/2d2e17-e36b-4321-a51f-77fab61d3ff7/40ca46ec3c7e09da6993c7ad.png')`,
          }}
          aria-hidden="true"
        />
        <Header />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/recetas" element={<Recetas />} />
          <Route path="/planes" element={<Planes />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}