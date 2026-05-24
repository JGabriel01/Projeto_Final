import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Botao from '../components/Botao';

export default function Pagina404() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <AlertCircle className="mx-auto mb-6 text-blue-600" size={80} />
        <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-2xl font-semibold text-gray-600 mb-2">Página não encontrada</p>
        <p className="text-gray-500 mb-8 max-w-md">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        <Botao
          onClick={() => navigate('/')}
          variant="primary"
          size="lg"
        >
          Voltar à Página Inicial
        </Botao>
      </div>
    </div>
  );
}
