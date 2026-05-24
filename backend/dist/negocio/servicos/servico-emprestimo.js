"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoEmprestimo = void 0;
const repositorio_emprestimo_1 = __importDefault(require("../../persistencia/repositorios/repositorio-emprestimo"));
const repositorio_livro_1 = __importDefault(require("../../persistencia/repositorios/repositorio-livro"));
const repositorio_multa_1 = __importDefault(require("../../persistencia/repositorios/repositorio-multa"));
const MULTA_DIARIA = 5.0; // R$ 5,00 por dia de atraso
class ServicoEmprestimo {
    async criar(dados) {
        // Verifica se livro existe e está disponível
        const livro = await repositorio_livro_1.default.obterPorId(dados.livroId);
        if (!livro)
            throw new Error('Livro não encontrado');
        if (!livro.disponivel)
            throw new Error('Livro não está disponível');
        // Marca livro como indisponível
        await repositorio_livro_1.default.atualizarDisponibilidade(dados.livroId, false);
        // Cria empréstimo
        return await repositorio_emprestimo_1.default.criar(dados);
    }
    async obterPorId(id) {
        return await repositorio_emprestimo_1.default.obterPorId(id);
    }
    async listar() {
        return await repositorio_emprestimo_1.default.listar();
    }
    async listarPorUsuario(usuarioId) {
        return await repositorio_emprestimo_1.default.listarPorUsuario(usuarioId);
    }
    async devolver(id) {
        const emprestimo = await repositorio_emprestimo_1.default.obterPorId(id);
        if (!emprestimo)
            throw new Error('Empréstimo não encontrado');
        // Marca livro como disponível
        await repositorio_livro_1.default.atualizarDisponibilidade(emprestimo.livroId, true);
        // Verifica se há multa por atraso
        const hoje = new Date();
        if (hoje > emprestimo.dataVencimento) {
            const diasAtraso = Math.floor((hoje.getTime() - emprestimo.dataVencimento.getTime()) / (1000 * 60 * 60 * 24));
            const valorMulta = diasAtraso * MULTA_DIARIA;
            // Verifica se já existe multa para este empréstimo
            const multaExistente = await repositorio_multa_1.default.obterPorEmprestimo(id);
            if (!multaExistente) {
                await repositorio_multa_1.default.criar(emprestimo.usuarioId, id, valorMulta);
            }
        }
        return await repositorio_emprestimo_1.default.devolverLivro(id);
    }
    async renovar(id) {
        const emprestimo = await repositorio_emprestimo_1.default.obterPorId(id);
        if (!emprestimo)
            throw new Error('Empréstimo não encontrado');
        // Não pode renovar se já foi devolvido
        if (emprestimo.dataDevolucao) {
            throw new Error('Não é possível renovar um empréstimo já devolvido');
        }
        // Não pode renovar se está atrasado
        const hoje = new Date();
        if (hoje > emprestimo.dataVencimento) {
            throw new Error('Não é possível renovar um empréstimo atrasado. Devolva e pague a multa.');
        }
        return await repositorio_emprestimo_1.default.renovar(id, 14);
    }
    async validarLeitura(usuarioId, livroId) {
        // Buscar empréstimo ativo para este livro
        const emprestimos = await repositorio_emprestimo_1.default.listarPorUsuario(usuarioId);
        const emprestimoAtivo = emprestimos.find((e) => e.livroId === livroId && !e.dataDevolucao && e.dataVencimento >= new Date());
        if (!emprestimoAtivo) {
            throw new Error('Você precisa emprestar este livro para lê-lo');
        }
        return emprestimoAtivo;
    }
}
exports.ServicoEmprestimo = ServicoEmprestimo;
exports.default = new ServicoEmprestimo();
