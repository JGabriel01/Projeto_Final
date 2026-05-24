"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controlador_reserva_1 = __importDefault(require("../controladores/controlador-reserva"));
const autenticacao_1 = require("../middlewares/autenticacao");
const rotasReserva = (0, express_1.Router)();
// Todas as rotas de reserva requerem autenticação
rotasReserva.use(autenticacao_1.middlewareAutenticacao);
// GET - Listar todas as reservas
rotasReserva.get('/', (req, res) => controlador_reserva_1.default.listar(req, res));
// GET - Obter reserva por ID
rotasReserva.get('/:id', (req, res) => controlador_reserva_1.default.obterPorId(req, res));
// GET - Listar reservas de um usuário
rotasReserva.get('/usuario/:usuarioId', (req, res) => controlador_reserva_1.default.listarPorUsuario(req, res));
// GET - Obter fila de reservas de um livro
rotasReserva.get('/livro/:livroId/fila', (req, res) => controlador_reserva_1.default.obterFilaPorLivro(req, res));
// POST - Criar nova reserva
rotasReserva.post('/', (req, res) => controlador_reserva_1.default.criar(req, res));
// PUT - Cancelar reserva
rotasReserva.put('/:id/cancelar', (req, res) => controlador_reserva_1.default.cancelar(req, res));
// PUT - Marcar como retirada
rotasReserva.put('/:id/retirada', (req, res) => controlador_reserva_1.default.marcarComoRetirada(req, res));
exports.default = rotasReserva;
