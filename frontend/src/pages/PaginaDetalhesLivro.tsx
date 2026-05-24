import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { livroService, emprestimoService, reservaService } from '../services/api';
import type { Livro } from '../types';
import { BookOpen, Download, Calendar, AlertCircle, ArrowLeft } from 'lucide-react';
import Botao from '../components/Botao';

export default function PaginaDetalhesLivro() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAutenticado = useAuthStore((state) => state.isAutenticado);
  const [livro, setLivro] = useState<Livro | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    if (!isAutenticado) {
      navigate('/login');
      return;
    }

    if (id) {
      carregarLivro(parseInt(id));
    }
  }, [id, isAutenticado, navigate]);

  const carregarLivro = async (livroId: number) => {
    try {
      setCarregando(true);
      const response = await livroService.obterPorId(livroId);
      setLivro(response.data);
    } catch (err) {
      setErro('Erro ao carregar detalhes do livro');
    } finally {
      setCarregando(false);
    }
  };

  const handleEmprestimo = async () => {
    if (!livro) return;
    try {
      setProcessando(true);
      await emprestimoService.criar(livro.id);
      setMensagem('Livro emprestado com sucesso!');
      setTimeout(() => navigate('/meus-emprestimos'), 2000);
    } catch (err: any) {
      setErro(err.response?.data?.mensagem || 'Erro ao emprestar');
    } finally {
      setProcessando(false);
    }
  };

  const handleReserva = async () => {
    if (!livro) return;
    try {
      setProcessando(true);
      await reservaService.criar(livro.id);
      setMensagem('Livro reservado com sucesso!');
      setTimeout(() => navigate('/minhas-reservas'), 2000);
    } catch (err: any) {
      setErro(err.response?.data?.mensagem || 'Erro ao reservar');
    } finally {
      setProcessando(false);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (erro || !livro) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-700"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-2">
            <AlertCircle size={24} />
            {erro || 'Livro não encontrado'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-700"
        >
          <ArrowLeft size={20} />
          Voltar ao Catálogo
        </button>

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

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Capa */}
            <div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 h-80 flex items-center justify-center">
                {livro.capa ? (
                  <img
                    src={livro.capa}
                    alt={livro.titulo}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center text-blue-600">
                    <BookOpen size={64} />
                    <p className="mt-4 text-center">Sem capa</p>
                  </div>
                )}
              </div>
              
              {livro.disponivel && (
                <div className="mt-4 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg text-center font-semibold">
                  Disponível
                </div>
              )}
              {!livro.disponivel && (
                <div className="mt-4 bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded-lg text-center font-semibold">
                  Indisponível
                </div>
              )}
            </div>

            {/* Informações */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{livro.titulo}</h1>
              <p className="text-xl text-gray-600 mb-4">{livro.autor}</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Gênero</p>
                  <p className="font-semibold text-gray-800">{livro.genero}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Ano</p>
                  <p className="font-semibold text-gray-800">{livro.ano}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-semibold ${livro.disponivel ? 'text-green-600' : 'text-red-600'}`}>
                    {livro.disponivel ? 'Disponível' : 'Indisponível'}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">Sinopse</h2>
                <p className="text-gray-700 leading-relaxed">{livro.sinopse}</p>
              </div>

              {/* Ações */}
              <div className="mt-8 flex gap-4 flex-wrap">
                {livro.disponivel ? (
                  <Botao
                    onClick={handleEmprestimo}
                    disabled={processando}
                    variant="success"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <Calendar size={20} />
                    {processando ? 'Emprestando...' : 'Emprestar Livro'}
                  </Botao>
                ) : (
                  <Botao
                    onClick={handleReserva}
                    disabled={processando}
                    variant="primary"
                    size="lg"
                  >
                    {processando ? 'Reservando...' : 'Reservar Livro'}
                  </Botao>
                )}

                {livro.arquivo && (
                  <a
                    href={livro.arquivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
                  >
                    <Download size={20} />
                    Baixar PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
