import { Request, Response } from 'express';
import servicoLivro from '../../negocio/servicos/servico-livro';
import servicoEmprestimo from '../../negocio/servicos/servico-emprestimo';
import { validarCamposObrigatorios } from '../../utilitarios/validadores';

export class ControladorLivro {
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const validacao = validarCamposObrigatorios(req.body, [
        'titulo',
        'autor',
        'genero',
        'ano',
        'sinopse',
      ]);
      if (!validacao.valido) {
        res.status(422).json({
          erro: `Campos obrigatórios faltando: ${validacao.faltando?.join(', ')}`,
        });
        return;
      }

      // Pegue arquivos da requisição se existirem
      const arquivos = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const capaBuffer = arquivos?.capa?.[0]?.buffer;
      const arquivoBuffer = arquivos?.arquivo?.[0]?.buffer;

      const livro = await servicoLivro.criar(req.body, capaBuffer, arquivoBuffer);
      res.status(201).json(livro);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async obterPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const livro = await servicoLivro.obterPorId(Number(id));

      if (!livro) {
        res.status(404).json({ erro: 'Livro não encontrado' });
        return;
      }

      res.status(200).json(livro);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const livros = await servicoLivro.listar();
      res.status(200).json(livros);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async listarDisponiveis(req: Request, res: Response): Promise<void> {
    try {
      const livros = await servicoLivro.listarDisponiveis();
      res.status(200).json(livros);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async buscar(req: Request, res: Response): Promise<void> {
    try {
      const { termo } = req.query;

      if (!termo || typeof termo !== 'string') {
        res.status(422).json({ erro: 'Termo de busca é obrigatório' });
        return;
      }

      const livros = await servicoLivro.buscar(termo);
      res.status(200).json(livros);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const capaBuffer = (req.file as any)?.buffer;

      const livro = await servicoLivro.atualizar(Number(id), req.body, capaBuffer);
      res.status(200).json(livro);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await servicoLivro.deletar(Number(id));
      res.status(204).send();
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async obterArquivoParaLeitura(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.usuario?.id;

      if (!usuarioId) {
        res.status(401).json({ erro: 'Usuário não autenticado' });
        return;
      }

      // Validar se usuário tem empréstimo ativo do livro
      await servicoEmprestimo.validarLeitura(usuarioId, Number(id));

      // Obter URL temporária do arquivo
      const urlArquivo = await servicoLivro.obterArquivoParaLeitura(Number(id));

      res.status(200).json({
        url: urlArquivo,
        mensagem: 'URL de acesso gerada com sucesso. Válida por 24 horas.',
      });
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }
}

export default new ControladorLivro();
