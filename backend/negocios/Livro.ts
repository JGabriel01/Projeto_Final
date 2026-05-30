//Classe Livro - Representação de um livro no catálogo

export class Livro {
  #idLivro: number;
  #titulo: string;
  #autor: string;
  #genero: string;
  #anoPublicacao: number;
  #sinopse: string;
  #status: string; // "disponível", "emprestado", "reservado"

  constructor(
    idLivro: number,
    titulo: string,
    autor: string,
    genero: string,
    anoPublicacao: number,
    sinopse: string,
    status: string = "disponível"
  ) {
    this.#idLivro = idLivro;
    this.#titulo = titulo;
    this.#autor = autor;
    this.#genero = genero;
    this.#anoPublicacao = anoPublicacao;
    this.#sinopse = sinopse;
    this.#status = status;
  }

  // Getters
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

  // Setters
  set titulo(titulo: string) {
    if (titulo.length < 3) {
      throw new Error("Título deve ter pelo menos 3 caracteres");
    }
    this.#titulo = titulo;
  }

  set autor(autor: string) {
    if (autor.length < 3) {
      throw new Error("Autor deve ter pelo menos 3 caracteres");
    }
    this.#autor = autor;
  }

  set genero(genero: string) {
    if (genero.length < 3) {
      throw new Error("Gênero deve ter pelo menos 3 caracteres");
    }
    this.#genero = genero;
  }

  set anoPublicacao(ano: number) {
    const anoAtual = new Date().getFullYear();
    if (ano < 1000 || ano > anoAtual) {
      throw new Error("Ano de publicação inválido");
    }
    this.#anoPublicacao = ano;
  }

  set sinopse(sinopse: string) {
    if (sinopse.length < 10) {
      throw new Error("Sinopse deve ter pelo menos 10 caracteres");
    }
    this.#sinopse = sinopse;
  }

  set status(status: string) {
    const statusValidos = ["disponível", "emprestado", "reservado"];
    if (!statusValidos.includes(status)) {
      throw new Error("Status inválido");
    }
    this.#status = status;
  }

  // Método para verificar disponibilidade
  estaDisponivel(): boolean {
    return this.#status === "disponível";
  }

  // Método para alterar status
  emprestar(): void {
    if (!this.estaDisponivel()) {
      throw new Error("Livro não está disponível para empréstimo");
    }
    this.#status = "emprestado";
  }

  devolver(): void {
    this.#status = "disponível";
  }

  reservar(): void {
    if (this.#status === "disponível") {
      this.#status = "reservado";
    } else if (this.#status !== "reservado") {
      throw new Error("Livro não pode ser reservado no status atual");
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
    };
  }
}
