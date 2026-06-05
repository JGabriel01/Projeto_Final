import { ErroValidacao } from "./ErroValidacao.js";

// Exceção para erros de exemplar
export class ErroExemplar extends ErroValidacao {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroExemplar";
    Object.setPrototypeOf(this, ErroExemplar.prototype);
  }
}
