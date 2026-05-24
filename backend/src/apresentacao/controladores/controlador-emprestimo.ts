import { Request, Response } from 'express';
import servicoEmprestimo from '../../negocio/servicos/servico-emprestimo';
import { validarCamposObrigatorios } from '../../utilitarios/validadores';

export class ControladorEmprestimo {
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const validacao = validarCamposObrigatorios(req.body, ['usuarioId', 'livroId']);
      if (!validacao.valido) {
        res.status(422).json({
          erro: `Campos obrigatórios faltando: ${validacao.faltando?.join(', ')}`,
        });
        return;
      }

      const emprestimo = await servicoEmprestimo.criar(req.body);
      res.status(201).json(emprestimo);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async obterPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const emprestimo = await servicoEmprestimo.obterPorId(Number(id));

      if (!emprestimo) {
        res.status(404).json({ erro: 'Empréstimo não encontrado' });
        return;
      }

      res.status(200).json(emprestimo);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const emprestimos = await servicoEmprestimo.listar();
      res.status(200).json(emprestimos);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async listarPorUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;
      const emprestimos = await servicoEmprestimo.listarPorUsuario(Number(usuarioId));
      res.status(200).json(emprestimos);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async devolver(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const emprestimo = await servicoEmprestimo.devolver(Number(id));
      res.status(200).json(emprestimo);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async renovar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const emprestimo = await servicoEmprestimo.renovar(Number(id));
      res.status(200).json(emprestimo);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }
}

export default new ControladorEmprestimo();
