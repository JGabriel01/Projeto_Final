"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarEmail = validarEmail;
exports.validarSenha = validarSenha;
exports.validarCamposObrigatorios = validarCamposObrigatorios;
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
function validarSenha(senha) {
    if (senha.length < 6) {
        return { valida: false, erro: 'Senha deve ter pelo menos 6 caracteres' };
    }
    return { valida: true };
}
function validarCamposObrigatorios(dados, campos) {
    const faltando = campos.filter((campo) => !dados[campo]);
    if (faltando.length > 0) {
        return { valido: false, faltando };
    }
    return { valido: true };
}
