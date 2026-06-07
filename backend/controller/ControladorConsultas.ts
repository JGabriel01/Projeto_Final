import { ErroValidacao } from "../excecoes/index.js";
import { RepositorioConsultas } from "../persistencia/RepositorioConsultas.js";
import type { ResultadoOperacao } from "./ControladorUsuarios.js";

export class ControladorConsultas {
  private repositorioConsultas = new RepositorioConsultas();

  async emprestimosAtivosPorUsuario(usuarioId?: number): Promise<ResultadoOperacao> {
    try {
      if (usuarioId !== undefined && (typeof usuarioId !== "number" || usuarioId <= 0)) {
        throw new ErroValidacao("ID do usuario deve ser positivo");
      }
      const dados = await this.repositorioConsultas.emprestimosAtivosPorUsuario(usuarioId);
      return { sucesso: true, dados };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao consultar emprestimos ativos por usuario");
    }
  }

  async livrosMaisEmprestados(
    limite?: number,
    dataInicio?: Date,
    dataFim?: Date
  ): Promise<ResultadoOperacao> {
    try {
      const dados = await this.repositorioConsultas.livrosMaisEmprestados(
        limite && limite > 0 ? limite : 10,
        dataInicio,
        dataFim
      );
      return { sucesso: true, dados };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao consultar livros mais emprestados");
    }
  }

  async multasPendentesPorUsuario(): Promise<ResultadoOperacao> {
    try {
      const dados = await this.repositorioConsultas.multasPendentesPorUsuario();
      return { sucesso: true, dados };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao consultar multas pendentes");
    }
  }

  async relatorioUsoMensal(dataInicio?: Date, dataFim?: Date): Promise<ResultadoOperacao> {
    try {
      const inicio = dataInicio ?? new Date("2026-01-01T00:00:00.000Z");
      const fim = dataFim ?? new Date("2026-12-31T23:59:59.999Z");
      if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
        throw new ErroValidacao("Periodo invalido");
      }
      const dados = await this.repositorioConsultas.relatorioUsoMensal(inicio, fim);
      return { sucesso: true, dados };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao gerar relatorio mensal");
    }
  }

  async disponibilidadeExemplaresPorLivro(): Promise<ResultadoOperacao> {
    try {
      const dados = await this.repositorioConsultas.disponibilidadeExemplaresPorLivro();
      return { sucesso: true, dados };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao consultar disponibilidade");
    }
  }

  private tratarErro(erro: any, mensagemDefault: string): ResultadoOperacao {
    if (erro instanceof ErroValidacao) {
      return { sucesso: false, erro: { mensagem: erro.message, tipo: "ErroValidacao" } };
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
