import { prisma } from "../config/prismaClient.js";

export class RepositorioExemplares {
  async criarParaLivro(
    livroId: number,
    codigoTombo: string,
    estado: string,
    localizacao: string
  ) {
    return await prisma.exemplar.create({
      data: {
        codigo_tombo: codigoTombo,
        estado,
        localizacao,
        livro_id: livroId,
      },
      include: {
        livro: true,
      },
    });
  }

  async listarTodos() {
    return await prisma.exemplar.findMany({
      include: {
        livro: true,
      },
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
