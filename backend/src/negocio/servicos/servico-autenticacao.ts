import bcrypt from 'bcryptjs';
import { gerarToken } from '../../utilitarios/autenticacao';
import { validarEmail, validarSenha } from '../../utilitarios/validadores';
import repositorioUsuario from '../../persistencia/repositorios/repositorio-usuario';
import { RegistrarDTO, LoginDTO, TokenResponse } from '../../modelos/tipos';

export class ServicoAutenticacao {
  async registrar(dados: RegistrarDTO): Promise<TokenResponse> {
    // Validações
    if (!validarEmail(dados.email)) {
      throw new Error('Email inválido');
    }

    const validacaoSenha = validarSenha(dados.senha);
    if (!validacaoSenha.valida) {
      throw new Error(validacaoSenha.erro);
    }

    // Verifica se email já existe
    const usuarioExistente = await repositorioUsuario.obterPorEmail(dados.email);
    if (usuarioExistente) {
      throw new Error('Email já cadastrado');
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(dados.senha, 10);

    // Criar usuário
    const usuario = await repositorioUsuario.criar({
      ...dados,
      senha: senhaHash,
    });

    // Gerar token
    const token = gerarToken({ id: usuario.id, email: usuario.email });

    // Retornar sem a senha
    const { senha, ...usuarioSemSenha } = usuario;

    return {
      token,
      usuario: usuarioSemSenha,
    };
  }

  async login(dados: LoginDTO): Promise<TokenResponse> {
    // Buscar usuário
    const usuario = await repositorioUsuario.obterPorEmail(dados.email);
    if (!usuario) {
      throw new Error('Email ou senha inválidos');
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(dados.senha, usuario.senha);
    if (!senhaValida) {
      throw new Error('Email ou senha inválidos');
    }

    // Gerar token
    const token = gerarToken({ id: usuario.id, email: usuario.email });

    // Retornar sem a senha
    const { senha, ...usuarioSemSenha } = usuario;

    return {
      token,
      usuario: usuarioSemSenha,
    };
  }

  async obterPerfil(usuarioId: number) {
    const usuario = await repositorioUsuario.obterPorId(usuarioId);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }
}

export default new ServicoAutenticacao();
