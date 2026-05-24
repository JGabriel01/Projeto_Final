"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControladorReserva = void 0;
const servico_reserva_1 = __importDefault(require("../../negocio/servicos/servico-reserva"));
const validadores_1 = require("../../utilitarios/validadores");
class ControladorReserva {
    async criar(req, res) {
        try {
            const validacao = (0, validadores_1.validarCamposObrigatorios)(req.body, ['usuarioId', 'livroId']);
            if (!validacao.valido) {
                res.status(422).json({
                    erro: `Campos obrigatórios faltando: ${validacao.faltando?.join(', ')}`,
                });
                return;
            }
            const reserva = await servico_reserva_1.default.criar(req.body);
            res.status(201).json(reserva);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async obterPorId(req, res) {
        try {
            const { id } = req.params;
            const reserva = await servico_reserva_1.default.obterPorId(Number(id));
            if (!reserva) {
                res.status(404).json({ erro: 'Reserva não encontrada' });
                return;
            }
            res.status(200).json(reserva);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async listar(req, res) {
        try {
            const reservas = await servico_reserva_1.default.listar();
            res.status(200).json(reservas);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async listarPorUsuario(req, res) {
        try {
            const { usuarioId } = req.params;
            const reservas = await servico_reserva_1.default.listarPorUsuario(Number(usuarioId));
            res.status(200).json(reservas);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async obterFilaPorLivro(req, res) {
        try {
            const { livroId } = req.params;
            const fila = await servico_reserva_1.default.obterFilaPorLivro(Number(livroId));
            res.status(200).json(fila);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async cancelar(req, res) {
        try {
            const { id } = req.params;
            const reserva = await servico_reserva_1.default.cancelar(Number(id));
            res.status(200).json(reserva);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async marcarComoRetirada(req, res) {
        try {
            const { id } = req.params;
            const reserva = await servico_reserva_1.default.marcarComoRetirada(Number(id));
            res.status(200).json(reserva);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}
exports.ControladorReserva = ControladorReserva;
exports.default = new ControladorReserva();
