import { Router } from "express";
import { rotasArquivos } from "./rotasArquivos.js";
import { rotasAuth } from "./rotasAuth.js";
import { rotasBiblioteca } from "./rotasBiblioteca.js";
import { rotasConsultas } from "./rotasConsultas.js";
import { rotasEmprestimos } from "./rotasEmprestimos.js";
import { rotasExemplares } from "./rotasExemplares.js";
import { rotasLivros } from "./rotasLivros.js";
import { rotasMultas } from "./rotasMultas.js";
import { rotasNotificacoes } from "./rotasNotificacoes.js";
import { rotasReservas } from "./rotasReservas.js";
import { rotasUsuarios } from "./rotasUsuarios.js";

export const rotasApi = Router();

rotasApi.get("/status", (_req, res) => {
  res.json({
    sucesso: true,
    dados: {
      api: "Sistema de Biblioteca",
      padrao: "REST API",
      autenticacao: "JWT Bearer Token",
      armazenamentoArquivos: "MinIO para capas de livros e imagens de perfil",
    },
  });
});

rotasApi.use("/arquivos", rotasArquivos);
rotasApi.use("/auth", rotasAuth);
rotasApi.use("/biblioteca", rotasBiblioteca);
rotasApi.use("/usuarios", rotasUsuarios);
rotasApi.use("/livros", rotasLivros);
rotasApi.use("/exemplares", rotasExemplares);
rotasApi.use("/emprestimos", rotasEmprestimos);
rotasApi.use("/reservas", rotasReservas);
rotasApi.use("/multas", rotasMultas);
rotasApi.use("/notificacoes", rotasNotificacoes);
rotasApi.use("/consultas", rotasConsultas);
