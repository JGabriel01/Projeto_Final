import { randomUUID } from "node:crypto";
import {
  minioBucket,
  minioClient,
  montarUrlArquivoApi,
} from "../config/minioClient.js";

export class ServicoMinio {
  async enviarCapaLivro(
    livroId: number,
    arquivo: Express.Multer.File
  ): Promise<{ objeto: string; url: string }> {
    const extensao = this.extrairExtensao(arquivo.originalname);
    const objeto = `capas/livro-${livroId}-${randomUUID()}${extensao}`;

    await this.garantirBucket();
    await minioClient.putObject(
      minioBucket,
      objeto,
      arquivo.buffer,
      arquivo.size,
      {
        "Content-Type": arquivo.mimetype,
      }
    );

    return {
      objeto,
      url: montarUrlArquivoApi(objeto),
    };
  }

  async enviarImagemPerfil(
    usuarioId: number,
    tipo: "foto" | "fundo",
    arquivo: Express.Multer.File
  ): Promise<{ objeto: string; url: string }> {
    const extensao = this.extrairExtensao(arquivo.originalname);
    const objeto = `perfis/usuario-${usuarioId}/${tipo}-${randomUUID()}${extensao}`;

    await this.garantirBucket();
    await minioClient.putObject(
      minioBucket,
      objeto,
      arquivo.buffer,
      arquivo.size,
      {
        "Content-Type": arquivo.mimetype,
      }
    );

    return {
      objeto,
      url: montarUrlArquivoApi(objeto),
    };
  }

  private async garantirBucket(): Promise<void> {
    const existe = await minioClient.bucketExists(minioBucket);
    if (!existe) {
      await minioClient.makeBucket(minioBucket);
    }

    await minioClient.setBucketPolicy(
      minioBucket,
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${minioBucket}/*`],
          },
        ],
      })
    );
  }

  private extrairExtensao(nomeArquivo: string): string {
    const indice = nomeArquivo.lastIndexOf(".");
    if (indice === -1) return "";
    return nomeArquivo.slice(indice).toLowerCase();
  }
}
