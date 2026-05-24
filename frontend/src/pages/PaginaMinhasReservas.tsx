import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { reservaService } from '../services/api';
import type { Reserva } from '../types';
import { AlertCircle, XCircle } from 'lucide-react';
import Botao from '../components/Botao';

export default function PaginaMinhasReservas() {
  const navigate = useNavigate();
  const isAutenticado = useAuthStore((state) => state.isAutenticado);
  const usuario = useAuthStore((state) => state.usuario);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [processando, setProcessando] = useState<number | null>(null);

  useEffect(() => {
    if (!isAutenticado || !usuario) {
      navigate('/login');
      return;
    }

    carregarReservas();
  }, [isAutenticado, usuario, navigate]);

  const carregarReservas = async () => {
    if (!usuario) return;
    try {
      setCarregando(true);
      const response = await reservaService.obterPorUsuario(usuario.id);
      setReservas(response.data);
    } catch (err) {
      setErro('Erro ao carregar reservas');
    } finally {
      setCarregando(false);
    }
  };

  const handleCancelarReserva = async (reservaId: number) => {
    try {
      setProcessando(reservaId);
      await reservaService.cancelar(reservaId);
      setReservas(reservas.filter((r) => r.id !== reservaId));
    } catch (err: any) {
      setErro(err.response?.data?.mensagem || 'Erro ao cancelar reserva');
    } finally {
      setProcessando(null);
    }
  };

  const obterStatusBadge = (status: string) => {
    const configs = {
      ativa: 'bg-blue-100 text-blue-800',
      retirada: 'bg-green-100 text-green-800',
      cancelada: 'bg-gray-100 text-gray-800',
    };
    return configs[status as keyof typeof configs] || configs.ativa;
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Minhas Reservas</h1>
        <p className="text-gray-600 mb-8">
          Acompanhe suas reservas de livros indisponíveis
        </p>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {erro}
          </div>
        )}

        {reservas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">Você não tem reservas</p>
            <Botao
              onClick={() => navigate('/catalogo')}
              variant="primary"
            >
              Explorar Catálogo
            </Botao>
          </div>
        ) : (
          <div className="grid gap-4">
            {reservas.map((reserva) => (
              <div
                key={reserva.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Livro */}
                  <div className="md:col-span-2">
                    <h3 className="font-bold text-lg text-gray-800">
                      {reserva.livro?.titulo || 'Livro'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {reserva.livro?.autor || 'Autor desconhecido'}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Gênero: {reserva.livro?.genero}
                    </p>
                  </div>

                  {/* Informações */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Reservado em</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(reserva.reservadoEm).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded text-sm font-semibold ${obterStatusBadge(
                          reserva.status
                        )}`}
                      >
                        {reserva.status === 'ativa'
                          ? 'Ativa'
                          : reserva.status === 'retirada'
                            ? 'Retirada'
                            : 'Cancelada'}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  {reserva.status === 'ativa' && (
                    <div className="text-right">
                      <Botao
                        onClick={() => handleCancelarReserva(reserva.id)}
                        disabled={processando === reserva.id}
                        variant="danger"
                        size="sm"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} />
                        {processando === reserva.id
                          ? 'Cancelando...'
                          : 'Cancelar'}
                      </Botao>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
