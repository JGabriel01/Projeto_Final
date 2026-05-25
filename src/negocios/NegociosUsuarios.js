import DaoUsuario from '../persistencia/DaoUsuario.js'
import Usuario from '../models/Usuario.js'

export default class NegociosUsuarios {
  constructor(dao = null) {
    this.dao = dao ?? new DaoUsuario()
  }

  criar(dadosUsuario) {
    // validação de negócio: email único
    const existente = this.dao.buscarPorEmail(dadosUsuario.email)
    if (existente) throw new Error('Email já cadastrado')
    const usuario = new Usuario(dadosUsuario)
    return this.dao.criar(usuario)
  }

  listar() {
    return this.dao.listar()
  }

  buscarPorId(id) {
    return this.dao.buscarPorId(id)
  }

  autenticar(email, senhaHash) {
    const usuario = this.dao.buscarPorEmail(email)
    if (!usuario) throw new Error('Credenciais inválidas')
    // aqui usamos comparação simples (senha já é fornecida como hash no projeto)
    if (usuario.senhaHash !== senhaHash) throw new Error('Credenciais inválidas')
    return usuario
  }
}
