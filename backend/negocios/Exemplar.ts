//Classe Exemplar - Representação de um exemplar físico de um livro

export class Exemplar {
  #idExemplar: number;
  #codigoTombo: string;
  #estado: string; // "novo", "bom", "desgastado", "danificado"
  #localizacao: string;
  #idLivro: number;

  constructor(
    idExemplar: number,
    codigoTombo: string,
    estado: string,
    localizacao: string,
    idLivro: number
  ) {
    this.#idExemplar = idExemplar;
    this.#codigoTombo = codigoTombo;
    this.#estado = estado;
    this.#localizacao = localizacao;
    this.#idLivro = idLivro;
  }

  // Getters
  get idExemplar(): number {
    return this.#idExemplar;
  }

  get codigoTombo(): string {
    return this.#codigoTombo;
  }

  get estado(): string {
    return this.#estado;
  }

  get localizacao(): string {
    return this.#localizacao;
  }

  get idLivro(): number {
    return this.#idLivro;
  }

  // Setters
  set codigoTombo(codigo: string) {
    if (codigo.length < 5) {
      throw new Error("Código do tombo inválido");
    }
    this.#codigoTombo = codigo;
  }

  set estado(estado: string) {
    const estadosValidos = ["novo", "bom", "desgastado", "danificado"];
    if (!estadosValidos.includes(estado)) {
      throw new Error("Estado inválido");
    }
    this.#estado = estado;
  }

  set localizacao(localizacao: string) {
    if (localizacao.length < 3) {
      throw new Error("Localização deve ter nome válido");
    }
    this.#localizacao = localizacao;
  }

  // Método para verificar estado
  podeSerEmprestado(): boolean {
    return this.#estado !== "danificado";
  }

  toJSON() {
    return {
      idExemplar: this.#idExemplar,
      codigoTombo: this.#codigoTombo,
      estado: this.#estado,
      localizacao: this.#localizacao,
      idLivro: this.#idLivro,
    };
  }
}
