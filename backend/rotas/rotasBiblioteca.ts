import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prismaClient.js";
import { autenticarJwt, autorizarAdmin } from "../middleware/autenticacaoJwt.js";

export const rotasBiblioteca = Router();

const DIA = 24 * 60 * 60 * 1000;
const HORA = 60 * 60 * 1000;
const emprestimoPadraoDias = 15;

function resposta(res: any, dados: any, status = 200) {
  res.status(status).json({ sucesso: true, dados });
}

function erro(res: any, mensagem: string, status = 400) {
  res.status(status).json({
    sucesso: false,
    erro: { mensagem, tipo: status === 403 ? "ErroAutorizacao" : "ErroValidacao" },
  });
}

function usuarioLogado(res: any) {
  return res.locals.usuario as { idUsuario: number; nivelAcesso: string; email: string };
}

async function notificar(usuarioId: number, tipo: string, mensagem: string, acao?: string, referenciaId?: number) {
  return (prisma as any).notificacao.create({
    data: {
      usuario_id: usuarioId,
      tipo,
      mensagem,
      data_envio: new Date(),
      lido: false,
      acao,
      referencia_id: referenciaId,
    },
  });
}

async function notificarAdmins(tipo: string, mensagem: string, acao?: string, referenciaId?: number, ignorarId?: number) {
  const admins = await prisma.usuario.findMany({
    where: {
      nivel_acesso: "admin",
      ...(ignorarId ? { id_usuario: { not: ignorarId } } : {}),
    },
  });
  await Promise.all(admins.map((admin) => notificar(admin.id_usuario, tipo, mensagem, acao, referenciaId)));
}

async function multasBloqueantes(usuarioId: number) {
  const multas = await (prisma as any).multa.findMany({
    where: {
      status_pagamento: { in: ["pendente", "aguardando_confirmacao"] },
      emprestimo: { usuario_id: usuarioId },
    },
  });
  return multas;
}

async function atualizarValoresMultas() {
  const multas = await (prisma as any).multa.findMany({
    where: { status_pagamento: { in: ["pendente", "aguardando_confirmacao"] } },
  });

  await Promise.all(multas.map((multa: any) => {
    const dias = Math.max(0, Math.floor((Date.now() - new Date(multa.data_geracao).getTime()) / DIA));
    const valor = 1 + dias;
    if (Number(multa.valor_multa) === valor) return Promise.resolve();
    return (prisma as any).multa.update({
      where: { id_multa: multa.id_multa },
      data: { valor_multa: valor },
    });
  }));
}

async function exemplaresDisponiveis(livroId: number) {
  const exemplares = await prisma.exemplar.findMany({ where: { livro_id: livroId } });
  const ids = exemplares.map((exemplar) => exemplar.id_exemplar);
  if (!ids.length) return [];

  const emprestimosAtivos = await (prisma as any).emprestimo.findMany({
    where: { exemplar_id: { in: ids }, data_devolucao_real: null },
    select: { exemplar_id: true },
  });
  const indisponiveis = new Set(emprestimosAtivos.map((emprestimo: any) => emprestimo.exemplar_id));
  return exemplares.filter((exemplar) => !indisponiveis.has(exemplar.id_exemplar));
}

async function sincronizarFilaLivro(livroId: number) {
  const disponiveis = await exemplaresDisponiveis(livroId);
  if (!disponiveis.length) return;

  await (prisma as any).reserva.updateMany({
    where: {
      livro_id: livroId,
      status_reserva: "pronta",
      data_expiracao: { lt: new Date() },
    },
    data: { status_reserva: "expirada" },
  });

  const reservaPronta = await (prisma as any).reserva.findFirst({
    where: { livro_id: livroId, status_reserva: "pronta" },
    orderBy: { data_reserva: "asc" },
  });
  if (reservaPronta) return;

  const proxima = await (prisma as any).reserva.findFirst({
    where: { livro_id: livroId, status_reserva: "ativa" },
    orderBy: { data_reserva: "asc" },
    include: { livro: true },
  });
  if (!proxima) return;

  const ate = new Date(Date.now() + HORA);
  await (prisma as any).reserva.update({
    where: { id_reserva: proxima.id_reserva },
    data: { status_reserva: "pronta", data_expiracao: ate, notificado_em: new Date() },
  });
  await notificar(
    proxima.usuario_id,
    "reserva",
    `Sua reserva de "${proxima.livro.titulo}" está pronta para empréstimo. Você tem 1 hora para confirmar.`,
    "reserva_pronta",
    proxima.id_reserva
  );
}

