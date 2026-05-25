import DaoMulta from '../persistencia/DaoMulta.js'

export default class NegociosMultas {
  constructor(dao = null) {
    this.dao = dao ?? new DaoMulta()
  }

  listar() { return this.dao.listar() }

  pagar(multaId) {
    const m = this.dao.buscarPorId(multaId)
    if (!m) throw new Error('Multa não encontrada')
    if (m.pago) throw new Error('Multa já paga')
    m.pago = true
    return this.dao.atualizar(multaId, m)
  }
}
