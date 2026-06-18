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

  private normalizarMatricula(matricula: string): string {
    return String(matricula || "").trim().toUpperCase();
  }

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
        throw new ErroValidacao("Todos os campos são obrigatórios");
      }
      const matriculaNormalizada = this.normalizarMatricula(matriculaAluno);

      const usuarioExistente = await this.repositorioUsuarios.buscarPorEmail(email);
      if (usuarioExistente) {
        throw new ErroDuplicado(`E-mail ${email} já está cadastrado`);
      }

      const alunoExistente =
        await this.repositorioUsuarios.buscarAlunoPorMatricula(matriculaNormalizada);
      if (alunoExistente) {
        throw new ErroDuplicado(`Matrícula ${matriculaNormalizada} já está cadastrada`);
      }

      const aluno = new Aluno(
        0,
        nome,
        email,
        senha,
        anoIngresso,
        curso,
        matriculaNormalizada
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
        throw new ErroValidacao("Todos os campos são obrigatórios");
      }
      const matriculaNormalizada = this.normalizarMatricula(matriculaProfessor);

      const usuarioExistente = await this.repositorioUsuarios.buscarPorEmail(email);
      if (usuarioExistente) {
        throw new ErroDuplicado(`E-mail ${email} já está cadastrado`);
      }

      const professorExistente =
        await this.repositorioUsuarios.buscarProfessorPorMatricula(
          matriculaNormalizada
        );
      if (professorExistente) {
        throw new ErroDuplicado(
          `Matrícula de professor ${matriculaNormalizada} já está cadastrada`
        );
      }

      const professor = new Professor(
        0,
        nome,
        email,
        senha,
        departamento,
        matriculaNormalizada
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
        throw new ErroValidacao("Todos os campos são obrigatórios");
      }

      const usuarioExistente = await this.repositorioUsuarios.buscarPorEmail(email);
      if (usuarioExistente) {
        throw new ErroDuplicado(`E-mail ${email} já está cadastrado`);
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
        throw new ErroValidacao("ID deve ser um número positivo");
      }

      const usuario = await this.repositorioUsuarios.buscarPorId(id);
      if (!usuario) {
        throw new ErroNaoEncontrado(`Usuário com ID ${id} não encontrado`);
      }

      return { sucesso: true, dados: usuario };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao buscar usuário");
    }
  }

  async buscarPublicoPorId(id: number): Promise<ResultadoOperacao<UsuarioPublico>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um número positivo");
      }

      const usuario = await this.repositorioUsuarios.buscarPorId(id);
      if (!usuario) {
        throw new ErroNaoEncontrado(`Usuário com ID ${id} não encontrado`);
      }

      return { sucesso: true, dados: this.formatarUsuarioPublico(usuario) };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao buscar usuário");
    }
  }

  async listarTodos(): Promise<ResultadoOperacao<Usuario[]>> {
    try {
      const usuarios = await this.repositorioUsuarios.listarTodos();
      return { sucesso: true, dados: usuarios };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao listar usuários");
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
      return this.tratarErro(erro, "Erro ao listar usuários");
    }
  }

  async atualizarUsuario(
    id: number,
    dados: {
      nome?: string;
      email?: string;
      senha?: string;
      cargo?: string;
      anoIngresso?: number;
      curso?: string;
      departamento?: string;
    }
  ): Promise<ResultadoOperacao<Usuario>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um número positivo");
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
        throw new ErroNaoEncontrado(`Usuário com ID ${id} não encontrado`);
      }

      if (dados.cargo !== undefined && usuarioExistente.nivelAcesso !== "admin") {
        throw new ErroValidacao("Cargo só pode ser alterado para administradores");
      }

      if (
        (dados.anoIngresso !== undefined || dados.curso !== undefined) &&
        usuarioExistente.nivelAcesso !== "aluno"
      ) {
        throw new ErroValidacao("Curso e ano de ingresso só podem ser alterados para alunos");
      }

      if (dados.departamento !== undefined && usuarioExistente.nivelAcesso !== "professor") {
        throw new ErroValidacao("Departamento só pode ser alterado para professores");
      }

      if (
        dados.anoIngresso !== undefined &&
        (!Number.isInteger(dados.anoIngresso) ||
          dados.anoIngresso < 1900 ||
          dados.anoIngresso > new Date().getFullYear())
      ) {
        throw new ErroValidacao("Ano de ingresso inválido");
      }

      if (
        dados.curso !== undefined &&
        (typeof dados.curso !== "string" ||
          dados.curso.trim().length < 3 ||
          dados.curso.trim().length > 100)
      ) {
        throw new ErroValidacao("Curso deve ter entre 3 e 100 caracteres");
      }

      if (
        dados.departamento !== undefined &&
        (typeof dados.departamento !== "string" ||
          dados.departamento.trim().length < 3 ||
          dados.departamento.trim().length > 100)
      ) {
        throw new ErroValidacao("Departamento deve ter entre 3 e 100 caracteres");
      }

      const usuarioAtualizado = await this.repositorioUsuarios.atualizar(id, dados);
      if (!usuarioAtualizado) {
        throw new ErroNaoEncontrado(`Usuário com ID ${id} não encontrado`);
      }

      return { sucesso: true, dados: usuarioAtualizado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao atualizar usuário");
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
        throw new ErroValidacao("ID deve ser um número positivo");
      }

      if (!imagens.fotoPerfilUrl && !imagens.fundoPerfilUrl) {
        throw new ErroValidacao("Envie pelo menos uma imagem de perfil");
      }

      const usuarioAtualizado =
        await this.repositorioUsuarios.atualizarImagensPerfil(id, imagens);
      if (!usuarioAtualizado) {
        throw new ErroNaoEncontrado(`Usuário com ID ${id} não encontrado`);
      }

      return { sucesso: true, dados: usuarioAtualizado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao atualizar imagens de perfil");
    }
  }

  async removerImagemPerfil(
    id: number,
    tipo: "foto" | "fundo" | "todas"
  ): Promise<ResultadoOperacao<Usuario>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um número positivo");
      }

      const imagens: {
        fotoPerfilUrl?: string | null;
        fotoPerfilObjeto?: string | null;
        fundoPerfilUrl?: string | null;
        fundoPerfilObjeto?: string | null;
      } = {};

      if (tipo === "foto" || tipo === "todas") {
        imagens.fotoPerfilUrl = null;
        imagens.fotoPerfilObjeto = null;
      }

      if (tipo === "fundo" || tipo === "todas") {
        imagens.fundoPerfilUrl = null;
        imagens.fundoPerfilObjeto = null;
      }

      const usuarioAtualizado =
        await this.repositorioUsuarios.atualizarImagensPerfil(id, imagens);
      if (!usuarioAtualizado) {
        throw new ErroNaoEncontrado(`Usuário com ID ${id} não encontrado`);
      }

      return { sucesso: true, dados: usuarioAtualizado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao remover imagem de perfil");
    }
  }

  async excluirUsuario(id: number): Promise<ResultadoOperacao<{ id: number }>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("A chave primária idUsuario deve ser um número positivo");
      }

      const excluiu = await this.repositorioUsuarios.deletar(id);
      if (!excluiu) {
        throw new ErroNaoEncontrado(`Cadastro com ID ${id} não encontrado`);
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
        throw new ErroValidacao("E-mail e senha são obrigatórios");
      }

      const usuario = await this.repositorioUsuarios.autenticar(email, senha);
      if (!usuario) {
        throw new ErroAutenticacao("E-mail ou senha inválidos");
      }

      return { sucesso: true, dados: usuario };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro na autenticação");
    }
  }

  async verificarEmailRecuperacao(
    email: string
  ): Promise<ResultadoOperacao<{ email: string }>> {
    try {
      if (!email) {
        throw new ErroValidacao("E-mail é obrigatório");
      }

      const usuario = await this.repositorioUsuarios.buscarPorEmail(email);
      if (!usuario) {
        throw new ErroNaoEncontrado("Funcionário não encontrado");
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
        throw new ErroValidacao("E-mail e nova senha são obrigatórios");
      }

      const usuario = await this.repositorioUsuarios.buscarPorEmail(email);
      if (!usuario) {
        throw new ErroNaoEncontrado("Funcionário não encontrado");
      }

      usuario.senha = senha;

      const usuarioAtualizado = await this.repositorioUsuarios.atualizar(
        usuario.idUsuario,
        { senha }
      );
      if (!usuarioAtualizado) {
        throw new ErroNaoEncontrado("Funcionário não encontrado");
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
