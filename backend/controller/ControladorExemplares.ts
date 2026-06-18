import { RepositorioExemplares } from "../persistencia/RepositorioExemplares.js";
import { ErroDuplicado, ErroNaoEncontrado, ErroValidacao } from "../excecoes/index.js";
import type { ResultadoOperacao } from "./ControladorUsuarios.js";

export class ControladorExemplares {
  private repositorioExemplares = new RepositorioExemplares();

  private normalizarCodigoTombo(codigoTombo: string): string {
    return String(codigoTombo || "").trim().toUpperCase();
  }

  private validarCodigoTombo(codigoTombo: string): void {
    if (!/^T\d{8}$/.test(codigoTombo)) {
      throw new ErroValidacao("Código de tombo deve seguir o padrão T20260001");
    }
  }

  async criarParaLivro(
    livroId: number,
    codigoTombo: string,
    estado: string,
    localizacao: string
  ): Promise<ResultadoOperacao> {
    try {
      if (typeof livroId !== "number" || livroId <= 0) {
        throw new ErroValidacao("ID do livro deve ser um número positivo");
      }
      if (!codigoTombo || !estado || !localizacao) {
        throw new ErroValidacao("Código de tombo, estado e localização são obrigatórios");
      }

      const codigoNormalizado = this.normalizarCodigoTombo(codigoTombo);
      this.validarCodigoTombo(codigoNormalizado);

      const tomboExistente = await this.repositorioExemplares.buscarPorCodigoTombo(codigoNormalizado);
      if (tomboExistente) {
        throw new ErroDuplicado(`Código de tombo ${codigoNormalizado} já está cadastrado`);
      }

      const exemplar = await this.repositorioExemplares.criarParaLivro(
        livroId,
        codigoNormalizado,
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
        throw new ErroValidacao("ID deve ser um número positivo");
      }

      const exemplar = await this.repositorioExemplares.buscarPorId(id);
      if (!exemplar) {
        throw new ErroNaoEncontrado(`Exemplar com ID ${id} não encontrado`);
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
        throw new ErroValidacao("ID deve ser um número positivo");
      }

      const codigoRecebido = dados.codigoTombo ?? dados.codigo_tombo;
      let codigoNormalizado: string | undefined;
      if (codigoRecebido !== undefined) {
        codigoNormalizado = this.normalizarCodigoTombo(codigoRecebido);
        this.validarCodigoTombo(codigoNormalizado);

        const tomboExistente = await this.repositorioExemplares.buscarPorCodigoTombo(codigoNormalizado);
        if (tomboExistente && tomboExistente.id_exemplar !== id) {
          throw new ErroDuplicado(`Código de tombo ${codigoNormalizado} já está cadastrado`);
        }
      }

      const exemplar = await this.repositorioExemplares.atualizar(id, {
        codigoTombo: codigoNormalizado,
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
        throw new ErroValidacao("ID deve ser um número positivo");
      }

      const excluiu = await this.repositorioExemplares.deletar(id);
      if (!excluiu) {
        throw new ErroNaoEncontrado(`Exemplar com ID ${id} não encontrado`);
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

    if (erro instanceof ErroDuplicado) {
      return {
        sucesso: false,
        erro: { mensagem: erro.message, tipo: "ErroDuplicado" },
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
