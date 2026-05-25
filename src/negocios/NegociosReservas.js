import DaoReserva from '../persistencia/DaoReserva.js'
import DaoLivro from '../persistencia/DaoLivro.js'
import Reserva from '../models/Reserva.js'

export default class NegociosReservas {
  constructor(dao = null, daoLivro = null) {
    this.dao = dao ?? new DaoReserva()
    this.daoLivro = daoLivro ?? new DaoLivro()
  }

  criar({ livroId, usuarioId }) {
    const livro = this.daoLivro.buscarPorId(livroId)
    if (!livro) throw new Error('Livro não encontrado')

    // permitir múltiplas reservas; regras podem ser alteradas
    const reserva = new Reserva({ livroId, usuarioId })
    return this.dao.criar(reserva)
  }

  cancelar(reservaId) {
    const r = this.dao.buscarPorId(reservaId)
    if (!r) throw new Error('Reserva não encontrada')
    r.status = 'cancelada'
    return this.dao.atualizar(reservaId, r)
  }

  listar() { return this.dao.listar() }
}
