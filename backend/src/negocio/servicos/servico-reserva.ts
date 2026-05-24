import repositorioReserva from '../../persistencia/repositorios/repositorio-reserva';
import repositorioLivro from '../../persistencia/repositorios/repositorio-livro';
import { CriarReservaDTO, Reserva } from '../../modelos/tipos';

export class ServicoReserva {
  async criar(dados: CriarReservaDTO): Promise<Reserva> {
    // Verifica se livro existe
    const livro = await repositorioLivro.obterPorId(dados.livroId);
    if (!livro) throw new Error('Livro não encontrado');

    // Verifica se livro já está reservado pelo mesmo usuário
    const reservasExistentes = await repositorioReserva.listarAtivasPorLivro(dados.livroId);
    const jaReservado = reservasExistentes.some((r) => r.usuarioId === dados.usuarioId);
    if (jaReservado) {
      throw new Error('Você já tem uma reserva ativa para este livro');
    }

    return await repositorioReserva.criar(dados);
  }

  async obterPorId(id: number): Promise<Reserva | null> {
    return await repositorioReserva.obterPorId(id);
  }

  async listar(): Promise<Reserva[]> {
    return await repositorioReserva.listar();
  }

  async listarPorUsuario(usuarioId: number): Promise<Reserva[]> {
    return await repositorioReserva.listarPorUsuario(usuarioId);
  }

  async obterFilaPorLivro(livroId: number): Promise<Reserva[]> {
    return await repositorioReserva.listarAtivasPorLivro(livroId);
  }

  async cancelar(id: number): Promise<Reserva> {
    const reserva = await repositorioReserva.obterPorId(id);
    if (!reserva) throw new Error('Reserva não encontrada');

    return await repositorioReserva.cancelar(id);
  }

  async marcarComoRetirada(id: number): Promise<Reserva> {
    const reserva = await repositorioReserva.obterPorId(id);
    if (!reserva) throw new Error('Reserva não encontrada');

    return await repositorioReserva.marcarComoRetirada(id);
  }

  async obterProximaReserva(livroId: number): Promise<Reserva | null> {
    const filas = await this.obterFilaPorLivro(livroId);
    return filas.length > 0 ? filas[0] : null;
  }
}

export default new ServicoReserva();
