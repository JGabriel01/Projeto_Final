import { Request, Response } from 'express';
import servicoAutenticacao from '../../negocio/servicos/servico-autenticacao';
import { validarCamposObrigatorios } from '../../utilitarios/validadores';

export class ControladorAutenticacao {
  async registrar(req: Request, res: Response): Promise<void> {
    try {
      const validacao = validarCamposObrigatorios(req.body, ['nome', 'email', 'senha']);
      if (!validacao.valido) {
        res.status(422).json({
          erro: `Campos obrigatórios faltando: ${validacao.faltando?.join(', ')}`,
        });
        return;
      }

      const resultado = await servicoAutenticacao.registrar(req.body);
      res.status(201).json(resultado);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const validacao = validarCamposObrigatorios(req.body, ['email', 'senha']);
      if (!validacao.valido) {
        res.status(422).json({
          erro: `Campos obrigatórios faltando: ${validacao.faltando?.join(', ')}`,
        });
        return;
      }

      const resultado = await servicoAutenticacao.login(req.body);
      res.status(200).json(resultado);
    } catch (erro: any) {
      res.status(401).json({ erro: erro.message });
    }
  }

  async obterPerfil(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        res.status(401).json({ erro: 'Usuário não autenticado' });
        return;
      }

      const usuario = await servicoAutenticacao.obterPerfil(usuarioId);
      res.status(200).json(usuario);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message });
    }
  }
}

export default new ControladorAutenticacao();
