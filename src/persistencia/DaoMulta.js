import Multa from '../models/Multa.js'

export default class DaoMulta {
  constructor() {
    this.itens = []
    this._proximoId = 1
  }

  _gerarId() { return String(this._proximoId++) }

  criar(dados) {
    const m = dados instanceof Multa ? dados : new Multa(dados)
    if (!m.id) m.id = this._gerarId()
    this.itens.push(m)
    return m
  }

  listar() { return [...this.itens] }

  buscarPorId(id) { return this.itens.find(i => String(i.id) === String(id)) ?? null }

  buscarPorEmprestimoId(emprestimoId) { return this.itens.filter(i => i.emprestimoId === emprestimoId) }

  atualizar(id, patch) {
    const idx = this.itens.findIndex(i => String(i.id) === String(id))
    if (idx === -1) return null
    // se patch for instância, substituir por ela mantendo id
    if (patch && typeof patch === 'object' && ('id' in patch) && !(patch instanceof Multa)) {
      Object.assign(this.itens[idx], patch)
    } else if (patch instanceof Multa) {
      this.itens[idx] = patch
    } else {
      Object.assign(this.itens[idx], patch)
    }
    return this.itens[idx]
  }

  remover(id) { const idx = this.itens.findIndex(i => String(i.id) === String(id)); if (idx === -1) return false; this.itens.splice(idx,1); return true }
}
