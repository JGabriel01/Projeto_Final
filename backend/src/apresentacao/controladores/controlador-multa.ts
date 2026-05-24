import { Request, Response } from 'express';
import servicoMulta from '../../negocio/servicos/servico-multa';

export class ControladorMulta {
  async obterPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const multa = await servicoMulta.obterPorId(Number(id));

      if (!multa) {
        res.status(404).json({ erro: 'Multa não encontrada' });
        return;
      }

      res.status(200).json(multa);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const multas = await servicoMulta.listar();
      res.status(200).json(multas);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async listarPorUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;
      const multas = await servicoMulta.listarPorUsuario(Number(usuarioId));
      res.status(200).json(multas);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async obterMultasNaoPagas(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;
      const multas = await servicoMulta.obterMultasNaoPagas(Number(usuarioId));
      const total = await servicoMulta.obterTotalMultasNaoPagas(Number(usuarioId));
      res.status(200).json({ multas, total });
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async pagarMulta(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const multa = await servicoMulta.pagarMulta(Number(id));
      res.status(200).json(multa);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }
}

export default new ControladorMulta();
