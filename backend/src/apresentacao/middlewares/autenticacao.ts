import { Request, Response, NextFunction } from 'express';
import { extrairTokenDoHeader, verificarToken, PayloadJWT } from '../../utilitarios/autenticacao';

declare global {
  namespace Express {
    interface Request {
      usuario?: PayloadJWT;
    }
  }
}

export function middlewareAutenticacao(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = extrairTokenDoHeader(req.headers.authorization);

  if (!token) {
    res.status(401).json({ erro: 'Token não fornecido' });
    return;
  }

  const payload = verificarToken(token);

  if (!payload) {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
    return;
  }

  req.usuario = payload;
  next();
}
