import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/api';
import Botao from '../components/Botao';
import { AlertCircle } from 'lucide-react';

export default function PaginaLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const response = await authService.login({ email, senha });
      const { token, usuario } = response.data;
      login(usuario, token);
      navigate('/catalogo');
    } catch (err: any) {
      setErro(err.response?.data?.mensagem || 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">BiblioTech</h1>
        <p className="text-center text-gray-600 mb-8">Acesse sua conta</p>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <Botao
            type="submit"
            disabled={carregando}
            className="w-full"
            variant="primary"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </Botao>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Não tem conta?{' '}
            <a href="/registro" className="text-blue-600 hover:text-blue-700 font-semibold">
              Registre-se aqui
            </a>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Credenciais de demonstração:<br />
            Email: usuario@exemplo.com<br />
            Senha: senha123
          </p>
        </div>
      </div>
    </div>
  );
}
