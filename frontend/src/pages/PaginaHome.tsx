import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { BookOpen, Users, Library, TrendingUp } from 'lucide-react';
import Botao from '../components/Botao';

export default function PaginaHome() {
  const navigate = useNavigate();
  const isAutenticado = useAuthStore((state) => state.isAutenticado);

  if (isAutenticado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Bem-vindo à BiblioTech
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Sua plataforma de biblioteca digital moderna
            </p>
            <Botao
              onClick={() => navigate('/catalogo')}
              variant="primary"
              size="lg"
              className="inline-flex items-center gap-2"
            >
              <BookOpen size={20} />
              Explorar Catálogo
            </Botao>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Library className="mx-auto mb-4 text-blue-600" size={40} />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">+5000</h3>
              <p className="text-gray-600">Livros Disponíveis</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Users className="mx-auto mb-4 text-blue-600" size={40} />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">+10K</h3>
              <p className="text-gray-600">Usuários Ativos</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <TrendingUp className="mx-auto mb-4 text-blue-600" size={40} />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">+50K</h3>
              <p className="text-gray-600">Empréstimos Realizados</p>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-lg p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Recursos Principais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="bg-blue-100 rounded-lg p-4 h-fit">
                  <BookOpen className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Catálogo Extenso
                  </h3>
                  <p className="text-gray-600">
                    Acesse milhares de livros em diversos gêneros
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-blue-100 rounded-lg p-4 h-fit">
                  <BookOpen className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Empréstimos Fáceis
                  </h3>
                  <p className="text-gray-600">
                    Emprestar livros em poucos cliques
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-blue-100 rounded-lg p-4 h-fit">
                  <BookOpen className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Reservas
                  </h3>
                  <p className="text-gray-600">
                    Reserve livros indisponíveis para mais tarde
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-blue-100 rounded-lg p-4 h-fit">
                  <BookOpen className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Leitura Digital
                  </h3>
                  <p className="text-gray-600">
                    Leia PDFs de livros emprestados online
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <BookOpen className="mx-auto mb-8 text-white" size={80} />
        <h1 className="text-5xl font-bold text-white mb-4">BiblioTech</h1>
        <p className="text-xl text-blue-100 mb-8">
          Sua plataforma de biblioteca digital com as melhores coleções
        </p>
        <div className="flex gap-4 justify-center">
          <Botao
            onClick={() => navigate('/login')}
            variant="primary"
            size="lg"
          >
            Entrar
          </Botao>
          <Botao
            onClick={() => navigate('/registro')}
            variant="secondary"
            size="lg"
          >
            Registrar
          </Botao>
        </div>
      </div>
    </div>
  );
}
