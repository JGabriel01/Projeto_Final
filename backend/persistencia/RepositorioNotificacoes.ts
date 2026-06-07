import { prisma } from "../config/prismaClient.js";
import { Notificacao } from "../negocios/Notificacao.js";

export class RepositorioNotificacoes {
  private criarNotificacaoDoDb(data: any): Notificacao {
    return new Notificacao(
      data.id_notificacao,
      data.tipo,
      data.mensagem,
      data.usuario_id,
      data.lido,
      data.data_envio,
      data.id_emprestimo ?? null
    );
  }

  async adicionar(notificacao: Notificacao): Promise<Notificacao> {
    const notificacaoDb = await prisma.notificacao.create({
      data: {
        tipo: notificacao.tipo,
        mensagem: notificacao.mensagem,
        usuario_id: notificacao.idUsuario,
        id_emprestimo: notificacao.idEmprestimo,
        lido: notificacao.lida,
        data_envio: notificacao.dataCriacao,
      },
    });
    return this.criarNotificacaoDoDb(notificacaoDb);
  }

  async listarTodos(): Promise<Notificacao[]> {
    const notificacoes = await prisma.notificacao.findMany({
      orderBy: { data_envio: "desc" },
    });
    return notificacoes.map((n) => this.criarNotificacaoDoDb(n));
  }

  async buscarPorId(id: number): Promise<Notificacao | undefined> {
    const notificacao = await prisma.notificacao.findUnique({
      where: { id_notificacao: id },
    });
    return notificacao ? this.criarNotificacaoDoDb(notificacao) : undefined;
  }

  async buscarPorUsuario(usuarioId: number): Promise<Notificacao[]> {
    const notificacoes = await prisma.notificacao.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { data_envio: "desc" },
    });
    return notificacoes.map((n) => this.criarNotificacaoDoDb(n));
  }

  async atualizar(
    id: number,
    dados: { tipo?: string; mensagem?: string; lido?: boolean }
  ): Promise<Notificacao | null> {
    try {
      const notificacao = await prisma.notificacao.update({
        where: { id_notificacao: id },
        data: {
          ...(dados.tipo && { tipo: dados.tipo }),
          ...(dados.mensagem && { mensagem: dados.mensagem }),
          ...(dados.lido !== undefined && { lido: dados.lido }),
        },
      });
      return this.criarNotificacaoDoDb(notificacao);
    } catch {
      return null;
    }
  }

  async deletar(id: number): Promise<boolean> {
    try {
      await prisma.notificacao.delete({ where: { id_notificacao: id } });
      return true;
    } catch {
      return false;
    }
  }
}
