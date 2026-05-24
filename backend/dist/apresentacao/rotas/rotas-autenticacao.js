"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controlador_autenticacao_1 = __importDefault(require("../controladores/controlador-autenticacao"));
const autenticacao_1 = require("../middlewares/autenticacao");
const rotasAutenticacao = (0, express_1.Router)();
// Públicas
rotasAutenticacao.post('/registrar', (req, res) => controlador_autenticacao_1.default.registrar(req, res));
rotasAutenticacao.post('/login', (req, res) => controlador_autenticacao_1.default.login(req, res));
// Autenticadas
rotasAutenticacao.get('/perfil', autenticacao_1.middlewareAutenticacao, (req, res) => controlador_autenticacao_1.default.obterPerfil(req, res));
exports.default = rotasAutenticacao;
