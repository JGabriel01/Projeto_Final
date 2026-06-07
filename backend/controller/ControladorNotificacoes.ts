import { ErroNaoEncontrado, ErroValidacao } from "../excecoes/index.js";
import { Notificacao } from "../negocios/Notificacao.js";
import { RepositorioNotificacoes } from "../persistencia/RepositorioNotificacoes.js";
import type { ResultadoOperacao } from "./ControladorUsuarios.js";

export class ControladorNotificacoes {
  private repositorioNotificacoes = new RepositorioNotificacoes();

  async criarNotificacao(
    tipo: string,
    mensagem: string,
    usuarioId: number,
    emprestimoId: number | null = null
  ): Promise<ResultadoOperacao<Notificacao>> {
    try {
      const notificacao = new Notificacao(
        0,
        tipo,
        mensagem,
        usuarioId,
        false,
        new Date(),
        emprestimoId
      );
      const criada = await this.repositorioNotificacoes.adicionar(notificacao);
      return { sucesso: true, dados: criada };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao criar notificacao");
    }
  }

  async listarTodos(): Promise<ResultadoOperacao<Notificacao[]>> {
    try {
      const notificacoes = await this.repositorioNotificacoes.listarTodos();
      return { sucesso: true, dados: notificacoes };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao listar notificacoes");
    }
  }

  async buscarPorId(id: number): Promise<ResultadoOperacao<Notificacao>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }
      const notificacao = await this.repositorioNotificacoes.buscarPorId(id);
      if (!notificacao) {
        throw new ErroNaoEncontrado(`Notificacao com ID ${id} nao encontrada`);
      }
      return { sucesso: true, dados: notificacao };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao buscar notificacao");
    }
  }

  async buscarPorUsuario(usuarioId: number): Promise<ResultadoOperacao<Notificacao[]>> {
    try {
      if (typeof usuarioId !== "number" || usuarioId <= 0) {
        throw new ErroValidacao("ID do usuario deve ser positivo");
      }
      const notificacoes = await this.repositorioNotificacoes.buscarPorUsuario(usuarioId);
      return { sucesso: true, dados: notificacoes };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao listar notificacoes do usuario");
    }
  }

  async atualizarNotificacao(
    id: number,
    dados: { tipo?: string; mensagem?: string; lido?: boolean }
  ): Promise<ResultadoOperacao<Notificacao>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }
      const notificacao = await this.repositorioNotificacoes.atualizar(id, dados);
      if (!notificacao) {
        throw new ErroNaoEncontrado(`Notificacao com ID ${id} nao encontrada`);
      }
      return { sucesso: true, dados: notificacao };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao atualizar notificacao");
    }
  }

  async excluirNotificacao(id: number): Promise<ResultadoOperacao<{ id: number }>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }
      const excluiu = await this.repositorioNotificacoes.deletar(id);
      if (!excluiu) {
        throw new ErroNaoEncontrado(`Notificacao com ID ${id} nao encontrada`);
      }
      return { sucesso: true, dados: { id } };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao excluir notificacao");
    }
  }

  private tratarErro(erro: any, mensagemDefault: string): ResultadoOperacao {
    if (erro instanceof ErroValidacao) {
      return { sucesso: false, erro: { mensagem: erro.message, tipo: "ErroValidacao" } };
    }
    if (erro instanceof ErroNaoEncontrado) {
      return { sucesso: false, erro: { mensagem: erro.message, tipo: "ErroNaoEncontrado" } };
    }
    return {
      sucesso: false,
      erro: {
        mensagem: mensagemDefault,
        tipo: "ErroDesconhecido",
        detalhes: erro?.message || "Erro desconhecido",
      },
    };
  }
}
