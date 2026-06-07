import { Usuario } from "../negocios/Usuario.js";
import { Aluno } from "../negocios/Aluno.js";
import { Professor } from "../negocios/Professor.js";
import { Admin } from "../negocios/Admin.js";
import { RepositorioUsuarios } from "../persistencia/RepositorioUsuarios.js";
import {
  ErroValidacao,
  ErroEmail,
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

export class ControladorUsuarios {
  private repositorioUsuarios = new RepositorioUsuarios();

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

  async listarTodos(): Promise<ResultadoOperacao<Usuario[]>> {
    try {
      const usuarios = await this.repositorioUsuarios.listarTodos();
      return { sucesso: true, dados: usuarios };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao listar usuarios");
    }
  }

  async atualizarUsuario(
    id: number,
    dados: { nome?: string; email?: string; senha?: string }
  ): Promise<ResultadoOperacao<Usuario>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
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

  async excluirNomeCadastro(id: number): Promise<ResultadoOperacao<{ id: number }>> {
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

  private tratarErro(erro: any, mensagemDefault: string): ResultadoOperacao {
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

    if (erro instanceof ErroNaoEncontrado) {
      return {
        sucesso: false,
        erro: {
          mensagem: erro.message,
          tipo: "ErroNaoEncontrado",
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
