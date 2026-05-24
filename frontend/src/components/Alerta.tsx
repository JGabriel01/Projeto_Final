import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

interface AlertProps {
  tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
  mensagem: string;
  descricao?: string;
  dismissavel?: boolean;
  onDismiss?: () => void;
}

export default function Alerta({
  tipo,
  mensagem,
  descricao,
  dismissavel = true,
  onDismiss,
}: AlertProps) {
  const [visivel, setVisivel] = useState(true);

  if (!visivel) return null;

  const configs = {
    sucesso: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      cor: 'text-green-600',
    },
    erro: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
      cor: 'text-red-600',
    },
    aviso: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertTriangle,
      cor: 'text-yellow-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      cor: 'text-blue-600',
    },
  };

  const config = configs[tipo];
  const IconeComponente = config.icon;

  const handleDismiss = () => {
    setVisivel(false);
    onDismiss?.();
  };

  return (
    <div className={`${config.bg} border ${config.border} ${config.text} px-4 py-4 rounded-lg flex items-start gap-3`}>
      <IconeComponente size={20} className={`flex-shrink-0 mt-0.5 ${config.cor}`} />
      <div className="flex-1">
        <p className="font-semibold">{mensagem}</p>
        {descricao && <p className="text-sm mt-1 opacity-90">{descricao}</p>}
      </div>
      {dismissavel && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-20 rounded transition"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
