import { Router } from "express";
import { ControladorNotificacoes } from "../controller/ControladorNotificacoes.js";
import { autenticarJwt } from "../middleware/autenticacaoJwt.js";
import { responderResultado } from "./resposta.js";

export const rotasNotificacoes = Router();
const controladorNotificacoes = new ControladorNotificacoes();

rotasNotificacoes.get("/", autenticarJwt, async (_req, res) => {
  const resultado = await controladorNotificacoes.listarTodos();
  responderResultado(res, resultado);
});

rotasNotificacoes.get("/usuario/:usuarioId", autenticarJwt, async (req, res) => {
  const resultado = await controladorNotificacoes.buscarPorUsuario(
    Number(req.params.usuarioId)
  );
  responderResultado(res, resultado);
});

rotasNotificacoes.get("/:id", autenticarJwt, async (req, res) => {
  const resultado = await controladorNotificacoes.buscarPorId(Number(req.params.id));
  responderResultado(res, resultado);
});

rotasNotificacoes.post("/", autenticarJwt, async (req, res) => {
  const resultado = await controladorNotificacoes.criarNotificacao(
    req.body.tipo,
    req.body.mensagem,
    Number(req.body.usuarioId ?? req.body.usuario_id),
    req.body.emprestimoId || req.body.id_emprestimo
      ? Number(req.body.emprestimoId ?? req.body.id_emprestimo)
      : null
  );
  responderResultado(res, resultado, 201);
});

rotasNotificacoes.put("/:id", autenticarJwt, async (req, res) => {
  const resultado = await controladorNotificacoes.atualizarNotificacao(
    Number(req.params.id),
    {
      tipo: req.body.tipo,
      mensagem: req.body.mensagem,
      lido: req.body.lido,
    }
  );
  responderResultado(res, resultado);
});

rotasNotificacoes.patch("/:id/lida", autenticarJwt, async (req, res) => {
  const resultado = await controladorNotificacoes.atualizarNotificacao(
    Number(req.params.id),
    { lido: true }
  );
  responderResultado(res, resultado);
});

rotasNotificacoes.delete("/:id", autenticarJwt, async (req, res) => {
  const resultado = await controladorNotificacoes.excluirNotificacao(Number(req.params.id));
  responderResultado(res, resultado);
});
