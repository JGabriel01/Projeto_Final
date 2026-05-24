"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controlador_emprestimo_1 = __importDefault(require("../controladores/controlador-emprestimo"));
const autenticacao_1 = require("../middlewares/autenticacao");
const rotasEmprestimo = (0, express_1.Router)();
// Todas as rotas de empréstimo requerem autenticação
rotasEmprestimo.use(autenticacao_1.middlewareAutenticacao);
// GET - Listar todos os empréstimos
rotasEmprestimo.get('/', (req, res) => controlador_emprestimo_1.default.listar(req, res));
// GET - Obter empréstimo por ID
rotasEmprestimo.get('/:id', (req, res) => controlador_emprestimo_1.default.obterPorId(req, res));
// GET - Listar empréstimos de um usuário
rotasEmprestimo.get('/usuario/:usuarioId', (req, res) => controlador_emprestimo_1.default.listarPorUsuario(req, res));
// POST - Criar novo empréstimo
rotasEmprestimo.post('/', (req, res) => controlador_emprestimo_1.default.criar(req, res));
// PUT - Devolver livro (finalizar empréstimo)
rotasEmprestimo.put('/:id/devolver', (req, res) => controlador_emprestimo_1.default.devolver(req, res));
// PUT - Renovar empréstimo
rotasEmprestimo.put('/:id/renovar', (req, res) => controlador_emprestimo_1.default.renovar(req, res));
exports.default = rotasEmprestimo;
