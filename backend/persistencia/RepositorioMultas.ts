import { prisma } from "../config/prismaClient.js";
import { Multa } from "../negocios/Multa.js";

export class RepositorioMultas {
  private criarMultaDoDb(data: any): Multa {
    return new Multa(
      data.id_multa,
      data.valor_multa,
      data.emprestimo_id,
      data.exemplar_id,
      data.data_geracao,
      data.status_pagamento
    );
  }

  async adicionar(multa: Multa): Promise<Multa> {
    const multaDb = await prisma.multa.create({
      data: {
        valor_multa: multa.valor,
        status_pagamento: multa.statusPagamento,
        data_geracao: multa.dataCriacao,
        emprestimo_id: multa.idEmprestimo,
        exemplar_id: multa.idExemplar,
      },
    });
    return this.criarMultaDoDb(multaDb);
  }

  async gerarPorEmprestimo(
    emprestimoId: number,
    valorPorDia: number = 2
  ): Promise<Multa> {
    const emprestimo = await prisma.emprestimo.findUnique({
      where: { id_emprestimo: emprestimoId },
    });
    if (!emprestimo || !emprestimo.exemplar_id) {
      throw new Error("Emprestimo nao encontrado ou sem exemplar");
    }

    const dataComparacao = emprestimo.data_devolucao_real ?? new Date();
    const atrasoMs = dataComparacao.getTime() - emprestimo.data_vencimento.getTime();
    const diasAtraso = Math.max(0, Math.ceil(atrasoMs / (1000 * 60 * 60 * 24)));
    const multa = new Multa(
      0,
      diasAtraso * valorPorDia,
      emprestimo.id_emprestimo,
      emprestimo.exemplar_id
    );
    return await this.adicionar(multa);
  }

  async listarTodos(): Promise<Multa[]> {
    const multas = await prisma.multa.findMany({
      orderBy: { data_geracao: "desc" },
    });
    return multas.map((m) => this.criarMultaDoDb(m));
  }

  async buscarPorId(id: number): Promise<Multa | undefined> {
    const multa = await prisma.multa.findUnique({ where: { id_multa: id } });
    return multa ? this.criarMultaDoDb(multa) : undefined;
  }

  async listarPendentes(): Promise<Multa[]> {
    const multas = await prisma.multa.findMany({
      where: { status_pagamento: "pendente" },
      orderBy: { data_geracao: "desc" },
    });
    return multas.map((m) => this.criarMultaDoDb(m));
  }

  async atualizar(
    id: number,
    dados: { valor?: number; statusPagamento?: string; dataPagamento?: Date | null }
  ): Promise<Multa | null> {
    try {
      const multa = await prisma.multa.update({
        where: { id_multa: id },
        data: {
          ...(dados.valor !== undefined && { valor_multa: dados.valor }),
          ...(dados.statusPagamento && { status_pagamento: dados.statusPagamento }),
          ...(dados.dataPagamento !== undefined && {
            data_pagamento: dados.dataPagamento,
          }),
        },
      });
      return this.criarMultaDoDb(multa);
    } catch {
      return null;
    }
  }

  async deletar(id: number): Promise<boolean> {
    try {
      await prisma.multa.delete({ where: { id_multa: id } });
      return true;
    } catch {
      return false;
    }
  }
}
