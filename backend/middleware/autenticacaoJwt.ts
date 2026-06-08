import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface PayloadJwt {
  idUsuario: number;
  email: string;
  nivelAcesso: string;
}

const segredoJwt = process.env.JWT_SECRET || "segredo-dev-projeto-final";
const sessoesAtivasPorUsuario = new Map<number, string>();

export function gerarToken(payload: PayloadJwt): string {
  return jwt.sign(payload, segredoJwt, { expiresIn: "2h" });
}

export function registrarSessao(usuarioId: number, token: string): void {
  sessoesAtivasPorUsuario.set(usuarioId, token);
}

export function encerrarSessao(usuarioId: number): void {
  sessoesAtivasPorUsuario.delete(usuarioId);
}

export function usuarioTemSessaoAtiva(usuarioId: number): boolean {
  const tokenAtivo = sessoesAtivasPorUsuario.get(usuarioId);
  if (!tokenAtivo) return false;

  try {
    jwt.verify(tokenAtivo, segredoJwt);
    return true;
  } catch {
    sessoesAtivasPorUsuario.delete(usuarioId);
    return false;
  }
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
    const tokenAtivo = sessoesAtivasPorUsuario.get(usuario.idUsuario);

    if (tokenAtivo !== token) {
      res.status(401).json({
        sucesso: false,
        erro: {
          mensagem: "Sessao expirada ou encerrada. Faca login novamente",
          tipo: "ErroAutenticacao",
        },
      });
      return;
    }

    res.locals.usuario = usuario;
    res.locals.token = token;
    next();
  } catch {
    res.status(401).json({
      sucesso: false,
      erro: { mensagem: "Token JWT invalido ou expirado", tipo: "ErroAutenticacao" },
    });
  }
}

export function autorizarProprioUsuario(parametroId: string = "id") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const idSolicitado = Number(req.params[parametroId]);
    const idLogado = Number(res.locals.usuario?.idUsuario);

    if (!Number.isInteger(idSolicitado) || idSolicitado <= 0) {
      res.status(400).json({
        sucesso: false,
        erro: { mensagem: "ID deve ser um numero positivo", tipo: "ErroValidacao" },
      });
      return;
    }

    if (idSolicitado !== idLogado) {
      res.status(403).json({
        sucesso: false,
        erro: {
          mensagem: "Voce so pode acessar ou alterar os dados do proprio usuario",
          tipo: "ErroAutorizacao",
        },
      });
      return;
    }

    next();
  };
}

export function autorizarProprioUsuarioBody() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const idSolicitado = Number(req.body.idUsuario ?? req.body.id_usuario ?? req.body.id);
    const idLogado = Number(res.locals.usuario?.idUsuario);

    if (!Number.isInteger(idSolicitado) || idSolicitado <= 0) {
      res.status(400).json({
        sucesso: false,
        erro: { mensagem: "ID deve ser um numero positivo", tipo: "ErroValidacao" },
      });
      return;
    }

    if (idSolicitado !== idLogado) {
      res.status(403).json({
        sucesso: false,
        erro: {
          mensagem: "Voce so pode excluir o proprio cadastro",
          tipo: "ErroAutorizacao",
        },
      });
      return;
    }

    next();
  };
}
