// Classe Notificacao - Representação de notificação ao usuário

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
    if (!value || value.trim().length === 0) {
      throw new Error("Tipo não pode estar vazio");
    }
    this.#tipo = value;
  }

  get mensagem(): string {
    return this.#mensagem;
  }

  set mensagem(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Mensagem não pode estar vazia");
    }
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
