import bcrypt from "bcryptjs";
import { prisma } from "../config/prismaClient.js";

export type UsuarioSessao = {
  idUsuario: number;
  nivelAcesso: string;
  email: string;
};

export class ErroRepositorioBiblioteca extends Error {
  constructor(
    message: string,
    public readonly status = 400
  ) {
    super(message);
    this.name = "ErroRepositorioBiblioteca";
  }
}

export class RepositorioBiblioteca {
  private readonly DIA = 24 * 60 * 60 * 1000;
  private readonly HORA = 60 * 60 * 1000;
  private readonly emprestimoPadraoDias = 15;

  private livroEstaInativo(livro?: { status?: string } | null) {
    return String(livro?.status || "").toLowerCase() === "inativo";
  }

  private calcularValorMulta(dataVencimento: Date | string, dataFinal: Date | string = new Date()) {
    const vencimento = new Date(dataVencimento).getTime();
    const fim = new Date(dataFinal).getTime();
    return Math.max(1, Math.ceil((fim - vencimento) / this.DIA));
  }

  private async notificar(
    usuarioId: number,
    tipo: string,
    mensagem: string,
    acao?: string,
    referenciaId?: number
  ) {
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

  private async notificarAdmins(
    tipo: string,
    mensagem: string,
    acao?: string,
    referenciaId?: number,
    ignorarId?: number
  ) {
    const admins = await prisma.usuario.findMany({
      where: {
        nivel_acesso: "admin",
        ...(ignorarId ? { id_usuario: { not: ignorarId } } : {}),
      },
    });
    await Promise.all(
      admins.map((admin) =>
        this.notificar(admin.id_usuario, tipo, mensagem, acao, referenciaId)
      )
    );
  }

  private async multasBloqueantes(usuarioId: number) {
    return (prisma as any).multa.findMany({
      where: {
        status_pagamento: { in: ["pendente", "aguardando_confirmacao"] },
        emprestimo: { usuario_id: usuarioId },
      },
    });
  }

  private async atualizarValoresMultas() {
    const multas = await (prisma as any).multa.findMany({
      where: { status_pagamento: { in: ["pendente", "aguardando_confirmacao"] } },
      include: { emprestimo: true },
    });

    await Promise.all(
      multas.map((multa: any) => {
        const vencimento = multa.emprestimo?.data_vencimento || multa.data_geracao;
        const fim = multa.emprestimo?.data_devolucao_real || new Date();
        const valor = this.calcularValorMulta(vencimento, fim);
        if (Number(multa.valor_multa) === valor) return Promise.resolve();
        return (prisma as any).multa.update({
          where: { id_multa: multa.id_multa },
          data: { valor_multa: valor },
        });
      })
    );
  }

  private async gerarMultasEmprestimosAtrasados() {
    const agora = new Date();
    const emprestimos = await (prisma as any).emprestimo.findMany({
      where: {
        data_devolucao_real: null,
        data_vencimento: { lt: agora },
        multa: { is: null },
        exemplar_id: { not: null },
      },
      include: {
        exemplar: { include: { livro: true } },
      },
    });

    await Promise.all(
      emprestimos.map(async (emprestimo: any) => {
        const valorMulta = this.calcularValorMulta(emprestimo.data_vencimento, agora);
        const multa = await (prisma as any).multa.create({
          data: {
            valor_multa: valorMulta,
            status_pagamento: "pendente",
            data_geracao: agora,
            emprestimo_id: emprestimo.id_emprestimo,
            exemplar_id: emprestimo.exemplar_id,
          },
        });
        await this.notificar(
          emprestimo.usuario_id,
          "multa",
          `Uma multa foi gerada por atraso na devolucao de "${emprestimo.exemplar.livro.titulo}".`,
          "gerenciar_multas",
          multa.id_multa
        );
      })
    );
  }

  private async alertarEmprestimosProximosDoVencimento() {
    const agora = new Date();
    const limite = new Date(agora.getTime() + 2 * this.DIA);
    const emprestimos = await (prisma as any).emprestimo.findMany({
      where: {
        data_devolucao_real: null,
        data_vencimento: {
          gte: agora,
          lte: limite,
        },
        exemplar_id: { not: null },
      },
      include: {
        exemplar: { include: { livro: true } },
      },
    });

    await Promise.all(
      emprestimos.map(async (emprestimo: any) => {
        const alertaExistente = await (prisma as any).notificacao.findFirst({
          where: {
            usuario_id: emprestimo.usuario_id,
            tipo: "devolucao",
            acao: "consultar_emprestimos",
            referencia_id: emprestimo.id_emprestimo,
          },
        });
        if (alertaExistente) return;

        const diasRestantes = Math.max(
          0,
          Math.ceil((new Date(emprestimo.data_vencimento).getTime() - agora.getTime()) / this.DIA)
        );
        const prazo = new Date(emprestimo.data_vencimento).toLocaleDateString("pt-BR");
        const textoPrazo = diasRestantes === 0
          ? "vence hoje"
          : `vence em ${diasRestantes} ${diasRestantes === 1 ? "dia" : "dias"}`;

        await this.notificar(
          emprestimo.usuario_id,
          "devolucao",
          `O prazo de devolucao de "${emprestimo.exemplar.livro.titulo}" ${textoPrazo} (${prazo}).`,
          "consultar_emprestimos",
          emprestimo.id_emprestimo
        );
      })
    );
  }

  private async exemplaresDisponiveis(livroId: number) {
    const exemplares = await prisma.exemplar.findMany({ where: { livro_id: livroId } });
    const ids = exemplares.map((exemplar) => exemplar.id_exemplar);
    if (!ids.length) return [];

    const emprestimosAtivos = await (prisma as any).emprestimo.findMany({
      where: { exemplar_id: { in: ids }, data_devolucao_real: null },
      select: { exemplar_id: true },
    });
    const indisponiveis = new Set(
      emprestimosAtivos.map((emprestimo: any) => emprestimo.exemplar_id)
    );
    return exemplares.filter((exemplar) => !indisponiveis.has(exemplar.id_exemplar));
  }

  private async sincronizarFilaLivro(livroId: number) {
    const disponiveis = await this.exemplaresDisponiveis(livroId);
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

    const ate = new Date(Date.now() + this.HORA);
    await (prisma as any).reserva.update({
      where: { id_reserva: proxima.id_reserva },
      data: { status_reserva: "pronta", data_expiracao: ate, notificado_em: new Date() },
    });
    await this.notificar(
      proxima.usuario_id,
      "reserva",
      `Sua reserva de "${proxima.livro.titulo}" esta pronta para emprestimo. Voce tem 1 hora para confirmar.`,
      "reserva_pronta",
      proxima.id_reserva
    );
  }

  private async sincronizarBiblioteca() {
    await this.gerarMultasEmprestimosAtrasados();
    await this.alertarEmprestimosProximosDoVencimento();
    await this.atualizarValoresMultas();
    const livros = await prisma.livro.findMany({ select: { id_livro: true } });
    await Promise.all(livros.map((livro) => this.sincronizarFilaLivro(livro.id_livro)));
  }

  private async criarEmprestimo(usuarioId: number, livroId: number, reservaId?: number) {
    const livro = await prisma.livro.findUnique({ where: { id_livro: livroId } });
    if (!livro) throw new ErroRepositorioBiblioteca("Livro nao encontrado", 404);
    if (this.livroEstaInativo(livro)) {
      throw new ErroRepositorioBiblioteca("Livro inativo nao pode gerar novos emprestimos");
    }

    const disponiveis = await this.exemplaresDisponiveis(livroId);
    if (!disponiveis.length) {
      throw new ErroRepositorioBiblioteca("Nao ha exemplares disponiveis para emprestimo");
    }

    const agora = new Date();
    const vencimento = new Date(agora.getTime() + this.emprestimoPadraoDias * this.DIA);
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

    await this.notificar(
      usuarioId,
      "emprestimo",
      `Emprestimo de "${emprestimo.exemplar.livro.titulo}" criado com vencimento em ${vencimento.toLocaleDateString("pt-BR")}.`,
      "consultar_emprestimos",
      emprestimo.id_emprestimo
    );
    await this.sincronizarFilaLivro(livroId);
    return emprestimo;
  }

  async obterEstado(usuario: UsuarioSessao) {
    await this.sincronizarBiblioteca();

    const [
      livros,
      exemplares,
      reservas,
      emprestimos,
      multas,
      notificacoes,
      usuarios,
      curtidasUsuario,
      solicitacoesExclusaoAdmin,
    ] = await Promise.all([
      prisma.livro.findMany({
        include: { _count: { select: { curtidas: true } } },
        orderBy: { id_livro: "desc" },
      }),
      prisma.exemplar.findMany({
        include: { livro: true },
        orderBy: { id_exemplar: "desc" },
      }),
      (prisma as any).reserva.findMany({
        include: { livro: true, usuario: true },
        orderBy: { data_reserva: "asc" },
      }),
      (prisma as any).emprestimo.findMany({
        include: { usuario: true, exemplar: { include: { livro: true } }, multa: true },
        orderBy: { data_saida: "desc" },
      }),
      (prisma as any).multa.findMany({
        include: {
          emprestimo: {
            include: { usuario: true, exemplar: { include: { livro: true } } },
          },
          exemplar: true,
        },
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
      (prisma as any).curtidaLivro.findMany({
        where: { usuario_id: usuario.idUsuario },
      }),
      (prisma as any).solicitacaoExclusaoAdmin
        .findMany({
          include: { admin: true },
          orderBy: { data_criacao: "desc" },
        })
        .catch(() => []),
    ]);

    return {
      livros,
      exemplares,
      reservas,
      emprestimos,
      multas,
      notificacoes,
      usuarios,
      curtidasUsuario,
      solicitacoesExclusaoAdmin,
    };
  }

  async criarEmprestimoUsuario(usuario: UsuarioSessao, livroId: number) {
    if (usuario.nivelAcesso === "admin") {
      throw new ErroRepositorioBiblioteca("Admins nao podem fazer emprestimos", 403);
    }
    await this.gerarMultasEmprestimosAtrasados();
    if ((await this.multasBloqueantes(usuario.idUsuario)).length) {
      throw new ErroRepositorioBiblioteca(
        "Voce tem multas pendentes. Resolva suas pendencias na aba Gerenciar multas."
      );
    }

    return this.criarEmprestimo(usuario.idUsuario, livroId);
  }

  async criarReserva(usuario: UsuarioSessao, livroId: number) {
    if (usuario.nivelAcesso === "admin") {
      throw new ErroRepositorioBiblioteca("Admins nao podem fazer reservas", 403);
    }
    await this.gerarMultasEmprestimosAtrasados();
    if ((await this.multasBloqueantes(usuario.idUsuario)).length) {
      throw new ErroRepositorioBiblioteca(
        "Voce tem multas pendentes. Resolva suas pendencias na aba Gerenciar multas."
      );
    }

    const livro = await prisma.livro.findUnique({ where: { id_livro: livroId } });
    if (!livro) throw new ErroRepositorioBiblioteca("Livro nao encontrado", 404);
    if (this.livroEstaInativo(livro)) {
      throw new ErroRepositorioBiblioteca("Livro inativo nao pode receber novas reservas");
    }

    const existente = await (prisma as any).reserva.findFirst({
      where: {
        usuario_id: usuario.idUsuario,
        livro_id: livroId,
        status_reserva: { in: ["ativa", "pronta"] },
      },
    });
    if (existente) throw new ErroRepositorioBiblioteca("Voce ja esta na fila de reserva desse livro");

    const disponiveis = await this.exemplaresDisponiveis(livroId);
    if (disponiveis.length) {
      throw new ErroRepositorioBiblioteca("Este livro possui exemplar disponivel. Faca o emprestimo.");
    }

    const reserva = await (prisma as any).reserva.create({
      data: {
        usuario_id: usuario.idUsuario,
        livro_id: livroId,
        data_reserva: new Date(),
        data_expiracao: new Date(Date.now() + 30 * this.DIA),
        status_reserva: "ativa",
      },
      include: { livro: true, usuario: true },
    });
    await this.notificar(
      usuario.idUsuario,
      "reserva",
      `Reserva de "${reserva.livro.titulo}" realizada. Aguarde sua vez na fila.`,
      "gerenciar_reservas",
      reserva.id_reserva
    );
    return reserva;
  }

  async criarEmprestimoDaReserva(usuario: UsuarioSessao, reservaId: number) {
    const reserva = await (prisma as any).reserva.findUnique({
      where: { id_reserva: reservaId },
    });
    if (!reserva) throw new ErroRepositorioBiblioteca("Reserva nao encontrada", 404);
    if (reserva.usuario_id !== usuario.idUsuario && usuario.nivelAcesso !== "admin") {
      throw new ErroRepositorioBiblioteca("Reserva pertence a outro usuario", 403);
    }
    if (reserva.status_reserva !== "pronta") {
      throw new ErroRepositorioBiblioteca("Esta reserva ainda nao esta pronta para emprestimo");
    }
    if (new Date(reserva.data_expiracao).getTime() < Date.now()) {
      await this.sincronizarFilaLivro(reserva.livro_id);
      throw new ErroRepositorioBiblioteca("O prazo de 1 hora desta reserva expirou");
    }
    await this.gerarMultasEmprestimosAtrasados();
    if ((await this.multasBloqueantes(reserva.usuario_id)).length) {
      throw new ErroRepositorioBiblioteca("Usuario possui multas pendentes");
    }

    return this.criarEmprestimo(reserva.usuario_id, reserva.livro_id, reserva.id_reserva);
  }

  async cancelarReserva(usuario: UsuarioSessao, reservaId: number) {
    const reserva = await (prisma as any).reserva.findUnique({
      where: { id_reserva: reservaId },
      include: { livro: true },
    });
    if (!reserva) throw new ErroRepositorioBiblioteca("Reserva nao encontrada", 404);
    if (reserva.usuario_id !== usuario.idUsuario && usuario.nivelAcesso !== "admin") {
      throw new ErroRepositorioBiblioteca("Reserva pertence a outro usuario", 403);
    }
    if (!["ativa", "pronta"].includes(reserva.status_reserva)) {
      throw new ErroRepositorioBiblioteca("Somente reservas em espera podem ser canceladas");
    }

    const cancelada = await (prisma as any).reserva.update({
      where: { id_reserva: reserva.id_reserva },
      data: { status_reserva: "cancelada" },
    });
    await this.notificar(
      reserva.usuario_id,
      "reserva",
      `Reserva de "${reserva.livro.titulo}" cancelada.`,
      "gerenciar_reservas",
      reserva.id_reserva
    );
    await this.sincronizarFilaLivro(reserva.livro_id);
    return cancelada;
  }

  async devolverEmprestimo(usuario: UsuarioSessao, emprestimoId: number, curtirLivro?: boolean) {
    const emprestimo = await (prisma as any).emprestimo.findUnique({
      where: { id_emprestimo: emprestimoId },
      include: { exemplar: { include: { livro: true } }, multa: true },
    });
    if (!emprestimo) throw new ErroRepositorioBiblioteca("Emprestimo nao encontrado", 404);
    if (emprestimo.usuario_id !== usuario.idUsuario && usuario.nivelAcesso !== "admin") {
      throw new ErroRepositorioBiblioteca("Emprestimo pertence a outro usuario", 403);
    }
    if (emprestimo.data_devolucao_real) {
      throw new ErroRepositorioBiblioteca("Este emprestimo ja foi devolvido");
    }

    const agora = new Date();
    const devolvido = await (prisma as any).emprestimo.update({
      where: { id_emprestimo: emprestimo.id_emprestimo },
      data: { data_devolucao_real: agora },
    });
    const livroId = emprestimo.exemplar.livro_id;

    if (curtirLivro === true) {
      await (prisma as any).curtidaLivro.upsert({
        where: {
          usuario_id_livro_id: {
            usuario_id: emprestimo.usuario_id,
            livro_id: livroId,
          },
        },
        update: {},
        create: {
          usuario_id: emprestimo.usuario_id,
          livro_id: livroId,
        },
      });
    }

    if (agora > new Date(emprestimo.data_vencimento) && !emprestimo.multa) {
      const valorMulta = this.calcularValorMulta(emprestimo.data_vencimento, agora);
      await (prisma as any).multa.create({
        data: {
          valor_multa: valorMulta,
          status_pagamento: "pendente",
          data_geracao: agora,
          emprestimo_id: emprestimo.id_emprestimo,
          exemplar_id: emprestimo.exemplar_id,
        },
      });
      await this.notificar(
        emprestimo.usuario_id,
        "multa",
        `Uma multa foi gerada por atraso na devolucao de "${emprestimo.exemplar.livro.titulo}".`,
        "gerenciar_multas",
        emprestimo.id_emprestimo
      );
    }

    await this.sincronizarFilaLivro(livroId);
    return devolvido;
  }

  async solicitarExtensao(usuario: UsuarioSessao, emprestimoId: number) {
    const emprestimo = await (prisma as any).emprestimo.findUnique({
      where: { id_emprestimo: emprestimoId },
      include: { usuario: true, exemplar: { include: { livro: true } } },
    });
    if (!emprestimo) throw new ErroRepositorioBiblioteca("Emprestimo nao encontrado", 404);
    if (emprestimo.usuario_id !== usuario.idUsuario) {
      throw new ErroRepositorioBiblioteca("Emprestimo pertence a outro usuario", 403);
    }
    if (emprestimo.renovacoes >= 2) {
      throw new ErroRepositorioBiblioteca("Voce ja usou as 2 extensoes permitidas para este emprestimo");
    }
    if (emprestimo.status_extensao === "pendente") {
      throw new ErroRepositorioBiblioteca("Ja existe uma solicitacao de extensao pendente");
    }

    await (prisma as any).emprestimo.update({
      where: { id_emprestimo: emprestimo.id_emprestimo },
      data: { status_extensao: "pendente" },
    });
    await this.notificarAdmins(
      "renovacao",
      `${emprestimo.usuario.nome} quer estender o prazo de entrega de "${emprestimo.exemplar.livro.titulo}".`,
      "gerenciar_emprestimos",
      emprestimo.id_emprestimo
    );
    return { mensagem: "Solicitacao enviada. Aguarde a confirmacao de um admin." };
  }

  async decidirExtensao(emprestimoId: number, aprovar: boolean) {
    const emprestimo = await (prisma as any).emprestimo.findUnique({
      where: { id_emprestimo: emprestimoId },
      include: { usuario: true, exemplar: { include: { livro: true } } },
    });
    if (!emprestimo) throw new ErroRepositorioBiblioteca("Emprestimo nao encontrado", 404);
    if (emprestimo.status_extensao !== "pendente") {
      throw new ErroRepositorioBiblioteca("Este emprestimo nao possui solicitacao pendente");
    }

    const data: any = { status_extensao: aprovar ? "aprovada" : "negada" };
    if (aprovar) {
      data.renovacoes = emprestimo.renovacoes + 1;
      data.data_vencimento = new Date(
        new Date(emprestimo.data_vencimento).getTime() +
          this.emprestimoPadraoDias * this.DIA
      );
    }
    const atualizado = await (prisma as any).emprestimo.update({
      where: { id_emprestimo: emprestimo.id_emprestimo },
      data,
    });
    await this.notificar(
      emprestimo.usuario_id,
      "renovacao",
      `Sua solicitacao de extensao para "${emprestimo.exemplar.livro.titulo}" foi ${aprovar ? "aprovada" : "negada"}.`,
      "consultar_emprestimos",
      emprestimo.id_emprestimo
    );
    return atualizado;
  }

  async informarPagamentoMulta(usuario: UsuarioSessao, multaId: number) {
    const multa = await (prisma as any).multa.findUnique({
      where: { id_multa: multaId },
      include: { emprestimo: { include: { usuario: true, exemplar: { include: { livro: true } } } } },
    });
    if (!multa) throw new ErroRepositorioBiblioteca("Multa nao encontrada", 404);
    if (multa.emprestimo.usuario_id !== usuario.idUsuario) {
      throw new ErroRepositorioBiblioteca("Multa pertence a outro usuario", 403);
    }
    if (multa.status_pagamento === "paga") {
      throw new ErroRepositorioBiblioteca("Esta multa ja esta paga");
    }

    const atualizada = await (prisma as any).multa.update({
      where: { id_multa: multa.id_multa },
      data: { status_pagamento: "aguardando_confirmacao", data_pagamento: new Date() },
    });
    await this.notificarAdmins(
      "multa",
      `${multa.emprestimo.usuario.nome} informou o pagamento da multa do livro "${multa.emprestimo.exemplar.livro.titulo}".`,
      "gerenciar_pagamento_multas",
      multa.id_multa
    );
    return atualizada;
  }

  async decidirPagamentoMulta(multaId: number, aprovar: boolean) {
    const multa = await (prisma as any).multa.findUnique({
      where: { id_multa: multaId },
      include: { emprestimo: { include: { usuario: true, exemplar: { include: { livro: true } } } } },
    });
    if (!multa) throw new ErroRepositorioBiblioteca("Multa nao encontrada", 404);

    const atualizada = await (prisma as any).multa.update({
      where: { id_multa: multa.id_multa },
      data: aprovar
        ? { status_pagamento: "paga", data_pagamento: new Date() }
        : { status_pagamento: "pendente", data_pagamento: null },
    });
    await this.notificar(
      multa.emprestimo.usuario_id,
      "multa",
      aprovar
        ? `Pagamento da multa de "${multa.emprestimo.exemplar.livro.titulo}" confirmado.`
        : `Pagamento da multa de "${multa.emprestimo.exemplar.livro.titulo}" nao confirmado. Envie o pagamento novamente.`,
      "gerenciar_multas",
      multa.id_multa
    );
    return atualizada;
  }

  async solicitarExclusaoMinhaConta(usuario: UsuarioSessao, email: string, senha: string) {
    const atual = await prisma.usuario.findUnique({
      where: { id_usuario: usuario.idUsuario },
    });
    if (!atual) throw new ErroRepositorioBiblioteca("Usuario nao encontrado", 404);
    const emailOk = atual.email === String(email || "").trim();
    const senhaOk = await bcrypt.compare(String(senha || ""), atual.senha);
    if (!emailOk || !senhaOk) {
      throw new ErroRepositorioBiblioteca("Email ou senha invalidos", 403);
    }

    if (atual.nivel_acesso === "admin") {
      const outrosAdmins = await prisma.usuario.count({
        where: {
          nivel_acesso: "admin",
          id_usuario: { not: atual.id_usuario },
        },
      });
      if (outrosAdmins === 0) {
        throw new ErroRepositorioBiblioteca(
          "Não é possível solicitar exclusão: este é o único administrador do sistema. Cadastre outro administrador antes de excluir esta conta."
        );
      }

      const existente = await (prisma as any).solicitacaoExclusaoAdmin.findFirst({
        where: { admin_id: atual.id_usuario, status: "pendente" },
      });
      const solicitacao =
        existente ||
        (await (prisma as any).solicitacaoExclusaoAdmin.create({
          data: { admin_id: atual.id_usuario, status: "pendente" },
        }));
      await this.notificarAdmins(
        "aviso",
        `${atual.nome} solicitou exclusao da conta de admin.`,
        "gerenciar_admins",
        solicitacao.id_solicitacao,
        atual.id_usuario
      );
      return {
        mensagem: "Solicitacao enviada. Aguarde outro admin confirmar.",
        solicitacao,
      };
    }

    await this.excluirUsuarioComDependencias(atual.id_usuario);
    return { mensagem: "Conta excluida" };
  }

  async decidirExclusaoAdmin(usuario: UsuarioSessao, solicitacaoId: number, aprovar: boolean) {
    const solicitacao = await (prisma as any).solicitacaoExclusaoAdmin.findUnique({
      where: { id_solicitacao: solicitacaoId },
      include: { admin: true },
    });
    if (!solicitacao) throw new ErroRepositorioBiblioteca("Solicitacao nao encontrada", 404);
    if (solicitacao.admin_id === usuario.idUsuario) {
      throw new ErroRepositorioBiblioteca("Outro admin precisa decidir sua solicitacao", 403);
    }

    await (prisma as any).solicitacaoExclusaoAdmin.update({
      where: { id_solicitacao: solicitacao.id_solicitacao },
      data: {
        status: aprovar ? "aprovada" : "negada",
        data_decisao: new Date(),
        decidido_por: usuario.idUsuario,
      },
    });
    await this.notificar(
      solicitacao.admin_id,
      "aviso",
      `Sua solicitacao de exclusao de admin foi ${aprovar ? "aprovada" : "negada"}.`,
      "gerenciar_admins",
      solicitacao.id_solicitacao
    );
    return { mensagem: aprovar ? "Solicitacao aprovada" : "Solicitacao negada" };
  }

  async excluirAdminAprovado(usuario: UsuarioSessao, solicitacaoId: number) {
    const solicitacao = await (prisma as any).solicitacaoExclusaoAdmin.findUnique({
      where: { id_solicitacao: solicitacaoId },
    });
    if (!solicitacao || solicitacao.admin_id !== usuario.idUsuario) {
      throw new ErroRepositorioBiblioteca("Solicitacao nao encontrada", 404);
    }
    if (solicitacao.status !== "aprovada") {
      throw new ErroRepositorioBiblioteca("A exclusao ainda nao foi aprovada");
    }
    await this.excluirUsuarioComDependencias(usuario.idUsuario);
    return { mensagem: "Conta admin excluida" };
  }

  private async excluirUsuarioComDependencias(usuarioId: number) {
    await (prisma as any).$transaction(async (tx: any) => {
      const emprestimos = await tx.emprestimo.findMany({
        where: { usuario_id: usuarioId },
        select: { id_emprestimo: true },
      });
      const emprestimoIds = emprestimos.map((emprestimo: any) => emprestimo.id_emprestimo);
      await tx.notificacao.deleteMany({ where: { usuario_id: usuarioId } });
      await tx.notificacao.deleteMany({ where: { id_emprestimo: { in: emprestimoIds } } });
      await tx.multa.deleteMany({ where: { emprestimo_id: { in: emprestimoIds } } });
      await tx.emprestimo.deleteMany({ where: { usuario_id: usuarioId } });
      await tx.reserva.deleteMany({ where: { usuario_id: usuarioId } });
      await tx.solicitacaoExclusaoAdmin
        .deleteMany({ where: { admin_id: usuarioId } })
        .catch(() => undefined);
      await tx.usuario.delete({ where: { id_usuario: usuarioId } });
    });
  }
}
