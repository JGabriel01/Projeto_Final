// Repositório de Empréstimos - Persistência com Prisma

import { prisma } from "../config/prismaClient.js";
import { Emprestimo } from "../negocios/Emprestimo.js";

export class RepositorioEmprestimos {
  private criarEmprestimoDoDb(data: any): Emprestimo {
    return new Emprestimo(
      data.id_emprestimo,
      data.usuario_id,
      data.exemplar_id,
      data.data_saida,
      data.data_vencimento,
      data.data_devolucao_real
    );
  }

  async adicionarEmprestimo(emprestimo: Emprestimo): Promise<Emprestimo> {
    const emprestimoDb = await prisma.emprestimo.create({
      data: {
        usuario_id: emprestimo.usuarioId,
        ...(emprestimo.exemplarId && emprestimo.exemplarId > 0 && { exemplar_id: emprestimo.exemplarId }),
        data_saida: emprestimo.dataSaida,
        data_vencimento: emprestimo.dataVencimento,
      },
    });
    return this.criarEmprestimoDoDb(emprestimoDb);
  }

  async buscarPorId(id: number): Promise<Emprestimo | undefined> {
    const emprestimo = await prisma.emprestimo.findUnique({
      where: { id_emprestimo: id },
    });
    return emprestimo ? this.criarEmprestimoDoDb(emprestimo) : undefined;
  }

  async buscarPorUsuario(usuarioId: number): Promise<Emprestimo[]> {
    const emprestimos = await prisma.emprestimo.findMany({
      where: { usuario_id: usuarioId },
    });
    return emprestimos.map((e) => this.criarEmprestimoDoDb(e));
  }

  async buscarAtivosDoUsuario(usuarioId: number): Promise<Emprestimo[]> {
    const emprestimos = await prisma.emprestimo.findMany({
      where: {
        usuario_id: usuarioId,
        data_devolucao_real: null,
      },
    });
    return emprestimos.map((e) => this.criarEmprestimoDoDb(e));
  }

  async listarTodos(): Promise<Emprestimo[]> {
    const emprestimos = await prisma.emprestimo.findMany();
    return emprestimos.map((e) => this.criarEmprestimoDoDb(e));
  }

  async listarAtivos(): Promise<Emprestimo[]> {
    const emprestimos = await prisma.emprestimo.findMany({
      where: { data_devolucao_real: null },
    });
    return emprestimos.map((e) => this.criarEmprestimoDoDb(e));
  }

  async listarAtrasados(): Promise<Emprestimo[]> {
    const agora = new Date();
    const emprestimos = await prisma.emprestimo.findMany({
      where: {
        data_devolucao_real: null,
        data_vencimento: { lt: agora },
      },
    });
    return emprestimos.map((e) => this.criarEmprestimoDoDb(e));
  }

  async listarDevolvidos(): Promise<Emprestimo[]> {
    const emprestimos = await prisma.emprestimo.findMany({
      where: { data_devolucao_real: { not: null } },
    });
    return emprestimos.map((e) => this.criarEmprestimoDoDb(e));
  }

  async atualizar(
    id: number,
    dados: { dataVencimento?: Date; exemplarId?: number | null }
  ): Promise<Emprestimo | null> {
    try {
      const emprestimoDb = await prisma.emprestimo.update({
        where: { id_emprestimo: id },
        data: {
          ...(dados.dataVencimento && {
            data_vencimento: dados.dataVencimento,
          }),
          ...(dados.exemplarId !== undefined && { exemplar_id: dados.exemplarId }),
        },
      });
      return this.criarEmprestimoDoDb(emprestimoDb);
    } catch {
      return null;
    }
  }

  async registrarDevolucao(
    id: number,
    dataDevolucaoReal: Date = new Date()
  ): Promise<Emprestimo | null> {
    try {
      const emprestimoDb = await prisma.emprestimo.update({
        where: { id_emprestimo: id },
        data: { data_devolucao_real: dataDevolucaoReal },
      });
      return this.criarEmprestimoDoDb(emprestimoDb);
    } catch {
      return null;
    }
  }

  async deletar(id: number): Promise<boolean> {
    try {
      await prisma.emprestimo.delete({
        where: { id_emprestimo: id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async contar(): Promise<number> {
    return await prisma.emprestimo.count();
  }

  async contarAtivos(): Promise<number> {
    return await prisma.emprestimo.count({
      where: { data_devolucao_real: null },
    });
  }

  async contarAtrasados(): Promise<number> {
    const agora = new Date();
    return await prisma.emprestimo.count({
      where: {
        data_devolucao_real: null,
        data_vencimento: { lt: agora },
      },
    });
  }

  async totalDiasAtraso(): Promise<number> {
    const atrasados = await this.listarAtrasados();
    return atrasados.reduce((total, emp) => {
      return total + emp.calcularDiasAtraso();
    }, 0);
  }

  async obterEstatisticas(): Promise<{
    total: number;
    ativos: number;
    devolvidos: number;
    atrasados: number;
  }> {
    const total = await this.contar();
    const ativos = await this.contarAtivos();
    const devolvidos = await prisma.emprestimo.count({
      where: { data_devolucao_real: { not: null } },
    });
    const atrasados = await this.contarAtrasados();
    return { total, ativos, devolvidos, atrasados };
  }
}
