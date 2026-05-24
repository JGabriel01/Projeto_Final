import { Router } from 'express';
import controladorMulta from '../controladores/controlador-multa';
import { middlewareAutenticacao } from '../middlewares/autenticacao';

const rotasMulta = Router();

// Todas as rotas de multa requerem autenticação
rotasMulta.use(middlewareAutenticacao);

// GET - Listar todas as multas
rotasMulta.get('/', (req, res) => controladorMulta.listar(req, res));

// GET - Obter multa por ID
rotasMulta.get('/:id', (req, res) => controladorMulta.obterPorId(req, res));

// GET - Listar multas de um usuário
rotasMulta.get('/usuario/:usuarioId', (req, res) =>
  controladorMulta.listarPorUsuario(req, res)
);

// GET - Obter multas não pagas de um usuário
rotasMulta.get('/usuario/:usuarioId/nao-pagas', (req, res) =>
  controladorMulta.obterMultasNaoPagas(req, res)
);

// PUT - Pagar multa
rotasMulta.put('/:id/pagar', (req, res) =>
  controladorMulta.pagarMulta(req, res)
);

export default rotasMulta;
