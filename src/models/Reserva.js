class Reserva {
  #id
  #livroId
  #usuarioId
  #dataReserva
  #status

  constructor({ id = null, livroId, usuarioId, dataReserva = new Date(), status = 'ativa' }) {
    this.#id = id
    this.livroId = livroId
    this.usuarioId = usuarioId
    this.dataReserva = dataReserva
    this.status = status
  }

  get id() { return this.#id }
  set id(v) { this.#id = v }

  get livroId() { return this.#livroId }
  set livroId(v) { if (!v) throw new Error('livroId é obrigatório'); this.#livroId = v }

  get usuarioId() { return this.#usuarioId }
  set usuarioId(v) { if (!v) throw new Error('usuarioId é obrigatório'); this.#usuarioId = v }

  get dataReserva() { return this.#dataReserva }
  set dataReserva(v) { const d = new Date(v); if (isNaN(d)) throw new Error('dataReserva inválida'); this.#dataReserva = d }

  get status() { return this.#status }
  set status(v) { if (!['ativa','cancelada','concluida'].includes(v)) throw new Error('status inválido'); this.#status = v }
}

export default Reserva

Reserva.prototype.toJSON = function() {
  return {
    id: this.id,
    livroId: this.livroId,
    usuarioId: this.usuarioId,
    dataReserva: this.dataReserva,
    status: this.status,
  }
}
