"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const controlador_livro_1 = __importDefault(require("../controladores/controlador-livro"));
const autenticacao_1 = require("../middlewares/autenticacao");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const rotasLivro = (0, express_1.Router)();
// Públicas
rotasLivro.get('/', (req, res) => controlador_livro_1.default.listar(req, res));
rotasLivro.get('/disponiveis', (req, res) => controlador_livro_1.default.listarDisponiveis(req, res));
rotasLivro.get('/buscar', (req, res) => controlador_livro_1.default.buscar(req, res));
rotasLivro.get('/:id', (req, res) => controlador_livro_1.default.obterPorId(req, res));
// Autenticadas
rotasLivro.post('/', autenticacao_1.middlewareAutenticacao, upload.fields([{ name: 'capa', maxCount: 1 }, { name: 'arquivo', maxCount: 1 }]), (req, res) => controlador_livro_1.default.criar(req, res));
rotasLivro.put('/:id', autenticacao_1.middlewareAutenticacao, upload.single('capa'), (req, res) => controlador_livro_1.default.atualizar(req, res));
rotasLivro.get('/:id/ler', autenticacao_1.middlewareAutenticacao, (req, res) => controlador_livro_1.default.obterArquivoParaLeitura(req, res));
rotasLivro.delete('/:id', autenticacao_1.middlewareAutenticacao, (req, res) => controlador_livro_1.default.deletar(req, res));
exports.default = rotasLivro;
