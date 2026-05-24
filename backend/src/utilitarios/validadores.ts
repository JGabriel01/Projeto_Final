export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validarSenha(senha: string): { valida: boolean; erro?: string } {
  if (senha.length < 6) {
    return { valida: false, erro: 'Senha deve ter pelo menos 6 caracteres' };
  }
  return { valida: true };
}

export function validarCamposObrigatorios(
  dados: Record<string, any>,
  campos: string[]
): { valido: boolean; faltando?: string[] } {
  const faltando = campos.filter((campo) => !dados[campo]);
  
  if (faltando.length > 0) {
    return { valido: false, faltando };
  }
  
  return { valido: true };
}
