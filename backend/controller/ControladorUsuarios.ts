import { Usuario } from "../negocios/Usuario.js";
import { Aluno } from "../negocios/Aluno.js";
import { Professor } from "../negocios/Professor.js";
import { Admin } from "../negocios/Admin.js";
import { RepositorioUsuarios } from "../persistencia/RepositorioUsuarios.js";
import {
  ErroValidacao,
  ErroEmail,
  ErroSenha,
  ErroDuplicado,
  ErroNaoEncontrado,
  ErroAutenticacao,
} from "../excecoes/index.js";

export interface ResultadoOperacao<T = any> {
  sucesso: boolean;
  dados?: T;
  erro?: {
    mensagem: string;
    tipo: string;
    detalhes?: string;
  };
}

export type UsuarioPublico = {
  idUsuario: number;
  nome: string;
  nivelAcesso: string;
  fotoPerfilUrl?: string;
  fundoPerfilUrl?: string;
  anoIngresso?: number;
  curso?: string;
  departamento?: string;
  cargo?: string;
};

export class ControladorUsuarios {
  private repositorioUsuarios = new RepositorioUsuarios();

  private formatarUsuarioPublico(usuario: Usuario): UsuarioPublico {
    const usuarioPublico: UsuarioPublico = {
      idUsuario: usuario.idUsuario,
      nome: usuario.nome,
      nivelAcesso: usuario.nivelAcesso,
      fotoPerfilUrl: usuario.fotoPerfilUrl,
      fundoPerfilUrl: usuario.fundoPerfilUrl,
    };

    if (usuario instanceof Aluno) {
      usuarioPublico.anoIngresso = usuario.anoIngresso;
      usuarioPublico.curso = usuario.curso;
    }

    if (usuario instanceof Professor) {
      usuarioPublico.departamento = usuario.departamento;
    }

    if (usuario instanceof Admin) {
      usuarioPublico.cargo = usuario.cargo;
    }

    return usuarioPublico;
  }

  async criarAluno(
    nome: string,
    email: string,
    senha: string,
    anoIngresso: number,
    curso: string,
    matriculaAluno: string
  ): Promise<ResultadoOperacao<Aluno>> {
    try {
      if (!nome || !email || !senha || !curso || !matriculaAluno) {
        throw new ErroValidacao("Todos os campos sao obrigatorios");
      }

      const usuarioExistente = await this.repositorioUsuarios.buscarPorEmail(email);
      if (usuarioExistente) {
        throw new ErroDuplicado(`Email ${email} ja esta cadastrado`);
      }

      const alunoExistente =
        await this.repositorioUsuarios.buscarAlunoPorMatricula(matriculaAluno);
      if (alunoExistente) {
        throw new ErroDuplicado(`Matricula ${matriculaAluno} ja esta cadastrada`);
      }

      const aluno = new Aluno(
        0,
        nome,
        email,
        senha,
        anoIngresso,
        curso,
        matriculaAluno
      );

      const alunoCriado = await this.repositorioUsuarios.adicionarAluno(aluno);
      return { sucesso: true, dados: alunoCriado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao criar aluno");
    }
  }

  async criarProfessor(
    nome: string,
    email: string,
    senha: string,
    departamento: string,
    matriculaProfessor: string
  ): Promise<ResultadoOperacao<Professor>> {
    try {
      if (!nome || !email || !senha || !departamento || !matriculaProfessor) {
        throw new ErroValidacao("Todos os campos sao obrigatorios");
      }

      const usuarioExistente = await this.repositorioUsuarios.buscarPorEmail(email);
      if (usuarioExistente) {
        throw new ErroDuplicado(`Email ${email} ja esta cadastrado`);
      }

      const professorExistente =
        await this.repositorioUsuarios.buscarProfessorPorMatricula(
          matriculaProfessor
        );
      if (professorExistente) {
        throw new ErroDuplicado(
          `Matricula de professor ${matriculaProfessor} ja esta cadastrada`
        );
      }

      const professor = new Professor(
        0,
        nome,
        email,
        senha,
        departamento,
        matriculaProfessor
      );

      const professorCriado =
        await this.repositorioUsuarios.adicionarProfessor(professor);
      return { sucesso: true, dados: professorCriado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao criar professor");
    }
  }

  async criarAdmin(
    nome: string,
    email: string,
    senha: string,
    cargo: string
  ): Promise<ResultadoOperacao<Admin>> {
    try {
      if (!nome || !email || !senha || !cargo) {
        throw new ErroValidacao("Todos os campos sao obrigatorios");
      }

      const usuarioExistente = await this.repositorioUsuarios.buscarPorEmail(email);
      if (usuarioExistente) {
        throw new ErroDuplicado(`Email ${email} ja esta cadastrado`);
      }

      const admin = new Admin(0, nome, email, senha, cargo);
      const adminCriado = await this.repositorioUsuarios.adicionarAdmin(admin);
      return { sucesso: true, dados: adminCriado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao criar administrador");
    }
  }

  async buscarPorId(id: number): Promise<ResultadoOperacao<Usuario>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }

      const usuario = await this.repositorioUsuarios.buscarPorId(id);
      if (!usuario) {
        throw new ErroNaoEncontrado(`Usuario com ID ${id} nao encontrado`);
      }

      return { sucesso: true, dados: usuario };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao buscar usuario");
    }
  }

