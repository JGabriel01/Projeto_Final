import { PrismaClient } from '@prisma/client';
import { Livro, CriarLivroDTO } from '../../modelos/tipos';

const prisma = new PrismaClient();

export class RepositorioLivro {
  async criar(dados: CriarLivroDTO & { capa?: string; arquivo?: string }): Promise<Livro> {
    return await prisma.livro.create({
      data: {
        titulo: dados.titulo,
        autor: dados.autor,
        genero: dados.genero,
        ano: dados.ano,
        sinopse: dados.sinopse,
        capa: dados.capa,
        arquivo: dados.arquivo,
        disponivel: true,
      },
    });
  }

  async obterPorId(id: number): Promise<Livro | null> {
    return await prisma.livro.findUnique({
      where: { id },
    });
  }

  async listar(): Promise<Livro[]> {
    return await prisma.livro.findMany();
  }

  async listarDisponiveis(): Promise<Livro[]> {
    return await prisma.livro.findMany({
      where: { disponivel: true },
    });
  }

  async buscarPorTitulo(titulo: string): Promise<Livro[]> {
    return await prisma.livro.findMany({
      where: {
        titulo: {
          contains: titulo,
        },
      },
    });
  }

  async buscarPorAutor(autor: string): Promise<Livro[]> {
    return await prisma.livro.findMany({
      where: {
        autor: {
          contains: autor,
        },
      },
    });
  }

  async atualizar(id: number, dados: Partial<Livro>): Promise<Livro> {
    return await prisma.livro.update({
      where: { id },
      data: dados,
    });
  }

  async deletar(id: number): Promise<void> {
    await prisma.livro.delete({
      where: { id },
    });
  }

  async atualizarDisponibilidade(id: number, disponivel: boolean): Promise<Livro> {
    return await prisma.livro.update({
      where: { id },
      data: { disponivel },
    });
  }
}

export default new RepositorioLivro();
