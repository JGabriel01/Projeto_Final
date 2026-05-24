"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositorioLivro = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RepositorioLivro {
    async criar(dados) {
        return await prisma.livro.create({
            data: {
                titulo: dados.titulo,
                autor: dados.autor,
                genero: dados.genero,
                ano: dados.ano,
                sinopse: dados.sinopse,
                capa: dados.capa,
                arquivo: dados.arquivo,
                disponivel: true,
            },
        });
    }
    async obterPorId(id) {
        return await prisma.livro.findUnique({
            where: { id },
        });
    }
    async listar() {
        return await prisma.livro.findMany();
    }
    async listarDisponiveis() {
        return await prisma.livro.findMany({
            where: { disponivel: true },
        });
    }
    async buscarPorTitulo(titulo) {
        return await prisma.livro.findMany({
            where: {
                titulo: {
                    contains: titulo,
                },
            },
        });
    }
    async buscarPorAutor(autor) {
        return await prisma.livro.findMany({
            where: {
                autor: {
                    contains: autor,
                },
            },
        });
    }
    async atualizar(id, dados) {
        return await prisma.livro.update({
            where: { id },
            data: dados,
        });
    }
    async deletar(id) {
        await prisma.livro.delete({
            where: { id },
        });
    }
    async atualizarDisponibilidade(id, disponivel) {
        return await prisma.livro.update({
            where: { id },
            data: { disponivel },
        });
    }
}
exports.RepositorioLivro = RepositorioLivro;
exports.default = new RepositorioLivro();
