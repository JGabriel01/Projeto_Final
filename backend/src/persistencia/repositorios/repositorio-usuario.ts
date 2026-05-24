import { PrismaClient } from '@prisma/client';
import { Usuario, RegistrarDTO } from '../../modelos/tipos';

const prisma = new PrismaClient();

export class RepositorioUsuario {
  async criar(dados: RegistrarDTO & { senha: string }): Promise<Usuario> {
    return await prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
      },
    });
  }

  async obterPorEmail(email: string): Promise<Usuario | null> {
    return await prisma.usuario.findUnique({
      where: { email },
    });
  }

  async obterPorId(id: number): Promise<Usuario | null> {
    return await prisma.usuario.findUnique({
      where: { id },
    });
  }

  async listar(): Promise<Usuario[]> {
    return await prisma.usuario.findMany();
  }

  async atualizar(id: number, dados: Partial<Usuario>): Promise<Usuario> {
    return await prisma.usuario.update({
      where: { id },
      data: dados,
    });
  }

  async deletar(id: number): Promise<void> {
    await prisma.usuario.delete({
      where: { id },
    });
  }
}

export default new RepositorioUsuario();
