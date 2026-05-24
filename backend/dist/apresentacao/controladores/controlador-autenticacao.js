"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControladorAutenticacao = void 0;
const servico_autenticacao_1 = __importDefault(require("../../negocio/servicos/servico-autenticacao"));
const validadores_1 = require("../../utilitarios/validadores");
class ControladorAutenticacao {
    async registrar(req, res) {
        try {
            const validacao = (0, validadores_1.validarCamposObrigatorios)(req.body, ['nome', 'email', 'senha']);
            if (!validacao.valido) {
                res.status(422).json({
                    erro: `Campos obrigatórios faltando: ${validacao.faltando?.join(', ')}`,
                });
                return;
            }
            const resultado = await servico_autenticacao_1.default.registrar(req.body);
            res.status(201).json(resultado);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async login(req, res) {
        try {
            const validacao = (0, validadores_1.validarCamposObrigatorios)(req.body, ['email', 'senha']);
            if (!validacao.valido) {
                res.status(422).json({
                    erro: `Campos obrigatórios faltando: ${validacao.faltando?.join(', ')}`,
                });
                return;
            }
            const resultado = await servico_autenticacao_1.default.login(req.body);
            res.status(200).json(resultado);
        }
        catch (erro) {
            res.status(401).json({ erro: erro.message });
        }
    }
    async obterPerfil(req, res) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                res.status(401).json({ erro: 'Usuário não autenticado' });
                return;
            }
            const usuario = await servico_autenticacao_1.default.obterPerfil(usuarioId);
            res.status(200).json(usuario);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}
exports.ControladorAutenticacao = ControladorAutenticacao;
exports.default = new ControladorAutenticacao();
