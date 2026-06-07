import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface PayloadJwt {
  idUsuario: number;
  email: string;
  nivelAcesso: string;
}

const segredoJwt = process.env.JWT_SECRET || "segredo-dev-projeto-final";

export function gerarToken(payload: PayloadJwt): string {
  return jwt.sign(payload, segredoJwt, { expiresIn: "2h" });
}

export function autenticarJwt(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;

  if (!token) {
    res.status(401).json({
      sucesso: false,
      erro: { mensagem: "Token JWT nao informado", tipo: "ErroAutenticacao" },
    });
    return;
  }

  try {
    const usuario = jwt.verify(token, segredoJwt) as PayloadJwt;
    res.locals.usuario = usuario;
    next();
  } catch {
    res.status(401).json({
      sucesso: false,
      erro: { mensagem: "Token JWT invalido ou expirado", tipo: "ErroAutenticacao" },
    });
  }
}
