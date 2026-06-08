import type { Response } from "express";
import type { ResultadoOperacao } from "../controller/ControladorUsuarios.js";

export function statusErro(resultado: ResultadoOperacao): number {
  const tipo = resultado.erro?.tipo;
  if (
    tipo === "ErroValidacao" ||
    tipo === "ErroAutenticacao" ||
    tipo === "ErroDuplicado"
  ) {
    return 400;
  }
  if (tipo === "ErroAutorizacao") return 403;
  if (tipo === "ErroNaoEncontrado") return 404;
  return 500;
}

export function responderResultado(
  res: Response,
  resultado: ResultadoOperacao,
  statusSucesso: number = 200
): void {
  res.status(resultado.sucesso ? statusSucesso : statusErro(resultado)).json(resultado);
}
