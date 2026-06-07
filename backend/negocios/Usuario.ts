// Classe base com validações e exceções customizadas
import bcrypt from "bcryptjs";
import { ErroUsuario, ErroEmail, ErroSenha } from "../excecoes/index.js";

export class Usuario {
  #idUsuario: number;
  #nome: string;
  #email: string;
  #senha: string;
  #nivelAcesso: string; // "aluno", "professor", "admin"

  constructor(
    idUsuario: number,
    nome: string,
    email: string,
    senha: string,
    nivelAcesso: string
  ) {
    // Validações no construtor
    this.validarNome(nome);
    this.validarEmail(email);
    this.validarSenha(senha);
    this.validarNivelAcesso(nivelAcesso);

    this.#idUsuario = idUsuario;
    this.#nome = nome;
    this.#email = email;
    this.#senha = senha;
    this.#nivelAcesso = nivelAcesso;
  }

  // Getters
  get idUsuario(): number {
    return this.#idUsuario;
  }

  get nome(): string {
    return this.#nome;
  }

  get email(): string {
    return this.#email;
  }

  get senha(): string {
    return this.#senha;
  }

  get nivelAcesso(): string {
    return this.#nivelAcesso;
  }

  // Setters com validações
  set nome(nome: string) {
    this.validarNome(nome);
    this.#nome = nome;
  }

  set email(email: string) {
    this.validarEmail(email);
    this.#email = email;
  }

  set senha(senha: string) {
    this.validarSenha(senha);
    this.#senha = senha;
  }

  // Validações privadas com exceções customizadas
  private validarNome(nome: string): void {
    if (!nome || typeof nome !== "string") {
      throw new ErroUsuario("Nome é obrigatório e deve ser uma string");
    }
    if (nome.trim().length < 3) {
      throw new ErroUsuario("Nome deve ter pelo menos 3 caracteres");
    }
    if (nome.trim().length > 100) {
      throw new ErroUsuario("Nome não pode exceder 100 caracteres");
    }
  }

  private validarEmail(email: string): void {
    if (!email || typeof email !== "string") {
      throw new ErroEmail("Email é obrigatório e deve ser uma string");
    }
    // Validação rigorosa de email RFC 5322 simplificada
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      throw new ErroEmail("Formato de email inválido. Use um email válido (ex: usuario@dominio.com)");
    }
    if (email.length > 100) {
      throw new ErroEmail("Email não pode exceder 100 caracteres");
    }
  }

  private validarSenha(senha: string): void {
    if (!senha || typeof senha !== "string") {
      throw new ErroSenha("Senha é obrigatória e deve ser uma string");
    }
    if (senha.length < 6) {
      throw new ErroSenha("Senha deve ter pelo menos 6 caracteres");
    }
    if (senha.length > 100) {
      throw new ErroSenha("Senha não pode exceder 100 caracteres");
    }
    // Validar força da senha: pelo menos 1 letra e 1 número
    if (!/[a-zA-Z]/.test(senha) || !/\d/.test(senha)) {
      throw new ErroSenha("Senha deve conter pelo menos uma letra e um número");
    }
  }

  private validarNivelAcesso(nivel: string): void {
    const niveisValidos = ["aluno", "professor", "admin"];
    if (!niveisValidos.includes(nivel)) {
      throw new ErroUsuario("Nível de acesso inválido. Valores permitidos: aluno, professor, admin");
    }
  }

  // Método público para autenticação
  autenticar(email: string, senha: string): boolean {
    if (this.#email !== email) {
      return false;
    }
    if (/^\$2[aby]\$\d{2}\$/.test(this.#senha)) {
      return bcrypt.compareSync(senha, this.#senha);
    }
    return this.#senha === senha;
  }

  toJSON() {
    return {
      idUsuario: this.#idUsuario,
      nome: this.#nome,
      email: this.#email,
      nivelAcesso: this.#nivelAcesso,
    };
  }
}
