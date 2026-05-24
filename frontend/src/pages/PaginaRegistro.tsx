import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/api';
import Botao from '../components/Botao';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function PaginaRegistro() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    if (senha !== confirmSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setCarregando(true);

    try {
      const response = await authService.registro({ nome, email, senha });
      const { token, usuario } = response.data;
      login(usuario, token);
      setSucesso(true);
      setTimeout(() => navigate('/catalogo'), 2000);
    } catch (err: any) {
      setErro(err.response?.data?.mensagem || 'Erro ao registrar');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">BiblioTech</h1>
        <p className="text-center text-gray-600 mb-8">Crie sua conta</p>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle size={20} />
            Registro realizado com sucesso! Redirecionando...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Seu Nome"
            />
          </div>

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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirmSenha}
              onChange={(e) => setConfirmSenha(e.target.value)}
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
            {carregando ? 'Registrando...' : 'Registrar'}
          </Botao>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Já tem conta?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Faça login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
