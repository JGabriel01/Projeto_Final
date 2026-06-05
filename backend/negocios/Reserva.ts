// Classe Reserva - Representação de uma reserva de livro
import { ErroReserva } from "../excecoes/index.js";

export class Reserva {
  #idReserva: number;
  #dataReserva: Date;
  #dataExpiracao: Date;
  #statusReserva: string; // "ativa", "cancelada", "retirada"
  #usuarioId: number;
  #livroId: number;

  constructor(
    idReserva: number,
    usuarioId: number,
    livroId: number,
    dataReserva: Date = new Date(),
    dataExpiracao: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
  ) {
    // Validações no construtor
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

  // Getters
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

  // Setters com validações
  set dataExpiracao(data: Date) {
    this.validarDatas(this.#dataReserva, data);
    this.#dataExpiracao = data;
  }

  set statusReserva(status: string) {
    this.validarStatusReserva(status);
    this.#statusReserva = status;
  }

  // Validações privadas
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
    // Máximo de 30 dias de reserva
    const diasMaximos = 30;
    const diffMs = dataExpiracao.getTime() - dataReserva.getTime();
    const dias = diffMs / (1000 * 60 * 60 * 24);
    if (dias > diasMaximos) {
      throw new ErroReserva(`Reserva não pode exceder ${diasMaximos} dias`);
    }
  }

  private validarStatusReserva(status: string): void {
    const statusValidos = ["ativa", "cancelada", "retirada"];
    if (!statusValidos.includes(status)) {
      throw new ErroReserva("Status de reserva inválido. Valores permitidos: ativa, cancelada, retirada");
    }
  }

  // Método para verificar se a reserva expirou
  expirou(): boolean {
    return new Date() > this.#dataExpiracao && this.#statusReserva === "ativa";
  }

  // Método para cancelar reserva
  cancelar(): void {
    if (this.#statusReserva === "retirada") {
      throw new ErroReserva("Não é possível cancelar uma reserva já retirada");
    }
    if (this.#statusReserva === "cancelada") {
      throw new ErroReserva("Esta reserva já foi cancelada");
    }
    this.#statusReserva = "cancelada";
  }

  // Método para confirmar retirada
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