import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import rotasAutenticacao from './apresentacao/rotas/rotas-autenticacao';
import rotasLivro from './apresentacao/rotas/rotas-livro';
import rotasEmprestimo from './apresentacao/rotas/rotas-emprestimo';
import rotasReserva from './apresentacao/rotas/rotas-reserva';
import rotasMulta from './apresentacao/rotas/rotas-multa';

const app = express();
const PORTA = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/saude', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/auth', rotasAutenticacao);
app.use('/api/livros', rotasLivro);
app.use('/api/emprestimos', rotasEmprestimo);
app.use('/api/reservas', rotasReserva);
app.use('/api/multas', rotasMulta);

// Rota não encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    erro: 'Rota não encontrada',
    metodo: req.method,
    caminho: req.path,
  });
});

// Manipulador de erros global
app.use((erro: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(erro);
  res.status(500).json({
    erro: 'Erro interno do servidor',
    mensagem: process.env.NODE_ENV === 'development' ? erro.message : undefined,
  });
});

// Iniciar servidor
app.listen(PORTA, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORTA}`);
  console.log(`📚 API REST - Sistema de Biblioteca`);
  console.log(`🔐 JWT Autenticação ativada`);
  console.log(`📦 MinIO armazenamento ativado`);
});

export default app;
