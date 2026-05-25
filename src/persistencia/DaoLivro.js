export default class DaoLivro {
  constructor() {
    this.itens = []
    this._proximoId = 1
  }

  _gerarId() {
    return String(this._proximoId++)
  }

  criar(livro) {
    if (!livro.id) livro.id = this._gerarId()
    this.itens.push(livro)
    return livro
  }

  listar() {
    return [...this.itens]
  }

  buscarPorId(id) {
    return this.itens.find((i) => String(i.id) === String(id)) ?? null
  }

  buscarPorTitulo(titulo) {
    return this.itens.filter(l => l.titulo && l.titulo.toLowerCase().includes(String(titulo).toLowerCase()))
  }

  buscarPorAutor(autor) {
    return this.itens.filter(l => l.autor && l.autor.toLowerCase().includes(String(autor).toLowerCase()))
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
