import { PrismaClient } from '@prisma/client';
import { Emprestimo, CriarEmprestimoDTO } from '../../modelos/tipos';

const prisma = new PrismaClient();

export class RepositorioEmprestimo {
  async criar(dados: CriarEmprestimoDTO): Promise<Emprestimo> {
    const dataEmprestimo = new Date();
    const dataVencimento = new Date();
    const diasEmprestimo = dados.diasEmprestimo || 14;
    dataVencimento.setDate(dataVencimento.getDate() + diasEmprestimo);

    return await prisma.emprestimo.create({
      data: {
        usuarioId: dados.usuarioId,
        livroId: dados.livroId,
        dataEmprestimo,
        dataVencimento,
      },
    });
  }

  async obterPorId(id: number): Promise<Emprestimo | null> {
    return await prisma.emprestimo.findUnique({
      where: { id },
    });
  }

  async listar(): Promise<Emprestimo[]> {
    return await prisma.emprestimo.findMany();
  }

  async listarPorUsuario(usuarioId: number): Promise<Emprestimo[]> {
    return await prisma.emprestimo.findMany({
      where: { usuarioId },
    });
  }

  async listarAtivos(): Promise<Emprestimo[]> {
    return await prisma.emprestimo.findMany({
      where: { dataDevolucao: null },
    });
  }

  async devolverLivro(id: number): Promise<Emprestimo> {
    return await prisma.emprestimo.update({
      where: { id },
      data: { dataDevolucao: new Date() },
    });
  }

  async renovar(id: number, diasAdicionais: number = 14): Promise<Emprestimo> {
    const emprestimo = await this.obterPorId(id);
    if (!emprestimo) throw new Error('Empréstimo não encontrado');

    const novaDataVencimento = new Date(emprestimo.dataVencimento);
    novaDataVencimento.setDate(novaDataVencimento.getDate() + diasAdicionais);

    return await prisma.emprestimo.update({
      where: { id },
      data: { dataVencimento: novaDataVencimento },
    });
  }

  async deletar(id: number): Promise<void> {
    await prisma.emprestimo.delete({
      where: { id },
    });
  }
}

export default new RepositorioEmprestimo();
