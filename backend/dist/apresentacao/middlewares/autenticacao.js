"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.middlewareAutenticacao = middlewareAutenticacao;
const autenticacao_1 = require("../../utilitarios/autenticacao");
function middlewareAutenticacao(req, res, next) {
    const token = (0, autenticacao_1.extrairTokenDoHeader)(req.headers.authorization);
    if (!token) {
        res.status(401).json({ erro: 'Token não fornecido' });
        return;
    }
    const payload = (0, autenticacao_1.verificarToken)(token);
    if (!payload) {
        res.status(401).json({ erro: 'Token inválido ou expirado' });
        return;
    }
    req.usuario = payload;
    next();
}
