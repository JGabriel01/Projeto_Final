import { Emprestimo } from "../negocios/Emprestimo.js";
import { RepositorioEmprestimos } from "../persistencia/RepositorioEmprestimos.js";
import { ErroEmprestimo, ErroValidacao } from "../excecoes/index.js";
import type { ResultadoOperacao } from "./ControladorUsuarios.js";

export class ControladorEmprestimos {
  private repositorioEmprestimos = new RepositorioEmprestimos();

  async criarEmprestimo(
    usuarioId: number,
    exemplarId: number | null,
    dataSaida?: Date,
    dataVencimento?: Date
  ): Promise<ResultadoOperacao<Emprestimo>> {
    try {
      if (typeof usuarioId !== "number" || usuarioId <= 0) {
        throw new ErroEmprestimo("ID do usuario invalido");
      }

      if (exemplarId !== null && (typeof exemplarId !== "number" || exemplarId <= 0)) {
        throw new ErroEmprestimo("ID do exemplar invalido");
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
      return this.tratarErro(erro, "Erro ao criar emprestimo");
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
