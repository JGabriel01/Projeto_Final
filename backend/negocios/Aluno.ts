// Especialização de Usuario com validações específicas
import { Usuario } from "./Usuario.js";
import { ErroUsuario, ErroValidacao } from "../excecoes/index.js";

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
    
    // Validações específicas do Aluno
    this.validarAnoIngresso(anoIngresso);
    this.validarCurso(curso);
    this.validarMatriculaAluno(matriculaAluno);

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

  // Setters com validações
  set anoIngresso(ano: number) {
    this.validarAnoIngresso(ano);
    this.#anoIngresso = ano;
  }

  set curso(curso: string) {
    this.validarCurso(curso);
    this.#curso = curso;
  }

  set matriculaAluno(matricula: string) {
    this.validarMatriculaAluno(matricula);
    this.#matriculaAluno = matricula;
  }

  // Validações privadas
  private validarAnoIngresso(ano: number): void {
    if (typeof ano !== "number") {
      throw new ErroUsuario("Ano de ingresso deve ser um número");
    }
    const anoAtual = new Date().getFullYear();
    const anoMinimo = 1900;
    if (ano < anoMinimo || ano > anoAtual) {
      throw new ErroUsuario(`Ano de ingresso deve estar entre ${anoMinimo} e ${anoAtual}`);
    }
  }

  private validarCurso(curso: string): void {
    if (!curso || typeof curso !== "string") {
      throw new ErroUsuario("Curso é obrigatório e deve ser uma string");
    }
    if (curso.trim().length < 3) {
      throw new ErroUsuario("Curso deve ter pelo menos 3 caracteres");
    }
    if (curso.trim().length > 100) {
      throw new ErroUsuario("Curso não pode exceder 100 caracteres");
    }
  }

  private validarMatriculaAluno(matricula: string): void {
    if (!matricula || typeof matricula !== "string") {
      throw new ErroValidacao("Matrícula é obrigatória e deve ser uma string");
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
