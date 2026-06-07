import { ErroMulta, ErroNaoEncontrado, ErroValidacao } from "../excecoes/index.js";
import { Multa } from "../negocios/Multa.js";
import { RepositorioMultas } from "../persistencia/RepositorioMultas.js";
import type { ResultadoOperacao } from "./ControladorUsuarios.js";

export class ControladorMultas {
  private repositorioMultas = new RepositorioMultas();

  async criarMulta(
    valor: number,
    emprestimoId: number,
    exemplarId: number,
    statusPagamento: string = "pendente"
  ): Promise<ResultadoOperacao<Multa>> {
    try {
      const multa = new Multa(0, valor, emprestimoId, exemplarId, new Date(), statusPagamento);
      const criada = await this.repositorioMultas.adicionar(multa);
      return { sucesso: true, dados: criada };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao criar multa");
    }
  }

  async gerarPorEmprestimo(
    emprestimoId: number,
    valorPorDia?: number
  ): Promise<ResultadoOperacao<Multa>> {
    try {
      if (typeof emprestimoId !== "number" || emprestimoId <= 0) {
        throw new ErroValidacao("ID do emprestimo deve ser positivo");
      }
      const multa = await this.repositorioMultas.gerarPorEmprestimo(
        emprestimoId,
        valorPorDia
      );
      return { sucesso: true, dados: multa };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao gerar multa por atraso");
    }
  }

  async listarTodos(): Promise<ResultadoOperacao<Multa[]>> {
    try {
      const multas = await this.repositorioMultas.listarTodos();
      return { sucesso: true, dados: multas };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao listar multas");
    }
  }

  async buscarPorId(id: number): Promise<ResultadoOperacao<Multa>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }
      const multa = await this.repositorioMultas.buscarPorId(id);
      if (!multa) throw new ErroNaoEncontrado(`Multa com ID ${id} nao encontrada`);
      return { sucesso: true, dados: multa };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao buscar multa");
    }
  }

  async listarPendentes(): Promise<ResultadoOperacao<Multa[]>> {
    try {
      const multas = await this.repositorioMultas.listarPendentes();
      return { sucesso: true, dados: multas };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao listar multas pendentes");
    }
  }

  async atualizarMulta(
    id: number,
    dados: { valor?: number; statusPagamento?: string; dataPagamento?: Date | null }
  ): Promise<ResultadoOperacao<Multa>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }
      const multa = await this.repositorioMultas.atualizar(id, dados);
      if (!multa) throw new ErroNaoEncontrado(`Multa com ID ${id} nao encontrada`);
      return { sucesso: true, dados: multa };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao atualizar multa");
    }
  }

  async excluirMulta(id: number): Promise<ResultadoOperacao<{ id: number }>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }
      const excluiu = await this.repositorioMultas.deletar(id);
      if (!excluiu) throw new ErroNaoEncontrado(`Multa com ID ${id} nao encontrada`);
      return { sucesso: true, dados: { id } };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao excluir multa");
    }
  }

  private tratarErro(erro: any, mensagemDefault: string): ResultadoOperacao {
    if (erro instanceof ErroMulta || erro instanceof ErroValidacao) {
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
