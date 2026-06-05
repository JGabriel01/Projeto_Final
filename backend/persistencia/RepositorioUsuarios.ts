// Repositório de Usuários - Persistência com Prisma

import { prisma } from "../config/prismaClient.js";
import { Usuario } from "../negocios/Usuario.js";
import { Aluno } from "../negocios/Aluno.js";
import { Professor } from "../negocios/Professor.js";
import { Admin } from "../negocios/Admin.js";

export class RepositorioUsuarios {
  private criarAlunoDoDb(data: any): Aluno {
    return new Aluno(
      data.aluno?.id_aluno || 0,
      data.id_usuario,
      data.nome,
      data.email,
      data.senha,
      data.aluno?.ano_ingresso || 0,
      data.aluno?.curso || "",
      data.aluno?.matricula_aluno || ""
    );
  }

  private criarProfessorDoDb(data: any): Professor {
    return new Professor(
      data.professor?.id_professor || 0,
      data.id_usuario,
      data.nome,
      data.email,
      data.senha,
      data.professor?.departamento || "",
      data.professor?.matricula_professor || ""
    );
  }

  private criarAdminDoDb(data: any): Admin {
    return new Admin(
      data.admin?.id_admin || 0,
      data.id_usuario,
      data.nome,
      data.email,
      data.senha,
      data.admin?.cargo || ""
    );
  }

  async adicionarAluno(aluno: Aluno): Promise<Aluno> {
    const usuarioCriado = await prisma.usuario.create({
      data: {
        nome: aluno.nome,
        email: aluno.email,
        senha: aluno.senha,
        nivel_acesso: "aluno",
        aluno: {
          create: {
            ano_ingresso: aluno.anoIngresso,
            curso: aluno.curso,
            matricula_aluno: aluno.matriculaAluno,
          },
        },
      },
      include: { aluno: true },
    });
    return this.criarAlunoDoDb(usuarioCriado);
  }

  async adicionarProfessor(professor: Professor): Promise<Professor> {
    const usuarioCriado = await prisma.usuario.create({
      data: {
        nome: professor.nome,
        email: professor.email,
        senha: professor.senha,
        nivel_acesso: "professor",
        professor: {
          create: {
            departamento: professor.departamento,
            matricula_professor: professor.matriculaProfessor,
          },
        },
      },
      include: { professor: true },
    });
    return this.criarProfessorDoDb(usuarioCriado);
  }

  async adicionarAdmin(admin: Admin): Promise<Admin> {
    const usuarioCriado = await prisma.usuario.create({
      data: {
        nome: admin.nome,
        email: admin.email,
        senha: admin.senha,
        nivel_acesso: "admin",
        admin: {
          create: {
            cargo: admin.cargo,
          },
        },
      },
      include: { admin: true },
    });
    return this.criarAdminDoDb(usuarioCriado);
  }

  async buscarPorId(id: number): Promise<Usuario | undefined> {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: { aluno: true, professor: true, admin: true },
    });
    if (!usuario) return undefined;
    if (usuario.nivel_acesso === "aluno") return this.criarAlunoDoDb(usuario);
    if (usuario.nivel_acesso === "professor") return this.criarProfessorDoDb(usuario);
    if (usuario.nivel_acesso === "admin") return this.criarAdminDoDb(usuario);
    return undefined;
  }

  async buscarPorEmail(email: string): Promise<Usuario | undefined> {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { aluno: true, professor: true, admin: true },
    });
    if (!usuario) return undefined;
    if (usuario.nivel_acesso === "aluno") return this.criarAlunoDoDb(usuario);
    if (usuario.nivel_acesso === "professor") return this.criarProfessorDoDb(usuario);
    if (usuario.nivel_acesso === "admin") return this.criarAdminDoDb(usuario);
    return undefined;
  }

  async buscarAlunoPorMatricula(matriculaAluno: string): Promise<Aluno | undefined> {
    const aluno = await prisma.aluno.findUnique({
      where: { matricula_aluno: matriculaAluno },
      include: { usuario: true },
    });
    if (!aluno) return undefined;
    return new Aluno(
      aluno.id_aluno,
      aluno.usuario.id_usuario,
      aluno.usuario.nome,
      aluno.usuario.email,
      aluno.usuario.senha,
      aluno.ano_ingresso,
      aluno.curso,
      aluno.matricula_aluno
    );
  }

  async buscarProfessorPorMatricula(
    matriculaProfessor: string
  ): Promise<Professor | undefined> {
    const professor = await prisma.professor.findUnique({
      where: { matricula_professor: matriculaProfessor },
      include: { usuario: true },
    });
    if (!professor) return undefined;
    return new Professor(
      professor.id_professor,
      professor.usuario.id_usuario,
      professor.usuario.nome,
      professor.usuario.email,
      professor.usuario.senha,
      professor.departamento,
      professor.matricula_professor
    );
  }

  async listarAlunos(): Promise<Aluno[]> {
    const usuarios = await prisma.usuario.findMany({
      where: { nivel_acesso: "aluno" },
      include: { aluno: true },
    });
    return usuarios.map((u) => this.criarAlunoDoDb(u));
  }

  async listarProfessores(): Promise<Professor[]> {
    const usuarios = await prisma.usuario.findMany({
      where: { nivel_acesso: "professor" },
      include: { professor: true },
    });
    return usuarios.map((u) => this.criarProfessorDoDb(u));
  }

  async listarAdmins(): Promise<Admin[]> {
    const usuarios = await prisma.usuario.findMany({
      where: { nivel_acesso: "admin" },
      include: { admin: true },
    });
    return usuarios.map((u) => this.criarAdminDoDb(u));
  }

  async listarTodos(): Promise<Usuario[]> {
    const usuarios = await prisma.usuario.findMany({
      include: { aluno: true, professor: true, admin: true },
    });
    const resultado = usuarios
      .map((u) => {
        if (u.nivel_acesso === "aluno") return this.criarAlunoDoDb(u);
        if (u.nivel_acesso === "professor") return this.criarProfessorDoDb(u);
        if (u.nivel_acesso === "admin") return this.criarAdminDoDb(u);
        return null;
      })
      .filter((u) => u !== null) as (Aluno | Professor | Admin)[];
    return resultado;
  }

  async autenticar(email: string, senha: string): Promise<Usuario | null> {
    const usuario = await this.buscarPorEmail(email);
    if (usuario && usuario.autenticar(email, senha)) {
      return usuario;
    }
    return null;
  }

  async contar(): Promise<number> {
    return await prisma.usuario.count();
  }
}
