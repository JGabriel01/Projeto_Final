(function () {
  const DIA = 24 * 60 * 60 * 1000;
  let profileTab = "reservas";
  let notificationsOpen = false;

  function byId(id) {
    return document.getElementById(id);
  }

  function nowIsoDate(days = 0) {
    return new Date(Date.now() + days * DIA).toISOString();
  }

  function rawId(item, camel, snake) {
    return item?.[camel] ?? item?.[snake];
  }

  function arquivoApiUrl(objeto, url) {
    if (objeto) return `/api/arquivos/${String(objeto).replace(/^\/+/, "")}`;
    return url;
  }

  function normalizeLivro(livro) {
    return {
      ...livro,
      idLivro: rawId(livro, "idLivro", "id_livro"),
      anoPublicacao: rawId(livro, "anoPublicacao", "ano_publicacao"),
      status: normalizarStatusLivro(rawId(livro, "status", "status")),
      capaUrl: arquivoApiUrl(
        rawId(livro, "capaObjeto", "capa_objeto"),
        rawId(livro, "capaUrl", "capa_url")
      ),
      curtidasTotal: rawId(livro, "curtidasTotal", "curtidas_total") ?? livro?._count?.curtidas ?? 0,
    };
  }

  function normalizeUsuario(usuario) {
    const aluno = usuario?.aluno || {};
    const professor = usuario?.professor || {};
    const admin = usuario?.admin || {};
    return {
      ...usuario,
      idUsuario: rawId(usuario, "idUsuario", "id_usuario"),
      nivelAcesso: rawId(usuario, "nivelAcesso", "nivel_acesso"),
      fotoPerfilUrl: arquivoApiUrl(
        rawId(usuario, "fotoPerfilObjeto", "foto_perfil_objeto"),
        rawId(usuario, "fotoPerfilUrl", "foto_perfil_url")
      ),
      fundoPerfilUrl: arquivoApiUrl(
        rawId(usuario, "fundoPerfilObjeto", "fundo_perfil_objeto"),
        rawId(usuario, "fundoPerfilUrl", "fundo_perfil_url")
      ),
      anoIngresso: aluno.ano_ingresso,
      curso: aluno.curso,
      departamento: professor.departamento,
      cargo: admin.cargo,
    };
  }

  function normalizeReserva(reserva) {
    return {
      ...reserva,
      idReserva: rawId(reserva, "idReserva", "id_reserva"),
      dataReserva: rawId(reserva, "dataReserva", "data_reserva"),
      dataExpiracao: rawId(reserva, "dataExpiracao", "data_expiracao"),
      statusReserva: rawId(reserva, "statusReserva", "status_reserva"),
      usuarioId: rawId(reserva, "usuarioId", "usuario_id"),
      livroId: rawId(reserva, "livroId", "livro_id"),
      usuario: reserva.usuario ? normalizeUsuario(reserva.usuario) : undefined,
      livro: reserva.livro ? normalizeLivro(reserva.livro) : undefined,
    };
  }

  function normalizeEmprestimo(emprestimo) {
    return {
      ...emprestimo,
      idEmprestimo: rawId(emprestimo, "idEmprestimo", "id_emprestimo"),
      dataSaida: rawId(emprestimo, "dataSaida", "data_saida"),
      dataVencimento: rawId(emprestimo, "dataVencimento", "data_vencimento"),
      dataDevolucaoReal: rawId(emprestimo, "dataDevolucaoReal", "data_devolucao_real"),
      usuarioId: rawId(emprestimo, "usuarioId", "usuario_id"),
      exemplarId: rawId(emprestimo, "exemplarId", "exemplar_id"),
      statusExtensao: rawId(emprestimo, "statusExtensao", "status_extensao") || "nenhuma",
      renovacoes: emprestimo.renovacoes || 0,
      usuario: emprestimo.usuario ? normalizeUsuario(emprestimo.usuario) : undefined,
      exemplar: emprestimo.exemplar,
      multa: emprestimo.multa ? normalizeMulta(emprestimo.multa) : undefined,
    };
  }

  function normalizeMulta(multa) {
    return {
      ...multa,
      idMulta: rawId(multa, "idMulta", "id_multa"),
      valor: rawId(multa, "valor", "valor_multa"),
      idEmprestimo: rawId(multa, "idEmprestimo", "emprestimo_id"),
      idExemplar: rawId(multa, "idExemplar", "exemplar_id"),
      dataCriacao: rawId(multa, "dataCriacao", "data_geracao"),
      dataPagamento: rawId(multa, "dataPagamento", "data_pagamento"),
      statusPagamento: rawId(multa, "statusPagamento", "status_pagamento"),
      emprestimo: multa.emprestimo ? normalizeEmprestimo(multa.emprestimo) : undefined,
    };
  }

  function normalizeCurtida(curtida) {
    return {
      ...curtida,
      idCurtida: rawId(curtida, "idCurtida", "id_curtida"),
      usuarioId: rawId(curtida, "usuarioId", "usuario_id"),
      livroId: rawId(curtida, "livroId", "livro_id"),
    };
  }

  function ordenarPorIdMaisNovo(items, camelKey, snakeKey) {
    return [...(items || [])].sort((a, b) =>
      Number(b?.[camelKey] ?? b?.[snakeKey] ?? 0) - Number(a?.[camelKey] ?? a?.[snakeKey] ?? 0)
    );
  }

  function normalizeNotificacao(notificacao) {
    return {
      ...notificacao,
      idNotificacao: rawId(notificacao, "idNotificacao", "id_notificacao"),
      idUsuario: rawId(notificacao, "idUsuario", "usuario_id"),
      idEmprestimo: rawId(notificacao, "idEmprestimo", "id_emprestimo"),
      dataCriacao: rawId(notificacao, "dataCriacao", "data_envio"),
      lida: rawId(notificacao, "lida", "lido"),
      referenciaId: rawId(notificacao, "referenciaId", "referencia_id"),
    };
  }

  function formatarTipoNotificacao(tipo) {
    const tipos = {
      devolucao: "Devolução",
      emprestimo: "Empréstimo",
      multa: "Multa",
      renovacao: "Renovação",
      reserva: "Reserva",
    };
    return tipos[String(tipo || "").toLowerCase()] || formatarStatus(tipo);
  }

  function formatarMensagemNotificacao(mensagem) {
    return String(mensagem || "")
      .replaceAll("devolucao", "devolução")
      .replaceAll("Devolucao", "Devolução")
      .replaceAll("emprestimo", "empréstimo")
      .replaceAll("Emprestimo", "Empréstimo")
      .replaceAll("Voce", "Você")
      .replaceAll("voce", "você")
      .replaceAll("Notificacao", "Notificação")
      .replaceAll("notificacao", "notificação")
      .replaceAll("notificacoes", "notificações")
      .replaceAll("Usuario", "Usuário")
      .replaceAll("usuario", "usuário")
      .replaceAll("esta ", "está ")
      .replaceAll("ate ", "até ")
      .replaceAll("proximo", "próximo")
      .replaceAll("proximos", "próximos");
  }

  function ownId() {
    return estado.usuario?.idUsuario;
  }

  function activeLoans() {
    return estado.emprestimos.filter((emprestimo) => !emprestimo.dataDevolucaoReal);
  }

  function copiesForBook(livroId) {
    return estado.exemplares.filter((exemplar) => exemplar.livro_id === livroId);
  }

  function loansForBook(livroId) {
    const ids = new Set(copiesForBook(livroId).map((exemplar) => exemplar.id_exemplar));
    return activeLoans().filter((emprestimo) => ids.has(emprestimo.exemplarId));
  }

  function availableCount(livroId) {
    return Math.max(copiesForBook(livroId).length - loansForBook(livroId).length, 0);
  }

  function hasBlockingFine(userId = ownId()) {
    const userLoanIds = new Set(estado.emprestimos.filter((e) => e.usuarioId === userId).map((e) => e.idEmprestimo));
    return estado.multas.some((multa) =>
      userLoanIds.has(multa.idEmprestimo) &&
      ["pendente", "aguardando_confirmacao"].includes(multa.statusPagamento)
    );
  }

  function userLikedBook(livroId) {
    return (estado.curtidasUsuario || []).some((curtida) => curtida.livroId === livroId);
  }

  function reservationQueue(livroId) {
    return estado.reservas
      .filter((reserva) => reserva.livroId === livroId && ["ativa", "pronta"].includes(reserva.statusReserva))
      .sort((a, b) => new Date(a.dataReserva) - new Date(b.dataReserva));
  }

  function ownActiveReservation(livroId) {
    return reservationQueue(livroId).find((reserva) => reserva.usuarioId === ownId());
  }

  function bookForLoan(emprestimo) {
    const exemplar = estado.exemplares.find((item) => item.id_exemplar === emprestimo.exemplarId) || emprestimo.exemplar;
    return estado.livros.find((livro) => livro.idLivro === exemplar?.livro_id) || normalizeLivro(exemplar?.livro || {});
  }

  function fineBook(multa) {
    const loan = estado.emprestimos.find((emprestimo) => emprestimo.idEmprestimo === multa.idEmprestimo) || multa.emprestimo;
    return loan ? bookForLoan(loan) : {};
  }

  function daysLeft(date) {
    return Math.ceil((new Date(date).getTime() - Date.now()) / DIA);
  }

  function escapeAttr(value) {
    return String(value ?? "").replaceAll('"', "&quot;");
  }

  function ensureModal() {
    if (byId("confirmModal")) return;
    document.body.insertAdjacentHTML("beforeend", `
      <div id="confirmModal" class="modal-backdrop hidden">
        <section class="confirm-modal">
          <h3 id="confirmModalTitle">Confirmar</h3>
          <p id="confirmModalText"></p>
          <div class="form-actions">
            <button id="confirmModalYes" class="primary-btn" type="button">Confirmar</button>
            <button id="confirmModalNo" class="secondary-btn" type="button">Cancelar</button>
          </div>
        </section>
      </div>
    `);
  }

  function confirmDialog(title, text, labels = {}) {
    ensureModal();
    return new Promise((resolve) => {
      byId("confirmModalTitle").textContent = title;
      byId("confirmModalText").textContent = text;
      byId("confirmModalYes").textContent = labels.yes || "Confirmar";
      byId("confirmModalNo").textContent = labels.no || "Cancelar";
      byId("confirmModal").classList.remove("hidden");
      const finish = (value) => {
        byId("confirmModal").classList.add("hidden");
        byId("confirmModalYes").onclick = null;
        byId("confirmModalNo").onclick = null;
        byId("confirmModalYes").textContent = "Confirmar";
        byId("confirmModalNo").textContent = "Cancelar";
        resolve(value);
      };
      byId("confirmModalYes").onclick = () => finish(true);
      byId("confirmModalNo").onclick = () => finish(false);
    });
  }

  async function apiExtra(path, options = {}) {
    return chamarApi(path, options);
  }

  carregarTudo = async function () {
    try {
      const dados = await apiExtra("/biblioteca/estado");
      estado.livros = ordenarPorIdMaisNovo((dados.livros || []).map(normalizeLivro), "idLivro", "id_livro");
      estado.exemplares = ordenarPorIdMaisNovo(dados.exemplares || [], "idExemplar", "id_exemplar");
      estado.reservas = (dados.reservas || []).map(normalizeReserva);
      estado.emprestimos = (dados.emprestimos || []).map(normalizeEmprestimo);
      estado.multas = (dados.multas || []).map(normalizeMulta);
      estado.notificacoes = (dados.notificacoes || []).map(normalizeNotificacao);
      estado.usuarios = (dados.usuarios || []).map(normalizeUsuario);
      estado.curtidasUsuario = (dados.curtidasUsuario || []).map(normalizeCurtida);
      estado.solicitacoesExclusaoAdmin = dados.solicitacoesExclusaoAdmin || [];
      const usuarioAtual = estado.usuarios.find((usuario) => usuario.idUsuario === ownId());
      if (usuarioAtual) {
        estado.usuario = { ...estado.usuario, ...usuarioAtual };
        localStorage.setItem("usuario", JSON.stringify(estado.usuario));
      }
      limparLivrosAusentesDaInterface();
      renderizarTudo();
      renderizarUsuarioAtual();
      renderNotifications();
    } catch (error) {
      notificar(error.message);
    }
  };

  aplicarInterfacePorPerfil = function () {
    const menu = byId("appMenu");
    if (menu) {
      menu.innerHTML = `
        <button class="nav-btn active" data-view="homeView" type="button">Início</button>
        <button class="nav-btn" data-view="usersView" type="button">Usuários</button>
      `;
      menu.querySelectorAll(".nav-btn").forEach((btn) => {
        btn.classList.toggle("active", document.querySelector(".view.active")?.id === btn.dataset.view);
        btn.addEventListener("click", () => definirVisaoAtiva(btn.dataset.view));
      });
    }
    byId("newBookBtn")?.classList.toggle("hidden", !ehAdmin());
    if (!ehAdmin()) {
      byId("bookFormPanel")?.classList.add("hidden");
      byId("bookForm")?.reset();
    }
  };

  renderizarTudo = function () {
    renderizarLivros();
    renderizarLivrosEmAlta();
    renderizarSecoesGeneros();
    renderizarLivrosIndisponiveis();
    renderizarUsuarios();
    renderizarResumoPerfil();
    renderNotifications();
  };

  renderizarUsuarios = function () {
    const target = byId("usersGrid");
    if (!target) return;
    const admins = estado.usuarios.filter((u) => u.nivelAcesso === "admin");
    const comuns = estado.usuarios.filter((u) => u.nivelAcesso !== "admin");
    const usuarios = ehAdmin() ? [...admins, ...comuns] : comuns;
    target.innerHTML = usuarios.map((usuario) => {
      const detalhe = usuario.curso || usuario.departamento || usuario.cargo || "Usuário da biblioteca";
      const fotoPerfilUrl = normalizarUrlImagem(usuario.fotoPerfilUrl);
      return `
        <article class="user-card ${usuario.nivelAcesso === "admin" ? "admin-user-card" : ""}">
          <div class="user-avatar" ${fotoPerfilUrl ? `style="background-image:url('${fotoPerfilUrl}');background-size:cover;background-position:center"` : ""}>
            ${fotoPerfilUrl ? "" : usuario.nome.slice(0, 1).toUpperCase()}
          </div>
          <h3>${usuario.nome}</h3>
          <p>${usuario.nivelAcesso}</p>
          <strong>${detalhe}</strong>
        </article>
      `;
    }).join("");
  };

  htmlDetalhesLivroInline = function (livro) {
    const exemplares = copiesForBook(livro.idLivro);
    const emprestados = loansForBook(livro.idLivro).length;
    const inativo = livroEstaInativo(livro);
    const disponiveis = inativo ? 0 : availableCount(livro.idLivro);
    const fila = reservationQueue(livro.idLivro);
    const reserva = ownActiveReservation(livro.idLivro);
    const bloqueado = !ehAdmin() && hasBlockingFine();
    let action = `<button class="secondary-btn book-more-btn" type="button" disabled>Somente consulta</button>`;

    if (inativo) {
      action = `<button class="secondary-btn book-more-btn" type="button" disabled>Livro inativo</button>`;
    } else if (!ehAdmin()) {
      if (reserva) {
        action = reserva.statusReserva === "pronta"
          ? `<button class="primary-btn book-more-btn" type="button" data-reservation-loan="${reserva.idReserva}">Fazer empréstimo da reserva</button>`
          : `<button class="reserved-btn book-more-btn" type="button" disabled>Reservado</button>`;
      } else if (bloqueado) {
        action = `<button class="secondary-btn book-more-btn" type="button" disabled>Reservas e empréstimos indisponíveis: pague sua multa pendente</button>`;
      } else if (disponiveis > 0) {
        action = `<button class="primary-btn book-more-btn" type="button" data-loan-book="${livro.idLivro}">Fazer empréstimo</button>`;
      } else {
        action = `<button class="secondary-btn book-more-btn" type="button" data-reserve-book="${livro.idLivro}">Reservar livro</button>`;
      }
    }

    return `
      <aside class="book-detail-panel open" aria-live="polite">
        <div class="book-detail-cover">${htmlCapaLivro(livro)}</div>
        <div class="book-detail-content">
          <span class="system-tag">Sobre a obra</span>
          <h3>${livro.titulo}</h3>
          <p class="book-detail-author">${livro.autor}</p>
          <div class="book-detail-tags">
            <span>${livro.genero || "Livro"}</span>
            <span>${livro.anoPublicacao || "-"}</span>
            <span>${formatarStatus(livro.status)}</span>
          </div>
          <p class="book-detail-synopsis">${livro.sinopse || "Sinopse não cadastrada."}</p>
          <div class="book-detail-stats">
            <article><strong>${exemplares.length}</strong><span>exemplares</span></article>
            <article><strong>${disponiveis}</strong><span>disponíveis</span></article>
            <article><strong>${emprestados}</strong><span>emprestados</span></article>
            <article><strong>${livro.curtidasTotal || 0}</strong><span>curtidas</span></article>
          </div>
          ${fila.length ? `
            <div class="reservation-queue">
              <strong>Fila de reservas</strong>
              ${fila.map((item, index) => {
                const usuario = item.usuario || estado.usuarios.find((u) => u.idUsuario === item.usuarioId) || {};
                const foto = normalizarUrlImagem(usuario.fotoPerfilUrl);
                return `<span><b>${index + 1}</b>${foto ? `<img src="${foto}" alt="">` : ""}${usuario.nome || nomeUsuarioPorId(item.usuarioId)} ${item.statusReserva === "pronta" ? "(pronto)" : ""}</span>`;
              }).join("")}
            </div>
          ` : ""}
          ${ehAdmin() ? `
            <div class="row-actions">
              <button class="secondary-btn" type="button" data-edit-book="${livro.idLivro}">Atualizar</button>
              <button class="danger-btn" type="button" data-delete-book="${livro.idLivro}">Remover</button>
            </div>
          ` : action}
        </div>
      </aside>
    `;
  };

  renderizarResumoPerfil = function () {
    const container = document.querySelector(".profile-private");
    if (!container || !estado.usuario) return;
    const tabs = ehAdmin()
      ? [
        ["reservas-admin", "Reservas por livro"],
        ["emprestimos-admin", "Gerenciamento de Empréstimos"],
        ["multas-admin", "Gerenciar pagamento de multas"],
        ["admins", "Admins"],
        ["dados", "Alterar dados"],
        ["excluir", "Excluir conta"],
      ]
      : [
        ["reservas", "Gerenciar minhas reservas"],
        ["emprestimos", "Consultar meus empréstimos"],
        ["multas", "Gerenciar multas"],
        ["dados", "Alterar dados"],
        ["excluir", "Excluir conta"],
      ];
    if (!tabs.some(([id]) => id === profileTab)) profileTab = tabs[0][0];

    container.innerHTML = `
      <div class="profile-tabs">
        ${tabs.map(([id, label]) => `<button class="tab-btn ${profileTab === id ? "active" : ""}" type="button" data-profile-tab="${id}">${label}</button>`).join("")}
      </div>
      <div id="profileTabContent" class="profile-tab-content">${profileTabHtml()}</div>
    `;
    container.querySelectorAll("[data-profile-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        profileTab = button.dataset.profileTab;
        renderizarResumoPerfil();
      });
    });
  };

  function profileTabHtml() {
    if (profileTab === "reservas") return myReservationsHtml();
    if (profileTab === "emprestimos") return myLoansHtml();
    if (profileTab === "multas") return myFinesHtml();
    if (profileTab === "dados") return editAccountHtml();
    if (profileTab === "excluir") return deleteAccountHtml();
    if (profileTab === "reservas-admin") return adminReservationsHtml();
    if (profileTab === "emprestimos-admin") return adminLoansHtml();
    if (profileTab === "multas-admin") return adminFinesHtml();
    if (profileTab === "admins") return adminPanelHtml();
    return "";
  }

  function booksRowHtml(items, emptyText, selectedId = estado.idLivroPerfilSelecionado) {
    if (!items.length) return `<p class="empty-state">${emptyText}</p>`;
    return `<div class="book-grid profile-book-grid">${items.map(({ livro, extra }) => `
      ${htmlCardLivro(livro, selectedId)}
      ${selectedId === livro.idLivro ? `<aside class="book-detail-panel open">${extra}</aside>` : ""}
    `).join("")}</div>`;
  }

  function myReservationsHtml() {
    const minhas = estado.reservas.filter((r) => r.usuarioId === ownId() && ["ativa", "pronta"].includes(r.statusReserva));
    if (!minhas.length) return `<p class="empty-state">Você ainda não fez reservas.</p>`;
    return `
      <div class="section-heading compact-heading"><div><h2>Livros reservados</h2><p>Aguarde novos exemplares para um novo empréstimo.</p></div></div>
      <div class="loan-list">${minhas.map((reserva) => {
        const livro = estado.livros.find((l) => l.idLivro === reserva.livroId) || reserva.livro;
        return `
          <article class="loan-card user-reservation-card">
            <div class="loan-cover">${htmlCapaLivro(livro)}</div>
            <div>
              <h3>${livro.titulo}</h3>
              <p>${livro.autor} | Status: ${formatarStatus(reserva.statusReserva)}</p>
              ${queueMiniHtml(livro.idLivro)}
              <div class="row-actions reservation-card-actions">
                <button class="reserved-btn" disabled>Reservado</button>
                <button class="danger-btn" type="button" data-cancel-reservation="${reserva.idReserva}">Cancelar reserva</button>
              </div>
            </div>
          </article>
        `;
      }).join("")}</div>
    `;
  }

  function myLoansHtml() {
    const meus = estado.emprestimos
      .filter((e) => e.usuarioId === ownId())
      .sort((a, b) => Number(Boolean(a.dataDevolucaoReal)) - Number(Boolean(b.dataDevolucaoReal)));
    if (!meus.length) return `<p class="empty-state">Você ainda não tem empréstimos.</p>`;
    return `<div class="loan-list">${meus.map((emprestimo) => {
      const livro = bookForLoan(emprestimo);
      const concluido = Boolean(emprestimo.dataDevolucaoReal);
      const falta = daysLeft(emprestimo.dataVencimento);
      const multa = estado.multas.find((m) => m.idEmprestimo === emprestimo.idEmprestimo && m.statusPagamento !== "paga");
      return `
        <article class="loan-card">
          <div class="loan-cover">${htmlCapaLivro(livro)}</div>
          <div>
            <h3>${livro.titulo}</h3>
            <p>Status: ${concluido ? "concluído" : "em andamento"}</p>
            <p>Data de expiração: ${formatarData(emprestimo.dataVencimento)}</p>
            ${concluido
              ? `<p>Devolvido em ${formatarData(emprestimo.dataDevolucaoReal)}.</p>`
              : `<p>${falta >= 0 ? `Faltam ${falta} ${falta === 1 ? "dia" : "dias"} para devolução.` : `${Math.abs(falta)} ${Math.abs(falta) === 1 ? "dia" : "dias"} em atraso.`}</p>`}
            ${multa ? `<p class="fine-warning">Este empréstimo tem multa pendente. Resolva em Gerenciar multas.</p>` : ""}
            ${concluido ? "" : `<div class="row-actions">
              <button class="primary-btn" type="button" data-return-loan="${emprestimo.idEmprestimo}">Devolver empréstimo</button>
              <button class="secondary-btn" type="button" data-extend-loan="${emprestimo.idEmprestimo}">Estender prazo</button>
            </div>`}
          </div>
        </article>
      `;
    }).join("")}</div>`;
  }

  function myFinesHtml() {
    const userLoanIds = new Set(estado.emprestimos.filter((e) => e.usuarioId === ownId()).map((e) => e.idEmprestimo));
    const minhas = estado.multas.filter((m) => userLoanIds.has(m.idEmprestimo) && m.statusPagamento !== "paga");
    if (!minhas.length) return `<h2>Gerenciamento de Multas</h2><p class="empty-state">Você não tem multas pendentes.</p>`;
    return `<h2>Gerenciamento de Multas</h2><div class="loan-list">${minhas.map((multa) => {
      const livro = fineBook(multa);
      const emprestimo = estado.emprestimos.find((e) => e.idEmprestimo === multa.idEmprestimo) || multa.emprestimo || {};
      const exemplar = estado.exemplares.find((e) => e.id_exemplar === multa.idExemplar) || emprestimo.exemplar || {};
      const aguardandoConfirmacao = multa.statusPagamento === "aguardando_confirmacao";
      return `
        <article class="loan-card">
          <div class="loan-cover">${htmlCapaLivro(livro)}</div>
          <div>
            <h3>${livro.titulo || "Livro"}</h3>
            <p>Valor da multa: R$ ${Number(multa.valor || 0).toFixed(2)}</p>
            <p>Data do empréstimo: ${formatarData(emprestimo.dataSaida)}</p>
            <p>Autor: ${livro.autor || "-"} | Condição: ${exemplar.estado || "-"}</p>
            <p class="fine-warning">Se não pagar no dia gerado, cada dia de atraso soma R$ 1,00 ao valor base.</p>
            ${aguardandoConfirmacao
              ? `<p>Status: aguardando confirmação do administrador.</p>`
              : `<button class="primary-btn" type="button" data-pay-fine="${multa.idMulta}">Pagamento</button>`}
          </div>
        </article>
      `;
    }).join("")}</div>`;
  }

  function editAccountHtml() {
    const camposAluno = ehAluno() ? `
        <label>Ano de ingresso<input id="editYear" type="number" min="1900" value="${escapeAttr(estado.usuario.anoIngresso || "")}"></label>
        <label>Curso<input id="editCourse" value="${escapeAttr(estado.usuario.curso || "")}"></label>
      ` : "";
    const camposProfessor = ehProfessor() ? `
        <label>Departamento<input id="editDepartment" value="${escapeAttr(estado.usuario.departamento || "")}"></label>
      ` : "";

    return `
      <form id="editAccountForm" class="form-panel stack-form">
        <label>Nome<input id="editName" value="${escapeAttr(estado.usuario.nome || "")}"></label>
        <label>E-mail<input id="editEmail" type="email" value="${escapeAttr(estado.usuario.email || "")}"></label>
        <label>Nova senha
          <span class="password-field">
            <input id="editPassword" type="password" placeholder="Deixe vazio para manter">
            <button class="password-toggle" type="button" data-password-toggle="editPassword" aria-label="Mostrar senha"></button>
          </span>
        </label>
        <div id="editPasswordStrength" class="password-strength" aria-label="Força da senha"></div>
        <small id="editPasswordStrengthText" class="password-strength-text">Digite uma senha com letras e números.</small>
        ${camposAluno}
        ${camposProfessor}
        ${ehAdmin() ? `<label>Cargo<input id="editRole" value="${escapeAttr(estado.usuario.cargo || "")}"></label>` : ""}
        <button class="primary-btn" type="submit">Salvar alterações</button>
      </form>
    `;
  }

  function deleteAccountHtml() {
    return `
      <form id="deleteAccountForm" class="form-panel stack-form" novalidate>
        <label>E-mail<input id="deleteEmail" type="text" inputmode="email" autocomplete="email" required></label>
        <label>Senha
          <span class="password-field">
            <input id="deletePassword" type="password" required>
            <button class="password-toggle" type="button" data-password-toggle="deletePassword" aria-label="Mostrar senha"></button>
          </span>
        </label>
        <button class="danger-btn" type="submit">Confirmar exclusão</button>
      </form>
    `;
  }

  function adminReservationsHtml() {
    const livros = estado.livros.map((livro) => ({ livro, total: reservationQueue(livro.idLivro).length })).filter((item) => item.total);
    if (!livros.length) return `<p class="empty-state">Nenhum livro possui fila de reservas.</p>`;
    return `<div class="loan-list">${livros.map(({ livro, total }) => `
      <article class="loan-card">
        <div class="loan-cover">${htmlCapaLivro(livro)}</div>
        <div><h3>${livro.titulo}</h3><p>${total} ${total === 1 ? "reserva" : "reservas"} na fila.</p>${queueMiniHtml(livro.idLivro)}</div>
      </article>
    `).join("")}</div>`;
  }

  function adminLoansHtml() {
    const pendentes = estado.emprestimos.filter((e) => e.statusExtensao === "pendente");
    if (!pendentes.length) return `<p class="empty-state">Nenhuma solicitação de extensão pendente.</p>`;
    return `<div class="loan-list">${pendentes.map((e) => {
      const livro = bookForLoan(e);
      return `<article class="loan-card"><div class="loan-cover">${htmlCapaLivro(livro)}</div><div><h3>${livro.titulo}</h3><p>${nomeUsuarioPorId(e.usuarioId)} quer estender o prazo.</p><div class="row-actions"><button class="primary-btn" data-decide-extension="${e.idEmprestimo}" data-approve="true">Aceitar</button><button class="danger-btn" data-decide-extension="${e.idEmprestimo}" data-approve="false">Negar</button></div></div></article>`;
    }).join("")}</div>`;
  }

  function adminFinesHtml() {
    const pendentes = estado.multas.filter((m) => m.statusPagamento === "aguardando_confirmacao");
    if (!pendentes.length) return `<p class="empty-state">Nenhum pagamento de multa aguardando confirmação.</p>`;
    return `<div class="table-wrap"><table><thead><tr><th>Usuário</th><th>Empréstimo</th><th>Valor</th><th>Ação</th></tr></thead><tbody>${pendentes.map((m) => {
      const usuario = m.emprestimo?.usuario || estado.usuarios.find((u) => u.idUsuario === m.emprestimo?.usuarioId) || {};
      const livro = fineBook(m);
      const foto = normalizarUrlImagem(usuario.fotoPerfilUrl);
      return `<tr><td><span class="admin-user-line">${foto ? `<img src="${foto}" alt="">` : ""}${usuario.nome || "-"}</span></td><td>${livro.titulo || "-"} | Exemplar ${m.idExemplar}</td><td>R$ ${Number(m.valor || 0).toFixed(2)}</td><td><div class="row-actions"><button class="primary-btn" data-confirm-fine="${m.idMulta}" data-approve="true">Confirmar pagamento</button><button class="danger-btn" data-confirm-fine="${m.idMulta}" data-approve="false">Negar pagamento</button></div></td></tr>`;
    }).join("")}</tbody></table></div>`;
  }

  function adminPanelHtml() {
    const admins = estado.usuarios.filter((u) => u.nivelAcesso === "admin");
    const solicitacoes = (estado.solicitacoesExclusaoAdmin || []).filter((s) => s.status === "pendente" || s.admin_id === ownId());
    return `
      <div class="split-grid">
        <article>
          <h3>Cadastrar novo administrador</h3>
          <form id="newAdminForm" class="stack-form">
            <label>Nome<input id="newAdminName" required></label>
            <label>E-mail<input id="newAdminEmail" type="email" required></label>
            <label>Senha
              <span class="password-field">
                <input id="newAdminPassword" type="password" required>
                <button class="password-toggle" type="button" data-password-toggle="newAdminPassword" aria-label="Mostrar senha"></button>
              </span>
            </label>
            <div id="newAdminPasswordStrength" class="password-strength" aria-label="Força da senha"></div>
            <small id="newAdminPasswordStrengthText" class="password-strength-text">Digite uma senha com letras e números.</small>
            <label>Cargo<input id="newAdminRole" required></label>
            <button class="primary-btn" type="submit">Cadastrar administrador</button>
          </form>
        </article>
        <article>
          <h3>Admins</h3>
          <div class="insight-list">${admins.map((admin) => `<div class="insight-item"><div class="user-avatar">${admin.nome.slice(0, 1)}</div><div><strong>${admin.nome}</strong><span>${admin.cargo || "Administrador"}</span></div></div>`).join("")}</div>
        </article>
      </div>
      <div class="table-wrap"><table><thead><tr><th>Admin</th><th>Status</th><th>Ação</th></tr></thead><tbody>${solicitacoes.map((s) => `<tr><td>${s.admin?.nome || nomeUsuarioPorId(s.admin_id)}</td><td>${formatarStatus(s.status)}</td><td>${s.admin_id === ownId() && s.status === "aprovada" ? `<button class="danger-btn" data-execute-admin-delete="${s.id_solicitacao}">Excluir conta</button>` : s.admin_id !== ownId() && s.status === "pendente" ? `<button class="primary-btn" data-decide-admin-delete="${s.id_solicitacao}" data-approve="true">Confirmar</button> <button class="danger-btn" data-decide-admin-delete="${s.id_solicitacao}" data-approve="false">Negar</button>` : "-"}</td></tr>`).join("")}</tbody></table></div>
    `;
  }

  function adminBooksHtml() {
    return `<div class="loan-list">${estado.livros.map((livro) => {
      const exemplares = copiesForBook(livro.idLivro);
      const emprestados = loansForBook(livro.idLivro);
      const disponiveis = livroEstaInativo(livro) ? 0 : availableCount(livro.idLivro);
      return `<article class="loan-card"><div class="loan-cover">${htmlCapaLivro(livro)}</div><div><h3>${livro.titulo}</h3><p>Status: ${formatarStatus(livro.status)} | ${disponiveis} ${disponiveis === 1 ? "disponível" : "disponíveis"} | ${emprestados.length} ${emprestados.length === 1 ? "emprestado" : "emprestados"}</p><div class="copy-list">${exemplares.map((e) => `<span>${e.codigo_tombo} | ${e.estado} | ${e.localizacao} | ${emprestados.some((loan) => loan.exemplarId === e.id_exemplar) ? "emprestado" : "disponível"}</span>`).join("")}</div></div></article>`;
    }).join("")}</div>`;
  }

  function queueMiniHtml(livroId) {
    const fila = reservationQueue(livroId);
    if (!fila.length) return `<p class="empty-state">Sem fila de reservas.</p>`;
    return `<div class="reservation-queue compact">${fila.map((reserva, index) => `<span><b>${index + 1}</b>${reserva.usuario?.nome || nomeUsuarioPorId(reserva.usuarioId)} ${reserva.statusReserva === "pronta" ? "(pronto)" : ""}</span>`).join("")}</div>`;
  }

  function renderNotifications() {
    const btn = byId("notificationsBtn");
    if (!btn) return;
    let panel = byId("notificationsPanel");
    if (!panel) {
      document.querySelector(".sidebar").insertAdjacentHTML("beforeend", `<section id="notificationsPanel" class="notifications-panel hidden"></section>`);
      panel = byId("notificationsPanel");
    }
    const notificacoesVisiveis = (estado.notificacoes || []).filter((n) => !n.lida);
    const unread = notificacoesVisiveis.length;
    const badge = byId("notificationsBadge");
    badge.textContent = unread;
    badge.classList.toggle("hidden", unread === 0);
    panel.classList.toggle("hidden", !notificationsOpen);
    panel.innerHTML = `
      <h3>Notificações</h3>
      ${notificacoesVisiveis.length ? notificacoesVisiveis.map((n) => `
        <article class="notification-item ${n.lida ? "" : "unread"}">
          <button class="notification-content" type="button" data-notification="${n.idNotificacao}" data-action="${n.acao || ""}" data-reference="${n.referenciaId || n.idEmprestimo || ""}">
            <strong>${formatarTipoNotificacao(n.tipo)}</strong>
            <span>${formatarMensagemNotificacao(n.mensagem)}</span>
            <small>${formatarData(n.dataCriacao)}</small>
          </button>
          <button class="notification-dismiss" type="button" data-dismiss-notification="${n.idNotificacao}" data-notification-type="${n.tipo || ""}">Dispensar</button>
        </article>
      `).join("") : `<p class="empty-state">Nenhuma notificação.</p>`}
    `;
  }

  document.addEventListener("click", async (event) => {
    const passwordToggle = event.target.closest("[data-password-toggle]");
    if (passwordToggle && ["newAdminPassword", "editPassword", "deletePassword"].includes(passwordToggle.dataset.passwordToggle)) {
      const input = document.querySelector(`#${passwordToggle.dataset.passwordToggle}`);
      if (!input) return;
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      passwordToggle.setAttribute("aria-label", showing ? "Mostrar senha" : "Ocultar senha");
      passwordToggle.classList.toggle("active", !showing);
      return;
    }

    const select = event.target.closest("[data-select-book]");
    if (select) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const id = Number(select.dataset.selectBook);
      if (byId("homeView")?.classList.contains("active")) {
        const origem = select.dataset.bookOrigin || "alta";
        const chaveSelecao = {
          alta: "livroEmAltaSelecionadoId",
          genero: "livroGeneroSelecionadoId",
          indisponivel: "livroIndisponivelSelecionadoId",
        }[origem] || "livroEmAltaSelecionadoId";
        estado[chaveSelecao] = estado[chaveSelecao] === id ? null : id;
        renderizarLivrosEmAlta();
        renderizarSecoesGeneros();
        renderizarLivrosIndisponiveis();
      } else {
        estado.idLivroSelecionado = estado.idLivroSelecionado === id ? null : id;
        estado.idLivroPerfilSelecionado = estado.idLivroPerfilSelecionado === id ? null : id;
        renderizarLivros();
        renderizarResumoPerfil();
      }
      return;
    }

    const actionButton = event.target.closest("[data-loan-book],[data-reserve-book],[data-reservation-loan],[data-cancel-reservation],[data-return-loan],[data-extend-loan],[data-pay-fine],[data-confirm-fine],[data-decide-extension],[data-open-fines],[data-decide-admin-delete],[data-execute-admin-delete]");
    if (!actionButton) return;
    event.preventDefault();

    try {
      if (actionButton.dataset.openFines) {
        definirVisaoAtiva("profileView");
        profileTab = "multas";
        renderizarResumoPerfil();
        return;
      }
      if (actionButton.dataset.loanBook && await confirmDialog("Confirmar empréstimo", "Tem certeza que quer fazer o empréstimo deste livro?")) {
        await apiExtra("/biblioteca/emprestimos", { method: "POST", body: JSON.stringify({ livroId: Number(actionButton.dataset.loanBook) }) });
        notificar("Empréstimo criado com prazo máximo de 15 dias");
      }
      if (actionButton.dataset.reserveBook) {
        await apiExtra("/biblioteca/reservas", { method: "POST", body: JSON.stringify({ livroId: Number(actionButton.dataset.reserveBook) }) });
        notificar("Reserva criada. Acompanhe sua posição na fila.");
      }
      if (actionButton.dataset.reservationLoan && await confirmDialog("Reserva pronta", "Tem certeza que quer fazer o empréstimo desse livro?")) {
        await apiExtra(`/biblioteca/reservas/${actionButton.dataset.reservationLoan}/emprestimos`, { method: "POST", body: JSON.stringify({}) });
        notificar("Empréstimo criado com prazo máximo de 15 dias");
      }
      if (actionButton.dataset.cancelReservation && await confirmDialog("Cancelar reserva", "Deseja sair da lista de espera deste livro?")) {
        await apiExtra(`/biblioteca/reservas/${actionButton.dataset.cancelReservation}`, { method: "PATCH", body: JSON.stringify({ statusReserva: "cancelada" }) });
        notificar("Reserva cancelada");
      }
      if (actionButton.dataset.returnLoan && await confirmDialog("Confirmar devolução", "Deseja confirmar a devolução deste empréstimo?")) {
        const emprestimo = estado.emprestimos.find((item) => item.idEmprestimo === Number(actionButton.dataset.returnLoan));
        const livro = emprestimo ? bookForLoan(emprestimo) : {};
        const curtirLivro = livro.idLivro && !userLikedBook(livro.idLivro)
          ? await confirmDialog(
            "Você gostou do livro?",
            "Se sim, deixe uma curtida. Se não quiser, clique em Cancelar e a devolução seguirá normalmente.",
            { yes: "Curtir", no: "Cancelar" }
          )
          : false;
        await apiExtra(`/biblioteca/emprestimos/${actionButton.dataset.returnLoan}/devolucao`, {
          method: "PATCH",
          body: JSON.stringify({ curtirLivro }),
        });
        notificar("Devolução registrada");
      }
      if (actionButton.dataset.extendLoan && await confirmDialog("Estender prazo", "Deseja solicitar ao admin mais 15 dias de prazo?")) {
        await apiExtra(`/biblioteca/emprestimos/${actionButton.dataset.extendLoan}/extensoes`, { method: "POST", body: JSON.stringify({}) });
        notificar("Solicitação enviada. Aguarde a confirmação de um administrador.");
      }
      if (actionButton.dataset.payFine && await confirmDialog("Confirmar pagamento", "Confirma que realizou o pagamento desta multa?")) {
        await apiExtra(`/biblioteca/multas/${actionButton.dataset.payFine}/pagamentos`, { method: "POST", body: JSON.stringify({}) });
        notificar("Aguarde a confirmação do pagamento por um administrador da biblioteca.");
      }
      if (actionButton.dataset.confirmFine) {
        const aprovar = actionButton.dataset.approve === "true";
        const confirmado = await confirmDialog(
          aprovar ? "Confirmar pagamento" : "Negar pagamento",
          aprovar ? "Confirma o recebimento do pagamento da multa?" : "Confirma que este pagamento não foi recebido?"
        );
        if (confirmado) {
          await apiExtra(`/biblioteca/multas/${actionButton.dataset.confirmFine}/pagamentos`, { method: "PATCH", body: JSON.stringify({ aprovar }) });
          notificar(aprovar ? "Pagamento confirmado" : "Pagamento negado. O usuário poderá informar o pagamento novamente.");
        }
      }
      if (actionButton.dataset.decideExtension) {
        await apiExtra(`/biblioteca/emprestimos/${actionButton.dataset.decideExtension}/extensoes`, { method: "PATCH", body: JSON.stringify({ aprovar: actionButton.dataset.approve === "true" }) });
        notificar("Solicitação atualizada");
      }
      if (actionButton.dataset.decideAdminDelete) {
        await apiExtra(`/biblioteca/admins/exclusoes/${actionButton.dataset.decideAdminDelete}`, { method: "PATCH", body: JSON.stringify({ aprovar: actionButton.dataset.approve === "true" }) });
        notificar("Solicitação de admin atualizada");
      }
      if (actionButton.dataset.executeAdminDelete && await confirmDialog("Excluir conta", "Sua exclusão foi aprovada. Deseja excluir sua conta agora?")) {
        await apiExtra(`/biblioteca/admins/exclusoes/${actionButton.dataset.executeAdminDelete}`, { method: "DELETE", body: JSON.stringify({}) });
        limparSessao();
        mostrarAutenticacao();
        notificar("Conta excluída");
        return;
      }
      await carregarTudo();
    } catch (error) {
      notificar(error.message);
    }
  }, true);

  document.addEventListener("submit", async (event) => {
    try {
      if (event.target.id === "editAccountForm") {
        event.preventDefault();
        const body = {
          nome: byId("editName").value.trim() || undefined,
          email: byId("editEmail").value.trim() || undefined,
          senha: byId("editPassword").value || undefined,
          cargo: byId("editRole")?.value.trim() || undefined,
          anoIngresso: byId("editYear")?.value ? Number(byId("editYear").value) : undefined,
          curso: byId("editCourse")?.value.trim() || undefined,
          departamento: byId("editDepartment")?.value.trim() || undefined,
        };
        Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);
        const usuario = await apiExtra(`/usuarios/${ownId()}`, { method: "PUT", body: JSON.stringify(body) });
        estado.usuario = { ...estado.usuario, ...usuario };
        localStorage.setItem("usuario", JSON.stringify(estado.usuario));
        notificar("Dados atualizados");
        await carregarTudo();
      }
      if (event.target.id === "deleteAccountForm") {
        event.preventDefault();
        const mensagemExclusao = ehAdmin()
          ? "Esta ação vai remover sua conta. Confirmar?"
          : "Esta ação remove reservas, empréstimos e multas vinculadas. Confirmar?";
        if (!await confirmDialog("Excluir conta", mensagemExclusao)) return;
        await apiExtra("/biblioteca/minha-conta", {
          method: "DELETE",
          body: JSON.stringify({ email: byId("deleteEmail").value.trim(), senha: byId("deletePassword").value }),
        });
        if (ehAdmin()) {
        notificar("Solicitação enviada para outro administrador.");
          await carregarTudo();
          return;
        }
        limparSessao();
        mostrarAutenticacao();
        notificar("Conta excluída");
      }
      if (event.target.id === "newAdminForm") {
        event.preventDefault();
        await apiExtra("/usuarios/admins", {
          method: "POST",
          body: JSON.stringify({
            nome: byId("newAdminName").value.trim(),
            email: byId("newAdminEmail").value.trim(),
            senha: byId("newAdminPassword").value,
            cargo: byId("newAdminRole").value.trim(),
          }),
        });
        notificar("Administrador cadastrado");
        await carregarTudo();
      }
    } catch (error) {
      notificar(error.message);
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.id === "newAdminPassword") {
      atualizarForcaSenha(
        event.target.value,
        "#newAdminPasswordStrength",
        "#newAdminPasswordStrengthText"
      );
    }
    if (event.target.id === "editPassword") {
      atualizarForcaSenha(
        event.target.value,
        "#editPasswordStrength",
        "#editPasswordStrengthText"
      );
    }
    if (event.target.id === "newCopyCode") {
      event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }
  });

  byId("notificationsBtn")?.addEventListener("click", () => {
    notificationsOpen = !notificationsOpen;
    renderNotifications();
  });

  document.addEventListener("click", async (event) => {
    const dismiss = event.target.closest("[data-dismiss-notification]");
    if (dismiss) {
      event.preventDefault();
      event.stopPropagation();
      try {
        const metodo = dismiss.dataset.notificationType === "devolucao" ? "PATCH" : "DELETE";
        const rota = metodo === "PATCH"
          ? `/notificacoes/${dismiss.dataset.dismissNotification}/lida`
          : `/notificacoes/${dismiss.dataset.dismissNotification}`;
        await apiExtra(rota, { method: metodo, body: metodo === "PATCH" ? JSON.stringify({}) : undefined });
        notificar("Notificação dispensada");
        await carregarTudo();
      } catch (error) {
        notificar(error.message);
      }
      return;
    }

    const item = event.target.closest("[data-notification]");
    if (!item) return;
    const action = item.dataset.action;
    const reference = item.dataset.reference;
    try {
      await apiExtra(`/notificacoes/${item.dataset.notification}/lida`, { method: "PATCH", body: JSON.stringify({}) });
    } catch {
      // A notificação ainda deve navegar mesmo se a marcação como lida falhar.
    }

    if (action === "reserva_pronta" && reference) {
      if (await confirmDialog("Reserva pronta para empréstimo", "Tem certeza que quer fazer o empréstimo desse livro?")) {
        await apiExtra(`/biblioteca/reservas/${reference}/emprestimos`, { method: "POST", body: JSON.stringify({}) });
        notificar("Empréstimo criado com prazo máximo de 15 dias");
      }
    } else {
      definirVisaoAtiva("profileView");
      const map = {
        gerenciar_reservas: "reservas",
        consultar_emprestimos: "emprestimos",
        gerenciar_multas: "multas",
        gerenciar_reservas_admin: "reservas-admin",
        gerenciar_emprestimos: "emprestimos-admin",
        gerenciar_pagamento_multas: "multas-admin",
        gerenciar_admins: "admins",
      };
      profileTab = map[action] || (ehAdmin() ? "reservas-admin" : "reservas");
    }
    try {
      await apiExtra(`/notificacoes/${item.dataset.notification}`, { method: "DELETE" });
    } catch {
      // Se a exclusão falhar, ao menos a navegação já foi feita.
    }
    notificationsOpen = false;
    await carregarTudo();
  });

  const originalBookPayload = dadosLivro;
  dadosLivro = function () {
    return originalBookPayload();
  };

  const originalUploadBookCover = enviarCapaLivro;
  enviarCapaLivro = async function (bookId) {
    await originalUploadBookCover(bookId);
    const pendingCopies = [...document.querySelectorAll(".pending-copy-row")].map((row) => ({
      livroId: Number(bookId),
      codigoTombo: row.querySelector("[data-copy-code]").textContent.toUpperCase(),
      estado: row.querySelector("[data-copy-state]").textContent,
      localizacao: row.querySelector("[data-copy-location]").textContent,
    }));
    for (const copy of pendingCopies) {
      await apiExtra("/exemplares", { method: "POST", body: JSON.stringify(copy) });
    }
  };

  function enhanceBookForm() {
    const form = byId("bookForm");
    if (!form || byId("bookCopiesBuilder")) return;
    form.insertAdjacentHTML("beforeend", `
      <div id="bookCopiesBuilder" class="form-panel wide">
        <h3>Criar novo exemplar</h3>
        <div class="form-grid">
          <label>Código tombo<input id="newCopyCode" type="text" placeholder="T20260001" pattern="T[0-9]{8}" title="Use o padrão T20260001" maxlength="9"></label>
          <label>Estado<select id="newCopyState"><option value="novo">Novo</option><option value="bom">Bom</option><option value="regular">Regular</option><option value="danificado">Danificado</option></select></label>
          <label class="wide">Localização<input id="newCopyLocation" type="text"></label>
        </div>
        <button id="addPendingCopyBtn" class="secondary-btn copy-builder-btn" type="button">Criar exemplar</button>
        <div id="pendingCopiesList" class="copy-list"></div>
        <div id="existingBookCopiesBlock" class="existing-copy-block hidden">
          <h3>Exemplares cadastrados</h3>
          <div id="existingBookCopiesList" class="copy-list"></div>
        </div>
      </div>
    `);
    byId("addPendingCopyBtn").addEventListener("click", () => {
      const code = byId("newCopyCode").value.trim().toUpperCase();
      const stateValue = byId("newCopyState").value;
      const location = byId("newCopyLocation").value.trim();
      if (!code || !location) {
        notificar("Informe tombo e localização do exemplar");
        return;
      }
      if (!/^T\d{8}$/.test(code)) {
        notificar("Código de tombo deve seguir o padrão T20260001");
        return;
      }
      byId("pendingCopiesList").insertAdjacentHTML("afterbegin", `
        <span class="pending-copy-row copy-list-row">
          <span class="copy-list-info">
            <b data-copy-code>${code}</b> | <em data-copy-state>${stateValue}</em> | <small data-copy-location>${location}</small>
          </span>
          <button class="danger-btn copy-remove-btn" type="button" data-remove-pending-copy>Remover</button>
        </span>
      `);
      if (byId("bookAvailable")) byId("bookAvailable").checked = true;
      byId("newCopyCode").value = "";
      byId("newCopyLocation").value = "";
    });
  }

  function renderExistingBookCopies(livroId) {
    const block = byId("existingBookCopiesBlock");
    const list = byId("existingBookCopiesList");
    if (!block || !list) return;
    block.classList.toggle("hidden", !livroId);
    if (!livroId) {
      list.innerHTML = "";
      return;
    }

    const exemplares = ordenarPorIdMaisNovo(copiesForBook(Number(livroId)), "idExemplar", "id_exemplar");
    list.innerHTML = exemplares.length
      ? exemplares.map((exemplar) => `
        <span class="copy-list-row">
          <span class="copy-list-info">
            <b>${exemplar.codigo_tombo}</b> | ${exemplar.estado || "-"} | ${exemplar.localizacao || "-"}
          </span>
          <button class="danger-btn copy-remove-btn" type="button" data-delete-copy="${exemplar.id_exemplar}">Remover</button>
        </span>
      `).join("")
      : `<span>Nenhum exemplar cadastrado para este livro.</span>`;
  }

  document.addEventListener("click", async (event) => {
    const pendingButton = event.target.closest("[data-remove-pending-copy]");
    const deleteButton = event.target.closest("[data-delete-copy]");

    if (pendingButton) {
      pendingButton.closest(".pending-copy-row")?.remove();
      return;
    }

    if (!deleteButton) return;
    const copyId = deleteButton.dataset.deleteCopy;
    if (!copyId || !await confirmDialog("Remover exemplar", "Deseja remover este exemplar cadastrado?")) return;

    try {
      await apiExtra(`/exemplares/${copyId}`, { method: "DELETE" });
      notificar("Exemplar removido");
      await carregarTudo();
      renderExistingBookCopies(byId("bookId")?.value || null);
    } catch (error) {
      notificar(error.message);
    }
  });

  const originalOpenBookForm = abrirFormularioLivro;
  abrirFormularioLivro = function (livro = null) {
    originalOpenBookForm(livro);
    enhanceBookForm();
    renderExistingBookCopies(livro?.idLivro || null);
  };

  document.addEventListener("DOMContentLoaded", () => {
    enhanceBookForm();
  });

  setTimeout(() => {
    aplicarInterfacePorPerfil();
    if (estado.token && estado.usuario) carregarTudo();
  }, 0);
})();

