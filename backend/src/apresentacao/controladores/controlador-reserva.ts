import { Request, Response } from 'express';
import servicoReserva from '../../negocio/servicos/servico-reserva';
import { validarCamposObrigatorios } from '../../utilitarios/validadores';

export class ControladorReserva {
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const validacao = validarCamposObrigatorios(req.body, ['usuarioId', 'livroId']);
      if (!validacao.valido) {
        res.status(422).json({
          erro: `Campos obrigatórios faltando: ${validacao.faltando?.join(', ')}`,
        });
        return;
      }

      const reserva = await servicoReserva.criar(req.body);
      res.status(201).json(reserva);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async obterPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reserva = await servicoReserva.obterPorId(Number(id));

      if (!reserva) {
        res.status(404).json({ erro: 'Reserva não encontrada' });
        return;
      }

      res.status(200).json(reserva);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const reservas = await servicoReserva.listar();
      res.status(200).json(reservas);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async listarPorUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;
      const reservas = await servicoReserva.listarPorUsuario(Number(usuarioId));
      res.status(200).json(reservas);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async obterFilaPorLivro(req: Request, res: Response): Promise<void> {
    try {
      const { livroId } = req.params;
      const fila = await servicoReserva.obterFilaPorLivro(Number(livroId));
      res.status(200).json(fila);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async cancelar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reserva = await servicoReserva.cancelar(Number(id));
      res.status(200).json(reserva);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async marcarComoRetirada(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reserva = await servicoReserva.marcarComoRetirada(Number(id));
      res.status(200).json(reserva);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }
}

export default new ControladorReserva();
