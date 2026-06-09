import { Router } from "express";
import multer from "multer";
import { ControladorUsuarios } from "../controller/ControladorUsuarios.js";
import {
  autenticarJwt,
  autorizarProprioUsuario,
  autorizarProprioUsuarioBody,
} from "../middleware/autenticacaoJwt.js";
import { validarCamposBody } from "../middleware/validarCamposBody.js";
import { ServicoMinio } from "../servicos/ServicoMinio.js";
import { responderResultado } from "./resposta.js";

export const rotasUsuarios = Router();
const controladorUsuarios = new ControladorUsuarios();
const servicoMinio = new ServicoMinio();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

rotasUsuarios.get("/", autenticarJwt, async (_req, res) => {
  const resultado = await controladorUsuarios.listarPublicos();
  responderResultado(res, resultado);
});

rotasUsuarios.get("/:id", autenticarJwt, async (req, res) => {
  const resultado = await controladorUsuarios.buscarPublicoPorId(Number(req.params.id));
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

rotasUsuarios.post(
  "/:id/imagens-perfil",
  autenticarJwt,
  autorizarProprioUsuario(),
  upload.fields([
    { name: "fotoPerfil", maxCount: 1 },
    { name: "fundoPerfil", maxCount: 1 },
  ]),
  async (req, res) => {
    const arquivos = req.files as
      | {
          fotoPerfil?: Express.Multer.File[];
          fundoPerfil?: Express.Multer.File[];
        }
      | undefined;
    const usuarioId = Number(req.params.id);
    const fotoPerfil = arquivos?.fotoPerfil?.[0];
    const fundoPerfil = arquivos?.fundoPerfil?.[0];

    if (!fotoPerfil && !fundoPerfil) {
      res.status(400).json({
        sucesso: false,
        erro: {
          mensagem: "Envie fotoPerfil ou fundoPerfil no formulario",
          tipo: "ErroValidacao",
        },
      });
      return;
    }

    const imagens: {
      fotoPerfilUrl?: string;
      fotoPerfilObjeto?: string;
      fundoPerfilUrl?: string;
      fundoPerfilObjeto?: string;
    } = {};

    if (fotoPerfil) {
      const foto = await servicoMinio.enviarImagemPerfil(
        usuarioId,
        "foto",
        fotoPerfil
      );
      imagens.fotoPerfilUrl = foto.url;
      imagens.fotoPerfilObjeto = foto.objeto;
    }

    if (fundoPerfil) {
      const fundo = await servicoMinio.enviarImagemPerfil(
        usuarioId,
        "fundo",
        fundoPerfil
      );
      imagens.fundoPerfilUrl = fundo.url;
      imagens.fundoPerfilObjeto = fundo.objeto;
    }

    const resultado = await controladorUsuarios.atualizarImagensPerfil(
      usuarioId,
      imagens
    );
    responderResultado(res, resultado);
  }
);

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
