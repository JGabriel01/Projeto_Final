import { ErroUsuario } from "./ErroUsuario.js";

// Exceção para erros de senha
export class ErroSenha extends ErroUsuario {
  constructor(mensagem: string = "Senha inválida") {
    super(mensagem);
    this.name = "ErroSenha";
    Object.setPrototypeOf(this, ErroSenha.prototype);
  }
}
