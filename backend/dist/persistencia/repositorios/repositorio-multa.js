"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositorioMulta = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RepositorioMulta {
    async criar(usuarioId, emprestimoId, valorMulta) {
        return await prisma.multa.create({
            data: {
                usuarioId,
                emprestimoId,
                valorMulta,
            },
        });
    }
    async obterPorId(id) {
        return await prisma.multa.findUnique({
            where: { id },
        });
    }
    async listar() {
        return await prisma.multa.findMany();
    }
    async listarPorUsuario(usuarioId) {
        return await prisma.multa.findMany({
            where: { usuarioId },
        });
    }
    async listarNaoPagas() {
        return await prisma.multa.findMany({
            where: { pago: false },
        });
    }
    async listarNaoPagasPorUsuario(usuarioId) {
        return await prisma.multa.findMany({
            where: {
                usuarioId,
                pago: false,
            },
        });
    }
    async obterPorEmprestimo(emprestimoId) {
        return await prisma.multa.findUnique({
            where: { emprestimoId },
        });
    }
    async marcarComoPaga(id) {
        return await prisma.multa.update({
            where: { id },
            data: { pago: true },
        });
    }
    async deletar(id) {
        await prisma.multa.delete({
            where: { id },
        });
    }
}
exports.RepositorioMulta = RepositorioMulta;
exports.default = new RepositorioMulta();