async function sincronizarBiblioteca() {
  await atualizarValoresMultas();
  const livros = await prisma.livro.findMany({ select: { id_livro: true } });
  await Promise.all(livros.map((livro) => sincronizarFilaLivro(livro.id_livro)));
}

async function criarEmprestimo(usuarioId: number, livroId: number, reservaId?: number) {
  const disponiveis = await exemplaresDisponiveis(livroId);
  if (!disponiveis.length) throw new Error("Não há exemplares disponíveis para empréstimo");

  const agora = new Date();
  const vencimento = new Date(agora.getTime() + emprestimoPadraoDias * DIA);
  const emprestimo = await (prisma as any).emprestimo.create({
    data: {
      usuario_id: usuarioId,
      exemplar_id: disponiveis[0].id_exemplar,
      data_saida: agora,
      data_vencimento: vencimento,
      renovacoes: 0,
      status_extensao: "nenhuma",
    },
    include: { exemplar: { include: { livro: true } }, usuario: true },
  });

  if (reservaId) {
    await (prisma as any).reserva.update({
      where: { id_reserva: reservaId },
      data: { status_reserva: "retirada" },
    });
  }

  await notificar(
    usuarioId,
    "emprestimo",
    `Empréstimo de "${emprestimo.exemplar.livro.titulo}" criado com vencimento em ${vencimento.toLocaleDateString("pt-BR")}.`,
    "consultar_emprestimos",
    emprestimo.id_emprestimo
  );
  await sincronizarFilaLivro(livroId);
  return emprestimo;
}

rotasBiblioteca.use(autenticarJwt);

rotasBiblioteca.get("/estado", async (_req, res) => {
  const usuario = usuarioLogado(res);
  await sincronizarBiblioteca();

  const [livros, exemplares, reservas, emprestimos, multas, notificacoes, usuarios, solicitacoesExclusaoAdmin] =
    await Promise.all([
      prisma.livro.findMany({ orderBy: { id_livro: "desc" } }),
      prisma.exemplar.findMany({ include: { livro: true }, orderBy: { id_exemplar: "desc" } }),
      (prisma as any).reserva.findMany({
        include: { livro: true, usuario: true },
        orderBy: { data_reserva: "asc" },
      }),
      (prisma as any).emprestimo.findMany({
        include: { usuario: true, exemplar: { include: { livro: true } }, multa: true },
        orderBy: { data_saida: "desc" },
      }),
      (prisma as any).multa.findMany({
        include: { emprestimo: { include: { usuario: true, exemplar: { include: { livro: true } } } }, exemplar: true },
        orderBy: { data_geracao: "desc" },
      }),
      (prisma as any).notificacao.findMany({
        where: { usuario_id: usuario.idUsuario },
        orderBy: { data_envio: "desc" },
      }),
      prisma.usuario.findMany({
        where: usuario.nivelAcesso === "admin" ? {} : { nivel_acesso: { not: "admin" } },
        include: { aluno: true, professor: true, admin: true },
        orderBy: [{ nivel_acesso: "asc" }, { nome: "asc" }],
      }),
      (prisma as any).solicitacaoExclusaoAdmin.findMany({
        include: { admin: true },
        orderBy: { data_criacao: "desc" },
      }).catch(() => []),
    ]);

  resposta(res, { livros, exemplares, reservas, emprestimos, multas, notificacoes, usuarios, solicitacoesExclusaoAdmin });
});

