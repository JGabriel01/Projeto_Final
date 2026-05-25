import DaoLivro from '../persistencia/DaoLivro.js'
import Livro from '../models/Livro.js'

export default class NegociosLivros {
  constructor(dao = null) {
    this.dao = dao ?? new DaoLivro()
  }

  criar(dadosLivro) {
    // validações de negócio adicionais podem ser adicionadas aqui
    // exemplo: impedir duplicidade exata por título+autor
    const existentes = this.dao.buscarPorTitulo(dadosLivro.titulo || '')
    if (existentes && existentes.some(e => e.autor === dadosLivro.autor)) {
      throw new Error('Livro duplicado (mesmo título e autor)')
    }
    const livro = new Livro(dadosLivro)
    return this.dao.criar(livro)
  }

  listar() {
    return this.dao.listar()
  }

  buscar(id) {
    return this.dao.buscarPorId(id)
  }

  atualizar(id, patch) {
    const existente = this.buscar(id)
    if (!existente) throw new Error('Livro não encontrado')
    const clone = {
      id: existente.id,
      titulo: existente.titulo,
      autor: existente.autor,
      genero: existente.genero,
      ano: existente.ano,
      sinopse: existente.sinopse,
      ...patch,
    }
    const validado = new Livro(clone)
    return this.dao.atualizar(id, validado)
  }

  remover(id) {
    const ok = this.dao.remover(id)
    if (!ok) throw new Error('Livro não encontrado')
    return ok
  }
}
