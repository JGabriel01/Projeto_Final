import { ErroUsuario } from "./ErroUsuario.js";

// Exceção para erros de email
export class ErroEmail extends ErroUsuario {
  constructor(mensagem: string = "Email inválido") {
    super(mensagem);
    this.name = "ErroEmail";
    Object.setPrototypeOf(this, ErroEmail.prototype);
  }
}
