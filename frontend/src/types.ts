// Type Definitions for BiblioTech
export interface Usuario {
  id: number;
  nome: string;
  email: string;
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
  capa?: string;
  arquivo?: string;
}

export interface Emprestimo {
  id: number;
  usuarioId: number;
  livroId: number;
  livro?: Livro;
  dataEmprestimo: Date;
  dataVencimento: Date;
  dataDevolucao?: Date;
}

export interface Reserva {
  id: number;
  usuarioId: number;
  livroId: number;
  livro?: Livro;
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

export interface LoginDTO {
  email: string;
  senha: string;
}

export interface RegistroDTO {
  nome: string;
  email: string;
  senha: string;
}

export interface TokenResponse {
  token: string;
  usuario: Omit<Usuario, 'senha'>;
}