rotasBiblioteca.post("/emprestar", async (req, res) => {
  try {
    const usuario = usuarioLogado(res);
    if (usuario.nivelAcesso === "admin") return erro(res, "Admins não podem fazer empréstimos", 403);
    if ((await multasBloqueantes(usuario.idUsuario)).length) {
      return erro(res, "Você tem multas pendentes. Resolva suas pendências na aba Gerenciar multas.");
    }

    const livroId = Number(req.body.livroId);
    const emprestimo = await criarEmprestimo(usuario.idUsuario, livroId);
    resposta(res, emprestimo, 201);
  } catch (e: any) {
    erro(res, e.message || "Erro ao criar empréstimo");
  }
});

rotasBiblioteca.post("/reservar", async (req, res) => {
  try {
    const usuario = usuarioLogado(res);
    if (usuario.nivelAcesso === "admin") return erro(res, "Admins não podem fazer reservas", 403);
    if ((await multasBloqueantes(usuario.idUsuario)).length) {
      return erro(res, "Você tem multas pendentes. Resolva suas pendências na aba Gerenciar multas.");
    }

    const livroId = Number(req.body.livroId);
    const existente = await (prisma as any).reserva.findFirst({
      where: { usuario_id: usuario.idUsuario, livro_id: livroId, status_reserva: { in: ["ativa", "pronta"] } },
    });
    if (existente) return erro(res, "Você já está na fila de reserva desse livro");

    const disponiveis = await exemplaresDisponiveis(livroId);
    if (disponiveis.length) return erro(res, "Este livro possui exemplar disponível. Faça o empréstimo.");

    const reserva = await (prisma as any).reserva.create({
      data: {
        usuario_id: usuario.idUsuario,
        livro_id: livroId,
        data_reserva: new Date(),
        data_expiracao: new Date(Date.now() + 30 * DIA),
        status_reserva: "ativa",
      },
      include: { livro: true, usuario: true },
    });
    await notificar(usuario.idUsuario, "reserva", `Reserva de "${reserva.livro.titulo}" realizada. Aguarde sua vez na fila.`, "gerenciar_reservas", reserva.id_reserva);
    resposta(res, reserva, 201);
  } catch (e: any) {
    erro(res, e.message || "Erro ao criar reserva");
  }
});

rotasBiblioteca.post("/reservas/:id/emprestar", async (req, res) => {
  try {
    const usuario = usuarioLogado(res);
    const reserva = await (prisma as any).reserva.findUnique({ where: { id_reserva: Number(req.params.id) } });
    if (!reserva) return erro(res, "Reserva não encontrada", 404);
    if (reserva.usuario_id !== usuario.idUsuario && usuario.nivelAcesso !== "admin") return erro(res, "Reserva pertence a outro usuário", 403);
    if (reserva.status_reserva !== "pronta") return erro(res, "Esta reserva ainda não está pronta para empréstimo");
    if (new Date(reserva.data_expiracao).getTime() < Date.now()) {
      await sincronizarFilaLivro(reserva.livro_id);
      return erro(res, "O prazo de 1 hora desta reserva expirou");
    }
    if ((await multasBloqueantes(reserva.usuario_id)).length) return erro(res, "Usuário possui multas pendentes");

    const emprestimo = await criarEmprestimo(reserva.usuario_id, reserva.livro_id, reserva.id_reserva);
    resposta(res, emprestimo, 201);
  } catch (e: any) {
    erro(res, e.message || "Erro ao criar empréstimo da reserva");
  }
});

