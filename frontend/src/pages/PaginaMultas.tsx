import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { multaService } from '../services/api';
import type { Multa } from '../types';
import { AlertCircle, CreditCard } from 'lucide-react';
import Botao from '../components/Botao';

export default function PaginaMultas() {
  const navigate = useNavigate();
  const isAutenticado = useAuthStore((state) => state.isAutenticado);
  const usuario = useAuthStore((state) => state.usuario);
  const [multas, setMultas] = useState<Multa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [processando, setProcessando] = useState<number | null>(null);

  useEffect(() => {
    if (!isAutenticado || !usuario) {
      navigate('/login');
      return;
    }

    carregarMultas();
  }, [isAutenticado, usuario, navigate]);

  const carregarMultas = async () => {
    if (!usuario) return;
    try {
      setCarregando(true);
      const response = await multaService.obterPorUsuario(usuario.id);
      setMultas(response.data);
    } catch (err) {
      setErro('Erro ao carregar multas');
    } finally {
      setCarregando(false);
    }
  };

  const handlePagarMulta = async (multaId: number) => {
    try {
      setProcessando(multaId);
      await multaService.pagar(multaId);
      setMultas(multas.map((m) => (m.id === multaId ? { ...m, pago: true } : m)));
    } catch (err: any) {
      setErro(err.response?.data?.mensagem || 'Erro ao pagar multa');
    } finally {
      setProcessando(null);
    }
  };

  const totalPendente = multas
    .filter((m) => !m.pago)
    .reduce((sum, m) => sum + m.valorMulta, 0);

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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Minhas Multas</h1>
        <p className="text-gray-600 mb-8">Gerencie suas multas por atraso em devoluções</p>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {erro}
          </div>
        )}

        {/* Resumo */}
        {multas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-1">Total de Multas</p>
              <p className="text-3xl font-bold text-gray-800">{multas.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-1">Pendentes</p>
              <p className="text-3xl font-bold text-red-600">
                {multas.filter((m) => !m.pago).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-1">Total Pendente</p>
              <p className="text-3xl font-bold text-red-600">
                R$ {totalPendente.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {multas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">Parabéns! Você não tem multas</p>
            <Botao
              onClick={() => navigate('/meus-emprestimos')}
              variant="primary"
            >
              Ver Meus Empréstimos
            </Botao>
          </div>
        ) : (
          <div className="grid gap-4">
            {multas.map((multa) => (
              <div
                key={multa.id}
                className={`rounded-lg shadow-md p-6 border-l-4 ${
                  multa.pago
                    ? 'bg-green-50 border-green-500'
                    : 'bg-white border-red-500'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Informações */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-800">
                        Multa #{multa.id}
                      </h3>
                      {multa.pago && (
                        <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                          PAGA
                        </span>
                      )}
                      {!multa.pago && (
                        <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                          PENDENTE
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">
                      Empréstimo ID: {multa.emprestimoId}
                    </p>
                  </div>

                  {/* Valores */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Data da Multa</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(multa.dataMulta).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {/* Valor */}
                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Valor</p>
                      <p className="text-2xl font-bold text-red-600">
                        R$ {multa.valorMulta.toFixed(2)}
                      </p>
                    </div>
                    {!multa.pago && (
                      <Botao
                        onClick={() => handlePagarMulta(multa.id)}
                        disabled={processando === multa.id}
                        variant="success"
                        size="sm"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <CreditCard size={16} />
                        {processando === multa.id ? 'Pagando...' : 'Pagar'}
                      </Botao>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
