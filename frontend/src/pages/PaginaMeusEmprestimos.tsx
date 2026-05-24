import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { emprestimoService } from '../services/api';
import type { Emprestimo } from '../types';
import { AlertCircle, Calendar, RotateCw } from 'lucide-react';
import Botao from '../components/Botao';

export default function PaginaMeusEmprestimos() {
  const navigate = useNavigate();
  const isAutenticado = useAuthStore((state) => state.isAutenticado);
  const usuario = useAuthStore((state) => state.usuario);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [processando, setProcessando] = useState<number | null>(null);

  useEffect(() => {
    if (!isAutenticado || !usuario) {
      navigate('/login');
      return;
    }

    carregarEmprestimos();
  }, [isAutenticado, usuario, navigate]);

  const carregarEmprestimos = async () => {
    if (!usuario) return;
    try {
      setCarregando(true);
      const response = await emprestimoService.obterPorUsuario(usuario.id);
      setEmprestimos(response.data);
    } catch (err) {
      setErro('Erro ao carregar empréstimos');
    } finally {
      setCarregando(false);
    }
  };

  const handleDevolverLivro = async (emprestimoId: number) => {
    try {
      setProcessando(emprestimoId);
      await emprestimoService.devolverLivro(emprestimoId);
      setEmprestimos(emprestimos.filter((e) => e.id !== emprestimoId));
    } catch (err: any) {
      setErro(err.response?.data?.mensagem || 'Erro ao devolver livro');
    } finally {
      setProcessando(null);
    }
  };

  const verificarAtraso = (dataVencimento: Date) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    return vencimento < hoje;
  };

  const calcularDiasRestantes = (dataVencimento: Date) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diferenca = vencimento.getTime() - hoje.getTime();
    return Math.ceil(diferenca / (1000 * 3600 * 24));
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Meus Empréstimos</h1>
        <p className="text-gray-600 mb-8">Acompanhe seus empréstimos ativos e devoluções</p>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {erro}
          </div>
        )}

        {emprestimos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">Você não tem empréstimos ativas</p>
            <Botao
              onClick={() => navigate('/catalogo')}
              variant="primary"
            >
              Explorar Catálogo
            </Botao>
          </div>
        ) : (
          <div className="grid gap-4">
            {emprestimos.map((emprestimo) => {
              const emAtraso = verificarAtraso(emprestimo.dataVencimento);
              const diasRestantes = calcularDiasRestantes(emprestimo.dataVencimento);

              return (
                <div
                  key={emprestimo.id}
                  className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                    emAtraso ? 'border-red-500' : 'border-blue-500'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    {/* Livro */}
                    <div className="md:col-span-2">
                      <h3 className="font-bold text-lg text-gray-800">
                        {emprestimo.livro?.titulo || 'Livro'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {emprestimo.livro?.autor || 'Autor desconhecido'}
                      </p>
                    </div>

                    {/* Datas */}
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Emprestado em</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(emprestimo.dataEmprestimo).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Vence em</p>
                        <p className={`font-semibold ${emAtraso ? 'text-red-600' : 'text-green-600'}`}>
                          {new Date(emprestimo.dataVencimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {/* Status e Ação */}
                    <div className="text-right space-y-2">
                      {emAtraso && (
                        <div className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-semibold inline-block">
                          ATRASADO
                        </div>
                      )}
                      {!emAtraso && (
                        <div className="text-gray-600 text-sm">
                          {diasRestantes > 0
                            ? `${diasRestantes} dia(s) restante(s)`
                            : 'Vence hoje'}
                        </div>
                      )}
                      <Botao
                        onClick={() => handleDevolverLivro(emprestimo.id)}
                        disabled={processando === emprestimo.id}
                        variant="primary"
                        size="sm"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <RotateCw size={16} />
                        {processando === emprestimo.id ? 'Devolvendo...' : 'Devolver'}
                      </Botao>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