rotasBiblioteca.post("/reservas/:id/cancelar", async (req, res) => {
  try {
    const usuario = usuarioLogado(res);
    const reserva = await (prisma as any).reserva.findUnique({
      where: { id_reserva: Number(req.params.id) },
      include: { livro: true },
    });
    if (!reserva) return erro(res, "Reserva não encontrada", 404);
    if (reserva.usuario_id !== usuario.idUsuario && usuario.nivelAcesso !== "admin") {
      return erro(res, "Reserva pertence a outro usuario", 403);
    }
    if (!["ativa", "pronta"].includes(reserva.status_reserva)) {
      return erro(res, "Somente reservas em espera podem ser canceladas");
    }

    const cancelada = await (prisma as any).reserva.update({
      where: { id_reserva: reserva.id_reserva },
      data: { status_reserva: "cancelada" },
    });
    await notificar(
      reserva.usuario_id,
      "reserva",
      `Reserva de "${reserva.livro.titulo}" cancelada.`,
      "gerenciar_reservas",
      reserva.id_reserva
    );
    await sincronizarFilaLivro(reserva.livro_id);
    resposta(res, cancelada);
  } catch (e: any) {
    erro(res, e.message || "Erro ao cancelar reserva");
  }
});

rotasBiblioteca.post("/emprestimos/:id/devolver", async (req, res) => {
  try {
    const usuario = usuarioLogado(res);
    const emprestimo = await (prisma as any).emprestimo.findUnique({
      where: { id_emprestimo: Number(req.params.id) },
      include: { exemplar: { include: { livro: true } }, multa: true },
    });
    if (!emprestimo) return erro(res, "Empréstimo não encontrado", 404);
    if (emprestimo.usuario_id !== usuario.idUsuario && usuario.nivelAcesso !== "admin") return erro(res, "Empréstimo pertence a outro usuário", 403);
    if (emprestimo.data_devolucao_real) return erro(res, "Este empréstimo já foi devolvido");

    const agora = new Date();
    const devolvido = await (prisma as any).emprestimo.update({
      where: { id_emprestimo: emprestimo.id_emprestimo },
      data: { data_devolucao_real: agora },
    });

    if (agora > new Date(emprestimo.data_vencimento) && !emprestimo.multa) {
      await (prisma as any).multa.create({
        data: {
          valor_multa: 1,
          status_pagamento: "pendente",
          data_geracao: agora,
          emprestimo_id: emprestimo.id_emprestimo,
          exemplar_id: emprestimo.exemplar_id,
        },
      });
      await notificar(emprestimo.usuario_id, "multa", `Uma multa foi gerada por atraso na devolução de "${emprestimo.exemplar.livro.titulo}".`, "gerenciar_multas", emprestimo.id_emprestimo);
    }

    await sincronizarFilaLivro(emprestimo.exemplar.livro_id);
    resposta(res, devolvido);
  } catch (e: any) {
    erro(res, e.message || "Erro ao devolver empréstimo");
  }
});

rotasBiblioteca.post("/emprestimos/:id/solicitar-extensao", async (req, res) => {
  const usuario = usuarioLogado(res);
  const emprestimo = await (prisma as any).emprestimo.findUnique({
    where: { id_emprestimo: Number(req.params.id) },
    include: { usuario: true, exemplar: { include: { livro: true } } },
  });
  if (!emprestimo) return erro(res, "Empréstimo não encontrado", 404);
  if (emprestimo.usuario_id !== usuario.idUsuario) return erro(res, "Empréstimo pertence a outro usuário", 403);
  if (emprestimo.renovacoes >= 2) return erro(res, "Você já usou as 2 extensões permitidas para este empréstimo");
  if (emprestimo.status_extensao === "pendente") return erro(res, "Já existe uma solicitação de extensão pendente");

  await (prisma as any).emprestimo.update({
    where: { id_emprestimo: emprestimo.id_emprestimo },
    data: { status_extensao: "pendente" },
  });
  await notificarAdmins(
    "renovacao",
    `${emprestimo.usuario.nome} quer estender o prazo de entrega de "${emprestimo.exemplar.livro.titulo}".`,
    "gerenciar_emprestimos",
    emprestimo.id_emprestimo
  );
  resposta(res, { mensagem: "Solicitação enviada. Aguarde a confirmação de um admin." });
});

