import { Router } from "express";
import { ControladorUsuarios } from "../controller/ControladorUsuarios.js";
import { autenticarJwt, autorizarProprioUsuarioBody } from "../middleware/autenticacaoJwt.js";
import { rotasAuth } from "./rotasAuth.js";
import { rotasConsultas } from "./rotasConsultas.js";
import { rotasEmprestimos } from "./rotasEmprestimos.js";
import { rotasExemplares } from "./rotasExemplares.js";
import { rotasLivros } from "./rotasLivros.js";
import { rotasMultas } from "./rotasMultas.js";
import { rotasNotificacoes } from "./rotasNotificacoes.js";
import { rotasReservas } from "./rotasReservas.js";
import { rotasUsuarios } from "./rotasUsuarios.js";
import { responderResultado } from "./resposta.js";
import { validarCamposBody } from "../middleware/validarCamposBody.js";

export const rotasApi = Router();
const controladorUsuarios = new ControladorUsuarios();

rotasApi.get("/status", (_req, res) => {
  res.json({
    sucesso: true,
    dados: {
      api: "Sistema de Biblioteca",
      padrao: "REST API",
      autenticacao: "JWT Bearer Token",
      armazenamentoArquivos: "MinIO para capas de livros",
    },
  });
});

rotasApi.use("/auth", rotasAuth);
rotasApi.use("/usuarios", rotasUsuarios);
rotasApi.use("/livros", rotasLivros);
rotasApi.use("/exemplares", rotasExemplares);
rotasApi.use("/emprestimos", rotasEmprestimos);
rotasApi.use("/reservas", rotasReservas);
rotasApi.use("/multas", rotasMultas);
rotasApi.use("/notificacoes", rotasNotificacoes);
rotasApi.use("/consultas", rotasConsultas);

rotasApi.post(
  "/excluirNomeCadastro",
  autenticarJwt,
  validarCamposBody(["idUsuario", "id_usuario", "id"]),
  autorizarProprioUsuarioBody(),
  async (req, res) => {
  const id = Number(req.body.idUsuario ?? req.body.id_usuario ?? req.body.id);
  const resultado = await controladorUsuarios.excluirNomeCadastro(id);
  responderResultado(res, resultado);
});

rotasApi.delete(
  "/excluirNomeCadastro",
  autenticarJwt,
  validarCamposBody(["idUsuario", "id_usuario", "id"]),
  autorizarProprioUsuarioBody(),
  async (req, res) => {
  const id = Number(req.body.idUsuario ?? req.body.id_usuario ?? req.body.id);
  const resultado = await controladorUsuarios.excluirNomeCadastro(id);
  responderResultado(res, resultado);
});
