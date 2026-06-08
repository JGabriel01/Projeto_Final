import { Router } from "express";
import { ControladorUsuarios } from "../controller/ControladorUsuarios.js";
import {
  autenticarJwt,
  autorizarProprioUsuario,
  autorizarProprioUsuarioBody,
} from "../middleware/autenticacaoJwt.js";
import { validarCamposBody } from "../middleware/validarCamposBody.js";
import { responderResultado } from "./resposta.js";

export const rotasUsuarios = Router();
const controladorUsuarios = new ControladorUsuarios();

rotasUsuarios.get("/", autenticarJwt, async (_req, res) => {
  const resultado = await controladorUsuarios.buscarPorId(
    Number(res.locals.usuario.idUsuario)
  );
  responderResultado(res, resultado);
});

rotasUsuarios.get("/:id", autenticarJwt, autorizarProprioUsuario(), async (req, res) => {
  const resultado = await controladorUsuarios.buscarPorId(Number(req.params.id));
  responderResultado(res, resultado);
});

rotasUsuarios.post(
  "/alunos",
  validarCamposBody(["nome", "email", "senha", "anoIngresso", "curso", "matriculaAluno"]),
  async (req, res) => {
  const resultado = await controladorUsuarios.criarAluno(
    req.body.nome,
    req.body.email,
    req.body.senha,
    Number(req.body.anoIngresso),
    req.body.curso,
    req.body.matriculaAluno
  );
  responderResultado(res, resultado, 201);
});

rotasUsuarios.post(
  "/professores",
  validarCamposBody(["nome", "email", "senha", "departamento", "matriculaProfessor"]),
  async (req, res) => {
  const resultado = await controladorUsuarios.criarProfessor(
    req.body.nome,
    req.body.email,
    req.body.senha,
    req.body.departamento,
    req.body.matriculaProfessor
  );
  responderResultado(res, resultado, 201);
});

rotasUsuarios.post(
  "/admins",
  validarCamposBody(["nome", "email", "senha", "cargo"]),
  async (req, res) => {
  const resultado = await controladorUsuarios.criarAdmin(
    req.body.nome,
    req.body.email,
    req.body.senha,
    req.body.cargo
  );
  responderResultado(res, resultado, 201);
});

rotasUsuarios.put(
  "/:id",
  autenticarJwt,
  autorizarProprioUsuario(),
  validarCamposBody(["nome", "email", "senha", "cargo"]),
  async (req, res) => {
  const resultado = await controladorUsuarios.atualizarUsuario(
    Number(req.params.id),
    req.body
  );
  responderResultado(res, resultado);
});

rotasUsuarios.delete(
  "/:id",
  autenticarJwt,
  autorizarProprioUsuario(),
  async (req, res) => {
  const resultado = await controladorUsuarios.excluirNomeCadastro(Number(req.params.id));
  responderResultado(res, resultado);
});

rotasUsuarios.post(
  "/excluirNomeCadastro",
  autenticarJwt,
  validarCamposBody(["idUsuario", "id_usuario", "id"]),
  autorizarProprioUsuarioBody(),
  async (req, res) => {
  const id = Number(req.body.idUsuario ?? req.body.id_usuario ?? req.body.id);
  const resultado = await controladorUsuarios.excluirNomeCadastro(id);
  responderResultado(res, resultado);
});
