import { Router } from "express";
import { ControladorReservas } from "../controller/ControladorReservas.js";
import { autenticarJwt } from "../middleware/autenticacaoJwt.js";
import { validarCamposBody } from "../middleware/validarCamposBody.js";
import { responderResultado } from "./resposta.js";

export const rotasReservas = Router();
const controladorReservas = new ControladorReservas();

rotasReservas.get("/", autenticarJwt, async (_req, res) => {
  const resultado = await controladorReservas.listarTodos();
  responderResultado(res, resultado);
});

rotasReservas.get("/usuario/:usuarioId", autenticarJwt, async (req, res) => {
  const resultado = await controladorReservas.buscarPorUsuario(
    Number(req.params.usuarioId)
  );
  responderResultado(res, resultado);
});

rotasReservas.get("/:id", autenticarJwt, async (req, res) => {
  const resultado = await controladorReservas.buscarPorId(Number(req.params.id));
  responderResultado(res, resultado);
});

rotasReservas.post(
  "/",
  autenticarJwt,
  validarCamposBody(["usuarioId", "usuario_id", "livroId", "livro_id", "dataReserva", "dataExpiracao"]),
  async (req, res) => {
  const resultado = await controladorReservas.criarReserva(
    Number(req.body.usuarioId ?? req.body.usuario_id),
    Number(req.body.livroId ?? req.body.livro_id),
    req.body.dataReserva ? new Date(req.body.dataReserva) : undefined,
    req.body.dataExpiracao ? new Date(req.body.dataExpiracao) : undefined
  );
  responderResultado(res, resultado, 201);
});

rotasReservas.put(
  "/:id",
  autenticarJwt,
  validarCamposBody(["dataExpiracao", "statusReserva", "status_reserva"]),
  async (req, res) => {
  const resultado = await controladorReservas.atualizarReserva(Number(req.params.id), {
    dataExpiracao: req.body.dataExpiracao
      ? new Date(req.body.dataExpiracao)
      : undefined,
    statusReserva: req.body.statusReserva ?? req.body.status_reserva,
  });
  responderResultado(res, resultado);
});

rotasReservas.delete("/:id", autenticarJwt, async (req, res) => {
  const resultado = await controladorReservas.excluirReserva(Number(req.params.id));
  responderResultado(res, resultado);
});
