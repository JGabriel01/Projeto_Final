import { ErroNaoEncontrado, ErroReserva, ErroValidacao } from "../excecoes/index.js";
import { Reserva } from "../negocios/Reserva.js";
import { RepositorioReservas } from "../persistencia/RepositorioReservas.js";
import type { ResultadoOperacao } from "./ControladorUsuarios.js";

export class ControladorReservas {
  private repositorioReservas = new RepositorioReservas();

  async criarReserva(
    usuarioId: number,
    livroId: number,
    dataReserva?: Date,
    dataExpiracao?: Date
  ): Promise<ResultadoOperacao<Reserva>> {
    try {
      const reserva = new Reserva(0, usuarioId, livroId, dataReserva, dataExpiracao);
      const criada = await this.repositorioReservas.adicionar(reserva);
      return { sucesso: true, dados: criada };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao criar reserva");
    }
  }

  async listarTodos(): Promise<ResultadoOperacao<Reserva[]>> {
    try {
      const reservas = await this.repositorioReservas.listarTodos();
      return { sucesso: true, dados: reservas };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao listar reservas");
    }
  }

  async buscarPorId(id: number): Promise<ResultadoOperacao<Reserva>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }
      const reserva = await this.repositorioReservas.buscarPorId(id);
      if (!reserva) throw new ErroNaoEncontrado(`Reserva com ID ${id} nao encontrada`);
      return { sucesso: true, dados: reserva };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao buscar reserva");
    }
  }

  async buscarPorUsuario(usuarioId: number): Promise<ResultadoOperacao<Reserva[]>> {
    try {
      if (typeof usuarioId !== "number" || usuarioId <= 0) {
        throw new ErroValidacao("ID do usuario deve ser positivo");
      }
      const reservas = await this.repositorioReservas.buscarPorUsuario(usuarioId);
      return { sucesso: true, dados: reservas };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao listar reservas do usuario");
    }
  }

  async atualizarReserva(
    id: number,
    dados: { dataExpiracao?: Date; statusReserva?: string }
  ): Promise<ResultadoOperacao<Reserva>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }
      if (dados.dataExpiracao && isNaN(dados.dataExpiracao.getTime())) {
        throw new ErroValidacao("Data de expiracao invalida");
      }
      const reserva = await this.repositorioReservas.atualizar(id, dados);
      if (!reserva) throw new ErroNaoEncontrado(`Reserva com ID ${id} nao encontrada`);
      return { sucesso: true, dados: reserva };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao atualizar reserva");
    }
  }

  async excluirReserva(id: number): Promise<ResultadoOperacao<{ id: number }>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }
      const excluiu = await this.repositorioReservas.deletar(id);
      if (!excluiu) throw new ErroNaoEncontrado(`Reserva com ID ${id} nao encontrada`);
      return { sucesso: true, dados: { id } };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao excluir reserva");
    }
  }

  private tratarErro(erro: any, mensagemDefault: string): ResultadoOperacao {
    if (erro instanceof ErroReserva || erro instanceof ErroValidacao) {
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
