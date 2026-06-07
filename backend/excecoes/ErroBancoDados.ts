// Exceção para erros de banco de dados
export class ErroBancoDados extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroBancoDados";
    Object.setPrototypeOf(this, ErroBancoDados.prototype);
  }
}
