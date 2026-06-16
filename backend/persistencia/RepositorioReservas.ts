import { prisma } from "../config/prismaClient.js";
import { Reserva } from "../negocios/Reserva.js";

export class RepositorioReservas {
  private criarReservaDoDb(data: any): Reserva {
    const reserva = new Reserva(
      data.id_reserva,
      data.usuario_id,
      data.livro_id,
      data.data_reserva,
      data.data_expiracao
    );
    reserva.statusReserva = data.status_reserva;
    return reserva;
  }

  async adicionar(reserva: Reserva): Promise<Reserva> {
    const reservaDb = await prisma.reserva.create({
      data: {
        usuario_id: reserva.usuarioId,
        livro_id: reserva.livroId,
        data_reserva: reserva.dataReserva,
        data_expiracao: reserva.dataExpiracao,
        status_reserva: reserva.statusReserva,
      },
    });
    return this.criarReservaDoDb(reservaDb);
  }

  async listarTodos(): Promise<Reserva[]> {
    const reservas = await prisma.reserva.findMany({
      orderBy: { data_reserva: "desc" },
    });
    return reservas.map((r) => this.criarReservaDoDb(r));
  }

  async buscarPorId(id: number): Promise<Reserva | undefined> {
    const reserva = await prisma.reserva.findUnique({
      where: { id_reserva: id },
    });
    return reserva ? this.criarReservaDoDb(reserva) : undefined;
  }

  async buscarPorUsuario(usuarioId: number): Promise<Reserva[]> {
    const reservas = await prisma.reserva.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { data_reserva: "desc" },
    });
    return reservas.map((r) => this.criarReservaDoDb(r));
  }

  async atualizar(
    id: number,
    dados: { dataExpiracao?: Date; statusReserva?: string }
  ): Promise<Reserva | null> {
    try {
      const reserva = await prisma.reserva.update({
        where: { id_reserva: id },
        data: {
          ...(dados.dataExpiracao && { data_expiracao: dados.dataExpiracao }),
          ...(dados.statusReserva && { status_reserva: dados.statusReserva }),
        },
      });
      return this.criarReservaDoDb(reserva);
    } catch {
      return null;
    }
  }

  async deletar(id: number): Promise<boolean> {
    try {
      await prisma.reserva.delete({ where: { id_reserva: id } });
      return true;
    } catch {
      return false;
    }
  }
}
