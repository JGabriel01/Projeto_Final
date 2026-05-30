//Classe Emprestimo - Representação de um empréstimo de livro

export class Emprestimo {
  #idEmprestimo: number;
  #dataSaida: Date;
  #dataVencimento: Date;
  #dataDevolucaoReal: Date | null;
  #usuarioId: number;
  #exemplarId: number;
  #status: string; // "ativo", "devolvido", "atrasado"

  constructor(
    idEmprestimo: number,
    usuarioId: number,
    exemplarId: number,
    dataSaida: Date = new Date(),
    dataVencimento: Date = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dias
  ) {
    this.#idEmprestimo = idEmprestimo;
    this.#dataSaida = dataSaida;
    this.#dataVencimento = dataVencimento;
    this.#dataDevolucaoReal = null;
    this.#usuarioId = usuarioId;
    this.#exemplarId = exemplarId;
    this.#status = "ativo";
  }

  // Getters
  get idEmprestimo(): number {
    return this.#idEmprestimo;
  }

  get dataSaida(): Date {
    return this.#dataSaida;
  }

  get dataVencimento(): Date {
    return this.#dataVencimento;
  }

  get dataDevolucaoReal(): Date | null {
    return this.#dataDevolucaoReal;
  }

  get usuarioId(): number {
    return this.#usuarioId;
  }

  get exemplarId(): number {
    return this.#exemplarId;
  }

  get status(): string {
    return this.#status;
  }

  // Setters
  set dataVencimento(data: Date) {
    if (data < this.#dataSaida) {
      throw new Error("Data de vencimento não pode ser anterior à data de saída");
    }
    this.#dataVencimento = data;
  }

  // Método para registrar devolução
  registrarDevolucao(): void {
    if (this.#status === "devolvido") {
      throw new Error("Este empréstimo já foi devolvido");
    }
    this.#dataDevolucaoReal = new Date();
    this.#status = this.estaAtrasado() ? "devolvido_atrasado" : "devolvido";
  }

  // Método para verificar atraso
  estaAtrasado(): boolean {
    if (this.#status === "devolvido" || this.#status === "devolvido_atrasado") {
      return (
        this.#dataDevolucaoReal !== null &&
        this.#dataDevolucaoReal > this.#dataVencimento
      );
    }
    return new Date() > this.#dataVencimento && this.#status === "ativo";
  }

  // Método para calcular dias de atraso
  calcularDiasAtraso(): number {
    let dataComparacao = new Date();
    if (this.#dataDevolucaoReal !== null) {
      dataComparacao = this.#dataDevolucaoReal;
    }

    if (dataComparacao > this.#dataVencimento) {
      const diff = dataComparacao.getTime() - this.#dataVencimento.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  // Método para renovar empréstimo (estender data de vencimento)
  renovar(diasAdicionais: number = 14): void {
    if (this.#status !== "ativo") {
      throw new Error("Apenas empréstimos ativos podem ser renovados");
    }
    this.#dataVencimento = new Date(
      this.#dataVencimento.getTime() + diasAdicionais * 24 * 60 * 60 * 1000
    );
  }

  toJSON() {
    return {
      idEmprestimo: this.#idEmprestimo,
      dataSaida: this.#dataSaida,
      dataVencimento: this.#dataVencimento,
      dataDevolucaoReal: this.#dataDevolucaoReal,
      usuarioId: this.#usuarioId,
      exemplarId: this.#exemplarId,
      status: this.#status,
      estaAtrasado: this.estaAtrasado(),
      diasAtraso: this.calcularDiasAtraso(),
    };
  }
}
