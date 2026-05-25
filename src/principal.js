import NegociosLivros from './negocios/NegociosLivros.js'
import NegociosUsuarios from './negocios/NegociosUsuarios.js'
import NegociosEmprestimos from './negocios/NegociosEmprestimos.js'
import NegociosReservas from './negocios/NegociosReservas.js'
import NegociosMultas from './negocios/NegociosMultas.js'

function principal() {
  console.log('Inicializando demo - Sistema de Biblioteca (Entrega 1) - camada de negócios')

  const negociosUsuarios = new NegociosUsuarios()
  try {
    negociosUsuarios.criar({ id: 'u1', email: 'admin@biblioteca.com', senhaHash: 'admin123', papel: 'admin' })
    negociosUsuarios.criar({ id: 'u2', email: 'user@biblioteca.com', senhaHash: 'usuario1', papel: 'usuario' })
    console.log('Usuários criados: admin@biblioteca.com, user@biblioteca.com')
  } catch (err) {
    console.error('Erro ao criar usuário de exemplo:', err.message)
  }

  const negociosLivros = new NegociosLivros()
  const negociosEmprestimos = new NegociosEmprestimos(null, negociosLivros.dao)
  const negociosReservas = new NegociosReservas(null, negociosLivros.dao)
  const negociosMultas = new NegociosMultas()

  try {
    negociosLivros.criar({ titulo: 'Dom Casmurro', autor: 'Machado de Assis', genero: 'Romance', ano: 1899, sinopse: 'Um clássico da literatura brasileira.' })
    negociosLivros.criar({ titulo: '1984', autor: 'George Orwell', genero: 'Distopia', ano: 1949, sinopse: 'Visão sombria de um futuro totalitário.' })
    negociosLivros.criar({ titulo: 'Clean Code', autor: 'Robert C. Martin', genero: 'Tecnologia', ano: 2008, sinopse: 'Boas práticas de programação.' })
  } catch (err) {
    console.error('Erro ao cadastrar livro:', err.message)
  }

  console.log('\nLista de livros:')
  console.table(negociosLivros.listar().map(l => ({ id: l.id, titulo: l.titulo, autor: l.autor, ano: l.ano })))

  try {
    const todos = negociosLivros.listar()
    const primeiroId = todos[0].id
    negociosLivros.atualizar(primeiroId, { ano: 1900 })
    console.log('\nApós atualização:')
    console.table(negociosLivros.listar().map(l => ({ id: l.id, titulo: l.titulo, autor: l.autor, ano: l.ano })))
  } catch (err) {
    console.error('Erro ao atualizar:', err.message)
  }

  try {
    const todos = negociosLivros.listar()
    const ultimoId = todos[todos.length - 1].id
    negociosLivros.remover(ultimoId)
    console.log('\nApós remoção do último livro:')
    console.table(negociosLivros.listar().map(l => ({ id: l.id, titulo: l.titulo })))
  } catch (err) {
    console.error('Erro ao remover:', err.message)
  }

  // Demonstrar empréstimo + devolução (possível multa)
  try {
    const livroId = negociosLivros.listar()[0].id
    const usuarioId = 'u2'
    const emp = negociosEmprestimos.emprestar({ livroId, usuarioId, dias: 0 }) // dias=0 para forçar devolução atrasada
    console.log('\nEmpréstimo criado:', emp.id, 'previsto:', emp.dataDevolucaoPrevista)
    // simular devolução (imediata, já atrasada)
    const resultado = negociosEmprestimos.devolver(emp.id)
    console.log('Devolução realizada. Multa criada:', !!resultado.multa)
    if (resultado.multa) console.table([{ id: resultado.multa.id, valor: resultado.multa.valor, pago: resultado.multa.pago }])
  } catch (err) {
    console.error('Erro no fluxo de empréstimo/devolução:', err.message)
  }

  // Demonstrar reserva
  try {
    const livroId = negociosLivros.listar()[0].id
    const reserva = negociosReservas.criar({ livroId, usuarioId: 'u2' })
    console.log('\nReserva criada:', reserva.id)
  } catch (err) {
    console.error('Erro ao criar reserva:', err.message)
  }

}

principal()
