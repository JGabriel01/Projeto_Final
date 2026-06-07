import * as Minio from "minio";

const endpoint = process.env.MINIO_ENDPOINT || "localhost";
const port = Number(process.env.MINIO_PORT) || 9000;
const useSSL = process.env.MINIO_USE_SSL === "true";

export const minioBucket = process.env.MINIO_BUCKET || "biblioteca";

export const minioClient = new Minio.Client({
  endPoint: endpoint,
  port,
  useSSL,
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

export function montarUrlPublica(nomeObjeto: string): string {
  const publicUrl = process.env.MINIO_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl.replace(/\/$/, "")}/${minioBucket}/${nomeObjeto}`;
  }

  const protocolo = useSSL ? "https" : "http";
  return `${protocolo}://${endpoint}:${port}/${minioBucket}/${nomeObjeto}`;
}
