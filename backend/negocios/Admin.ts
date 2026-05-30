/**
 * Classe Admin - Estende Usuario
 * Herda encapsulamento de Usuario e adiciona campos específicos
 */

import { Usuario } from "./Usuario.js";

export class Admin extends Usuario {
  #idAdmin: number;
  #cargo: string;

  constructor(
    idAdmin: number,
    idUsuario: number,
    nome: string,
    email: string,
    senha: string,
    cargo: string
  ) {
    super(idUsuario, nome, email, senha, "admin");
    this.#idAdmin = idAdmin;
    this.#cargo = cargo;
  }

  // Getters
  get idAdmin(): number {
    return this.#idAdmin;
  }

  get cargo(): string {
    return this.#cargo;
  }

  // Setters
  set cargo(cargo: string) {
    if (cargo.length < 3) {
      throw new Error("Cargo deve ter nome válido");
    }
    this.#cargo = cargo;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      idAdmin: this.#idAdmin,
      cargo: this.#cargo,
    };
  }
}
