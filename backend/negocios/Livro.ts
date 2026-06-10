import { ErroLivro } from "../excecoes/index.js";

export class Livro {
  #idLivro: number;
  #titulo: string;
  #autor: string;
  #genero: string;
  #anoPublicacao: number;
  #sinopse: string;
  #status: string;
  #capaUrl: string | null;
  #capaObjeto: string | null;
  #curtidasTotal: number;

  constructor(
    idLivro: number,
    titulo: string,
    autor: string,
    genero: string,
    anoPublicacao: number,
    sinopse: string,
    status: string = "disponivel",
    capaUrl: string | null = null,
    capaObjeto: string | null = null,
    curtidasTotal: number = 0
  ) {
    this.validarTitulo(titulo);
    this.validarAutor(autor);
    this.validarGenero(genero);
    this.validarAnoPublicacao(anoPublicacao);
    this.validarSinopse(sinopse);
    this.validarStatus(status);

    this.#idLivro = idLivro;
    this.#titulo = titulo;
    this.#autor = autor;
    this.#genero = genero;
    this.#anoPublicacao = anoPublicacao;
    this.#sinopse = sinopse;
    this.#status = status;
    this.#capaUrl = capaUrl;
    this.#capaObjeto = capaObjeto;
    this.#curtidasTotal = curtidasTotal;
  }

  get idLivro(): number {
    return this.#idLivro;
  }

  get titulo(): string {
    return this.#titulo;
  }

  get autor(): string {
    return this.#autor;
  }

  get genero(): string {
    return this.#genero;
  }

  get anoPublicacao(): number {
    return this.#anoPublicacao;
  }

  get sinopse(): string {
    return this.#sinopse;
  }

  get status(): string {
    return this.#status;
  }

  get capaUrl(): string | null {
    return this.#capaUrl;
  }

  get capaObjeto(): string | null {
    return this.#capaObjeto;
  }

  get curtidasTotal(): number {
    return this.#curtidasTotal;
  }

  set titulo(titulo: string) {
    this.validarTitulo(titulo);
    this.#titulo = titulo;
  }

  set autor(autor: string) {
    this.validarAutor(autor);
    this.#autor = autor;
  }

  set genero(genero: string) {
    this.validarGenero(genero);
    this.#genero = genero;
  }

  set anoPublicacao(ano: number) {
    this.validarAnoPublicacao(ano);
    this.#anoPublicacao = ano;
  }

  set sinopse(sinopse: string) {
    this.validarSinopse(sinopse);
    this.#sinopse = sinopse;
  }

  set status(status: string) {
    this.validarStatus(status);
    this.#status = status;
  }

  private validarTitulo(titulo: string): void {
    if (!titulo || typeof titulo !== "string") {
      throw new ErroLivro("Titulo e obrigatorio e deve ser uma string");
    }
    if (titulo.trim().length < 3) {
      throw new ErroLivro("Titulo deve ter pelo menos 3 caracteres");
    }
    if (titulo.trim().length > 200) {
      throw new ErroLivro("Titulo nao pode exceder 200 caracteres");
    }
  }

  private validarAutor(autor: string): void {
    if (!autor || typeof autor !== "string") {
      throw new ErroLivro("Autor e obrigatorio e deve ser uma string");
    }
    if (autor.trim().length < 3) {
      throw new ErroLivro("Autor deve ter pelo menos 3 caracteres");
    }
    if (autor.trim().length > 150) {
      throw new ErroLivro("Autor nao pode exceder 150 caracteres");
    }
  }

  private validarGenero(genero: string): void {
    if (!genero || typeof genero !== "string") {
      throw new ErroLivro("Genero e obrigatorio e deve ser uma string");
    }
    if (genero.trim().length < 3) {
      throw new ErroLivro("Genero deve ter pelo menos 3 caracteres");
    }
    if (genero.trim().length > 100) {
      throw new ErroLivro("Genero nao pode exceder 100 caracteres");
    }
  }

  private validarAnoPublicacao(ano: number): void {
    if (typeof ano !== "number") {
      throw new ErroLivro("Ano de publicacao deve ser um numero");
    }
    const anoAtual = new Date().getFullYear();
    if (ano < 1000 || ano > anoAtual) {
      throw new ErroLivro(`Ano de publicacao deve estar entre 1000 e ${anoAtual}`);
    }
  }

  private validarSinopse(sinopse: string): void {
    if (!sinopse || typeof sinopse !== "string") {
      throw new ErroLivro("Sinopse e obrigatoria e deve ser uma string");
    }
    if (sinopse.trim().length < 10) {
      throw new ErroLivro("Sinopse deve ter pelo menos 10 caracteres");
    }
    if (sinopse.trim().length > 5000) {
      throw new ErroLivro("Sinopse nao pode exceder 5000 caracteres");
    }
  }

  private validarStatus(status: string): void {
    const statusValidos = ["disponivel", "disponível", "disponÃ­vel", "emprestado", "reservado"];
    if (!statusValidos.includes(status)) {
      throw new ErroLivro("Status invalido. Valores permitidos: disponivel, emprestado, reservado");
    }
  }

  estaDisponivel(): boolean {
    return ["disponivel", "disponível", "disponÃ­vel"].includes(this.#status);
  }

  emprestar(): void {
    if (!this.estaDisponivel()) {
      throw new ErroLivro("Livro nao esta disponivel para emprestimo");
    }
    this.#status = "emprestado";
  }

  devolver(): void {
    this.#status = "disponivel";
  }

  reservar(): void {
    if (this.estaDisponivel()) {
      this.#status = "reservado";
    } else if (this.#status !== "reservado") {
      throw new Error("Livro nao pode ser reservado no status atual");
    }
  }

  toJSON() {
    return {
      idLivro: this.#idLivro,
      titulo: this.#titulo,
      autor: this.#autor,
      genero: this.#genero,
      anoPublicacao: this.#anoPublicacao,
      sinopse: this.#sinopse,
      status: this.#status,
      capaUrl: this.#capaUrl,
      capaObjeto: this.#capaObjeto,
      curtidasTotal: this.#curtidasTotal,
      estaDisponivel: this.estaDisponivel(),
    };
  }
}
