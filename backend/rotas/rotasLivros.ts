import { Router } from "express";
import multer from "multer";
import { ControladorLivros } from "../controller/ControladorLivros.js";
import { autenticarJwt, autorizarAdmin } from "../middleware/autenticacaoJwt.js";
import { validarCamposBody } from "../middleware/validarCamposBody.js";
import { ServicoMinio } from "../servicos/ServicoMinio.js";
import { responderResultado } from "./resposta.js";

export const rotasLivros = Router();
const controladorLivros = new ControladorLivros();
const servicoMinio = new ServicoMinio();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

rotasLivros.get("/", async (_req, res) => {
  const resultado = await controladorLivros.listarTodos();
  responderResultado(res, resultado);
});

rotasLivros.get("/:id", async (req, res) => {
  const resultado = await controladorLivros.buscarPorId(Number(req.params.id));
  responderResultado(res, resultado);
});

rotasLivros.post(
  "/",
  autenticarJwt,
  autorizarAdmin,
  validarCamposBody(["titulo", "autor", "genero", "anoPublicacao", "sinopse"]),
  async (req, res) => {
  const resultado = await controladorLivros.criarLivro(
    req.body.titulo,
    req.body.autor,
    req.body.genero,
    Number(req.body.anoPublicacao),
    req.body.sinopse
  );
  responderResultado(res, resultado, 201);
});

rotasLivros.put(
  "/:id",
  autenticarJwt,
  autorizarAdmin,
  validarCamposBody(["titulo", "autor", "genero", "anoPublicacao", "sinopse", "status"]),
  async (req, res) => {
  const resultado = await controladorLivros.atualizarLivro(Number(req.params.id), req.body);
  responderResultado(res, resultado);
});

rotasLivros.delete("/:id", autenticarJwt, autorizarAdmin, async (req, res) => {
  const resultado = await controladorLivros.excluirLivro(Number(req.params.id));
  responderResultado(res, resultado);
});

rotasLivros.post(
  "/:id/capa",
  autenticarJwt,
  autorizarAdmin,
  upload.single("capa"),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({
        sucesso: false,
        erro: { mensagem: "Arquivo de capa nao enviado", tipo: "ErroValidacao" },
      });
      return;
    }

    const livroId = Number(req.params.id);
    const capa = await servicoMinio.enviarCapaLivro(livroId, req.file);
    const resultado = await controladorLivros.atualizarCapa(
      livroId,
      capa.objeto,
      capa.url
    );
    responderResultado(res, resultado);
  }
);
