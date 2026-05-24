import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import CardLivro from '../components/CardLivro';
import { livroService, emprestimoService, reservaService } from '../services/api';
import type { Livro } from '../types';
import { Search, AlertCircle } from 'lucide-react';

export default function PaginaCatalogo() {
  const navigate = useNavigate();
  const isAutenticado = useAuthStore((state) => state.isAutenticado);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [filtrados, setFiltrados] = useState<Livro[]>([]);
  const [busca, setBusca] = useState('');
  const [generoFiltro, setGeneroFiltro] = useState('todos');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const generos = [
    'todos',
    'Ficção Científica',
    'Fantasia',
    'Mistério',
    'Romance',
    'Educativo',
    'História',
    'Autoajuda',
  ];

  useEffect(() => {
    if (!isAutenticado) {
      navigate('/login');
      return;
    }
    carregarLivros();
  }, [isAutenticado, navigate]);

  const carregarLivros = async () => {
    try {
      setCarregando(true);
      const response = await livroService.listar();
      setLivros(response.data);
      setFiltrados(response.data);
    } catch (err) {
      setErro('Erro ao carregar livros');
    } finally {
      setCarregando(false);
    }
  };

  const aplicarFiltros = (searchTerm: string, genero: string) => {
    let resultado = livros;

    if (genero !== 'todos') {
      resultado = resultado.filter((livro) => livro.genero === genero);
    }

    if (searchTerm) {
      resultado = resultado.filter(
        (livro) =>
          livro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          livro.autor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFiltrados(resultado);
  };

  const handleBusca = (value: string) => {
    setBusca(value);
    aplicarFiltros(value, generoFiltro);
  };

  const handleGeneroFiltro = (genero: string) => {
    setGeneroFiltro(genero);
    aplicarFiltros(busca, genero);
  };

  const handleEmprestimo = async (livro: Livro) => {
    if (!isAutenticado) {
      navigate('/login');
      return;
    }

    try {
      await emprestimoService.criar(livro.id);
      setMensagem(`Livro "${livro.titulo}" emprestado com sucesso!`);
      setTimeout(() => {
        setMensagem('');
        navigate('/meus-emprestimos');
      }, 2000);
    } catch (err: any) {
      setErro(err.response?.data?.mensagem || 'Erro ao emprestar livro');
    }
  };

  const handleReserva = async (livro: Livro) => {
    if (!isAutenticado) {
      navigate('/login');
      return;
    }

    try {
      await reservaService.criar(livro.id);
      setMensagem(`Livro "${livro.titulo}" reservado com sucesso!`);
      setTimeout(() => {
        setMensagem('');
        carregarLivros();
      }, 2000);
    } catch (err: any) {
      setErro(err.response?.data?.mensagem || 'Erro ao reservar livro');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Mensagens */}
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {mensagem}
          </div>
        )}

        {/* Cabeçalho */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Catálogo de Livros</h1>
        <p className="text-gray-600 mb-8">Explore nossa vasta coleção de livros</p>

        {/* Busca */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por título ou autor..."
              value={busca}
              onChange={(e) => handleBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            {generos.map((genero) => (
              <button
                key={genero}
                onClick={() => handleGeneroFiltro(genero)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  generoFiltro === genero
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {genero === 'todos' ? 'Todos os Gêneros' : genero}
              </button>
            ))}
          </div>
        </div>

        {/* Resultados */}
        {carregando ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando livros...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">Nenhum livro encontrado</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Mostrando {filtrados.length} livro(s)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtrados.map((livro) => (
                <CardLivro
                  key={livro.id}
                  livro={livro}
                  onEmprestimo={() => handleEmprestimo(livro)}
                  onReserva={() => handleReserva(livro)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
