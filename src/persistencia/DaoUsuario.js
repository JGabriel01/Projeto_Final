export default class DaoUsuario {
  constructor() {
    this.itens = []
    this._proximoId = 1
  }

  _gerarId() {
    return String(this._proximoId++)
  }

  criar(usuario) {
    // poderia validar unicidade de email aqui
    if (!usuario.id) usuario.id = this._gerarId()
    this.itens.push(usuario)
    return usuario
  }

  listar() {
    return [...this.itens]
  }

  buscarPorId(id) {
    return this.itens.find((i) => String(i.id) === String(id)) ?? null
  }

  buscarPorEmail(email) {
    return this.itens.find(u => u.email === email) ?? null
  }

  atualizar(id, patch) {
    const idx = this.itens.findIndex((i) => String(i.id) === String(id))
    if (idx === -1) return null
    Object.assign(this.itens[idx], patch)
    return this.itens[idx]
  }

  remover(id) {
    const idx = this.itens.findIndex((i) => String(i.id) === String(id))
    if (idx === -1) return false
    this.itens.splice(idx, 1)
    return true
  }
}
