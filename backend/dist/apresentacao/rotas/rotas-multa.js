"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controlador_multa_1 = __importDefault(require("../controladores/controlador-multa"));
const autenticacao_1 = require("../middlewares/autenticacao");
const rotasMulta = (0, express_1.Router)();
// Todas as rotas de multa requerem autenticação
rotasMulta.use(autenticacao_1.middlewareAutenticacao);
// GET - Listar todas as multas
rotasMulta.get('/', (req, res) => controlador_multa_1.default.listar(req, res));
// GET - Obter multa por ID
rotasMulta.get('/:id', (req, res) => controlador_multa_1.default.obterPorId(req, res));
// GET - Listar multas de um usuário
rotasMulta.get('/usuario/:usuarioId', (req, res) => controlador_multa_1.default.listarPorUsuario(req, res));
// GET - Obter multas não pagas de um usuário
rotasMulta.get('/usuario/:usuarioId/nao-pagas', (req, res) => controlador_multa_1.default.obterMultasNaoPagas(req, res));
// PUT - Pagar multa
rotasMulta.put('/:id/pagar', (req, res) => controlador_multa_1.default.pagarMulta(req, res));
exports.default = rotasMulta;
