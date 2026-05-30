/**
 * Classe Aluno - Estende Usuario
 * Herda encapsulamento de Usuario e adiciona campos específicos
 */

import { Usuario } from "./Usuario.js";

export class Aluno extends Usuario {
  #idAluno: number;
  #anoIngresso: number;
  #curso: string;
  #matriculaAluno: string;

  constructor(
    idAluno: number,
    idUsuario: number,
    nome: string,
    email: string,
    senha: string,
    anoIngresso: number,
    curso: string,
    matriculaAluno: string
  ) {
    super(idUsuario, nome, email, senha, "aluno");
    this.#idAluno = idAluno;
    this.#anoIngresso = anoIngresso;
    this.#curso = curso;
    this.#matriculaAluno = matriculaAluno;
  }

  // Getters
  get idAluno(): number {
    return this.#idAluno;
  }

  get anoIngresso(): number {
    return this.#anoIngresso;
  }

  get curso(): string {
    return this.#curso;
  }

  get matriculaAluno(): string {
    return this.#matriculaAluno;
  }

  // Setters
  set anoIngresso(ano: number) {
    if (ano < 1900 || ano > new Date().getFullYear()) {
      throw new Error("Ano de ingresso inválido");
    }
    this.#anoIngresso = ano;
  }

  set curso(curso: string) {
    if (curso.length < 3) {
      throw new Error("Curso deve ter nome válido");
    }
    this.#curso = curso;
  }

  set matriculaAluno(matricula: string) {
    if (matricula.length < 5) {
      throw new Error("Matrícula inválida");
    }
    this.#matriculaAluno = matricula;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      idAluno: this.#idAluno,
      anoIngresso: this.#anoIngresso,
      curso: this.#curso,
      matriculaAluno: this.#matriculaAluno,
    };
  }
}
