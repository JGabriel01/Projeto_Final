import { Emprestimo } from "../negocios/Emprestimo.js";
import { RepositorioExemplares } from "../persistencia/RepositorioExemplares.js";
import { RepositorioEmprestimos } from "../persistencia/RepositorioEmprestimos.js";
import { ErroEmprestimo, ErroNaoEncontrado, ErroValidacao } from "../excecoes/index.js";
import type { ResultadoOperacao } from "./ControladorUsuarios.js";

export class ControladorEmprestimos {
  private repositorioEmprestimos = new RepositorioEmprestimos();
  private repositorioExemplares = new RepositorioExemplares();

  async criarEmprestimo(
    usuarioId: number,
    exemplarId: number | null,
    dataSaida?: Date,
    dataVencimento?: Date
  ): Promise<ResultadoOperacao<Emprestimo>> {
    try {
      if (typeof usuarioId !== "number" || usuarioId <= 0) {
        throw new ErroEmprestimo("ID do usuário inválido");
      }

      if (exemplarId !== null && (typeof exemplarId !== "number" || exemplarId <= 0)) {
        throw new ErroEmprestimo("ID do exemplar inválido");
      }

      if (exemplarId !== null) {
        const exemplar = await this.repositorioExemplares.buscarPorId(exemplarId);
        if (!exemplar) {
          throw new ErroNaoEncontrado(`Exemplar com ID ${exemplarId} não encontrado`);
        }
        if (String(exemplar.livro?.status || "").toLowerCase() === "inativo") {
          throw new ErroEmprestimo("Livro inativo não pode gerar novos empréstimos");
        }
      }

      const emprestimo = new Emprestimo(
        0,
        usuarioId,
        exemplarId,
        dataSaida,
        dataVencimento
      );

      const emprestimoCriado =
        await this.repositorioEmprestimos.adicionarEmprestimo(emprestimo);
      return { sucesso: true, dados: emprestimoCriado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao criar empréstimo");
    }
  }

  async listarTodos(): Promise<ResultadoOperacao<Emprestimo[]>> {
    try {
      const emprestimos = await this.repositorioEmprestimos.listarTodos();
      return { sucesso: true, dados: emprestimos };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao listar empréstimos");
    }
  }

  async buscarPorId(id: number): Promise<ResultadoOperacao<Emprestimo>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um número positivo");
      }

      const emprestimo = await this.repositorioEmprestimos.buscarPorId(id);
      if (!emprestimo) {
        throw new ErroNaoEncontrado(`Empréstimo com ID ${id} não encontrado`);
      }

      return { sucesso: true, dados: emprestimo };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao buscar empréstimo");
    }
  }

  async excluirEmprestimo(id: number): Promise<ResultadoOperacao<{ id: number }>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um número positivo");
      }

      const excluiu = await this.repositorioEmprestimos.deletar(id);
      if (!excluiu) {
        throw new ErroNaoEncontrado(`Empréstimo com ID ${id} não encontrado`);
      }

      return { sucesso: true, dados: { id } };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao excluir empréstimo");
    }
  }

  async atualizarEmprestimo(
    id: number,
    dados: { dataVencimento?: Date; exemplarId?: number | null }
  ): Promise<ResultadoOperacao<Emprestimo>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um número positivo");
      }

      if (dados.dataVencimento && isNaN(dados.dataVencimento.getTime())) {
        throw new ErroValidacao("Data de vencimento inválida");
      }
      if (
        dados.exemplarId !== undefined &&
        dados.exemplarId !== null &&
        (typeof dados.exemplarId !== "number" || dados.exemplarId <= 0)
      ) {
        throw new ErroValidacao("ID do exemplar deve ser positivo ou nulo");
      }

      const atualizado = await this.repositorioEmprestimos.atualizar(id, dados);
      if (!atualizado) {
        throw new ErroNaoEncontrado(`Empréstimo com ID ${id} não encontrado`);
      }

      return { sucesso: true, dados: atualizado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao atualizar empréstimo");
    }
  }

  async registrarDevolucao(
    id: number,
    dataDevolucaoReal?: Date
  ): Promise<ResultadoOperacao<Emprestimo>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um número positivo");
      }

      const devolvido = await this.repositorioEmprestimos.registrarDevolucao(
        id,
        dataDevolucaoReal
      );
      if (!devolvido) {
        throw new ErroNaoEncontrado(`Empréstimo com ID ${id} não encontrado`);
      }

      return { sucesso: true, dados: devolvido };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao registrar devolução");
    }
  }

  private tratarErro(erro: any, mensagemDefault: string): ResultadoOperacao {
    if (erro instanceof ErroEmprestimo) {
      return {
        sucesso: false,
        erro: {
          mensagem: erro.message,
          tipo: "ErroEmprestimo",
        },
      };
    }

    if (erro instanceof ErroValidacao) {
      return {
        sucesso: false,
        erro: {
          mensagem: erro.message,
          tipo: "ErroValidacao",
        },
      };
    }

    if (erro instanceof ErroNaoEncontrado) {
      return {
        sucesso: false,
        erro: {
          mensagem: erro.message,
          tipo: "ErroNaoEncontrado",
        },
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
