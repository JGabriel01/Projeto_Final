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
    matriculaProfessor: string,
    fotoPerfilUrl?: string,
    fundoPerfilUrl?: string
  ) {
    super(idUsuario, nome, email, senha, "professor", fotoPerfilUrl, fundoPerfilUrl);
    
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
    if (!/^P\d{8}$/.test(matricula.trim().toUpperCase())) {
      throw new ErroValidacao("Matrícula de professor deve seguir o padrão P20260001");
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
