import { ErroValidacao } from "./ErroValidacao.js";

// Exceção para erros de usuário
export class ErroUsuario extends ErroValidacao {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroUsuario";
    Object.setPrototypeOf(this, ErroUsuario.prototype);
  }
}
