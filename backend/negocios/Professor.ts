// Especialização de Usuario com validações específicas
import { Usuario } from "./Usuario.js";
import { ErroUsuario, ErroValidacao } from "../excecoes/index.js";

export class Professor extends Usuario {
  #departamento: string;
  #matriculaProfessor: string;

  constructor(
    idUsuario: number,
    nome: string,
    email: string,
    senha: string,
    departamento: string,
    matriculaProfessor: string
  ) {
    super(idUsuario, nome, email, senha, "professor");
    
    // Validações específicas do Professor
    this.validarDepartamento(departamento);
    this.validarMatriculaProfessor(matriculaProfessor);

    this.#departamento = departamento;
    this.#matriculaProfessor = matriculaProfessor;
  }

  get departamento(): string {
    return this.#departamento;
  }

  set departamento(value: string) {
    this.validarDepartamento(value);
    this.#departamento = value;
  }

  get matriculaProfessor(): string {
    return this.#matriculaProfessor;
  }

  set matriculaProfessor(value: string) {
    this.validarMatriculaProfessor(value);
    this.#matriculaProfessor = value;
  }

  // Validações privadas
  private validarDepartamento(departamento: string): void {
    if (!departamento || typeof departamento !== "string") {
      throw new ErroUsuario("Departamento é obrigatório e deve ser uma string");
    }
    if (departamento.trim().length === 0) {
      throw new ErroUsuario("Departamento não pode estar vazio");
    }
    if (departamento.trim().length < 3) {
      throw new ErroUsuario("Departamento deve ter pelo menos 3 caracteres");
    }
    if (departamento.trim().length > 100) {
      throw new ErroUsuario("Departamento não pode exceder 100 caracteres");
    }
  }

  private validarMatriculaProfessor(matricula: string): void {
    if (!matricula || typeof matricula !== "string") {
      throw new ErroValidacao("Matrícula é obrigatória e deve ser uma string");
    }
    if (matricula.trim().length === 0) {
      throw new ErroValidacao("Matrícula não pode estar vazia");
    }
    if (matricula.trim().length < 5) {
      throw new ErroValidacao("Matrícula deve ter pelo menos 5 caracteres");
    }
    if (matricula.trim().length > 50) {
      throw new ErroValidacao("Matrícula não pode exceder 50 caracteres");
    }
    // Validar formato: alfanumérico
    if (!/^[a-zA-Z0-9]+$/.test(matricula.trim())) {
      throw new ErroValidacao("Matrícula deve conter apenas letras e números");
    }
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      departamento: this.#departamento,
      matriculaProfessor: this.#matriculaProfessor,
    };
  }
}
