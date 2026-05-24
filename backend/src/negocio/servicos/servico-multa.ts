import repositorioMulta from '../../persistencia/repositorios/repositorio-multa';
import { Multa } from '../../modelos/tipos';

export class ServicoMulta {
  async obterPorId(id: number): Promise<Multa | null> {
    return await repositorioMulta.obterPorId(id);
  }

  async listar(): Promise<Multa[]> {
    return await repositorioMulta.listar();
  }

  async listarPorUsuario(usuarioId: number): Promise<Multa[]> {
    return await repositorioMulta.listarPorUsuario(usuarioId);
  }

  async obterMultasNaoPagas(usuarioId: number): Promise<Multa[]> {
    return await repositorioMulta.listarNaoPagasPorUsuario(usuarioId);
  }

  async obterTotalMultasNaoPagas(usuarioId: number): Promise<number> {
    const multas = await this.obterMultasNaoPagas(usuarioId);
    return multas.reduce((total, multa) => total + multa.valorMulta, 0);
  }

  async pagarMulta(id: number): Promise<Multa> {
    const multa = await repositorioMulta.obterPorId(id);
    if (!multa) throw new Error('Multa não encontrada');

    if (multa.pago) throw new Error('Esta multa já foi paga');

    return await repositorioMulta.marcarComoPaga(id);
  }

  async deletar(id: number): Promise<void> {
    await repositorioMulta.deletar(id);
  }
}

export default new ServicoMulta();
