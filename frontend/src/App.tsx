import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// Pages
import PaginaHome from './pages/PaginaHome';
import PaginaLogin from './pages/PaginaLogin';
import PaginaRegistro from './pages/PaginaRegistro';
import PaginaCatalogo from './pages/PaginaCatalogo';
import PaginaDetalhesLivro from './pages/PaginaDetalhesLivro';
import PaginaMeusEmprestimos from './pages/PaginaMeusEmprestimos';
import PaginaMinhasReservas from './pages/PaginaMinhasReservas';
import PaginaMultas from './pages/PaginaMultas';
import Pagina404 from './pages/Pagina404';

function App() {
  const inicializarDoLocalStorage = useAuthStore(
    (state) => state.inicializarDoLocalStorage
  );

  useEffect(() => {
    inicializarDoLocalStorage();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PaginaHome />} />
            <Route path="/login" element={<PaginaLogin />} />
            <Route path="/registro" element={<PaginaRegistro />} />

            {/* Protected Routes */}
            <Route
              path="/catalogo"
              element={
                <PrivateRoute>
                  <PaginaCatalogo />
                </PrivateRoute>
              }
            />
            <Route
              path="/livro/:id"
              element={
                <PrivateRoute>
                  <PaginaDetalhesLivro />
                </PrivateRoute>
              }
            />
            <Route
              path="/meus-emprestimos"
              element={
                <PrivateRoute>
                  <PaginaMeusEmprestimos />
                </PrivateRoute>
              }
            />
            <Route
              path="/minhas-reservas"
              element={
                <PrivateRoute>
                  <PaginaMinhasReservas />
                </PrivateRoute>
              }
            />
            <Route
              path="/multas"
              element={
                <PrivateRoute>
                  <PaginaMultas />
                </PrivateRoute>
              }
            />

            {/* Error Page */}
            <Route path="/404" element={<Pagina404 />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
