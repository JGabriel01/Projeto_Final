import { Router } from 'express';
import controladorAutenticacao from '../controladores/controlador-autenticacao';
import { middlewareAutenticacao } from '../middlewares/autenticacao';

const rotasAutenticacao = Router();

// Públicas
rotasAutenticacao.post('/registrar', (req, res) =>
  controladorAutenticacao.registrar(req, res)
);
rotasAutenticacao.post('/login', (req, res) =>
  controladorAutenticacao.login(req, res)
);

// Autenticadas
rotasAutenticacao.get('/perfil', middlewareAutenticacao, (req, res) =>
  controladorAutenticacao.obterPerfil(req, res)
);

export default rotasAutenticacao;
