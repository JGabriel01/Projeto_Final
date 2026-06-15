import { Router } from "express";
import { autenticarJwt, autorizarAdmin } from "../middleware/autenticacaoJwt.js";
import {
  ErroRepositorioBiblioteca,
  RepositorioBiblioteca,
  type UsuarioSessao,
} from "../persistencia/RepositorioBiblioteca.js";

export const rotasBiblioteca = Router();

const repositorioBiblioteca = new RepositorioBiblioteca();

function resposta(res: any, dados: any, status = 200) {
  res.status(status).json({ sucesso: true, dados });
}

function erro(res: any, mensagem: string, status = 400) {
  res.status(status).json({
    sucesso: false,
    erro: { mensagem, tipo: status === 403 ? "ErroAutorizacao" : "ErroValidacao" },
  });
}

function usuarioLogado(res: any): UsuarioSessao {
  return res.locals.usuario as UsuarioSessao;
}

function responderErroRepositorio(res: any, erroCapturado: any, mensagemDefault: string) {
  if (erroCapturado instanceof ErroRepositorioBiblioteca) {
    erro(res, erroCapturado.message, erroCapturado.status);
    return;
  }
  erro(res, erroCapturado?.message || mensagemDefault);
}

rotasBiblioteca.use(autenticarJwt);

rotasBiblioteca.get("/estado", async (_req, res) => {
  try {
    const estado = await repositorioBiblioteca.obterEstado(usuarioLogado(res));
    resposta(res, estado);
  } catch (e: any) {
    responderErroRepositorio(res, e, "Erro ao carregar estado da biblioteca");
  }
});

rotasBiblioteca.post("/emprestimos", async (req, res) => {
  try {
    const emprestimo = await repositorioBiblioteca.criarEmprestimoUsuario(
      usuarioLogado(res),
      Number(req.body.livroId)
    );
    resposta(res, emprestimo, 201);
  } catch (e: any) {
    responderErroRepositorio(res, e, "Erro ao criar emprestimo");
  }
});

rotasBiblioteca.post("/reservas", async (req, res) => {
  try {
    const reserva = await repositorioBiblioteca.criarReserva(
      usuarioLogado(res),
      Number(req.body.livroId)
    );
    resposta(res, reserva, 201);
  } catch (e: any) {
    responderErroRepositorio(res, e, "Erro ao criar reserva");
  }
});

rotasBiblioteca.post("/reservas/:id/emprestimos", async (req, res) => {
  try {
    const emprestimo = await repositorioBiblioteca.criarEmprestimoDaReserva(
      usuarioLogado(res),
      Number(req.params.id)
    );
    resposta(res, emprestimo, 201);
  } catch (e: any) {
    responderErroRepositorio(res, e, "Erro ao criar emprestimo da reserva");
  }
});

rotasBiblioteca.patch("/reservas/:id", async (req, res) => {
  try {
    const reserva = await repositorioBiblioteca.cancelarReserva(
      usuarioLogado(res),
      Number(req.params.id)
    );
    resposta(res, reserva);
  } catch (e: any) {
    responderErroRepositorio(res, e, "Erro ao cancelar reserva");
  }
});

rotasBiblioteca.patch("/emprestimos/:id/devolucao", async (req, res) => {
  try {
    const emprestimo = await repositorioBiblioteca.devolverEmprestimo(
      usuarioLogado(res),
      Number(req.params.id),
      req.body?.curtirLivro
    );
    resposta(res, emprestimo);
  } catch (e: any) {
    responderErroRepositorio(res, e, "Erro ao devolver emprestimo");
  }
});

rotasBiblioteca.post("/emprestimos/:id/extensoes", async (req, res) => {
  try {
    const resultado = await repositorioBiblioteca.solicitarExtensao(
      usuarioLogado(res),
      Number(req.params.id)
    );
    resposta(res, resultado);
  } catch (e: any) {
    responderErroRepositorio(res, e, "Erro ao solicitar extensao");
  }
});

rotasBiblioteca.patch("/emprestimos/:id/extensoes", autorizarAdmin, async (req, res) => {
  try {
    const emprestimo = await repositorioBiblioteca.decidirExtensao(
      Number(req.params.id),
      Boolean(req.body.aprovar)
    );
    resposta(res, emprestimo);
  } catch (e: any) {
    responderErroRepositorio(res, e, "Erro ao decidir extensao");
  }
});

rotasBiblioteca.post("/multas/:id/pagamentos", async (req, res) => {
  try {
    const multa = await repositorioBiblioteca.informarPagamentoMulta(
      usuarioLogado(res),
      Number(req.params.id)
    );
    resposta(res, multa);
  } catch (e: any) {
    responderErroRepositorio(res, e, "Erro ao informar pagamento da multa");
  }
});

rotasBiblioteca.patch("/multas/:id/pagamentos", autorizarAdmin, async (req, res) => {
  try {
    const aprovar = req.body.aprovar !== false && req.body.statusPagamento !== "pendente";
    const multa = await repositorioBiblioteca.decidirPagamentoMulta(Number(req.params.id), aprovar);
    resposta(res, multa);
  } catch (e: any) {
    responderErroRepositorio(res, e, "Erro ao decidir pagamento da multa");
  }
});

rotasBiblioteca.delete("/minha-conta", async (req, res) => {
  try {
    const resultado = await repositorioBiblioteca.solicitarExclusaoMinhaConta(
      usuarioLogado(res),
      req.body.email,
      req.body.senha
    );
    resposta(res, resultado);
  } catch (e: any) {
    responderErroRepositorio(res, e, "Erro ao excluir conta");
  }
});

rotasBiblioteca.patch("/admins/exclusoes/:id", autorizarAdmin, async (req, res) => {
  try {
    const resultado = await repositorioBiblioteca.decidirExclusaoAdmin(
      usuarioLogado(res),
      Number(req.params.id),
      Boolean(req.body.aprovar)
    );
    resposta(res, resultado);
  } catch (e: any) {
    responderErroRepositorio(res, e, "Erro ao decidir exclusao de admin");
  }
});

rotasBiblioteca.delete("/admins/exclusoes/:id", async (req, res) => {
  try {
    const resultado = await repositorioBiblioteca.excluirAdminAprovado(
      usuarioLogado(res),
      Number(req.params.id)
    );
    resposta(res, resultado);
  } catch (e: any) {
    responderErroRepositorio(res, e, "Erro ao excluir admin");
  }
});
