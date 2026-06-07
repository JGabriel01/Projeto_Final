// Repositório de Livros - Persistência com Prisma

import { prisma } from "../config/prismaClient.js";
import { Livro } from "../negocios/Livro.js";

export class RepositorioLivros {
  private criarLivroDoDb(data: any): Livro {
    return new Livro(
      data.id_livro,
      data.titulo,
      data.autor,
      data.genero,
      data.ano_publicacao,
      data.sinopse,
      data.status,
      data.capa_url ?? null,
      data.capa_objeto ?? null
    );
  }

  async adicionarLivro(livro: Livro): Promise<Livro> {
    const livroCriado = await prisma.livro.create({
      data: {
        titulo: livro.titulo,
        autor: livro.autor,
        genero: livro.genero,
        ano_publicacao: livro.anoPublicacao,
        sinopse: livro.sinopse,
        status: livro.status,
        capa_url: livro.capaUrl,
        capa_objeto: livro.capaObjeto,
      },
    });
    return this.criarLivroDoDb(livroCriado);
  }

  async buscarPorId(id: number): Promise<Livro | undefined> {
    const livro = await prisma.livro.findUnique({
      where: { id_livro: id },
    });
    return livro ? this.criarLivroDoDb(livro) : undefined;
  }

  async buscarPorTitulo(titulo: string): Promise<Livro[]> {
    const livros = await prisma.livro.findMany({
      where: { titulo: { contains: titulo } },
    });
    return livros.map((l) => this.criarLivroDoDb(l));
  }

  async buscarPorAutor(autor: string): Promise<Livro[]> {
    const livros = await prisma.livro.findMany({
      where: { autor: { contains: autor } },
    });
    return livros.map((l) => this.criarLivroDoDb(l));
  }

  async listarTodos(): Promise<Livro[]> {
    const livros = await prisma.livro.findMany();
    return livros.map((l) => this.criarLivroDoDb(l));
  }

  async listarDisponveis(): Promise<Livro[]> {
    const livros = await prisma.livro.findMany({
      where: { status: "disponível" },
    });
    return livros.map((l) => this.criarLivroDoDb(l));
  }

  async listarEmprestados(): Promise<Livro[]> {
    const livros = await prisma.livro.findMany({
      where: { status: "emprestado" },
    });
    return livros.map((l) => this.criarLivroDoDb(l));
  }

  async listarReservados(): Promise<Livro[]> {
    const livros = await prisma.livro.findMany({
      where: { status: "reservado" },
    });
    return livros.map((l) => this.criarLivroDoDb(l));
  }

  async buscarPorAno(ano: number): Promise<Livro[]> {
    const livros = await prisma.livro.findMany({
      where: { ano_publicacao: ano },
    });
    return livros.map((l) => this.criarLivroDoDb(l));
  }

  async listarOrdenadosPorTitulo(): Promise<Livro[]> {
    const livros = await prisma.livro.findMany({
      orderBy: { titulo: "asc" },
    });
    return livros.map((l) => this.criarLivroDoDb(l));
  }

  async listarOrdenadosPorAutor(): Promise<Livro[]> {
    const livros = await prisma.livro.findMany({
      orderBy: { autor: "asc" },
    });
    return livros.map((l) => this.criarLivroDoDb(l));
  }

  async atualizar(
    id: number,
    livroAtualizado: Partial<Livro>
  ): Promise<Livro | null> {
    try {
      const livroDb = await prisma.livro.update({
        where: { id_livro: id },
        data: {
          ...(livroAtualizado.titulo && { titulo: livroAtualizado.titulo }),
          ...(livroAtualizado.autor && { autor: livroAtualizado.autor }),
          ...(livroAtualizado.genero && { genero: livroAtualizado.genero }),
          ...(livroAtualizado.anoPublicacao && {
            ano_publicacao: livroAtualizado.anoPublicacao,
          }),
          ...(livroAtualizado.sinopse && { sinopse: livroAtualizado.sinopse }),
          ...(livroAtualizado.status && { status: livroAtualizado.status }),
        },
      });
      return this.criarLivroDoDb(livroDb);
    } catch {
      return null;
    }
  }

  async deletar(id: number): Promise<boolean> {
    try {
      await prisma.livro.delete({
        where: { id_livro: id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async atualizarCapa(
    id: number,
    capaObjeto: string,
    capaUrl: string
  ): Promise<Livro | null> {
    try {
      const livroDb = await prisma.livro.update({
        where: { id_livro: id },
        data: {
          capa_objeto: capaObjeto,
          capa_url: capaUrl,
        },
      });
      return this.criarLivroDoDb(livroDb);
    } catch {
      return null;
    }
  }

  async contar(): Promise<number> {
    return await prisma.livro.count();
  }

  async contarDisponveis(): Promise<number> {
    return await prisma.livro.count({
      where: { status: "disponível" },
    });
  }

  async obterEstatisticas(): Promise<{
    total: number;
    disponivel: number;
    emprestado: number;
    reservado: number;
  }> {
    const total = await prisma.livro.count();
    const disponivel = await prisma.livro.count({
      where: { status: "disponível" },
    });
    const emprestado = await prisma.livro.count({
      where: { status: "emprestado" },
    });
    const reservado = await prisma.livro.count({
      where: { status: "reservado" },
    });
    return { total, disponivel, emprestado, reservado };
  }
}
