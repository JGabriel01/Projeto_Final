"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositorioReserva = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RepositorioReserva {
    async criar(dados) {
        return (await prisma.reserva.create({
            data: {
                usuarioId: dados.usuarioId,
                livroId: dados.livroId,
                status: 'ativa',
            },
        }));
    }
    async obterPorId(id) {
        const resultado = await prisma.reserva.findUnique({
            where: { id },
        });
        return resultado ? resultado : null;
    }
    async listar() {
        const resultados = await prisma.reserva.findMany();
        return resultados.map((r) => r);
    }
    async listarPorUsuario(usuarioId) {
        const resultados = await prisma.reserva.findMany({
            where: { usuarioId },
        });
        return resultados.map((r) => r);
    }
    async listarAtivasPorLivro(livroId) {
        const resultados = await prisma.reserva.findMany({
            where: {
                livroId,
                status: 'ativa',
            },
            orderBy: {
                reservadoEm: 'asc',
            },
        });
        return resultados.map((r) => r);
    }
    async atualizarStatus(id, status) {
        return (await prisma.reserva.update({
            where: { id },
            data: { status },
        }));
    }
    async cancelar(id) {
        return this.atualizarStatus(id, 'cancelada');
    }
    async marcarComoRetirada(id) {
        return this.atualizarStatus(id, 'retirada');
    }
    async deletar(id) {
        await prisma.reserva.delete({
            where: { id },
        });
    }
}
exports.RepositorioReserva = RepositorioReserva;
exports.default = new RepositorioReserva();
