// Classe Professor - Estende Usuario com campos específicos

import { Usuario } from "./Usuario.js";

export class Professor extends Usuario {
  #departamento: string;
  #matriculaProfessor: string;

  constructor(
    idUsuario: number,
    id: number,
    nome: string,
    email: string,
    senha: string,
    departamento: string,
    matriculaProfessor: string
  ) {
    super(idUsuario, nome, email, senha, "Professor");
    this.#departamento = departamento;
    this.#matriculaProfessor = matriculaProfessor;
  }

  get departamento(): string {
    return this.#departamento;
  }

  set departamento(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Departamento não pode estar vazio");
    }
    this.#departamento = value;
  }

  get matriculaProfessor(): string {
    return this.#matriculaProfessor;
  }

  set matriculaProfessor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Matrícula não pode estar vazia");
    }
    this.#matriculaProfessor = value;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      departamento: this.#departamento,
      matriculaProfessor: this.#matriculaProfessor,
    };
  }
}
