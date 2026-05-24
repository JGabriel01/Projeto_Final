"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControladorMulta = void 0;
const servico_multa_1 = __importDefault(require("../../negocio/servicos/servico-multa"));
class ControladorMulta {
    async obterPorId(req, res) {
        try {
            const { id } = req.params;
            const multa = await servico_multa_1.default.obterPorId(Number(id));
            if (!multa) {
                res.status(404).json({ erro: 'Multa não encontrada' });
                return;
            }
            res.status(200).json(multa);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async listar(req, res) {
        try {
            const multas = await servico_multa_1.default.listar();
            res.status(200).json(multas);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async listarPorUsuario(req, res) {
        try {
            const { usuarioId } = req.params;
            const multas = await servico_multa_1.default.listarPorUsuario(Number(usuarioId));
            res.status(200).json(multas);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async obterMultasNaoPagas(req, res) {
        try {
            const { usuarioId } = req.params;
            const multas = await servico_multa_1.default.obterMultasNaoPagas(Number(usuarioId));
            const total = await servico_multa_1.default.obterTotalMultasNaoPagas(Number(usuarioId));
            res.status(200).json({ multas, total });
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async pagarMulta(req, res) {
        try {
            const { id } = req.params;
            const multa = await servico_multa_1.default.pagarMulta(Number(id));
            res.status(200).json(multa);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}
exports.ControladorMulta = ControladorMulta;
exports.default = new ControladorMulta();
