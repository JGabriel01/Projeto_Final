import { Router } from "express";
import { ControladorMultas } from "../controller/ControladorMultas.js";
import { autenticarJwt } from "../middleware/autenticacaoJwt.js";
import { validarCamposBody } from "../middleware/validarCamposBody.js";
import { responderResultado } from "./resposta.js";

export const rotasMultas = Router();
const controladorMultas = new ControladorMultas();

rotasMultas.get("/", autenticarJwt, async (_req, res) => {
  const resultado = await controladorMultas.listarTodos();
  responderResultado(res, resultado);
});

rotasMultas.get("/pendentes", autenticarJwt, async (_req, res) => {
  const resultado = await controladorMultas.listarPendentes();
  responderResultado(res, resultado);
});

rotasMultas.get("/:id", autenticarJwt, async (req, res) => {
  const resultado = await controladorMultas.buscarPorId(Number(req.params.id));
  responderResultado(res, resultado);
});

rotasMultas.post(
  "/",
  autenticarJwt,
  validarCamposBody(["valor", "valor_multa", "emprestimoId", "emprestimo_id", "exemplarId", "exemplar_id", "statusPagamento", "status_pagamento"]),
  async (req, res) => {
  const resultado = await controladorMultas.criarMulta(
    Number(req.body.valor ?? req.body.valor_multa),
    Number(req.body.emprestimoId ?? req.body.emprestimo_id),
    Number(req.body.exemplarId ?? req.body.exemplar_id),
    req.body.statusPagamento ?? req.body.status_pagamento ?? "pendente"
  );
  responderResultado(res, resultado, 201);
});

rotasMultas.post(
  "/emprestimos/:emprestimoId",
  autenticarJwt,
  validarCamposBody(["valorPorDia"]),
  async (req, res) => {
  const resultado = await controladorMultas.gerarPorEmprestimo(
    Number(req.params.emprestimoId),
    req.body.valorPorDia ? Number(req.body.valorPorDia) : undefined
  );
  responderResultado(res, resultado, 201);
});

rotasMultas.put(
  "/:id",
  autenticarJwt,
  validarCamposBody(["valor", "statusPagamento", "status_pagamento", "dataPagamento"]),
  async (req, res) => {
  const resultado = await controladorMultas.atualizarMulta(Number(req.params.id), {
    valor: req.body.valor !== undefined ? Number(req.body.valor) : undefined,
    statusPagamento: req.body.statusPagamento ?? req.body.status_pagamento,
    dataPagamento: req.body.dataPagamento
      ? new Date(req.body.dataPagamento)
      : req.body.dataPagamento === null
        ? null
        : undefined,
  });
  responderResultado(res, resultado);
});

rotasMultas.delete("/:id", autenticarJwt, async (req, res) => {
  const resultado = await controladorMultas.excluirMulta(Number(req.params.id));
  responderResultado(res, resultado);
});
