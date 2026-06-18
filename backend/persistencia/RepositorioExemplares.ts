import { prisma } from "../config/prismaClient.js";

export class RepositorioExemplares {
  async criarParaLivro(
    livroId: number,
    codigoTombo: string,
    estado: string,
    localizacao: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const exemplar = await tx.exemplar.create({
        data: {
          codigo_tombo: codigoTombo,
          estado,
          localizacao,
          livro_id: livroId,
        },
      });

      await tx.livro.updateMany({
        where: { id_livro: livroId, status: "inativo" },
        data: { status: "disponivel" },
      });

      return await tx.exemplar.findUnique({
        where: { id_exemplar: exemplar.id_exemplar },
        include: {
          livro: true,
        },
      });
    });
  }

  async listarTodos() {
    return await prisma.exemplar.findMany({
      include: {
        livro: true,
      },
      orderBy: { id_exemplar: "desc" },
    });
  }

  async buscarPorId(id: number) {
    return await prisma.exemplar.findUnique({
      where: { id_exemplar: id },
      include: {
        livro: true,
      },
    });
  }

  async buscarPorCodigoTombo(codigoTombo: string) {
    return await prisma.exemplar.findUnique({
      where: { codigo_tombo: codigoTombo },
      include: {
        livro: true,
      },
    });
  }

  async possuiHistorico(id: number): Promise<boolean> {
    const [emprestimos, multas] = await Promise.all([
      (prisma as any).emprestimo.count({ where: { exemplar_id: id } }),
      (prisma as any).multa.count({ where: { exemplar_id: id } }),
    ]);
    return emprestimos > 0 || multas > 0;
  }

  async atualizar(
    id: number,
    dados: { codigoTombo?: string; estado?: string; localizacao?: string; livroId?: number }
  ) {
    return await prisma.exemplar.update({
      where: { id_exemplar: id },
      data: {
        ...(dados.codigoTombo && { codigo_tombo: dados.codigoTombo }),
        ...(dados.estado && { estado: dados.estado }),
        ...(dados.localizacao && { localizacao: dados.localizacao }),
        ...(dados.livroId && { livro_id: dados.livroId }),
      },
      include: {
        livro: true,
      },
    });
  }

  async deletar(id: number): Promise<boolean> {
    try {
      await prisma.exemplar.delete({
        where: { id_exemplar: id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
