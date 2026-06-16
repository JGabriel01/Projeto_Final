class ErroBase extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ErroValidacao extends ErroBase {}
export class ErroUsuario extends ErroBase {}
export class ErroEmail extends ErroBase {}
export class ErroSenha extends ErroBase {}
export class ErroAutenticacao extends ErroBase {}
export class ErroLivro extends ErroBase {}
export class ErroEmprestimo extends ErroBase {}
export class ErroExemplar extends ErroBase {}
export class ErroReserva extends ErroBase {}
export class ErroMulta extends ErroBase {}
export class ErroNaoEncontrado extends ErroBase {}
export class ErroDuplicado extends ErroBase {}
export class ErroBancoDados extends ErroBase {}
