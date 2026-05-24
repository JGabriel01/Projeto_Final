"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoLivro = void 0;
const repositorio_livro_1 = __importDefault(require("../../persistencia/repositorios/repositorio-livro"));
const servico_armazenamento_1 = __importDefault(require("./servico-armazenamento"));
class ServicoLivro {
    async criar(dados, capaBuffer, arquivoBuffer) {
        let capa;
        let arquivo;
        // Se houver capa, fazer upload
        if (capaBuffer) {
            const nomeCapaUnico = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
            capa = await servico_armazenamento_1.default.enviarCapa(nomeCapaUnico, capaBuffer);
        }
        // Se houver arquivo PDF, fazer upload
        if (arquivoBuffer) {
            const nomeArquivoUnico = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
            arquivo = await servico_armazenamento_1.default.enviarLivroPDF(nomeArquivoUnico, arquivoBuffer);
        }
        return await repositorio_livro_1.default.criar({
            ...dados,
            capa,
            arquivo,
        });
    }
    async obterPorId(id) {
        return await repositorio_livro_1.default.obterPorId(id);
    }
    async listar() {
        return await repositorio_livro_1.default.listar();
    }
    async listarDisponiveis() {
        return await repositorio_livro_1.default.listarDisponiveis();
    }
    async buscar(termo) {
        // Buscar por título e autor
        const porTitulo = await repositorio_livro_1.default.buscarPorTitulo(termo);
        const porAutor = await repositorio_livro_1.default.buscarPorAutor(termo);
        // Combinar e remover duplicatas
        const livrosMap = new Map();
        [...porTitulo, ...porAutor].forEach((livro) => {
            livrosMap.set(livro.id, livro);
        });
        return Array.from(livrosMap.values());
    }
    async atualizar(id, dados, capaBuffer) {
        const livroAtual = await repositorio_livro_1.default.obterPorId(id);
        if (!livroAtual)
            throw new Error('Livro não encontrado');
        let capa = livroAtual.capa;
        // Se houver nova capa, deletar a antiga e enviar a nova
        if (capaBuffer) {
            if (livroAtual.capa) {
                const nomeCapaAntiga = livroAtual.capa.split('/')[1];
                await servico_armazenamento_1.default.deletarCapa(nomeCapaAntiga);
            }
            const nomeCapaUnico = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
            capa = await servico_armazenamento_1.default.enviarCapa(nomeCapaUnico, capaBuffer);
        }
        return await repositorio_livro_1.default.atualizar(id, {
            ...dados,
            capa,
        });
    }
    async obterArquivoParaLeitura(livroId) {
        const livro = await repositorio_livro_1.default.obterPorId(livroId);
        if (!livro)
            throw new Error('Livro não encontrado');
        if (!livro.arquivo) {
            throw new Error('Este livro não possui arquivo disponível para leitura');
        }
        // Extrair nome do arquivo da URL armazenada
        const nomeArquivo = livro.arquivo.split('/')[1];
        // Retornar URL temporária do MinIO (válida por 24 horas)
        return await servico_armazenamento_1.default.obterURLLivroPDFTemporaria(nomeArquivo, 24);
    }
    async deletar(id) {
        const livro = await repositorio_livro_1.default.obterPorId(id);
        if (!livro)
            throw new Error('Livro não encontrado');
        // Deletar capa se existir
        if (livro.capa) {
            const nomeCapaAntiga = livro.capa.split('/')[1];
            await servico_armazenamento_1.default.deletarCapa(nomeCapaAntiga);
        }
        // Deletar arquivo PDF se existir
        if (livro.arquivo) {
            const nomeArquivoAntigo = livro.arquivo.split('/')[1];
            await servico_armazenamento_1.default.deletarLivroPDF(nomeArquivoAntigo);
        }
        await repositorio_livro_1.default.deletar(id);
    }
}
exports.ServicoLivro = ServicoLivro;
exports.default = new ServicoLivro();
