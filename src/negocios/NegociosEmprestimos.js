import DaoEmprestimo from '../persistencia/DaoEmprestimo.js'
import DaoLivro from '../persistencia/DaoLivro.js'
import DaoMulta from '../persistencia/DaoMulta.js'
import Emprestimo from '../models/Emprestimo.js'
import Multa from '../models/Multa.js'

export default class NegociosEmprestimos {
  constructor(daoEmp = null, daoLivro = null, daoMulta = null) {
    this.daoEmp = daoEmp ?? new DaoEmprestimo()
    this.daoLivro = daoLivro ?? new DaoLivro()
    this.daoMulta = daoMulta ?? new DaoMulta()
  }

  emprestar({ livroId, usuarioId, dias = 7 }) {
    // checar se livro existe
    const livro = this.daoLivro.buscarPorId(livroId)
    if (!livro) throw new Error('Livro não encontrado')

    // checar se já há emprestimo ativo para o mesmo livro
    const ativos = this.daoEmp.buscarPorLivroId(livroId).filter(e => e.status === 'emprestado')
    if (ativos.length > 0) throw new Error('Livro já está emprestado')

    const dataEmp = new Date()
    const dataPrev = new Date(dataEmp)
    dataPrev.setDate(dataPrev.getDate() + dias)

    const emprestimo = new Emprestimo({ livroId, usuarioId, dataEmprestimo: dataEmp, dataDevolucaoPrevista: dataPrev })
    return this.daoEmp.criar(emprestimo)
  }

  devolver(emprestimoId) {
    const emp = this.daoEmp.buscarPorId(emprestimoId)
    if (!emp) throw new Error('Empréstimo não encontrado')
    if (emp.status === 'devolvido') throw new Error('Empréstimo já devolvido')

    const hoje = new Date()
    emp.dataDevolucaoReal = hoje
    emp.status = 'devolvido'
    this.daoEmp.atualizar(emprestimoId, emp)

    // calcular multa se atrasado
    const prevista = emp.dataDevolucaoPrevista
    let multa = null
    if (prevista && hoje > prevista) {
      const diasAtraso = Math.ceil((hoje - prevista) / (1000 * 60 * 60 * 24))
      const valor = diasAtraso * 1.0 // R$1 por dia (exemplo)
      multa = new Multa({ emprestimoId: emp.id, valor, pago: false })
      this.daoMulta.criar(multa)
    }

    return { emprestimo: emp, multa }
  }

  listar() { return this.daoEmp.listar() }
  buscarPorId(id) { return this.daoEmp.buscarPorId(id) }
}
