import { Router } from "express";
import { ControladorUsuarios } from "../controller/ControladorUsuarios.js";
import { autenticarJwt } from "../middleware/autenticacaoJwt.js";
import { responderResultado } from "./resposta.js";

export const rotasUsuarios = Router();
const controladorUsuarios = new ControladorUsuarios();

rotasUsuarios.get("/", autenticarJwt, async (_req, res) => {
  const resultado = await controladorUsuarios.listarTodos();
  responderResultado(res, resultado);
});

rotasUsuarios.get("/:id", autenticarJwt, async (req, res) => {
  const resultado = await controladorUsuarios.buscarPorId(Number(req.params.id));
  responderResultado(res, resultado);
});

rotasUsuarios.post("/alunos", async (req, res) => {
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

rotasUsuarios.post("/professores", async (req, res) => {
  const resultado = await controladorUsuarios.criarProfessor(
    req.body.nome,
    req.body.email,
    req.body.senha,
    req.body.departamento,
    req.body.matriculaProfessor
  );
  responderResultado(res, resultado, 201);
});

rotasUsuarios.post("/admins", async (req, res) => {
  const resultado = await controladorUsuarios.criarAdmin(
    req.body.nome,
    req.body.email,
    req.body.senha,
    req.body.cargo
  );
  responderResultado(res, resultado, 201);
});

rotasUsuarios.put("/:id", autenticarJwt, async (req, res) => {
  const resultado = await controladorUsuarios.atualizarUsuario(
    Number(req.params.id),
    req.body
  );
  responderResultado(res, resultado);
});

rotasUsuarios.delete("/:id", autenticarJwt, async (req, res) => {
  const resultado = await controladorUsuarios.excluirNomeCadastro(Number(req.params.id));
  responderResultado(res, resultado);
});

rotasUsuarios.post("/excluirNomeCadastro", autenticarJwt, async (req, res) => {
  const id = Number(req.body.idUsuario ?? req.body.id_usuario ?? req.body.id);
  const resultado = await controladorUsuarios.excluirNomeCadastro(id);
  responderResultado(res, resultado);
});
