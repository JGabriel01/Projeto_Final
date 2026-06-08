import "dotenv/config";
import cors from "cors";
import express from "express";
import { ControladorUsuarios } from "./controller/ControladorUsuarios.js";
import { prisma } from "./config/prismaClient.js";
import { autenticarJwt, autorizarProprioUsuarioBody } from "./middleware/autenticacaoJwt.js";
import { rotasApi } from "./rotas/index.js";
import { responderResultado } from "./rotas/resposta.js";
import { validarCamposBody } from "./middleware/validarCamposBody.js";

const app = express();
const porta = Number(process.env.PORT) || 3000;
const controladorUsuarios = new ControladorUsuarios();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    sucesso: true,
    mensagem: "API REST do Sistema de Biblioteca",
    documentacao: "/api/status",
  });
});

app.use("/api", rotasApi);

app.post(
  "/excluirNomeCadastro",
  autenticarJwt,
  validarCamposBody(["idUsuario", "id_usuario", "id"]),
  autorizarProprioUsuarioBody(),
  async (req, res) => {
  const id = Number(req.body.idUsuario ?? req.body.id_usuario ?? req.body.id);
  const resultado = await controladorUsuarios.excluirNomeCadastro(id);
  responderResultado(res, resultado);
});

app.use((_req, res) => {
  res.status(404).json({
    sucesso: false,
    erro: { mensagem: "Rota nao encontrada", tipo: "ErroNaoEncontrado" },
  });
});

const servidor = app.listen(porta, () => {
  console.log(`API REST rodando em http://localhost:${porta}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  servidor.close(() => process.exit(0));
});