rotasBiblioteca.post("/emprestimos/:id/decidir-extensao", autorizarAdmin, async (req, res) => {
  const aprovar = Boolean(req.body.aprovar);
  const emprestimo = await (prisma as any).emprestimo.findUnique({
    where: { id_emprestimo: Number(req.params.id) },
    include: { usuario: true, exemplar: { include: { livro: true } } },
  });
  if (!emprestimo) return erro(res, "Empréstimo não encontrado", 404);
  if (emprestimo.status_extensao !== "pendente") return erro(res, "Este empréstimo não possui solicitação pendente");

  const data: any = { status_extensao: aprovar ? "aprovada" : "negada" };
  if (aprovar) {
    data.renovacoes = emprestimo.renovacoes + 1;
    data.data_vencimento = new Date(new Date(emprestimo.data_vencimento).getTime() + emprestimoPadraoDias * DIA);
  }
  const atualizado = await (prisma as any).emprestimo.update({ where: { id_emprestimo: emprestimo.id_emprestimo }, data });
  await notificar(emprestimo.usuario_id, "renovacao", `Sua solicitação de extensão para "${emprestimo.exemplar.livro.titulo}" foi ${aprovar ? "aprovada" : "negada"}.`, "consultar_emprestimos", emprestimo.id_emprestimo);
  resposta(res, atualizado);
});

rotasBiblioteca.post("/multas/:id/solicitar-pagamento", async (req, res) => {
  const usuario = usuarioLogado(res);
  const multa = await (prisma as any).multa.findUnique({
    where: { id_multa: Number(req.params.id) },
    include: { emprestimo: { include: { usuario: true, exemplar: { include: { livro: true } } } } },
  });
  if (!multa) return erro(res, "Multa não encontrada", 404);
  if (multa.emprestimo.usuario_id !== usuario.idUsuario) return erro(res, "Multa pertence a outro usuário", 403);
  if (multa.status_pagamento === "paga") return erro(res, "Esta multa já está paga");

  const atualizada = await (prisma as any).multa.update({
    where: { id_multa: multa.id_multa },
    data: { status_pagamento: "aguardando_confirmacao", data_pagamento: new Date() },
  });
  await notificarAdmins("multa", `${multa.emprestimo.usuario.nome} informou o pagamento da multa do livro "${multa.emprestimo.exemplar.livro.titulo}".`, "gerenciar_pagamento_multas", multa.id_multa);
  resposta(res, atualizada);
});

rotasBiblioteca.post("/multas/:id/confirmar-pagamento", autorizarAdmin, async (req, res) => {
  const multa = await (prisma as any).multa.findUnique({
    where: { id_multa: Number(req.params.id) },
    include: { emprestimo: { include: { usuario: true, exemplar: { include: { livro: true } } } } },
  });
  if (!multa) return erro(res, "Multa não encontrada", 404);
  const atualizada = await (prisma as any).multa.update({
    where: { id_multa: multa.id_multa },
    data: { status_pagamento: "paga", data_pagamento: new Date() },
  });
  await notificar(multa.emprestimo.usuario_id, "multa", `Pagamento da multa de "${multa.emprestimo.exemplar.livro.titulo}" confirmado.`, "gerenciar_multas", multa.id_multa);
  resposta(res, atualizada);
});

