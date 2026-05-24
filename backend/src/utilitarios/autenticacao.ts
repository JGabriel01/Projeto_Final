import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui';
const EXPIRACAO = '24h';

export interface PayloadJWT {
  id: number;
  email: string;
}

export function gerarToken(payload: PayloadJWT): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRACAO });
}

export function verificarToken(token: string): PayloadJWT | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as PayloadJWT;
    return decoded;
  } catch {
    return null;
  }
}

export function extrairTokenDoHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
