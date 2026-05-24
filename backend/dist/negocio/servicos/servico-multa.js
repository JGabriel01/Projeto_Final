"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoMulta = void 0;
const repositorio_multa_1 = __importDefault(require("../../persistencia/repositorios/repositorio-multa"));
class ServicoMulta {
    async obterPorId(id) {
        return await repositorio_multa_1.default.obterPorId(id);
    }
    async listar() {
        return await repositorio_multa_1.default.listar();
    }
    async listarPorUsuario(usuarioId) {
        return await repositorio_multa_1.default.listarPorUsuario(usuarioId);
    }
    async obterMultasNaoPagas(usuarioId) {
        return await repositorio_multa_1.default.listarNaoPagasPorUsuario(usuarioId);
    }
    async obterTotalMultasNaoPagas(usuarioId) {
        const multas = await this.obterMultasNaoPagas(usuarioId);
        return multas.reduce((total, multa) => total + multa.valorMulta, 0);
    }
    async pagarMulta(id) {
        const multa = await repositorio_multa_1.default.obterPorId(id);
        if (!multa)
            throw new Error('Multa não encontrada');
        if (multa.pago)
            throw new Error('Esta multa já foi paga');
        return await repositorio_multa_1.default.marcarComoPaga(id);
    }
    async deletar(id) {
        await repositorio_multa_1.default.deletar(id);
    }
}
exports.ServicoMulta = ServicoMulta;
exports.default = new ServicoMulta();
