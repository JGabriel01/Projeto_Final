// Classe Notificacao - Representação de notificação ao usuário
import { ErroValidacao } from "../excecoes/index.js";

export class Notificacao {
  #idNotificacao: number;
  #tipo: string;
  #mensagem: string;
  #idUsuario: number;
  #idEmprestimo: number | null;
  #lida: boolean;
  #dataCriacao: Date;

  constructor(
    idNotificacao: number,
    tipo: string,
    mensagem: string,
    idUsuario: number,
    lida: boolean = false,
    dataCriacao: Date = new Date(),
    idEmprestimo: number | null = null
  ) {
    // Validações no construtor
    this.validarTipo(tipo);
    this.validarMensagem(mensagem);
    this.validarIdUsuario(idUsuario);
    if (idEmprestimo !== null) {
      this.validarIdEmprestimo(idEmprestimo);
    }

    this.#idNotificacao = idNotificacao;
    this.#tipo = tipo;
    this.#mensagem = mensagem;
    this.#idUsuario = idUsuario;
    this.#idEmprestimo = idEmprestimo;
    this.#lida = lida;
    this.#dataCriacao = dataCriacao;
  }

  get idNotificacao(): number {
    return this.#idNotificacao;
  }

  get tipo(): string {
    return this.#tipo;
  }

  set tipo(value: string) {
    this.validarTipo(value);
    this.#tipo = value;
  }

  get mensagem(): string {
    return this.#mensagem;
  }

  set mensagem(value: string) {
    this.validarMensagem(value);
    this.#mensagem = value;
  }

  get idUsuario(): number {
    return this.#idUsuario;
  }

  get idEmprestimo(): number | null {
    return this.#idEmprestimo;
  }

  get lida(): boolean {
    return this.#lida;
  }

  get dataCriacao(): Date {
    return this.#dataCriacao;
  }

  // Validações privadas
  private validarTipo(tipo: string): void {
    if (!tipo || typeof tipo !== "string") {
      throw new ErroValidacao("Tipo é obrigatório e deve ser uma string");
    }
    if (tipo.trim().length === 0) {
      throw new ErroValidacao("Tipo não pode estar vazio");
    }
    if (tipo.trim().length > 50) {
      throw new ErroValidacao("Tipo não pode exceder 50 caracteres");
    }
    // Tipos válidos
    const tiposValidos = ["emprestimo", "multa", "reserva", "devolucao", "renovacao", "aviso"];
    if (!tiposValidos.includes(tipo.toLowerCase())) {
      throw new ErroValidacao(`Tipo inválido. Valores permitidos: ${tiposValidos.join(", ")}`);
    }
  }

  private validarMensagem(mensagem: string): void {
    if (!mensagem || typeof mensagem !== "string") {
      throw new ErroValidacao("Mensagem é obrigatória e deve ser uma string");
    }
    if (mensagem.trim().length === 0) {
      throw new ErroValidacao("Mensagem não pode estar vazia");
    }
    if (mensagem.trim().length < 5) {
      throw new ErroValidacao("Mensagem deve ter pelo menos 5 caracteres");
    }
    if (mensagem.trim().length > 2000) {
      throw new ErroValidacao("Mensagem não pode exceder 2000 caracteres");
    }
  }

  private validarIdUsuario(idUsuario: number): void {
    if (typeof idUsuario !== "number" || idUsuario <= 0) {
      throw new ErroValidacao("ID do usuário deve ser um número positivo");
    }
  }

  private validarIdEmprestimo(idEmprestimo: number): void {
    if (typeof idEmprestimo !== "number" || idEmprestimo <= 0) {
      throw new ErroValidacao("ID do empréstimo deve ser um número positivo");
    }
  }

  marcarComoLido(): void {
    this.#lida = true;
  }

  marcarComoNaoLido(): void {
    this.#lida = false;
  }

  toJSON() {
    return {
      idNotificacao: this.#idNotificacao,
      tipo: this.#tipo,
      mensagem: this.#mensagem,
      idUsuario: this.#idUsuario,
      idEmprestimo: this.#idEmprestimo,
      lida: this.#lida,
      dataCriacao: this.#dataCriacao,
    };
  }
}
