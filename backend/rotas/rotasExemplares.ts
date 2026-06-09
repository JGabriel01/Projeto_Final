import { Router } from "express";
import { ControladorExemplares } from "../controller/ControladorExemplares.js";
import { autenticarJwt, autorizarAdmin } from "../middleware/autenticacaoJwt.js";
import { validarCamposBody } from "../middleware/validarCamposBody.js";
import { responderResultado } from "./resposta.js";

export const rotasExemplares = Router();
const controladorExemplares = new ControladorExemplares();

rotasExemplares.get("/", async (_req, res) => {
  const resultado = await controladorExemplares.listarTodos();
  responderResultado(res, resultado);
});

rotasExemplares.get("/:id", async (req, res) => {
  const resultado = await controladorExemplares.buscarPorId(Number(req.params.id));
  responderResultado(res, resultado);
});

rotasExemplares.post(
  "/",
  autenticarJwt,
  autorizarAdmin,
  validarCamposBody(["livroId", "livro_id", "codigoTombo", "codigo_tombo", "estado", "localizacao"]),
  async (req, res) => {
  const resultado = await controladorExemplares.criarParaLivro(
    Number(req.body.livroId ?? req.body.livro_id),
    req.body.codigoTombo ?? req.body.codigo_tombo,
    req.body.estado,
    req.body.localizacao
  );
  responderResultado(res, resultado, 201);
});

rotasExemplares.put(
  "/:id",
  autenticarJwt,
  autorizarAdmin,
  validarCamposBody(["livroId", "livro_id", "codigoTombo", "codigo_tombo", "estado", "localizacao"]),
  async (req, res) => {
  const resultado = await controladorExemplares.atualizar(Number(req.params.id), req.body);
  responderResultado(res, resultado);
});

rotasExemplares.delete("/:id", autenticarJwt, autorizarAdmin, async (req, res) => {
  const resultado = await controladorExemplares.excluir(Number(req.params.id));
  responderResultado(res, resultado);
});
