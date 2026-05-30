// Classe Reserva - Representação de uma reserva de livro


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

  // Setters
  set dataExpiracao(data: Date) {
    if (data < this.#dataReserva) {
      throw new Error(
        "Data de expiração não pode ser anterior à data da reserva"
      );
    }
    this.#dataExpiracao = data;
  }

  set statusReserva(status: string) {
    const statusValidos = ["ativa", "cancelada", "retirada"];
    if (!statusValidos.includes(status)) {
      throw new Error("Status de reserva inválido");
    }
    this.#statusReserva = status;
  }

  // Método para verificar se a reserva expirou
  expirou(): boolean {
    return new Date() > this.#dataExpiracao && this.#statusReserva === "ativa";
  }

  // Método para cancelar reserva
  cancelar(): void {
    if (this.#statusReserva === "retirada") {
      throw new Error("Não é possível cancelar uma reserva já retirada");
    }
    this.#statusReserva = "cancelada";
  }

  // Método para confirmar retirada
  confirmarRetirada(): void {
    if (this.#statusReserva !== "ativa") {
      throw new Error("Apenas reservas ativas podem ser retiradas");
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