  async buscarPublicoPorId(id: number): Promise<ResultadoOperacao<UsuarioPublico>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }

      const usuario = await this.repositorioUsuarios.buscarPorId(id);
      if (!usuario) {
        throw new ErroNaoEncontrado(`Usuario com ID ${id} nao encontrado`);
      }

      return { sucesso: true, dados: this.formatarUsuarioPublico(usuario) };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao buscar usuario");
    }
  }

  async listarTodos(): Promise<ResultadoOperacao<Usuario[]>> {
    try {
      const usuarios = await this.repositorioUsuarios.listarTodos();
      return { sucesso: true, dados: usuarios };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao listar usuarios");
    }
  }

  async listarPublicos(): Promise<ResultadoOperacao<UsuarioPublico[]>> {
    try {
      const usuarios = await this.repositorioUsuarios.listarTodos();
      return {
        sucesso: true,
        dados: usuarios.map((usuario) => this.formatarUsuarioPublico(usuario)),
      };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao listar usuarios");
    }
  }

  async atualizarUsuario(
    id: number,
    dados: { nome?: string; email?: string; senha?: string; cargo?: string }
  ): Promise<ResultadoOperacao<Usuario>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }

      if (
        dados.cargo !== undefined &&
        (typeof dados.cargo !== "string" ||
          dados.cargo.trim().length < 3 ||
          dados.cargo.trim().length > 100)
      ) {
        throw new ErroValidacao("Cargo deve ter entre 3 e 100 caracteres");
      }

      const usuarioExistente = await this.repositorioUsuarios.buscarPorId(id);
      if (!usuarioExistente) {
        throw new ErroNaoEncontrado(`Usuario com ID ${id} nao encontrado`);
      }

      if (dados.cargo !== undefined && usuarioExistente.nivelAcesso !== "admin") {
        throw new ErroValidacao("Cargo so pode ser alterado para administradores");
      }

      const usuarioAtualizado = await this.repositorioUsuarios.atualizar(id, dados);
      if (!usuarioAtualizado) {
        throw new ErroNaoEncontrado(`Usuario com ID ${id} nao encontrado`);
      }

      return { sucesso: true, dados: usuarioAtualizado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao atualizar usuario");
    }
  }

  async atualizarImagensPerfil(
    id: number,
    imagens: {
      fotoPerfilUrl?: string;
      fotoPerfilObjeto?: string;
      fundoPerfilUrl?: string;
      fundoPerfilObjeto?: string;
    }
  ): Promise<ResultadoOperacao<Usuario>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }

      if (!imagens.fotoPerfilUrl && !imagens.fundoPerfilUrl) {
        throw new ErroValidacao("Envie pelo menos uma imagem de perfil");
      }

      const usuarioAtualizado =
        await this.repositorioUsuarios.atualizarImagensPerfil(id, imagens);
      if (!usuarioAtualizado) {
        throw new ErroNaoEncontrado(`Usuario com ID ${id} nao encontrado`);
      }

      return { sucesso: true, dados: usuarioAtualizado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao atualizar imagens de perfil");
    }
  }

  async excluirUsuario(id: number): Promise<ResultadoOperacao<{ id: number }>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("A chave primaria idUsuario deve ser um numero positivo");
      }

      const excluiu = await this.repositorioUsuarios.deletar(id);
      if (!excluiu) {
        throw new ErroNaoEncontrado(`Cadastro com ID ${id} nao encontrado`);
      }

      return { sucesso: true, dados: { id } };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao excluir cadastro");
    }
  }

  async autenticar(
    email: string,
    senha: string
  ): Promise<ResultadoOperacao<Usuario>> {
    try {
      if (!email || !senha) {
        throw new ErroValidacao("Email e senha sao obrigatorios");
      }

      const usuario = await this.repositorioUsuarios.autenticar(email, senha);
      if (!usuario) {
        throw new ErroAutenticacao("Email ou senha invalidos");
      }

      return { sucesso: true, dados: usuario };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro na autenticacao");
    }
  }

  async verificarEmailRecuperacao(
    email: string
  ): Promise<ResultadoOperacao<{ email: string }>> {
    try {
      if (!email) {
        throw new ErroValidacao("Email e obrigatorio");
      }

      const usuario = await this.repositorioUsuarios.buscarPorEmail(email);
      if (!usuario) {
        throw new ErroNaoEncontrado("Funcionario nao encontrado");
      }

      return { sucesso: true, dados: { email: usuario.email } };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao verificar email");
    }
  }

  async redefinirSenhaPorEmail(
    email: string,
    senha: string
  ): Promise<ResultadoOperacao<{ mensagem: string }>> {
    try {
      if (!email || !senha) {
        throw new ErroValidacao("Email e nova senha sao obrigatorios");
      }

      const usuario = await this.repositorioUsuarios.buscarPorEmail(email);
      if (!usuario) {
        throw new ErroNaoEncontrado("Funcionario nao encontrado");
      }

      usuario.senha = senha;

      const usuarioAtualizado = await this.repositorioUsuarios.atualizar(
        usuario.idUsuario,
        { senha }
      );
      if (!usuarioAtualizado) {
        throw new ErroNaoEncontrado("Funcionario nao encontrado");
      }

      return {
        sucesso: true,
        dados: { mensagem: "Senha redefinida com sucesso" },
      };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao redefinir senha");
    }
  }

  private tratarErro(erro: any, mensagemDefault: string): ResultadoOperacao {
    if (erro instanceof ErroNaoEncontrado) {
      return {
        sucesso: false,
        erro: {
          mensagem: erro.message,
          tipo: "ErroNaoEncontrado",
        },
      };
    }

    if (erro instanceof ErroValidacao) {
      return {
        sucesso: false,
        erro: {
          mensagem: erro.message,
          tipo: "ErroValidacao",
        },
      };
    }

    if (erro instanceof ErroEmail) {
      return {
        sucesso: false,
        erro: {
          mensagem: erro.message,
          tipo: "ErroEmail",
        },
      };
    }

    if (erro instanceof ErroSenha) {
      return {
        sucesso: false,
        erro: {
          mensagem: erro.message,
          tipo: "ErroValidacao",
        },
      };
    }

    if (erro instanceof ErroAutenticacao) {
      return {
        sucesso: false,
        erro: {
          mensagem: erro.message,
          tipo: "ErroAutenticacao",
        },
      };
    }

    if (erro instanceof ErroDuplicado) {
      return {
        sucesso: false,
        erro: {
          mensagem: erro.message,
          tipo: "ErroDuplicado",
        },
      };
    }

    return {
      sucesso: false,
      erro: {
        mensagem: mensagemDefault,
        tipo: "ErroDesconhecido",
        detalhes: erro?.message || "Erro desconhecido",
      },
    };
  }
}
