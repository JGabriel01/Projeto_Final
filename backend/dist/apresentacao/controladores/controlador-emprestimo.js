"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControladorEmprestimo = void 0;
const servico_emprestimo_1 = __importDefault(require("../../negocio/servicos/servico-emprestimo"));
const validadores_1 = require("../../utilitarios/validadores");
class ControladorEmprestimo {
    async criar(req, res) {
        try {
            const validacao = (0, validadores_1.validarCamposObrigatorios)(req.body, ['usuarioId', 'livroId']);
            if (!validacao.valido) {
                res.status(422).json({
                    erro: `Campos obrigatórios faltando: ${validacao.faltando?.join(', ')}`,
                });
                return;
            }
            const emprestimo = await servico_emprestimo_1.default.criar(req.body);
            res.status(201).json(emprestimo);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async obterPorId(req, res) {
        try {
            const { id } = req.params;
            const emprestimo = await servico_emprestimo_1.default.obterPorId(Number(id));
            if (!emprestimo) {
                res.status(404).json({ erro: 'Empréstimo não encontrado' });
                return;
            }
            res.status(200).json(emprestimo);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async listar(req, res) {
        try {
            const emprestimos = await servico_emprestimo_1.default.listar();
            res.status(200).json(emprestimos);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async listarPorUsuario(req, res) {
        try {
            const { usuarioId } = req.params;
            const emprestimos = await servico_emprestimo_1.default.listarPorUsuario(Number(usuarioId));
            res.status(200).json(emprestimos);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async devolver(req, res) {
        try {
            const { id } = req.params;
            const emprestimo = await servico_emprestimo_1.default.devolver(Number(id));
            res.status(200).json(emprestimo);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async renovar(req, res) {
        try {
            const { id } = req.params;
            const emprestimo = await servico_emprestimo_1.default.renovar(Number(id));
            res.status(200).json(emprestimo);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}
exports.ControladorEmprestimo = ControladorEmprestimo;
exports.default = new ControladorEmprestimo();
