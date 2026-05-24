import axios from 'axios';
import type { LoginDTO, RegistroDTO, Livro, Emprestimo, Reserva, Multa, Usuario } from '../types';

const API_BASE = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Autenticação
export const authService = {
  login: (dados: LoginDTO) => api.post('/autenticacao/login', dados),
  registro: (dados: RegistroDTO) => api.post('/autenticacao/registro', dados),
};

// Livros
export const livroService = {
  listar: () => api.get<Livro[]>('/livros'),
  buscar: (query: string) => api.get<Livro[]>(`/livros/buscar?q=${query}`),
  obterPorId: (id: number) => api.get<Livro>(`/livros/${id}`),
  criar: (dados: FormData) => api.post('/livros', dados, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  atualizar: (id: number, dados: FormData) => api.put(`/livros/${id}`, dados, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletar: (id: number) => api.delete(`/livros/${id}`),
};

// Empréstimos
export const emprestimoService = {
  listar: () => api.get<Emprestimo[]>('/emprestimos'),
  obterPorUsuario: (usuarioId: number) => api.get<Emprestimo[]>(`/emprestimos/usuario/${usuarioId}`),
  criar: (livroId: number, diasEmprestimo?: number) =>
    api.post('/emprestimos', { livroId, diasEmprestimo }),
  devolverLivro: (emprestimoId: number) =>
    api.post(`/emprestimos/${emprestimoId}/devolver`),
};

// Reservas
export const reservaService = {
  listar: () => api.get<Reserva[]>('/reservas'),
  obterPorUsuario: (usuarioId: number) => api.get<Reserva[]>(`/reservas/usuario/${usuarioId}`),
  criar: (livroId: number) => api.post('/reservas', { livroId }),
  cancelar: (reservaId: number) => api.post(`/reservas/${reservaId}/cancelar`),
};

// Multas
export const multaService = {
  listar: () => api.get<Multa[]>('/multas'),
  obterPorUsuario: (usuarioId: number) => api.get<Multa[]>(`/multas/usuario/${usuarioId}`),
  pagar: (multaId: number) => api.post(`/multas/${multaId}/pagar`),
};

// Usuários
export const usuarioService = {
  obterPerfil: () => api.get<Usuario>('/usuarios/perfil'),
  atualizar: (dados: Partial<Usuario>) => api.put('/usuarios/perfil', dados),
};

export default api;
