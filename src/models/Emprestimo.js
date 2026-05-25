class Emprestimo {
  #id
  #livroId
  #usuarioId
  #dataEmprestimo
  #dataDevolucaoPrevista
  #dataDevolucaoReal
  #status

  constructor({ id = null, livroId, usuarioId, dataEmprestimo = new Date(), dataDevolucaoPrevista = null, dataDevolucaoReal = null, status = 'emprestado' }) {
    this.#id = id
    this.livroId = livroId
    this.usuarioId = usuarioId
    this.dataEmprestimo = dataEmprestimo
    this.dataDevolucaoPrevista = dataDevolucaoPrevista
    this.dataDevolucaoReal = dataDevolucaoReal
    this.status = status
  }

  get id() { return this.#id }
  set id(v) { this.#id = v }

  get livroId() { return this.#livroId }
  set livroId(v) {
    if (!v) throw new Error('livroId é obrigatório')
    this.#livroId = v
  }

  get usuarioId() { return this.#usuarioId }
  set usuarioId(v) {
    if (!v) throw new Error('usuarioId é obrigatório')
    this.#usuarioId = v
  }

  get dataEmprestimo() { return this.#dataEmprestimo }
  set dataEmprestimo(v) {
    const d = new Date(v)
    if (isNaN(d)) throw new Error('dataEmprestimo inválida')
    this.#dataEmprestimo = d
  }

  get dataDevolucaoPrevista() { return this.#dataDevolucaoPrevista }
  set dataDevolucaoPrevista(v) {
    if (v === null) { this.#dataDevolucaoPrevista = null; return }
    const d = new Date(v)
    if (isNaN(d)) throw new Error('dataDevolucaoPrevista inválida')
    this.#dataDevolucaoPrevista = d
  }

  get dataDevolucaoReal() { return this.#dataDevolucaoReal }
  set dataDevolucaoReal(v) {
    if (v === null) { this.#dataDevolucaoReal = null; return }
    const d = new Date(v)
    if (isNaN(d)) throw new Error('dataDevolucaoReal inválida')
    this.#dataDevolucaoReal = d
  }

  get status() { return this.#status }
  set status(v) {
    if (!['emprestado', 'devolvido'].includes(v)) throw new Error('status inválido')
    this.#status = v
  }
}

export default Emprestimo

Emprestimo.prototype.toJSON = function() {
  return {
    id: this.id,
    livroId: this.livroId,
    usuarioId: this.usuarioId,
    dataEmprestimo: this.dataEmprestimo,
    dataDevolucaoPrevista: this.dataDevolucaoPrevista,
    dataDevolucaoReal: this.dataDevolucaoReal,
    status: this.status,
  }
}
