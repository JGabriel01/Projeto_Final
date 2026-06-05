import { ErroValidacao } from "./ErroValidacao.js";

// Exceção para recurso não encontrado
export class ErroNaoEncontrado extends ErroValidacao {
  constructor(mensagem: string = "Recurso não encontrado") {
    super(mensagem);
    this.name = "ErroNaoEncontrado";
    Object.setPrototypeOf(this, ErroNaoEncontrado.prototype);
  }
}
