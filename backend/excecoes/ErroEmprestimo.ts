import { ErroValidacao } from "./ErroValidacao.js";

// Exceção para erros de empréstimo
export class ErroEmprestimo extends ErroValidacao {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroEmprestimo";
    Object.setPrototypeOf(this, ErroEmprestimo.prototype);
  }
}
