import { Router } from "express";
import { minioBucket, minioClient } from "../config/minioClient.js";

export const rotasArquivos = Router();

rotasArquivos.get(/^\/(.+)$/, async (req, res) => {
  const nomeObjeto = req.params[0];

  try {
    const estatisticas = await minioClient.statObject(minioBucket, nomeObjeto);
    const tipoConteudo =
      estatisticas.metaData?.["content-type"] ||
      estatisticas.metaData?.["Content-Type"] ||
      "application/octet-stream";
    const arquivo = await minioClient.getObject(minioBucket, nomeObjeto);

    res.setHeader("Content-Type", tipoConteudo);
    res.setHeader("Cache-Control", "public, max-age=3600");
    arquivo.pipe(res);
  } catch {
    res.status(404).json({
      sucesso: false,
      erro: { mensagem: "Arquivo não encontrado", tipo: "ErroNaoEncontrado" },
    });
  }
});
