// Exceção genérica para validações de negócio
export class ErroValidacao extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroValidacao";
    Object.setPrototypeOf(this, ErroValidacao.prototype);
  }
}
