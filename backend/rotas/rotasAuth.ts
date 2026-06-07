import { Router } from "express";
import { ControladorUsuarios } from "../controller/ControladorUsuarios.js";
import { autenticarJwt, gerarToken } from "../middleware/autenticacaoJwt.js";
import { responderResultado, statusErro } from "./resposta.js";

export const rotasAuth = Router();
const controladorUsuarios = new ControladorUsuarios();

rotasAuth.post("/login", async (req, res) => {
  const resultado = await controladorUsuarios.autenticar(req.body.email, req.body.senha);
  if (!resultado.sucesso || !resultado.dados) {
    res.status(statusErro(resultado)).json(resultado);
    return;
  }

  const token = gerarToken({
    idUsuario: resultado.dados.idUsuario,
    email: resultado.dados.email,
    nivelAcesso: resultado.dados.nivelAcesso,
  });

  res.json({
    sucesso: true,
    dados: {
      usuario: resultado.dados,
      token,
    },
  });
});

rotasAuth.get("/me", autenticarJwt, (_req, res) => {
  res.json({
    sucesso: true,
    dados: {
      usuario: res.locals.usuario,
    },
  });
});

rotasAuth.post("/logout", autenticarJwt, (_req, res) => {
  res.json({
    sucesso: true,
    dados: {
      mensagem: "Logout realizado no cliente removendo o token JWT",
    },
  });
});
