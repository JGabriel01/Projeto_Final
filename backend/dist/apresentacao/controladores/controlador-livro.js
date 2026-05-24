"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControladorLivro = void 0;
const servico_livro_1 = __importDefault(require("../../negocio/servicos/servico-livro"));
const servico_emprestimo_1 = __importDefault(require("../../negocio/servicos/servico-emprestimo"));
const validadores_1 = require("../../utilitarios/validadores");
class ControladorLivro {
    async criar(req, res) {
        try {
            const validacao = (0, validadores_1.validarCamposObrigatorios)(req.body, [
                'titulo',
                'autor',
                'genero',
                'ano',
                'sinopse',
            ]);
            if (!validacao.valido) {
                res.status(422).json({
                    erro: `Campos obrigatórios faltando: ${validacao.faltando?.join(', ')}`,
                });
                return;
            }
            // Pegue arquivos da requisição se existirem
            const arquivos = req.files;
            const capaBuffer = arquivos?.capa?.[0]?.buffer;
            const arquivoBuffer = arquivos?.arquivo?.[0]?.buffer;
            const livro = await servico_livro_1.default.criar(req.body, capaBuffer, arquivoBuffer);
            res.status(201).json(livro);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async obterPorId(req, res) {
        try {
            const { id } = req.params;
            const livro = await servico_livro_1.default.obterPorId(Number(id));
            if (!livro) {
                res.status(404).json({ erro: 'Livro não encontrado' });
                return;
            }
            res.status(200).json(livro);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async listar(req, res) {
        try {
            const livros = await servico_livro_1.default.listar();
            res.status(200).json(livros);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async listarDisponiveis(req, res) {
        try {
            const livros = await servico_livro_1.default.listarDisponiveis();
            res.status(200).json(livros);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async buscar(req, res) {
        try {
            const { termo } = req.query;
            if (!termo || typeof termo !== 'string') {
                res.status(422).json({ erro: 'Termo de busca é obrigatório' });
                return;
            }
            const livros = await servico_livro_1.default.buscar(termo);
            res.status(200).json(livros);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const capaBuffer = req.file?.buffer;
            const livro = await servico_livro_1.default.atualizar(Number(id), req.body, capaBuffer);
            res.status(200).json(livro);
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async deletar(req, res) {
        try {
            const { id } = req.params;
            await servico_livro_1.default.deletar(Number(id));
            res.status(204).send();
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
    async obterArquivoParaLeitura(req, res) {
        try {
            const { id } = req.params;
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                res.status(401).json({ erro: 'Usuário não autenticado' });
                return;
            }
            // Validar se usuário tem empréstimo ativo do livro
            await servico_emprestimo_1.default.validarLeitura(usuarioId, Number(id));
            // Obter URL temporária do arquivo
            const urlArquivo = await servico_livro_1.default.obterArquivoParaLeitura(Number(id));
            res.status(200).json({
                url: urlArquivo,
                mensagem: 'URL de acesso gerada com sucesso. Válida por 24 horas.',
            });
        }
        catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}
exports.ControladorLivro = ControladorLivro;
exports.default = new ControladorLivro();
