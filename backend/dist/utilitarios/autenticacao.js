"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarToken = gerarToken;
exports.verificarToken = verificarToken;
exports.extrairTokenDoHeader = extrairTokenDoHeader;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui';
const EXPIRACAO = '24h';
function gerarToken(payload) {
    return jsonwebtoken_1.default.sign(payload, SECRET_KEY, { expiresIn: EXPIRACAO });
}
function verificarToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        return decoded;
    }
    catch {
        return null;
    }
}
function extrairTokenDoHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}
