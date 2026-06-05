//Classe Exemplar - Representação de um exemplar físico de um livro
import { ErroExemplar } from "../excecoes/index.js";

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
    // Validações no construtor
    this.validarCodigoTombo(codigoTombo);
    this.validarEstado(estado);
    this.validarLocalizacao(localizacao);
    this.validarIdLivro(idLivro);

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

  // Setters com validações
  set codigoTombo(codigo: string) {
    this.validarCodigoTombo(codigo);
    this.#codigoTombo = codigo;
  }

  set estado(estado: string) {
    this.validarEstado(estado);
    this.#estado = estado;
  }

  set localizacao(localizacao: string) {
    this.validarLocalizacao(localizacao);
    this.#localizacao = localizacao;
  }

  // Validações privadas
  private validarCodigoTombo(codigo: string): void {
    if (!codigo || typeof codigo !== "string") {
      throw new ErroExemplar("Código do tombo é obrigatório e deve ser uma string");
    }
    if (codigo.trim().length < 5) {
      throw new ErroExemplar("Código do tombo deve ter pelo menos 5 caracteres");
    }
    if (codigo.trim().length > 50) {
      throw new ErroExemplar("Código do tombo não pode exceder 50 caracteres");
    }
    // Validar formato: alfanumérico
    if (!/^[a-zA-Z0-9\-_]+$/.test(codigo.trim())) {
      throw new ErroExemplar("Código do tombo deve conter apenas letras, números, hífen e underscore");
    }
  }

  private validarEstado(estado: string): void {
    const estadosValidos = ["novo", "bom", "desgastado", "danificado"];
    if (!estadosValidos.includes(estado)) {
      throw new ErroExemplar("Estado inválido. Valores permitidos: novo, bom, desgastado, danificado");
    }
  }

  private validarLocalizacao(localizacao: string): void {
    if (!localizacao || typeof localizacao !== "string") {
      throw new ErroExemplar("Localização é obrigatória e deve ser uma string");
    }
    if (localizacao.trim().length < 3) {
      throw new ErroExemplar("Localização deve ter pelo menos 3 caracteres");
    }
    if (localizacao.trim().length > 100) {
      throw new ErroExemplar("Localização não pode exceder 100 caracteres");
    }
  }

  private validarIdLivro(idLivro: number): void {
    if (typeof idLivro !== "number" || idLivro <= 0) {
      throw new ErroExemplar("ID do livro deve ser um número positivo");
    }
  }

  // Método para verificar se pode ser emprestado
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
      podeSerEmprestado: this.podeSerEmprestado(),
    };
  }
}
