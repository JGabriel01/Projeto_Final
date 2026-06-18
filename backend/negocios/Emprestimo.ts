// Classe Empréstimo - Representação de um empréstimo de livro
import { ErroEmprestimo } from "../excecoes/index.js";

export class Emprestimo {
  #idEmprestimo: number;
  #dataSaida: Date;
  #dataVencimento: Date;
  #dataDevolucaoReal: Date | null;
  #usuarioId: number;
  #exemplarId: number | null;
  #status: string; // "ativo", "devolvido", "atrasado"

  constructor(
    idEmprestimo: number,
    usuarioId: number,
    exemplarId: number | null,
    dataSaida: Date = new Date(),
    dataVencimento: Date = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
    dataDevolucaoReal: Date | null = null
  ) {
    // Validações no construtor
    this.validarUsuarioId(usuarioId);
    this.validarExemplarId(exemplarId);
    this.validarDatas(dataSaida, dataVencimento);

    this.#idEmprestimo = idEmprestimo;
    this.#dataSaida = dataSaida;
    this.#dataVencimento = dataVencimento;
    this.#dataDevolucaoReal = dataDevolucaoReal;
    this.#usuarioId = usuarioId;
    this.#exemplarId = exemplarId;
    this.#status = dataDevolucaoReal
      ? dataDevolucaoReal > dataVencimento
        ? "devolvido_atrasado"
        : "devolvido"
      : "ativo";
  }

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

  get exemplarId(): number | null {
    return this.#exemplarId;
  }

  get status(): string {
    return this.#status;
  }

  set dataVencimento(data: Date) {
    this.validarDatas(this.#dataSaida, data);
    this.#dataVencimento = data;
  }

  private validarUsuarioId(usuarioId: number): void {
    if (typeof usuarioId !== "number" || usuarioId <= 0) {
      throw new ErroEmprestimo("ID do usuário deve ser um número positivo");
    }
  }

  private validarExemplarId(exemplarId: number | null): void {
    if (exemplarId !== null && (typeof exemplarId !== "number" || exemplarId <= 0)) {
      throw new ErroEmprestimo("ID do exemplar deve ser um número positivo ou nulo");
    }
  }

  private validarDatas(dataSaida: Date, dataVencimento: Date): void {
    if (!(dataSaida instanceof Date) || isNaN(dataSaida.getTime())) {
      throw new ErroEmprestimo("Data de saída deve ser uma data válida");
    }
    if (!(dataVencimento instanceof Date) || isNaN(dataVencimento.getTime())) {
      throw new ErroEmprestimo("Data de vencimento deve ser uma data válida");
    }
    if (dataVencimento <= dataSaida) {
      throw new ErroEmprestimo("Data de vencimento não pode ser anterior ou igual à data de saída");
    }

    const diasMaximos = 30;
    const diffMs = dataVencimento.getTime() - dataSaida.getTime();
    const dias = diffMs / (1000 * 60 * 60 * 24);
    if (dias > diasMaximos) {
      throw new ErroEmprestimo(`Empréstimo não pode exceder ${diasMaximos} dias`);
    }
  }

  registrarDevolucao(): void {
    if (this.#status === "devolvido") {
      throw new ErroEmprestimo("Este empréstimo já foi devolvido");
    }
    this.#dataDevolucaoReal = new Date();
    this.#status = this.estaAtrasado() ? "devolvido_atrasado" : "devolvido";
  }

  estaAtrasado(): boolean {
    if (this.#status === "devolvido" || this.#status === "devolvido_atrasado") {
      return (
        this.#dataDevolucaoReal !== null &&
        this.#dataDevolucaoReal > this.#dataVencimento
      );
    }
    return new Date() > this.#dataVencimento && this.#status === "ativo";
  }

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

  renovar(diasAdicionais: number = 14): void {
    if (this.#status !== "ativo") {
      throw new ErroEmprestimo("Apenas empréstimos ativos podem ser renovados");
    }
    if (this.estaAtrasado()) {
      throw new ErroEmprestimo("Não é possível renovar empréstimos atrasados");
    }
    if (diasAdicionais < 1 || diasAdicionais > 30) {
      throw new ErroEmprestimo("Dias adicionais devem estar entre 1 e 30");
    }

    const novaDataVencimento = new Date(this.#dataVencimento);
    novaDataVencimento.setDate(novaDataVencimento.getDate() + diasAdicionais);

    const diasTotais = (novaDataVencimento.getTime() - this.#dataSaida.getTime()) / (1000 * 60 * 60 * 24);
    if (diasTotais > 30) {
      throw new ErroEmprestimo("Renovação não pode exceder 30 dias de empréstimo no total");
    }

    this.#dataVencimento = novaDataVencimento;
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
