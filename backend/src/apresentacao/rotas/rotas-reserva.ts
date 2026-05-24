import { Router } from 'express';
import controladorReserva from '../controladores/controlador-reserva';
import { middlewareAutenticacao } from '../middlewares/autenticacao';

const rotasReserva = Router();

// Todas as rotas de reserva requerem autenticação
rotasReserva.use(middlewareAutenticacao);

// GET - Listar todas as reservas
rotasReserva.get('/', (req, res) => controladorReserva.listar(req, res));

// GET - Obter reserva por ID
rotasReserva.get('/:id', (req, res) =>
  controladorReserva.obterPorId(req, res)
);

// GET - Listar reservas de um usuário
rotasReserva.get('/usuario/:usuarioId', (req, res) =>
  controladorReserva.listarPorUsuario(req, res)
);

// GET - Obter fila de reservas de um livro
rotasReserva.get('/livro/:livroId/fila', (req, res) =>
  controladorReserva.obterFilaPorLivro(req, res)
);

// POST - Criar nova reserva
rotasReserva.post('/', (req, res) => controladorReserva.criar(req, res));

// PUT - Cancelar reserva
rotasReserva.put('/:id/cancelar', (req, res) =>
  controladorReserva.cancelar(req, res)
);

// PUT - Marcar como retirada
rotasReserva.put('/:id/retirada', (req, res) =>
  controladorReserva.marcarComoRetirada(req, res)
);

export default rotasReserva;
