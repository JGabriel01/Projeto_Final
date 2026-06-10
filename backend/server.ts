import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ControladorUsuarios } from "./controller/ControladorUsuarios.js";
import { prisma } from "./config/prismaClient.js";
import { autenticarJwt, autorizarProprioUsuarioBody } from "./middleware/autenticacaoJwt.js";
import { rotasApi } from "./rotas/index.js";
import { responderResultado } from "./rotas/resposta.js";
import { validarCamposBody } from "./middleware/validarCamposBody.js";

const app = express();
const porta = Number(process.env.PORT) || 3000;
const controladorUsuarios = new ControladorUsuarios();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, "../frontend");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(frontendPath));

app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
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
    erro: { mensagem: "Rota não encontrada", tipo: "ErroNaoEncontrado" },
  });
});

async function garantirAdminBase() {
  const adminBase = await prisma.usuario.findUnique({
    where: { email: "admin@biblioteca.com" },
  });
  if (adminBase) return;
  await controladorUsuarios.criarAdmin(
    "Administrador Base",
    "admin@biblioteca.com",
    "admin123",
    "Administrador"
  );
  console.log("Admin base criado: admin@biblioteca.com / admin123");
}

await garantirAdminBase();

const servidor = app.listen(porta, () => {
  console.log(`API REST rodando em http://localhost:${porta}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  servidor.close(() => process.exit(0));
});

