"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoReserva = void 0;
const repositorio_reserva_1 = __importDefault(require("../../persistencia/repositorios/repositorio-reserva"));
const repositorio_livro_1 = __importDefault(require("../../persistencia/repositorios/repositorio-livro"));
class ServicoReserva {
    async criar(dados) {
        // Verifica se livro existe
        const livro = await repositorio_livro_1.default.obterPorId(dados.livroId);
        if (!livro)
            throw new Error('Livro não encontrado');
        // Verifica se livro já está reservado pelo mesmo usuário
        const reservasExistentes = await repositorio_reserva_1.default.listarAtivasPorLivro(dados.livroId);
        const jaReservado = reservasExistentes.some((r) => r.usuarioId === dados.usuarioId);
        if (jaReservado) {
            throw new Error('Você já tem uma reserva ativa para este livro');
        }
        return await repositorio_reserva_1.default.criar(dados);
    }
    async obterPorId(id) {
        return await repositorio_reserva_1.default.obterPorId(id);
    }
    async listar() {
        return await repositorio_reserva_1.default.listar();
    }
    async listarPorUsuario(usuarioId) {
        return await repositorio_reserva_1.default.listarPorUsuario(usuarioId);
    }
    async obterFilaPorLivro(livroId) {
        return await repositorio_reserva_1.default.listarAtivasPorLivro(livroId);
    }
    async cancelar(id) {
        const reserva = await repositorio_reserva_1.default.obterPorId(id);
        if (!reserva)
            throw new Error('Reserva não encontrada');
        return await repositorio_reserva_1.default.cancelar(id);
    }
    async marcarComoRetirada(id) {
        const reserva = await repositorio_reserva_1.default.obterPorId(id);
        if (!reserva)
            throw new Error('Reserva não encontrada');
        return await repositorio_reserva_1.default.marcarComoRetirada(id);
    }
    async obterProximaReserva(livroId) {
        const filas = await this.obterFilaPorLivro(livroId);
        return filas.length > 0 ? filas[0] : null;
    }
}
exports.ServicoReserva = ServicoReserva;
exports.default = new ServicoReserva();
