import { ErroUsuario } from "./ErroUsuario.js";

// Exceção para erros de autenticação
export class ErroAutenticacao extends ErroUsuario {
  constructor(mensagem: string = "Falha na autenticação") {
    super(mensagem);
    this.name = "ErroAutenticacao";
    Object.setPrototypeOf(this, ErroAutenticacao.prototype);
  }
}
