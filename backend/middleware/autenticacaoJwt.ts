import type { NextFunction, Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";

export interface PayloadJwt {
  idUsuario: number;
  email: string;
  nivelAcesso: string;
}

const segredoJwt = process.env.JWT_SECRET || "segredo-dev-projeto-final";
const expiracaoJwt = (process.env.JWT_EXPIRES_IN || "2h") as SignOptions["expiresIn"];
const sessoesAtivasPorUsuario = new Map<number, string>();

export function gerarToken(payload: PayloadJwt): string {
  return jwt.sign(payload, segredoJwt, { expiresIn: expiracaoJwt });
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
      erro: { mensagem: "Token JWT não informado", tipo: "ErroAutenticacao" },
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
          mensagem: "Sessão expirada ou encerrada. Faça login novamente",
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
      erro: { mensagem: "Token JWT inválido ou expirado", tipo: "ErroAutenticacao" },
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
        erro: { mensagem: "ID deve ser um número positivo", tipo: "ErroValidacao" },
      });
      return;
    }

    if (idSolicitado !== idLogado) {
      res.status(403).json({
        sucesso: false,
        erro: {
          mensagem: "Você só pode acessar ou alterar os dados do próprio usuário",
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
        erro: { mensagem: "ID deve ser um número positivo", tipo: "ErroValidacao" },
      });
      return;
    }

    if (idSolicitado !== idLogado) {
      res.status(403).json({
        sucesso: false,
        erro: {
          mensagem: "Você só pode excluir o próprio cadastro",
          tipo: "ErroAutorizacao",
        },
      });
      return;
    }

    next();
  };
}

export function autorizarAdmin(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.locals.usuario?.nivelAcesso !== "admin") {
    res.status(403).json({
      sucesso: false,
      erro: {
        mensagem: "Apenas administradores podem realizar esta operação",
        tipo: "ErroAutorizacao",
      },
    });
    return;
  }

  next();
}
