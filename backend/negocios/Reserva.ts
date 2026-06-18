import { ErroReserva } from "../excecoes/index.js";

export class Reserva {
  #idReserva: number;
  #dataReserva: Date;
  #dataExpiracao: Date;
  #statusReserva: string;
  #usuarioId: number;
  #livroId: number;

  constructor(
    idReserva: number,
    usuarioId: number,
    livroId: number,
    dataReserva: Date = new Date(),
    dataExpiracao: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ) {
    this.validarUsuarioId(usuarioId);
    this.validarLivroId(livroId);
    this.validarDatas(dataReserva, dataExpiracao);

    this.#idReserva = idReserva;
    this.#dataReserva = dataReserva;
    this.#dataExpiracao = dataExpiracao;
    this.#statusReserva = "ativa";
    this.#usuarioId = usuarioId;
    this.#livroId = livroId;
  }

  get idReserva(): number {
    return this.#idReserva;
  }

  get dataReserva(): Date {
    return this.#dataReserva;
  }

  get dataExpiracao(): Date {
    return this.#dataExpiracao;
  }

  get statusReserva(): string {
    return this.#statusReserva;
  }

  get usuarioId(): number {
    return this.#usuarioId;
  }

  get livroId(): number {
    return this.#livroId;
  }

  set dataExpiracao(data: Date) {
    this.validarDatas(this.#dataReserva, data);
    this.#dataExpiracao = data;
  }

  set statusReserva(status: string) {
    this.validarStatusReserva(status);
    this.#statusReserva = status;
  }

  private validarUsuarioId(usuarioId: number): void {
    if (typeof usuarioId !== "number" || usuarioId <= 0) {
      throw new ErroReserva("ID do usuário deve ser um número positivo");
    }
  }

  private validarLivroId(livroId: number): void {
    if (typeof livroId !== "number" || livroId <= 0) {
      throw new ErroReserva("ID do livro deve ser um número positivo");
    }
  }

  private validarDatas(dataReserva: Date, dataExpiracao: Date): void {
    if (!(dataReserva instanceof Date) || isNaN(dataReserva.getTime())) {
      throw new ErroReserva("Data da reserva deve ser uma data válida");
    }
    if (!(dataExpiracao instanceof Date) || isNaN(dataExpiracao.getTime())) {
      throw new ErroReserva("Data de expiração deve ser uma data válida");
    }
    if (dataExpiracao <= dataReserva) {
      throw new ErroReserva("Data de expiração não pode ser anterior ou igual à data da reserva");
    }

    const dias = (dataExpiracao.getTime() - dataReserva.getTime()) / (1000 * 60 * 60 * 24);
    if (dias > 30) {
      throw new ErroReserva("Reserva não pode exceder 30 dias");
    }
  }

  private validarStatusReserva(status: string): void {
    const statusValidos = ["ativa", "cancelada", "retirada", "expirada", "pronta", "em_espera"];
    if (!statusValidos.includes(status)) {
      throw new ErroReserva("Status de reserva inválido");
    }
  }

  expirou(): boolean {
    return new Date() > this.#dataExpiracao && this.#statusReserva === "ativa";
  }

  cancelar(): void {
    if (this.#statusReserva === "retirada") {
      throw new ErroReserva("Não é possível cancelar uma reserva já retirada");
    }
    if (this.#statusReserva === "cancelada") {
      throw new ErroReserva("Esta reserva já foi cancelada");
    }
    this.#statusReserva = "cancelada";
  }

  confirmarRetirada(): void {
    if (this.#statusReserva !== "ativa") {
      throw new ErroReserva("Apenas reservas ativas podem ser retiradas");
    }
    if (this.expirou()) {
      throw new ErroReserva("Não é possível retirar uma reserva expirada");
    }
    this.#statusReserva = "retirada";
  }

  toJSON() {
    return {
      idReserva: this.#idReserva,
      dataReserva: this.#dataReserva,
      dataExpiracao: this.#dataExpiracao,
      statusReserva: this.#statusReserva,
      usuarioId: this.#usuarioId,
      livroId: this.#livroId,
      expirou: this.expirou(),
    };
  }
}
