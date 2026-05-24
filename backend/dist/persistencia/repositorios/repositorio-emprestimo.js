"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositorioEmprestimo = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RepositorioEmprestimo {
    async criar(dados) {
        const dataEmprestimo = new Date();
        const dataVencimento = new Date();
        const diasEmprestimo = dados.diasEmprestimo || 14;
        dataVencimento.setDate(dataVencimento.getDate() + diasEmprestimo);
        return await prisma.emprestimo.create({
            data: {
                usuarioId: dados.usuarioId,
                livroId: dados.livroId,
                dataEmprestimo,
                dataVencimento,
            },
        });
    }
    async obterPorId(id) {
        return await prisma.emprestimo.findUnique({
            where: { id },
        });
    }
    async listar() {
        return await prisma.emprestimo.findMany();
    }
    async listarPorUsuario(usuarioId) {
        return await prisma.emprestimo.findMany({
            where: { usuarioId },
        });
    }
    async listarAtivos() {
        return await prisma.emprestimo.findMany({
            where: { dataDevolucao: null },
        });
    }
    async devolverLivro(id) {
        return await prisma.emprestimo.update({
            where: { id },
            data: { dataDevolucao: new Date() },
        });
    }
    async renovar(id, diasAdicionais = 14) {
        const emprestimo = await this.obterPorId(id);
        if (!emprestimo)
            throw new Error('Empréstimo não encontrado');
        const novaDataVencimento = new Date(emprestimo.dataVencimento);
        novaDataVencimento.setDate(novaDataVencimento.getDate() + diasAdicionais);
        return await prisma.emprestimo.update({
            where: { id },
            data: { dataVencimento: novaDataVencimento },
        });
    }
    async deletar(id) {
        await prisma.emprestimo.delete({
            where: { id },
        });
    }
}
exports.RepositorioEmprestimo = RepositorioEmprestimo;
exports.default = new RepositorioEmprestimo();
