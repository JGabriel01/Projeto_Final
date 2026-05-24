"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const rotas_autenticacao_1 = __importDefault(require("./apresentacao/rotas/rotas-autenticacao"));
const rotas_livro_1 = __importDefault(require("./apresentacao/rotas/rotas-livro"));
const rotas_emprestimo_1 = __importDefault(require("./apresentacao/rotas/rotas-emprestimo"));
const rotas_reserva_1 = __importDefault(require("./apresentacao/rotas/rotas-reserva"));
const rotas_multa_1 = __importDefault(require("./apresentacao/rotas/rotas-multa"));
const app = (0, express_1.default)();
const PORTA = process.env.PORT || 3000;
// Middlewares globais
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/saude', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Rotas da API
app.use('/api/auth', rotas_autenticacao_1.default);
app.use('/api/livros', rotas_livro_1.default);
app.use('/api/emprestimos', rotas_emprestimo_1.default);
app.use('/api/reservas', rotas_reserva_1.default);
app.use('/api/multas', rotas_multa_1.default);
// Rota não encontrada (404)
app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada',
        metodo: req.method,
        caminho: req.path,
    });
});
// Manipulador de erros global
app.use((erro, req, res, next) => {
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
exports.default = app;
