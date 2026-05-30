// Classe Multa - Representação de multa por atraso

export class Multa {
  #idMulta: number;
  #valor: number;
  #idEmprestimo: number;
  #idExemplar: number;
  #dataCriacao: Date;

  constructor(
    idMulta: number,
    valor: number,
    idEmprestimo: number,
    idExemplar: number,
    dataCriacao: Date = new Date()
  ) {
    this.#idMulta = idMulta;
    this.#valor = valor;
    this.#idEmprestimo = idEmprestimo;
    this.#idExemplar = idExemplar;
    this.#dataCriacao = dataCriacao;
  }

  get idMulta(): number {
    return this.#idMulta;
  }

  get valor(): number {
    return this.#valor;
  }

  set valor(value: number) {
    if (value < 0) {
      throw new Error("Valor não pode ser negativo");
    }
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

  toJSON() {
    return {
      idMulta: this.#idMulta,
      valor: this.#valor,
      idEmprestimo: this.#idEmprestimo,
      idExemplar: this.#idExemplar,
      dataCriacao: this.#dataCriacao,
    };
  }
}
