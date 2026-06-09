// Especialização de Usuario com validações específicas
import { Usuario } from "./Usuario.js";
import { ErroUsuario, ErroValidacao } from "../excecoes/index.js";

export class Admin extends Usuario {
  #cargo: string;

  constructor(
    idUsuario: number,
    nome: string,
    email: string,
    senha: string,
    cargo: string,
    fotoPerfilUrl?: string,
    fundoPerfilUrl?: string
  ) {
    super(idUsuario, nome, email, senha, "admin", fotoPerfilUrl, fundoPerfilUrl);
    
    // Validações específicas do Admin
    this.validarCargo(cargo);
    
    this.#cargo = cargo;
  }

  get cargo(): string {
    return this.#cargo;
  }

  // Setters com validações
  set cargo(cargo: string) {
    this.validarCargo(cargo);
    this.#cargo = cargo;
  }

  // Validações privadas
  private validarCargo(cargo: string): void {
    if (!cargo || typeof cargo !== "string") {
      throw new ErroUsuario("Cargo é obrigatório e deve ser uma string");
    }
    if (cargo.trim().length < 3) {
      throw new ErroUsuario("Cargo deve ter pelo menos 3 caracteres");
    }
    if (cargo.trim().length > 100) {
      throw new ErroUsuario("Cargo não pode exceder 100 caracteres");
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      cargo: this.#cargo,
    };
  }
}
