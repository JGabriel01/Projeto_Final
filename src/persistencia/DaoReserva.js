import Reserva from '../models/Reserva.js'

export default class DaoReserva {
  constructor() {
    this.itens = []
    this._proximoId = 1
  }

  _gerarId() { return String(this._proximoId++) }

  criar(dados) {
    const r = dados instanceof Reserva ? dados : new Reserva(dados)
    if (!r.id) r.id = this._gerarId()
    this.itens.push(r)
    return r
  }

  listar() { return [...this.itens] }

  buscarPorId(id) { return this.itens.find(i => String(i.id) === String(id)) ?? null }

  buscarPorLivroId(livroId) { return this.itens.filter(i => i.livroId === livroId) }

  atualizar(id, patch) {
    const idx = this.itens.findIndex(i => String(i.id) === String(id))
    if (idx === -1) return null
    if (patch && typeof patch === 'object' && ('id' in patch) && !(patch instanceof Reserva)) {
      Object.assign(this.itens[idx], patch)
    } else if (patch instanceof Reserva) {
      this.itens[idx] = patch
    } else {
      Object.assign(this.itens[idx], patch)
    }
    return this.itens[idx]
  }

  remover(id) { const idx = this.itens.findIndex(i => String(i.id) === String(id)); if (idx === -1) return false; this.itens.splice(idx,1); return true }
}
