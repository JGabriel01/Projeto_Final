// Tipos de entidades
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  criadoEm: Date;
}

export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  genero: string;
  ano: number;
  sinopse: string;
  disponivel: boolean;
  capa?: string; // URL da capa no armazenamento
  arquivo?: string; // URL do arquivo (PDF) no armazenamento
}

export interface Emprestimo {
  id: number;
  usuarioId: number;
  livroId: number;
  dataEmprestimo: Date;
  dataVencimento: Date;
  dataDevolucao?: Date;
}

export interface Reserva {
  id: number;
  usuarioId: number;
  livroId: number;
  reservadoEm: Date;
  status: 'ativa' | 'cancelada' | 'retirada';
}

export interface Multa {
  id: number;
  usuarioId: number;
  emprestimoId: number;
  valorMulta: number;
  dataMulta: Date;
  pago: boolean;
}

// DTOs para requisições
export interface RegistrarDTO {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginDTO {
  email: string;
  senha: string;
}

export interface CriarLivroDTO {
  titulo: string;
  autor: string;
  genero: string;
  ano: number;
  sinopse: string;
}

export interface CriarEmprestimoDTO {
  usuarioId: number;
  livroId: number;
  diasEmprestimo?: number;
}

export interface CriarReservaDTO {
  usuarioId: number;
  livroId: number;
}

// Resposta autenticação
export interface TokenResponse {
  token: string;
  usuario: Omit<Usuario, 'senha'>;
}
