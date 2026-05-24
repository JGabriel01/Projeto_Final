import repositorioLivro from '../../persistencia/repositorios/repositorio-livro';
import servicoArmazenamento from './servico-armazenamento';
import { CriarLivroDTO, Livro } from '../../modelos/tipos';

export class ServicoLivro {
  async criar(dados: CriarLivroDTO, capaBuffer?: Buffer, arquivoBuffer?: Buffer): Promise<Livro> {
    let capa: string | undefined;
    let arquivo: string | undefined;

    // Se houver capa, fazer upload
    if (capaBuffer) {
      const nomeCapaUnico = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      capa = await servicoArmazenamento.enviarCapa(nomeCapaUnico, capaBuffer);
    }

    // Se houver arquivo PDF, fazer upload
    if (arquivoBuffer) {
      const nomeArquivoUnico = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
      arquivo = await servicoArmazenamento.enviarLivroPDF(nomeArquivoUnico, arquivoBuffer);
    }

    return await repositorioLivro.criar({
      ...dados,
      capa,
      arquivo,
    });
  }

  async obterPorId(id: number): Promise<Livro | null> {
    return await repositorioLivro.obterPorId(id);
  }

  async listar(): Promise<Livro[]> {
    return await repositorioLivro.listar();
  }

  async listarDisponiveis(): Promise<Livro[]> {
    return await repositorioLivro.listarDisponiveis();
  }

  async buscar(termo: string): Promise<Livro[]> {
    // Buscar por título e autor
    const porTitulo = await repositorioLivro.buscarPorTitulo(termo);
    const porAutor = await repositorioLivro.buscarPorAutor(termo);

    // Combinar e remover duplicatas
    const livrosMap = new Map();
    [...porTitulo, ...porAutor].forEach((livro) => {
      livrosMap.set(livro.id, livro);
    });

    return Array.from(livrosMap.values());
  }

  async atualizar(id: number, dados: Partial<CriarLivroDTO>, capaBuffer?: Buffer): Promise<Livro> {
    const livroAtual = await repositorioLivro.obterPorId(id);
    if (!livroAtual) throw new Error('Livro não encontrado');

    let capa = livroAtual.capa;

    // Se houver nova capa, deletar a antiga e enviar a nova
    if (capaBuffer) {
      if (livroAtual.capa) {
        const nomeCapaAntiga = livroAtual.capa.split('/')[1];
        await servicoArmazenamento.deletarCapa(nomeCapaAntiga);
      }

      const nomeCapaUnico = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      capa = await servicoArmazenamento.enviarCapa(nomeCapaUnico, capaBuffer);
    }

    return await repositorioLivro.atualizar(id, {
      ...dados,
      capa,
    });
  }

  async obterArquivoParaLeitura(livroId: number): Promise<string> {
    const livro = await repositorioLivro.obterPorId(livroId);
    if (!livro) throw new Error('Livro não encontrado');

    if (!livro.arquivo) {
      throw new Error('Este livro não possui arquivo disponível para leitura');
    }

    // Extrair nome do arquivo da URL armazenada
    const nomeArquivo = livro.arquivo.split('/')[1];
    
    // Retornar URL temporária do MinIO (válida por 24 horas)
    return await servicoArmazenamento.obterURLLivroPDFTemporaria(nomeArquivo, 24);
  }

  async deletar(id: number): Promise<void> {
    const livro = await repositorioLivro.obterPorId(id);
    if (!livro) throw new Error('Livro não encontrado');

    // Deletar capa se existir
    if (livro.capa) {
      const nomeCapaAntiga = livro.capa.split('/')[1];
      await servicoArmazenamento.deletarCapa(nomeCapaAntiga);
    }

    // Deletar arquivo PDF se existir
    if (livro.arquivo) {
      const nomeArquivoAntigo = livro.arquivo.split('/')[1];
      await servicoArmazenamento.deletarLivroPDF(nomeArquivoAntigo);
    }

    await repositorioLivro.deletar(id);
  }
}

export default new ServicoLivro();
