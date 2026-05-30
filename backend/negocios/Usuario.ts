// Classe Usuario - Classe base para todos os usuários do sistema

export class Usuario {
  #idUsuario: number;
  #nome: string;
  #email: string;
  #senha: string;
  #nivelAcesso: string; // "aluno", "professor", "admin", "usuario_comum"

  constructor(
    idUsuario: number,
    nome: string,
    email: string,
    senha: string,
    nivelAcesso: string
  ) {
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

  // Setters
  set nome(nome: string) {
    if (nome.length < 3) {
      throw new Error("Nome deve ter pelo menos 3 caracteres");
    }
    this.#nome = nome;
  }

  set email(email: string) {
    if (!this.validarEmail(email)) {
      throw new Error("Email inválido");
    }
    this.#email = email;
  }

  set senha(senha: string) {
    if (senha.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres");
    }
    this.#senha = senha;
  }

  // Métodos privados
  #validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Método público para autenticação (preparado para login)
  autenticar(email: string, senha: string): boolean {
    return this.#email === email && this.#senha === senha;
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
