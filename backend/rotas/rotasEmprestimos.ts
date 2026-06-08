import { Router } from "express";
import { ControladorEmprestimos } from "../controller/ControladorEmprestimos.js";
import { autenticarJwt } from "../middleware/autenticacaoJwt.js";
import { validarCamposBody } from "../middleware/validarCamposBody.js";
import { responderResultado } from "./resposta.js";

export const rotasEmprestimos = Router();
const controladorEmprestimos = new ControladorEmprestimos();

rotasEmprestimos.get("/", autenticarJwt, async (_req, res) => {
  const resultado = await controladorEmprestimos.listarTodos();
  responderResultado(res, resultado);
});

rotasEmprestimos.get("/:id", autenticarJwt, async (req, res) => {
  const resultado = await controladorEmprestimos.buscarPorId(Number(req.params.id));
  responderResultado(res, resultado);
});

rotasEmprestimos.post(
  "/",
  autenticarJwt,
  validarCamposBody(["usuarioId", "usuario_id", "exemplarId", "exemplar_id", "dataSaida", "dataVencimento"]),
  async (req, res) => {
  const dataSaida = req.body.dataSaida ? new Date(req.body.dataSaida) : undefined;
  const dataVencimento = req.body.dataVencimento
    ? new Date(req.body.dataVencimento)
    : undefined;

  const resultado = await controladorEmprestimos.criarEmprestimo(
    Number(req.body.usuarioId ?? req.body.usuario_id),
    req.body.exemplarId !== undefined || req.body.exemplar_id !== undefined
      ? Number(req.body.exemplarId ?? req.body.exemplar_id)
      : null,
    dataSaida,
    dataVencimento
  );
  responderResultado(res, resultado, 201);
});

rotasEmprestimos.put(
  "/:id",
  autenticarJwt,
  validarCamposBody(["exemplarId", "exemplar_id", "dataVencimento"]),
  async (req, res) => {
  const resultado = await controladorEmprestimos.atualizarEmprestimo(
    Number(req.params.id),
    {
      dataVencimento: req.body.dataVencimento
        ? new Date(req.body.dataVencimento)
        : undefined,
      exemplarId:
        req.body.exemplarId === null || req.body.exemplar_id === null
          ? null
          : req.body.exemplarId !== undefined || req.body.exemplar_id !== undefined
            ? Number(req.body.exemplarId ?? req.body.exemplar_id)
          : undefined,
    }
  );
  responderResultado(res, resultado);
});

rotasEmprestimos.patch(
  "/:id/devolucao",
  autenticarJwt,
  validarCamposBody(["dataDevolucaoReal"]),
  async (req, res) => {
  const resultado = await controladorEmprestimos.registrarDevolucao(
    Number(req.params.id),
    req.body.dataDevolucaoReal
      ? new Date(req.body.dataDevolucaoReal)
      : undefined
  );
  responderResultado(res, resultado);
});

rotasEmprestimos.delete("/:id", autenticarJwt, async (req, res) => {
  const resultado = await controladorEmprestimos.excluirEmprestimo(Number(req.params.id));
  responderResultado(res, resultado);
});