rotasBiblioteca.post("/minha-conta/excluir", async (req, res) => {
  const usuario = usuarioLogado(res);
  const atual = await prisma.usuario.findUnique({ where: { id_usuario: usuario.idUsuario } });
  if (!atual) return erro(res, "Usuário não encontrado", 404);
  const emailOk = atual.email === String(req.body.email || "").trim();
  const senhaOk = await bcrypt.compare(String(req.body.senha || ""), atual.senha);
  if (!emailOk || !senhaOk) return erro(res, "Email ou senha inválidos", 403);

  if (atual.nivel_acesso === "admin") {
    const existente = await (prisma as any).solicitacaoExclusaoAdmin.findFirst({
      where: { admin_id: atual.id_usuario, status: "pendente" },
    });
    const solicitacao = existente || await (prisma as any).solicitacaoExclusaoAdmin.create({
      data: { admin_id: atual.id_usuario, status: "pendente" },
    });
    await notificarAdmins("aviso", `${atual.nome} solicitou exclusão da conta de admin.`, "gerenciar_admins", solicitacao.id_solicitacao, atual.id_usuario);
    return resposta(res, { mensagem: "Solicitação enviada. Aguarde outro admin confirmar.", solicitacao });
  }

  await excluirUsuarioComDependencias(atual.id_usuario);
  resposta(res, { mensagem: "Conta excluída" });
});

rotasBiblioteca.post("/admins/exclusoes/:id/decidir", autorizarAdmin, async (req, res) => {
  const usuario = usuarioLogado(res);
  const solicitacao = await (prisma as any).solicitacaoExclusaoAdmin.findUnique({
    where: { id_solicitacao: Number(req.params.id) },
    include: { admin: true },
  });
  if (!solicitacao) return erro(res, "Solicitação não encontrada", 404);
  if (solicitacao.admin_id === usuario.idUsuario) return erro(res, "Outro admin precisa decidir sua solicitação", 403);
  const aprovar = Boolean(req.body.aprovar);

  await (prisma as any).solicitacaoExclusaoAdmin.update({
    where: { id_solicitacao: solicitacao.id_solicitacao },
    data: { status: aprovar ? "aprovada" : "negada", data_decisao: new Date(), decidido_por: usuario.idUsuario },
  });
  await notificar(solicitacao.admin_id, "aviso", `Sua solicitação de exclusão de admin foi ${aprovar ? "aprovada" : "negada"}.`, "gerenciar_admins", solicitacao.id_solicitacao);
  resposta(res, { mensagem: aprovar ? "Solicitação aprovada" : "Solicitação negada" });
});

rotasBiblioteca.post("/admins/exclusoes/:id/executar", async (req, res) => {
  const usuario = usuarioLogado(res);
  const solicitacao = await (prisma as any).solicitacaoExclusaoAdmin.findUnique({ where: { id_solicitacao: Number(req.params.id) } });
  if (!solicitacao || solicitacao.admin_id !== usuario.idUsuario) return erro(res, "Solicitação não encontrada", 404);
  if (solicitacao.status !== "aprovada") return erro(res, "A exclusão ainda não foi aprovada");
  await excluirUsuarioComDependencias(usuario.idUsuario);
  resposta(res, { mensagem: "Conta admin excluída" });
});

async function excluirUsuarioComDependencias(usuarioId: number) {
  await (prisma as any).$transaction(async (tx: any) => {
    const emprestimos = await tx.emprestimo.findMany({ where: { usuario_id: usuarioId }, select: { id_emprestimo: true } });
    const emprestimoIds = emprestimos.map((e: any) => e.id_emprestimo);
    await tx.notificacao.deleteMany({ where: { usuario_id: usuarioId } });
    await tx.notificacao.deleteMany({ where: { id_emprestimo: { in: emprestimoIds } } });
    await tx.multa.deleteMany({ where: { emprestimo_id: { in: emprestimoIds } } });
    await tx.emprestimo.deleteMany({ where: { usuario_id: usuarioId } });
    await tx.reserva.deleteMany({ where: { usuario_id: usuarioId } });
    await tx.solicitacaoExclusaoAdmin.deleteMany({ where: { admin_id: usuarioId } }).catch(() => undefined);
    await tx.usuario.delete({ where: { id_usuario: usuarioId } });
  });
}

