import { PrismaClient } from '@prisma/client';
import { Multa } from '../../modelos/tipos';

const prisma = new PrismaClient();

export class RepositorioMulta {
  async criar(usuarioId: number, emprestimoId: number, valorMulta: number): Promise<Multa> {
    return await prisma.multa.create({
      data: {
        usuarioId,
        emprestimoId,
        valorMulta,
      },
    });
  }

  async obterPorId(id: number): Promise<Multa | null> {
    return await prisma.multa.findUnique({
      where: { id },
    });
  }

  async listar(): Promise<Multa[]> {
    return await prisma.multa.findMany();
  }

  async listarPorUsuario(usuarioId: number): Promise<Multa[]> {
    return await prisma.multa.findMany({
      where: { usuarioId },
    });
  }

  async listarNaoPagas(): Promise<Multa[]> {
    return await prisma.multa.findMany({
      where: { pago: false },
    });
  }

  async listarNaoPagasPorUsuario(usuarioId: number): Promise<Multa[]> {
    return await prisma.multa.findMany({
      where: {
        usuarioId,
        pago: false,
      },
    });
  }

  async obterPorEmprestimo(emprestimoId: number): Promise<Multa | null> {
    return await prisma.multa.findUnique({
      where: { emprestimoId },
    });
  }

  async marcarComoPaga(id: number): Promise<Multa> {
    return await prisma.multa.update({
      where: { id },
      data: { pago: true },
    });
  }

  async deletar(id: number): Promise<void> {
    await prisma.multa.delete({
      where: { id },
    });
  }
}

export default new RepositorioMulta();
