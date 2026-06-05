import { ErroValidacao } from "./ErroValidacao.js";

// Exceção para erros de multa
export class ErroMulta extends ErroValidacao {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroMulta";
    Object.setPrototypeOf(this, ErroMulta.prototype);
  }
}
