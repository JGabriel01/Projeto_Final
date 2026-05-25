class Livro {
  #id
  #titulo
  #autor
  #genero
  #ano
  #sinopse

  constructor({ id = null, titulo, autor, genero, ano, sinopse = '' }) {
    this.#id = id
    this.titulo = titulo
    this.autor = autor
    this.genero = genero
    this.ano = ano
    this.sinopse = sinopse
  }

  get id() {
    return this.#id
  }
  set id(v) {
    this.#id = v
  }

  get titulo() {
    return this.#titulo
  }
  set titulo(v) {
    if (!v || typeof v !== 'string' || v.trim().length < 1) {
      throw new Error('Título é obrigatório')
    }
    this.#titulo = v
  }

  get autor() {
    return this.#autor
  }
  set autor(v) {
    if (!v || typeof v !== 'string' || v.trim().length < 1) {
      throw new Error('Autor é obrigatório')
    }
    this.#autor = v
  }

  get genero() {
    return this.#genero
  }
  set genero(v) {
    if (!v || typeof v !== 'string') {
      throw new Error('Gênero inválido')
    }
    this.#genero = v
  }

  get ano() {
    return this.#ano
  }
  set ano(v) {
    const n = Number(v)
    if (!Number.isInteger(n) || n < 0 || n > new Date().getFullYear()) {
      throw new Error('Ano inválido')
    }
    this.#ano = n
  }

  get sinopse() {
    return this.#sinopse
  }
  set sinopse(v) {
    this.#sinopse = v ?? ''
  }
}

export default Livro

// serialização simples
Livro.prototype.toJSON = function() {
  return {
    id: this.id,
    titulo: this.titulo,
    autor: this.autor,
    genero: this.genero,
    ano: this.ano,
    sinopse: this.sinopse,
  }
}
