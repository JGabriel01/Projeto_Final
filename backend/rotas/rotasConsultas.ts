import { Router } from "express";
import { ControladorConsultas } from "../controller/ControladorConsultas.js";
import { autenticarJwt } from "../middleware/autenticacaoJwt.js";
import { responderResultado } from "./resposta.js";

export const rotasConsultas = Router();
const controladorConsultas = new ControladorConsultas();

rotasConsultas.get("/emprestimos-ativos", autenticarJwt, async (req, res) => {
  const usuarioId = req.query.usuarioId
    ? Number(req.query.usuarioId)
    : req.query.usuario_id
      ? Number(req.query.usuario_id)
      : undefined;
  const resultado = await controladorConsultas.emprestimosAtivosPorUsuario(usuarioId);
  responderResultado(res, resultado);
});

rotasConsultas.get("/livros-mais-emprestados", autenticarJwt, async (req, res) => {
  const resultado = await controladorConsultas.livrosMaisEmprestados(
    req.query.limite ? Number(req.query.limite) : undefined,
    req.query.dataInicio ? new Date(String(req.query.dataInicio)) : undefined,
    req.query.dataFim ? new Date(String(req.query.dataFim)) : undefined
  );
  responderResultado(res, resultado);
});

rotasConsultas.get("/multas-pendentes", autenticarJwt, async (_req, res) => {
  const resultado = await controladorConsultas.multasPendentesPorUsuario();
  responderResultado(res, resultado);
});

rotasConsultas.get("/relatorio-uso-mensal", autenticarJwt, async (req, res) => {
  const resultado = await controladorConsultas.relatorioUsoMensal(
    req.query.dataInicio ? new Date(String(req.query.dataInicio)) : undefined,
    req.query.dataFim ? new Date(String(req.query.dataFim)) : undefined
  );
  responderResultado(res, resultado);
});

rotasConsultas.get("/disponibilidade-exemplares", autenticarJwt, async (_req, res) => {
  const resultado = await controladorConsultas.disponibilidadeExemplaresPorLivro();
  responderResultado(res, resultado);
});
