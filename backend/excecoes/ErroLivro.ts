import { ErroValidacao } from "./ErroValidacao.js";

// Exceção para erros de livro
export class ErroLivro extends ErroValidacao {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroLivro";
    Object.setPrototypeOf(this, ErroLivro.prototype);
  }
}
