import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, Menu, X, BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { isAutenticado, usuario, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
          <BookOpen size={32} />
          <span>BiblioTech</span>
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden md:flex gap-8 items-center">
          {isAutenticado ? (
            <>
              <Link to="/catalogo" className="hover:text-blue-600 transition">
                Catálogo
              </Link>
              <Link to="/meus-emprestimos" className="hover:text-blue-600 transition">
                Meus Empréstimos
              </Link>
              <Link to="/minhas-reservas" className="hover:text-blue-600 transition">
                Reservas
              </Link>
              <Link to="/multas" className="hover:text-blue-600 transition">
                Multas
              </Link>
              <div className="flex items-center gap-4 border-l pl-4">
                <span className="text-sm font-medium">{usuario?.nome}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  <LogOut size={18} />
                  Sair
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Entrar
              </Link>
              <Link
                to="/registro"
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition"
              >
                Registrar
              </Link>
            </>
          )}
        </nav>

        {/* Menu Mobile */}
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="md:hidden p-2 hover:bg-gray-100 rounded"
        >
          {menuAberto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Mobile Expandido */}
      {menuAberto && (
        <div className="md:hidden bg-gray-50 border-t">
          <nav className="flex flex-col gap-2 p-4">
            {isAutenticado ? (
              <>
                <Link to="/catalogo" className="px-4 py-2 hover:bg-gray-100 rounded">
                  Catálogo
                </Link>
                <Link to="/meus-emprestimos" className="px-4 py-2 hover:bg-gray-100 rounded">
                  Meus Empréstimos
                </Link>
                <Link to="/minhas-reservas" className="px-4 py-2 hover:bg-gray-100 rounded">
                  Reservas
                </Link>
                <Link to="/multas" className="px-4 py-2 hover:bg-gray-100 rounded">
                  Multas
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-left text-red-500 hover:bg-red-50 rounded"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 hover:bg-gray-100 rounded">
                  Entrar
                </Link>
                <Link to="/registro" className="px-4 py-2 hover:bg-gray-100 rounded">
                  Registrar
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
