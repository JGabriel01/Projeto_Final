// Classe Multa - Representação de multa por atraso
import { ErroMulta } from "../excecoes/index.js";

export class Multa {
  #idMulta: number;
  #valor: number;
  #idEmprestimo: number;
  #idExemplar: number;
  #dataCriacao: Date;
  #statusPagamento: string; // "pendente", "paga", "cancelada"

  constructor(
    idMulta: number,
    valor: number,
    idEmprestimo: number,
    idExemplar: number,
    dataCriacao: Date = new Date(),
    statusPagamento: string = "pendente"
  ) {
    // Validações no construtor
    this.validarValor(valor);
    this.validarIdEmprestimo(idEmprestimo);
    this.validarIdExemplar(idExemplar);
    this.validarStatusPagamento(statusPagamento);

    this.#idMulta = idMulta;
    this.#valor = valor;
    this.#idEmprestimo = idEmprestimo;
    this.#idExemplar = idExemplar;
    this.#dataCriacao = dataCriacao;
    this.#statusPagamento = statusPagamento;
  }

  get idMulta(): number {
    return this.#idMulta;
  }

  get valor(): number {
    return this.#valor;
  }

  set valor(value: number) {
    this.validarValor(value);
    this.#valor = value;
  }

  get idEmprestimo(): number {
    return this.#idEmprestimo;
  }

  get idExemplar(): number {
    return this.#idExemplar;
  }

  get dataCriacao(): Date {
    return this.#dataCriacao;
  }

  get statusPagamento(): string {
    return this.#statusPagamento;
  }

  set statusPagamento(status: string) {
    this.validarStatusPagamento(status);
    this.#statusPagamento = status;
  }

  // Validações privadas
  private validarValor(value: number): void {
    if (typeof value !== "number") {
      throw new ErroMulta("Valor deve ser um número");
    }
    if (value < 0) {
      throw new ErroMulta("Valor não pode ser negativo");
    }
    if (value > 10000) {
      throw new ErroMulta("Valor de multa não pode exceder R$ 10.000,00");
    }
  }

  private validarIdEmprestimo(idEmprestimo: number): void {
    if (typeof idEmprestimo !== "number" || idEmprestimo <= 0) {
      throw new ErroMulta("ID do empréstimo deve ser um número positivo");
    }
  }

  private validarIdExemplar(idExemplar: number): void {
    if (typeof idExemplar !== "number" || idExemplar <= 0) {
      throw new ErroMulta("ID do exemplar deve ser um número positivo");
    }
  }

  private validarStatusPagamento(status: string): void {
    const statusValidos = ["pendente", "paga", "cancelada"];
    if (!statusValidos.includes(status)) {
      throw new ErroMulta("Status de pagamento inválido. Valores permitidos: pendente, paga, cancelada");
    }
  }

  // Método para registrar pagamento
  registrarPagamento(): void {
    if (this.#statusPagamento === "cancelada") {
      throw new ErroMulta("Não é possível pagar uma multa cancelada");
    }
    this.#statusPagamento = "paga";
  }

  // Método para cancelar multa
  cancelar(): void {
    if (this.#statusPagamento === "paga") {
      throw new ErroMulta("Não é possível cancelar uma multa já paga");
    }
    this.#statusPagamento = "cancelada";
  }

  toJSON() {
    return {
      idMulta: this.#idMulta,
      valor: this.#valor,
      idEmprestimo: this.#idEmprestimo,
      idExemplar: this.#idExemplar,
      dataCriacao: this.#dataCriacao,
      statusPagamento: this.#statusPagamento,
    };
  }
}
