import { Router } from 'express';
import multer from 'multer';
import controladorLivro from '../controladores/controlador-livro';
import { middlewareAutenticacao } from '../middlewares/autenticacao';

const upload = multer({ storage: multer.memoryStorage() });
const rotasLivro = Router();

// Públicas
rotasLivro.get('/', (req, res) => controladorLivro.listar(req, res));
rotasLivro.get('/disponiveis', (req, res) =>
  controladorLivro.listarDisponiveis(req, res)
);
rotasLivro.get('/buscar', (req, res) => controladorLivro.buscar(req, res));
rotasLivro.get('/:id', (req, res) => controladorLivro.obterPorId(req, res));

// Autenticadas
rotasLivro.post(
  '/',
  middlewareAutenticacao,
  upload.fields([{ name: 'capa', maxCount: 1 }, { name: 'arquivo', maxCount: 1 }]),
  (req, res) => controladorLivro.criar(req, res)
);

rotasLivro.put(
  '/:id',
  middlewareAutenticacao,
  upload.single('capa'),
  (req, res) => controladorLivro.atualizar(req, res)
);

rotasLivro.get('/:id/ler', middlewareAutenticacao, (req, res) =>
  controladorLivro.obterArquivoParaLeitura(req, res)
);

rotasLivro.delete('/:id', middlewareAutenticacao, (req, res) =>
  controladorLivro.deletar(req, res)
);

export default rotasLivro;
