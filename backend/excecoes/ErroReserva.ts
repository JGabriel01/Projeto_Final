import { ErroValidacao } from "./ErroValidacao.js";

// Exceção para erros de reserva
export class ErroReserva extends ErroValidacao {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroReserva";
    Object.setPrototypeOf(this, ErroReserva.prototype);
  }
}
