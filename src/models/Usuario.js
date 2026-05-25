class Usuario {
  #id
  #email
  #senhaHash
  #papel
  #nome
  #telefone

  constructor({ id = null, email, senhaHash, papel = 'usuario', nome = '', telefone = '' }) {
    this.#id = id
    this.email = email
    this.senhaHash = senhaHash
    this.papel = papel
    this.nome = nome
    this.telefone = telefone
  }

  get id() { return this.#id }
  set id(v) { this.#id = v }

  get email() { return this.#email }
  set email(v) {
    if (!v || typeof v !== 'string' || !v.includes('@')) throw new Error('Email inválido')
    this.#email = v
  }

  get senhaHash() { return this.#senhaHash }
  set senhaHash(v) {
    if (!v || typeof v !== 'string' || v.length < 6) throw new Error('senhaHash inválida (mínimo 6 caracteres)')
    this.#senhaHash = v
  }

  get papel() { return this.#papel }
  set papel(v) {
    if (!['usuario', 'admin'].includes(v)) throw new Error('Papel inválido')
    this.#papel = v
  }

  get nome() { return this.#nome }
  set nome(v) { this.#nome = v == null ? '' : String(v).trim() }

  get telefone() { return this.#telefone }
  set telefone(v) { this.#telefone = v == null ? '' : String(v).trim() }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      senhaHash: this.senhaHash,
      papel: this.papel,
      telefone: this.telefone,
    }
  }
}

export default Usuario
