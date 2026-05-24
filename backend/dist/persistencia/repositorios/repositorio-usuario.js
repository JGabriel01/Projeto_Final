"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositorioUsuario = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RepositorioUsuario {
    async criar(dados) {
        return await prisma.usuario.create({
            data: {
                nome: dados.nome,
                email: dados.email,
                senha: dados.senha,
            },
        });
    }
    async obterPorEmail(email) {
        return await prisma.usuario.findUnique({
            where: { email },
        });
    }
    async obterPorId(id) {
        return await prisma.usuario.findUnique({
            where: { id },
        });
    }
    async listar() {
        return await prisma.usuario.findMany();
    }
    async atualizar(id, dados) {
        return await prisma.usuario.update({
            where: { id },
            data: dados,
        });
    }
    async deletar(id) {
        await prisma.usuario.delete({
            where: { id },
        });
    }
}
exports.RepositorioUsuario = RepositorioUsuario;
exports.default = new RepositorioUsuario();
