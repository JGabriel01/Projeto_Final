import { ErroValidacao } from "./ErroValidacao.js";

// Exceção para recurso duplicado
export class ErroDuplicado extends ErroValidacao {
  constructor(mensagem: string = "Recurso já existe") {
    super(mensagem);
    this.name = "ErroDuplicado";
    Object.setPrototypeOf(this, ErroDuplicado.prototype);
  }
}
