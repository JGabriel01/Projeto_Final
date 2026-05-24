"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoAutenticacao = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const autenticacao_1 = require("../../utilitarios/autenticacao");
const validadores_1 = require("../../utilitarios/validadores");
const repositorio_usuario_1 = __importDefault(require("../../persistencia/repositorios/repositorio-usuario"));
class ServicoAutenticacao {
    async registrar(dados) {
        // Validações
        if (!(0, validadores_1.validarEmail)(dados.email)) {
            throw new Error('Email inválido');
        }
        const validacaoSenha = (0, validadores_1.validarSenha)(dados.senha);
        if (!validacaoSenha.valida) {
            throw new Error(validacaoSenha.erro);
        }
        // Verifica se email já existe
        const usuarioExistente = await repositorio_usuario_1.default.obterPorEmail(dados.email);
        if (usuarioExistente) {
            throw new Error('Email já cadastrado');
        }
        // Hash da senha
        const senhaHash = await bcryptjs_1.default.hash(dados.senha, 10);
        // Criar usuário
        const usuario = await repositorio_usuario_1.default.criar({
            ...dados,
            senha: senhaHash,
        });
        // Gerar token
        const token = (0, autenticacao_1.gerarToken)({ id: usuario.id, email: usuario.email });
        // Retornar sem a senha
        const { senha, ...usuarioSemSenha } = usuario;
        return {
            token,
            usuario: usuarioSemSenha,
        };
    }
    async login(dados) {
        // Buscar usuário
        const usuario = await repositorio_usuario_1.default.obterPorEmail(dados.email);
        if (!usuario) {
            throw new Error('Email ou senha inválidos');
        }
        // Verificar senha
        const senhaValida = await bcryptjs_1.default.compare(dados.senha, usuario.senha);
        if (!senhaValida) {
            throw new Error('Email ou senha inválidos');
        }
        // Gerar token
        const token = (0, autenticacao_1.gerarToken)({ id: usuario.id, email: usuario.email });
        // Retornar sem a senha
        const { senha, ...usuarioSemSenha } = usuario;
        return {
            token,
            usuario: usuarioSemSenha,
        };
    }
    async obterPerfil(usuarioId) {
        const usuario = await repositorio_usuario_1.default.obterPorId(usuarioId);
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }
        const { senha, ...usuarioSemSenha } = usuario;
        return usuarioSemSenha;
    }
}
exports.ServicoAutenticacao = ServicoAutenticacao;
exports.default = new ServicoAutenticacao();
