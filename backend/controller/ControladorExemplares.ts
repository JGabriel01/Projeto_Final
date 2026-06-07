import { RepositorioExemplares } from "../persistencia/RepositorioExemplares.js";
import { ErroNaoEncontrado, ErroValidacao } from "../excecoes/index.js";
import type { ResultadoOperacao } from "./ControladorUsuarios.js";

export class ControladorExemplares {
  private repositorioExemplares = new RepositorioExemplares();

  async criarParaLivro(
    livroId: number,
    codigoTombo: string,
    estado: string,
    localizacao: string
  ): Promise<ResultadoOperacao> {
    try {
      if (typeof livroId !== "number" || livroId <= 0) {
        throw new ErroValidacao("ID do livro deve ser um numero positivo");
      }
      if (!codigoTombo || !estado || !localizacao) {
        throw new ErroValidacao("Codigo de tombo, estado e localizacao sao obrigatorios");
      }

      const exemplar = await this.repositorioExemplares.criarParaLivro(
        livroId,
        codigoTombo,
        estado,
        localizacao
      );
      return { sucesso: true, dados: exemplar };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao criar exemplar");
    }
  }

  async listarTodos(): Promise<ResultadoOperacao> {
    try {
      const exemplares = await this.repositorioExemplares.listarTodos();
      return { sucesso: true, dados: exemplares };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao listar exemplares");
    }
  }

  async buscarPorId(id: number): Promise<ResultadoOperacao> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }

      const exemplar = await this.repositorioExemplares.buscarPorId(id);
      if (!exemplar) {
        throw new ErroNaoEncontrado(`Exemplar com ID ${id} nao encontrado`);
      }

      return { sucesso: true, dados: exemplar };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao buscar exemplar");
    }
  }

  async atualizar(
    id: number,
    dados: { codigoTombo?: string; codigo_tombo?: string; estado?: string; localizacao?: string; livroId?: number; livro_id?: number }
  ): Promise<ResultadoOperacao> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }

      const exemplar = await this.repositorioExemplares.atualizar(id, {
        codigoTombo: dados.codigoTombo ?? dados.codigo_tombo,
        estado: dados.estado,
        localizacao: dados.localizacao,
        livroId: dados.livroId ?? dados.livro_id,
      });
      return { sucesso: true, dados: exemplar };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao atualizar exemplar");
    }
  }

  async excluir(id: number): Promise<ResultadoOperacao<{ id: number }>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }

      const excluiu = await this.repositorioExemplares.deletar(id);
      if (!excluiu) {
        throw new ErroNaoEncontrado(`Exemplar com ID ${id} nao encontrado`);
      }
      return { sucesso: true, dados: { id } };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao excluir exemplar");
    }
  }

  private tratarErro(erro: any, mensagemDefault: string): ResultadoOperacao {
    if (erro instanceof ErroValidacao) {
      return {
        sucesso: false,
        erro: { mensagem: erro.message, tipo: "ErroValidacao" },
      };
    }

    if (erro instanceof ErroNaoEncontrado) {
      return {
        sucesso: false,
        erro: { mensagem: erro.message, tipo: "ErroNaoEncontrado" },
      };
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
