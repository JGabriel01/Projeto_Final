import { PrismaClient } from '@prisma/client';
import { Reserva, CriarReservaDTO } from '../../modelos/tipos';

const prisma = new PrismaClient();

export class RepositorioReserva {
  async criar(dados: CriarReservaDTO): Promise<Reserva> {
    return (await prisma.reserva.create({
      data: {
        usuarioId: dados.usuarioId,
        livroId: dados.livroId,
        status: 'ativa',
      },
    })) as Reserva;
  }

  async obterPorId(id: number): Promise<Reserva | null> {
    const resultado = await prisma.reserva.findUnique({
      where: { id },
    });
    return resultado ? (resultado as Reserva) : null;
  }

  async listar(): Promise<Reserva[]> {
    const resultados = await prisma.reserva.findMany();
    return resultados.map((r) => r as Reserva);
  }

  async listarPorUsuario(usuarioId: number): Promise<Reserva[]> {
    const resultados = await prisma.reserva.findMany({
      where: { usuarioId },
    });
    return resultados.map((r) => r as Reserva);
  }

  async listarAtivasPorLivro(livroId: number): Promise<Reserva[]> {
    const resultados = await prisma.reserva.findMany({
      where: {
        livroId,
        status: 'ativa',
      },
      orderBy: {
        reservadoEm: 'asc',
      },
    });
    return resultados.map((r) => r as Reserva);
  }

  async atualizarStatus(
    id: number,
    status: 'ativa' | 'cancelada' | 'retirada'
  ): Promise<Reserva> {
    return (await prisma.reserva.update({
      where: { id },
      data: { status },
    })) as Reserva;
  }

  async cancelar(id: number): Promise<Reserva> {
    return this.atualizarStatus(id, 'cancelada');
  }

  async marcarComoRetirada(id: number): Promise<Reserva> {
    return this.atualizarStatus(id, 'retirada');
  }

  async deletar(id: number): Promise<void> {
    await prisma.reserva.delete({
      where: { id },
    });
  }
}

export default new RepositorioReserva();
