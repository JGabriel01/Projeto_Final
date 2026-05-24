import repositorioEmprestimo from '../../persistencia/repositorios/repositorio-emprestimo';
import repositorioLivro from '../../persistencia/repositorios/repositorio-livro';
import repositorioMulta from '../../persistencia/repositorios/repositorio-multa';
import { CriarEmprestimoDTO, Emprestimo } from '../../modelos/tipos';

const MULTA_DIARIA = 5.0; // R$ 5,00 por dia de atraso

export class ServicoEmprestimo {
  async criar(dados: CriarEmprestimoDTO): Promise<Emprestimo> {
    // Verifica se livro existe e está disponível
    const livro = await repositorioLivro.obterPorId(dados.livroId);
    if (!livro) throw new Error('Livro não encontrado');
    if (!livro.disponivel) throw new Error('Livro não está disponível');

    // Marca livro como indisponível
    await repositorioLivro.atualizarDisponibilidade(dados.livroId, false);

    // Cria empréstimo
    return await repositorioEmprestimo.criar(dados);
  }

  async obterPorId(id: number): Promise<Emprestimo | null> {
    return await repositorioEmprestimo.obterPorId(id);
  }

  async listar(): Promise<Emprestimo[]> {
    return await repositorioEmprestimo.listar();
  }

  async listarPorUsuario(usuarioId: number): Promise<Emprestimo[]> {
    return await repositorioEmprestimo.listarPorUsuario(usuarioId);
  }

  async devolver(id: number): Promise<Emprestimo> {
    const emprestimo = await repositorioEmprestimo.obterPorId(id);
    if (!emprestimo) throw new Error('Empréstimo não encontrado');

    // Marca livro como disponível
    await repositorioLivro.atualizarDisponibilidade(emprestimo.livroId, true);

    // Verifica se há multa por atraso
    const hoje = new Date();
    if (hoje > emprestimo.dataVencimento) {
      const diasAtraso = Math.floor(
        (hoje.getTime() - emprestimo.dataVencimento.getTime()) / (1000 * 60 * 60 * 24)
      );
      const valorMulta = diasAtraso * MULTA_DIARIA;

      // Verifica se já existe multa para este empréstimo
      const multaExistente = await repositorioMulta.obterPorEmprestimo(id);
      if (!multaExistente) {
        await repositorioMulta.criar(emprestimo.usuarioId, id, valorMulta);
      }
    }

    return await repositorioEmprestimo.devolverLivro(id);
  }

  async renovar(id: number): Promise<Emprestimo> {
    const emprestimo = await repositorioEmprestimo.obterPorId(id);
    if (!emprestimo) throw new Error('Empréstimo não encontrado');

    // Não pode renovar se já foi devolvido
    if (emprestimo.dataDevolucao) {
      throw new Error('Não é possível renovar um empréstimo já devolvido');
    }

    // Não pode renovar se está atrasado
    const hoje = new Date();
    if (hoje > emprestimo.dataVencimento) {
      throw new Error('Não é possível renovar um empréstimo atrasado. Devolva e pague a multa.');
    }

    return await repositorioEmprestimo.renovar(id, 14);
  }

  async validarLeitura(usuarioId: number, livroId: number): Promise<Emprestimo> {
    // Buscar empréstimo ativo para este livro
    const emprestimos = await repositorioEmprestimo.listarPorUsuario(usuarioId);
    const emprestimoAtivo = emprestimos.find(
      (e) => e.livroId === livroId && !e.dataDevolucao && e.dataVencimento >= new Date()
    );

    if (!emprestimoAtivo) {
      throw new Error('Você precisa emprestar este livro para lê-lo');
    }

    return emprestimoAtivo;
  }
}

export default new ServicoEmprestimo();
