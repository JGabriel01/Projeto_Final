import { X } from 'lucide-react';
import Botao from './Botao';

interface ModalProps {
  aberto: boolean;
  titulo: string;
  descricao?: string;
  children?: React.ReactNode;
  botaoPrimario?: {
    texto: string;
    onClick: () => void;
    carregando?: boolean;
  };
  botaoSecundario?: {
    texto: string;
    onClick: () => void;
  };
  onFechar: () => void;
}

export default function Modal({
  aberto,
  titulo,
  descricao,
  children,
  botaoPrimario,
  botaoSecundario,
  onFechar,
}: ModalProps) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{titulo}</h2>
          <button
            onClick={onFechar}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {descricao && <p className="text-gray-600 mb-4">{descricao}</p>}
          {children}
        </div>

        {/* Footer */}
        {(botaoPrimario || botaoSecundario) && (
          <div className="flex gap-3 p-6 border-t border-gray-200">
            {botaoSecundario && (
              <Botao
                onClick={botaoSecundario.onClick}
                variant="secondary"
                className="flex-1"
              >
                {botaoSecundario.texto}
              </Botao>
            )}
            {botaoPrimario && (
              <Botao
                onClick={botaoPrimario.onClick}
                disabled={botaoPrimario.carregando}
                variant="primary"
                className="flex-1"
              >
                {botaoPrimario.carregando ? 'Processando...' : botaoPrimario.texto}
              </Botao>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
