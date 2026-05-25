class Multa {
  #id
  #emprestimoId
  #valor
  #pago

  constructor({ id = null, emprestimoId, valor = 0, pago = false }) {
    this.#id = id
    this.emprestimoId = emprestimoId
    this.valor = valor
    this.pago = pago
  }

  get id() { return this.#id }
  set id(v) { this.#id = v }

  get emprestimoId() { return this.#emprestimoId }
  set emprestimoId(v) { if (!v) throw new Error('emprestimoId é obrigatório'); this.#emprestimoId = v }

  get valor() { return this.#valor }
  set valor(v) { const n = Number(v); if (isNaN(n) || n < 0) throw new Error('valor inválido'); this.#valor = n }

  get pago() { return this.#pago }
  set pago(v) { this.#pago = !!v }
}

export default Multa

Multa.prototype.toJSON = function() {
  return {
    id: this.id,
    emprestimoId: this.emprestimoId,
    valor: this.valor,
    pago: this.pago,
  }
}
