import { Router } from "express";
import { ControladorUsuarios } from "../controller/ControladorUsuarios.js";
import {
  autenticarJwt,
  encerrarSessao,
  gerarToken,
  registrarSessao,
  usuarioTemSessaoAtiva,
} from "../middleware/autenticacaoJwt.js";
import { validarCamposBody } from "../middleware/validarCamposBody.js";
import { responderResultado, statusErro } from "./resposta.js";

export const rotasAuth = Router();
const controladorUsuarios = new ControladorUsuarios();

rotasAuth.post("/login", validarCamposBody(["email", "senha"]), async (req, res) => {
  const resultado = await controladorUsuarios.autenticar(req.body.email, req.body.senha);
  if (!resultado.sucesso || !resultado.dados) {
    res.status(statusErro(resultado)).json(resultado);
    return;
  }

  if (usuarioTemSessaoAtiva(resultado.dados.idUsuario)) {
    res.status(409).json({
      sucesso: false,
      erro: {
        mensagem: "Este usuario ja esta logado. Faca logout antes de entrar novamente",
        tipo: "ErroAutorizacao",
      },
    });
    return;
  }

  const token = gerarToken({
    idUsuario: resultado.dados.idUsuario,
    email: resultado.dados.email,
    nivelAcesso: resultado.dados.nivelAcesso,
  });

  registrarSessao(resultado.dados.idUsuario, token);

  res.json({
    sucesso: true,
    dados: {
      usuario: resultado.dados,
      token,
    },
  });
});

rotasAuth.post("/recuperar-senha/verificar-email", validarCamposBody(["email"]), async (req, res) => {
  const resultado = await controladorUsuarios.verificarEmailRecuperacao(req.body.email);
  responderResultado(res, resultado);
});

rotasAuth.post("/recuperar-senha/redefinir", validarCamposBody(["email", "senha"]), async (req, res) => {
  const resultado = await controladorUsuarios.redefinirSenhaPorEmail(
    req.body.email,
    req.body.senha
  );
  responderResultado(res, resultado);
});

rotasAuth.get("/me", autenticarJwt, (_req, res) => {
  res.json({
    sucesso: true,
    dados: {
      usuario: res.locals.usuario,
    },
  });
});

rotasAuth.post("/logout", autenticarJwt, validarCamposBody([]), (_req, res) => {
  encerrarSessao(Number(res.locals.usuario.idUsuario));

  res.json({
    sucesso: true,
    dados: {
      mensagem: "Logout realizado com sucesso",
    },
  });
});
