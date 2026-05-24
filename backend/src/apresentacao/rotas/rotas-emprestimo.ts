import { Router } from 'express';
import controladorEmprestimo from '../controladores/controlador-emprestimo';
import { middlewareAutenticacao } from '../middlewares/autenticacao';

const rotasEmprestimo = Router();

// Todas as rotas de empréstimo requerem autenticação
rotasEmprestimo.use(middlewareAutenticacao);

// GET - Listar todos os empréstimos
rotasEmprestimo.get('/', (req, res) => controladorEmprestimo.listar(req, res));

// GET - Obter empréstimo por ID
rotasEmprestimo.get('/:id', (req, res) =>
  controladorEmprestimo.obterPorId(req, res)
);

// GET - Listar empréstimos de um usuário
rotasEmprestimo.get('/usuario/:usuarioId', (req, res) =>
  controladorEmprestimo.listarPorUsuario(req, res)
);

// POST - Criar novo empréstimo
rotasEmprestimo.post('/', (req, res) => controladorEmprestimo.criar(req, res));

// PUT - Devolver livro (finalizar empréstimo)
rotasEmprestimo.put('/:id/devolver', (req, res) =>
  controladorEmprestimo.devolver(req, res)
);

// PUT - Renovar empréstimo
rotasEmprestimo.put('/:id/renovar', (req, res) =>
  controladorEmprestimo.renovar(req, res)
);

export default rotasEmprestimo;
