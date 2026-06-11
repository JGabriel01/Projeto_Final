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

  function ownId() {
    return state.usuario?.idUsuario;
  }

  function activeLoans() {
    return state.emprestimos.filter((emprestimo) => !emprestimo.dataDevolucaoReal);
  }

  function copiesForBook(livroId) {
    return state.exemplares.filter((exemplar) => exemplar.livro_id === livroId);
  }

  function loansForBook(livroId) {
    const ids = new Set(copiesForBook(livroId).map((exemplar) => exemplar.id_exemplar));
    return activeLoans().filter((emprestimo) => ids.has(emprestimo.exemplarId));
  }

  function availableCount(livroId) {
    return Math.max(copiesForBook(livroId).length - loansForBook(livroId).length, 0);
  }

  function hasBlockingFine(userId = ownId()) {
    const userLoanIds = new Set(state.emprestimos.filter((e) => e.usuarioId === userId).map((e) => e.idEmprestimo));
    return state.multas.some((multa) =>
      userLoanIds.has(multa.idEmprestimo) &&
      ["pendente", "aguardando_confirmacao"].includes(multa.statusPagamento)
    );
  }

  function reservationQueue(livroId) {
    return state.reservas
      .filter((reserva) => reserva.livroId === livroId && ["ativa", "pronta"].includes(reserva.statusReserva))
      .sort((a, b) => new Date(a.dataReserva) - new Date(b.dataReserva));
  }

  function ownActiveReservation(livroId) {
    return reservationQueue(livroId).find((reserva) => reserva.usuarioId === ownId());
  }

  function bookForLoan(emprestimo) {
    const exemplar = state.exemplares.find((item) => item.id_exemplar === emprestimo.exemplarId) || emprestimo.exemplar;
    return state.livros.find((livro) => livro.idLivro === exemplar?.livro_id) || normalizeLivro(exemplar?.livro || {});
  }

  function fineBook(multa) {
    const loan = state.emprestimos.find((emprestimo) => emprestimo.idEmprestimo === multa.idEmprestimo) || multa.emprestimo;
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
    return api(path, options);
  }

  loadAll = async function () {
    try {
      const dados = await apiExtra("/biblioteca/estado");
      state.livros = (dados.livros || []).map(normalizeLivro);
      state.exemplares = dados.exemplares || [];
      state.reservas = (dados.reservas || []).map(normalizeReserva);
      state.emprestimos = (dados.emprestimos || []).map(normalizeEmprestimo);
      state.multas = (dados.multas || []).map(normalizeMulta);
      state.notificacoes = (dados.notificacoes || []).map(normalizeNotificacao);
      state.usuarios = (dados.usuarios || []).map(normalizeUsuario);
      state.solicitacoesExclusaoAdmin = dados.solicitacoesExclusaoAdmin || [];
      const usuarioAtual = state.usuarios.find((usuario) => usuario.idUsuario === ownId());
      if (usuarioAtual) {
        state.usuario = { ...state.usuario, ...usuarioAtual };
        localStorage.setItem("usuario", JSON.stringify(state.usuario));
      }
      renderAll();
      renderCurrentUser();
      renderNotifications();
    } catch (error) {
      notify(error.message);
    }
  };

  applyRoleInterface = function () {
    const menu = byId("appMenu");
    if (menu) {
      menu.innerHTML = `
        <button class="nav-btn active" data-view="homeView" type="button">Inicio</button>
        <button class="nav-btn" data-view="usersView" type="button">Usuários</button>
      `;
      menu.querySelectorAll(".nav-btn").forEach((btn) => {
        btn.classList.toggle("active", document.querySelector(".view.active")?.id === btn.dataset.view);
        btn.addEventListener("click", () => setActiveView(btn.dataset.view));
      });
    }
    byId("newBookBtn")?.classList.toggle("hidden", !isAdmin());
  };

  renderAll = function () {
    renderBooks();
    renderHomeBooks();
    renderUsers();
    renderProfileSummary();
    renderNotifications();
  };

  renderUsers = function () {
    const target = byId("usersGrid");
    if (!target) return;
    const admins = state.usuarios.filter((u) => u.nivelAcesso === "admin");
    const comuns = state.usuarios.filter((u) => u.nivelAcesso !== "admin");
    const usuarios = isAdmin() ? [...admins, ...comuns] : comuns;
    target.innerHTML = usuarios.map((usuario) => {
      const detalhe = usuario.curso || usuario.departamento || usuario.cargo || "Usuário da biblioteca";
      const fotoPerfilUrl = normalizeImageUrl(usuario.fotoPerfilUrl);
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

  bookInlineDetailsHtml = function (livro) {
    const exemplares = copiesForBook(livro.idLivro);
    const emprestados = loansForBook(livro.idLivro).length;
    const disponiveis = availableCount(livro.idLivro);
    const fila = reservationQueue(livro.idLivro);
    const reserva = ownActiveReservation(livro.idLivro);
    const bloqueado = !isAdmin() && hasBlockingFine();
    let action = `<button class="secondary-btn book-more-btn" type="button" disabled>Somente consulta</button>`;

    if (!isAdmin()) {
      if (reserva) {
        action = reserva.statusReserva === "pronta"
          ? `<button class="primary-btn book-more-btn" type="button" data-reservation-loan="${reserva.idReserva}">Fazer empréstimo da reserva</button>`
          : `<button class="reserved-btn book-more-btn" type="button" disabled>Reservado</button>`;
      } else if (bloqueado) {
        action = `<button class="danger-btn book-more-btn" type="button" data-open-fines="1">Multas pendentes</button>`;
      } else if (disponiveis > 0) {
        action = `<button class="primary-btn book-more-btn" type="button" data-loan-book="${livro.idLivro}">Fazer empréstimo</button>`;
      } else {
        action = `<button class="secondary-btn book-more-btn" type="button" data-reserve-book="${livro.idLivro}">Reservar livro</button>`;
      }
    }

    return `
      <aside class="book-detail-panel open" aria-live="polite">
        <div class="book-detail-cover">${bookCoverHtml(livro)}</div>
        <div class="book-detail-content">
          <span class="system-tag">Sobre a obra</span>
          <h3>${livro.titulo}</h3>
          <p class="book-detail-author">${livro.autor}</p>
          <div class="book-detail-tags">
            <span>${livro.genero || "Livro"}</span>
            <span>${livro.anoPublicacao || "-"}</span>
            <span>${formatStatus(livro.status)}</span>
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
                const usuario = item.usuario || state.usuarios.find((u) => u.idUsuario === item.usuarioId) || {};
                const foto = normalizeImageUrl(usuario.fotoPerfilUrl);
                return `<span><b>${index + 1}</b>${foto ? `<img src="${foto}" alt="">` : ""}${usuario.nome || userNameById(item.usuarioId)} ${item.statusReserva === "pronta" ? "(pronto)" : ""}</span>`;
              }).join("")}
            </div>
          ` : ""}
          ${isAdmin() ? `
            <div class="row-actions">
              <button class="secondary-btn" type="button" data-edit-book="${livro.idLivro}">Atualizar</button>
              <button class="danger-btn" type="button" data-delete-book="${livro.idLivro}">Remover</button>
            </div>
          ` : action}
        </div>
      </aside>
    `;
  };

  renderProfileSummary = function () {
    const container = document.querySelector(".profile-private");
    if (!container || !state.usuario) return;
    const tabs = isAdmin()
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
        renderProfileSummary();
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

  function booksRowHtml(items, emptyText, selectedId = state.selectedProfileBookId) {
    if (!items.length) return `<p class="empty-state">${emptyText}</p>`;
    return `<div class="book-grid profile-book-grid">${items.map(({ livro, extra }) => `
      ${bookCardHtml(livro, selectedId)}
      ${selectedId === livro.idLivro ? `<aside class="book-detail-panel open">${extra}</aside>` : ""}
    `).join("")}</div>`;
  }

  function myReservationsHtml() {
    const minhas = state.reservas.filter((r) => r.usuarioId === ownId() && ["ativa", "pronta"].includes(r.statusReserva));
    return `
      <div class="section-heading compact-heading"><div><h2>Livros reservados</h2><p>Aguarde novos exemplares para um novo empréstimo.</p></div></div>
      ${booksRowHtml(minhas.map((reserva) => {
        const livro = state.livros.find((l) => l.idLivro === reserva.livroId) || reserva.livro;
        return {
          livro,
          extra: `<div class="book-detail-content"><h3>${livro.titulo}</h3><p>${livro.autor}</p><p>Status: ${formatStatus(reserva.statusReserva)}</p>${queueMiniHtml(livro.idLivro)}<div class="row-actions"><button class="reserved-btn" disabled>Reservado</button><button class="danger-btn" type="button" data-cancel-reservation="${reserva.idReserva}">Cancelar reserva</button></div></div>`,
        };
      }), "Você ainda não fez reservas.")}
    `;
  }

  function myLoansHtml() {
    const meus = state.emprestimos.filter((e) => e.usuarioId === ownId() && !e.dataDevolucaoReal);
    if (!meus.length) return `<p class="empty-state">Você não tem empréstimos ativos.</p>`;
    return `<div class="loan-list">${meus.map((emprestimo) => {
      const livro = bookForLoan(emprestimo);
      const falta = daysLeft(emprestimo.dataVencimento);
      const multa = state.multas.find((m) => m.idEmprestimo === emprestimo.idEmprestimo && m.statusPagamento !== "paga");
      return `
        <article class="loan-card">
          <div class="loan-cover">${bookCoverHtml(livro)}</div>
          <div>
            <h3>${livro.titulo}</h3>
            <p>Data de expiração: ${formatDate(emprestimo.dataVencimento)}</p>
            <p>${falta >= 0 ? `Faltam ${falta} dia(s) para devolução.` : `${Math.abs(falta)} dia(s) em atraso.`}</p>
            ${multa ? `<p class="fine-warning">Este empréstimo tem multa pendente. Resolva em Gerenciar multas.</p>` : ""}
            <div class="row-actions">
              <button class="primary-btn" type="button" data-return-loan="${emprestimo.idEmprestimo}">Devolver empréstimo</button>
              <button class="secondary-btn" type="button" data-extend-loan="${emprestimo.idEmprestimo}">Estender prazo</button>
            </div>
          </div>
        </article>
      `;
    }).join("")}</div>`;
  }

  function myFinesHtml() {
    const userLoanIds = new Set(state.emprestimos.filter((e) => e.usuarioId === ownId()).map((e) => e.idEmprestimo));
    const minhas = state.multas.filter((m) => userLoanIds.has(m.idEmprestimo) && m.statusPagamento !== "paga");
    if (!minhas.length) return `<h2>Gerenciamento de Multas</h2><p class="empty-state">Você não tem multas pendentes.</p>`;
    return `<h2>Gerenciamento de Multas</h2><div class="loan-list">${minhas.map((multa) => {
      const livro = fineBook(multa);
      const emprestimo = state.emprestimos.find((e) => e.idEmprestimo === multa.idEmprestimo) || multa.emprestimo || {};
      const exemplar = state.exemplares.find((e) => e.id_exemplar === multa.idExemplar) || emprestimo.exemplar || {};
      return `
        <article class="loan-card">
          <div class="loan-cover">${bookCoverHtml(livro)}</div>
          <div>
            <h3>${livro.titulo || "Livro"}</h3>
            <p>Valor da multa: R$ ${Number(multa.valor || 0).toFixed(2)}</p>
            <p>Data do empréstimo: ${formatDate(emprestimo.dataSaida)}</p>
            <p>Autor: ${livro.autor || "-"} | Condição: ${exemplar.estado || "-"}</p>
            <p class="fine-warning">Se não pagar no dia gerado, cada dia de atraso soma R$ 1,00 ao valor base.</p>
            <button class="primary-btn" type="button" data-pay-fine="${multa.idMulta}">Pagamento</button>
          </div>
        </article>
      `;
    }).join("")}</div>`;
  }

  function editAccountHtml() {
    return `
      <form id="editAccountForm" class="form-panel stack-form">
        <label>Nome<input id="editName" value="${escapeAttr(state.usuario.nome || "")}"></label>
        <label>E-mail<input id="editEmail" type="email" value="${escapeAttr(state.usuario.email || "")}"></label>
        <label>Nova senha
          <span class="password-field">
            <input id="editPassword" type="password" placeholder="Deixe vazio para manter">
            <button class="password-toggle" type="button" data-password-toggle="editPassword" aria-label="Mostrar senha"></button>
          </span>
        </label>
        <div id="editPasswordStrength" class="password-strength" aria-label="Força da senha"></div>
        <small id="editPasswordStrengthText" class="password-strength-text">Digite uma senha com letras e números.</small>
        ${isAdmin() ? `<label>Cargo<input id="editRole" value="${escapeAttr(state.usuario.cargo || "")}"></label>` : ""}
        <button class="primary-btn" type="submit">Salvar alterações</button>
      </form>
    `;
  }

  function deleteAccountHtml() {
    return `
      <form id="deleteAccountForm" class="form-panel stack-form">
        <label>E-mail<input id="deleteEmail" type="email" required></label>
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
    const livros = state.livros.map((livro) => ({ livro, total: reservationQueue(livro.idLivro).length })).filter((item) => item.total);
    if (!livros.length) return `<p class="empty-state">Nenhum livro possui fila de reservas.</p>`;
    return `<div class="loan-list">${livros.map(({ livro, total }) => `
      <article class="loan-card">
        <div class="loan-cover">${bookCoverHtml(livro)}</div>
        <div><h3>${livro.titulo}</h3><p>${total} reserva(s) na fila.</p>${queueMiniHtml(livro.idLivro)}</div>
      </article>
    `).join("")}</div>`;
  }

  function adminLoansHtml() {
    const pendentes = state.emprestimos.filter((e) => e.statusExtensao === "pendente");
    if (!pendentes.length) return `<p class="empty-state">Nenhuma solicitação de extensão pendente.</p>`;
    return `<div class="loan-list">${pendentes.map((e) => {
      const livro = bookForLoan(e);
      return `<article class="loan-card"><div class="loan-cover">${bookCoverHtml(livro)}</div><div><h3>${livro.titulo}</h3><p>${userNameById(e.usuarioId)} quer estender o prazo.</p><div class="row-actions"><button class="primary-btn" data-decide-extension="${e.idEmprestimo}" data-approve="true">Aceitar</button><button class="danger-btn" data-decide-extension="${e.idEmprestimo}" data-approve="false">Negar</button></div></div></article>`;
    }).join("")}</div>`;
  }

  function adminFinesHtml() {
    const pendentes = state.multas.filter((m) => m.statusPagamento === "aguardando_confirmacao");
    if (!pendentes.length) return `<p class="empty-state">Nenhum pagamento de multa aguardando confirmação.</p>`;
    return `<div class="table-wrap"><table><thead><tr><th>Usuário</th><th>Empréstimo</th><th>Valor</th><th>Ação</th></tr></thead><tbody>${pendentes.map((m) => {
      const usuario = m.emprestimo?.usuario || state.usuarios.find((u) => u.idUsuario === m.emprestimo?.usuarioId) || {};
      const livro = fineBook(m);
      const foto = normalizeImageUrl(usuario.fotoPerfilUrl);
      return `<tr><td><span class="admin-user-line">${foto ? `<img src="${foto}" alt="">` : ""}${usuario.nome || "-"}</span></td><td>${livro.titulo || "-"} | Exemplar ${m.idExemplar}</td><td>R$ ${Number(m.valor || 0).toFixed(2)}</td><td><button class="primary-btn" data-confirm-fine="${m.idMulta}">Confirmar pagamento</button></td></tr>`;
    }).join("")}</tbody></table></div>`;
  }

  function adminPanelHtml() {
    const admins = state.usuarios.filter((u) => u.nivelAcesso === "admin");
    const solicitacoes = (state.solicitacoesExclusaoAdmin || []).filter((s) => s.status === "pendente" || s.admin_id === ownId());
    return `
      <div class="split-grid">
        <article>
          <h3>Cadastrar novo admin</h3>
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
            <button class="primary-btn" type="submit">Cadastrar admin</button>
          </form>
        </article>
        <article>
          <h3>Admins</h3>
          <div class="insight-list">${admins.map((admin) => `<div class="insight-item"><div class="user-avatar">${admin.nome.slice(0, 1)}</div><div><strong>${admin.nome}</strong><span>${admin.cargo || "Admin"}</span></div></div>`).join("")}</div>
        </article>
      </div>
      <div class="table-wrap"><table><thead><tr><th>Admin</th><th>Status</th><th>Ação</th></tr></thead><tbody>${solicitacoes.map((s) => `<tr><td>${s.admin?.nome || userNameById(s.admin_id)}</td><td>${s.status}</td><td>${s.admin_id === ownId() && s.status === "aprovada" ? `<button class="danger-btn" data-execute-admin-delete="${s.id_solicitacao}">Excluir conta</button>` : s.admin_id !== ownId() && s.status === "pendente" ? `<button class="primary-btn" data-decide-admin-delete="${s.id_solicitacao}" data-approve="true">Confirmar</button> <button class="danger-btn" data-decide-admin-delete="${s.id_solicitacao}" data-approve="false">Negar</button>` : "-"}</td></tr>`).join("")}</tbody></table></div>
    `;
  }

  function adminBooksHtml() {
    return `<div class="loan-list">${state.livros.map((livro) => {
      const exemplares = copiesForBook(livro.idLivro);
      const emprestados = loansForBook(livro.idLivro);
      return `<article class="loan-card"><div class="loan-cover">${bookCoverHtml(livro)}</div><div><h3>${livro.titulo}</h3><p>${availableCount(livro.idLivro)} disponível(is) | ${emprestados.length} emprestado(s)</p><div class="copy-list">${exemplares.map((e) => `<span>${e.codigo_tombo} | ${e.estado} | ${e.localizacao} | ${emprestados.some((loan) => loan.exemplarId === e.id_exemplar) ? "emprestado" : "disponível"}</span>`).join("")}</div></div></article>`;
    }).join("")}</div>`;
  }

  function queueMiniHtml(livroId) {
    const fila = reservationQueue(livroId);
    if (!fila.length) return `<p class="empty-state">Sem fila de reservas.</p>`;
    return `<div class="reservation-queue compact">${fila.map((reserva, index) => `<span><b>${index + 1}</b>${reserva.usuario?.nome || userNameById(reserva.usuarioId)} ${reserva.statusReserva === "pronta" ? "(pronto)" : ""}</span>`).join("")}</div>`;
  }

  function renderNotifications() {
    const btn = byId("notificationsBtn");
    if (!btn) return;
    let panel = byId("notificationsPanel");
    if (!panel) {
      document.querySelector(".sidebar").insertAdjacentHTML("beforeend", `<section id="notificationsPanel" class="notifications-panel hidden"></section>`);
      panel = byId("notificationsPanel");
    }
    const unread = (state.notificacoes || []).filter((n) => !n.lida).length;
    const badge = byId("notificationsBadge");
    badge.textContent = unread;
    badge.classList.toggle("hidden", unread === 0);
    panel.classList.toggle("hidden", !notificationsOpen);
    panel.innerHTML = `
      <h3>Notificações</h3>
      ${(state.notificacoes || []).length ? state.notificacoes.map((n) => `
        <article class="notification-item ${n.lida ? "" : "unread"}">
          <button class="notification-content" type="button" data-notification="${n.idNotificacao}" data-action="${n.acao || ""}" data-reference="${n.referenciaId || n.idEmprestimo || ""}">
            <strong>${n.tipo}</strong>
            <span>${n.mensagem}</span>
            <small>${formatDate(n.dataCriacao)}</small>
          </button>
          <button class="notification-dismiss" type="button" data-dismiss-notification="${n.idNotificacao}">Dispensar</button>
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
        state.selectedHomeBookId = state.selectedHomeBookId === id ? null : id;
        renderHomeBooks();
      } else {
        state.selectedBookId = state.selectedBookId === id ? null : id;
        state.selectedProfileBookId = state.selectedProfileBookId === id ? null : id;
        renderBooks();
        renderProfileSummary();
      }
      return;
    }

    const actionButton = event.target.closest("[data-loan-book],[data-reserve-book],[data-reservation-loan],[data-cancel-reservation],[data-return-loan],[data-extend-loan],[data-pay-fine],[data-confirm-fine],[data-decide-extension],[data-open-fines],[data-decide-admin-delete],[data-execute-admin-delete]");
    if (!actionButton) return;
    event.preventDefault();

    try {
      if (actionButton.dataset.openFines) {
        setActiveView("profileView");
        profileTab = "multas";
        renderProfileSummary();
        return;
      }
      if (actionButton.dataset.loanBook && await confirmDialog("Confirmar empréstimo", "Tem certeza que quer fazer o empréstimo deste livro?")) {
        await apiExtra("/biblioteca/emprestimos", { method: "POST", body: JSON.stringify({ livroId: Number(actionButton.dataset.loanBook) }) });
        notify("Empréstimo criado com prazo máximo de 15 dias");
      }
      if (actionButton.dataset.reserveBook) {
        await apiExtra("/biblioteca/reservas", { method: "POST", body: JSON.stringify({ livroId: Number(actionButton.dataset.reserveBook) }) });
        notify("Reserva criada. Acompanhe sua posição na fila.");
      }
      if (actionButton.dataset.reservationLoan && await confirmDialog("Reserva pronta", "Tem certeza que quer fazer o empréstimo desse livro?")) {
        await apiExtra(`/biblioteca/reservas/${actionButton.dataset.reservationLoan}/emprestimos`, { method: "POST", body: JSON.stringify({}) });
        notify("Empréstimo criado com prazo máximo de 15 dias");
      }
      if (actionButton.dataset.cancelReservation && await confirmDialog("Cancelar reserva", "Deseja sair da lista de espera deste livro?")) {
        await apiExtra(`/biblioteca/reservas/${actionButton.dataset.cancelReservation}`, { method: "PATCH", body: JSON.stringify({ statusReserva: "cancelada" }) });
        notify("Reserva cancelada");
      }
      if (actionButton.dataset.returnLoan && await confirmDialog("Confirmar devolução", "Deseja confirmar a devolução deste empréstimo?")) {
        const curtirLivro = await confirmDialog(
          "Você gostou do livro?",
          "Se sim, deixe uma curtida. Se não quiser, clique em Cancelar e a devolução seguirá normalmente.",
          { yes: "Curtir", no: "Cancelar" }
        );
        await apiExtra(`/biblioteca/emprestimos/${actionButton.dataset.returnLoan}/devolucao`, {
          method: "PATCH",
          body: JSON.stringify({ curtirLivro }),
        });
        notify("Devolução registrada");
      }
      if (actionButton.dataset.extendLoan && await confirmDialog("Estender prazo", "Deseja solicitar ao admin mais 15 dias de prazo?")) {
        await apiExtra(`/biblioteca/emprestimos/${actionButton.dataset.extendLoan}/extensoes`, { method: "POST", body: JSON.stringify({}) });
        notify("Solicitação enviada. Aguarde confirmação de um admin.");
      }
      if (actionButton.dataset.payFine && await confirmDialog("Confirmar pagamento", "Confirma que realizou o pagamento desta multa?")) {
        await apiExtra(`/biblioteca/multas/${actionButton.dataset.payFine}/pagamentos`, { method: "POST", body: JSON.stringify({}) });
        notify("Aguarde a confirmação do pagamento por qualquer admin da biblioteca para o mesmo ser aprovado.");
      }
      if (actionButton.dataset.confirmFine && await confirmDialog("Confirmar pagamento", "Confirma o recebimento do pagamento da multa?")) {
        await apiExtra(`/biblioteca/multas/${actionButton.dataset.confirmFine}/pagamentos`, { method: "PATCH", body: JSON.stringify({ statusPagamento: "paga" }) });
        notify("Pagamento confirmado");
      }
      if (actionButton.dataset.decideExtension) {
        await apiExtra(`/biblioteca/emprestimos/${actionButton.dataset.decideExtension}/extensoes`, { method: "PATCH", body: JSON.stringify({ aprovar: actionButton.dataset.approve === "true" }) });
        notify("Solicitação atualizada");
      }
      if (actionButton.dataset.decideAdminDelete) {
        await apiExtra(`/biblioteca/admins/exclusoes/${actionButton.dataset.decideAdminDelete}`, { method: "PATCH", body: JSON.stringify({ aprovar: actionButton.dataset.approve === "true" }) });
        notify("Solicitação de admin atualizada");
      }
      if (actionButton.dataset.executeAdminDelete && await confirmDialog("Excluir conta", "Sua exclusão foi aprovada. Deseja excluir sua conta agora?")) {
        await apiExtra(`/biblioteca/admins/exclusoes/${actionButton.dataset.executeAdminDelete}`, { method: "DELETE", body: JSON.stringify({}) });
        clearSession();
        showAuth();
        notify("Conta excluída");
        return;
      }
      await loadAll();
    } catch (error) {
      notify(error.message);
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
        };
        Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);
        const usuario = await apiExtra(`/usuarios/${ownId()}`, { method: "PUT", body: JSON.stringify(body) });
        state.usuario = { ...state.usuario, ...usuario };
        localStorage.setItem("usuario", JSON.stringify(state.usuario));
        notify("Dados atualizados");
        await loadAll();
      }
      if (event.target.id === "deleteAccountForm") {
        event.preventDefault();
        const mensagemExclusao = isAdmin()
          ? "Esta ação vai remover sua conta. Confirmar?"
          : "Esta ação remove reservas, empréstimos e multas vinculadas. Confirmar?";
        if (!await confirmDialog("Excluir conta", mensagemExclusao)) return;
        await apiExtra("/biblioteca/minha-conta", {
          method: "DELETE",
          body: JSON.stringify({ email: byId("deleteEmail").value.trim(), senha: byId("deletePassword").value }),
        });
        if (isAdmin()) {
          notify("Solicitação enviada para outro admin.");
          await loadAll();
          return;
        }
        clearSession();
        showAuth();
        notify("Conta excluída");
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
        notify("Admin cadastrado");
        await loadAll();
      }
    } catch (error) {
      notify(error.message);
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.id === "newAdminPassword") {
      updatePasswordStrength(
        event.target.value,
        "#newAdminPasswordStrength",
        "#newAdminPasswordStrengthText"
      );
    }
    if (event.target.id === "editPassword") {
      updatePasswordStrength(
        event.target.value,
        "#editPasswordStrength",
        "#editPasswordStrengthText"
      );
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
        await apiExtra(`/notificacoes/${dismiss.dataset.dismissNotification}`, { method: "DELETE" });
        notify("Notificação dispensada");
        await loadAll();
      } catch (error) {
        notify(error.message);
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
        notify("Empréstimo criado com prazo máximo de 15 dias");
      }
    } else {
      setActiveView("profileView");
      const map = {
        gerenciar_reservas: "reservas",
        consultar_emprestimos: "emprestimos",
        gerenciar_multas: "multas",
        gerenciar_reservas_admin: "reservas-admin",
        gerenciar_emprestimos: "emprestimos-admin",
        gerenciar_pagamento_multas: "multas-admin",
        gerenciar_admins: "admins",
      };
      profileTab = map[action] || (isAdmin() ? "reservas-admin" : "reservas");
    }
    try {
      await apiExtra(`/notificacoes/${item.dataset.notification}`, { method: "DELETE" });
    } catch {
      // Se a exclusão falhar, ao menos a navegação já foi feita.
    }
    notificationsOpen = false;
    await loadAll();
  });

  const originalBookPayload = bookPayload;
  bookPayload = function () {
    return originalBookPayload();
  };

  const originalUploadBookCover = uploadBookCover;
  uploadBookCover = async function (bookId) {
    await originalUploadBookCover(bookId);
    const pendingCopies = [...document.querySelectorAll(".pending-copy-row")].map((row) => ({
      livroId: Number(bookId),
      codigoTombo: row.querySelector("[data-copy-code]").textContent,
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
        <div id="existingBookCopiesBlock" class="existing-copy-block hidden">
          <h3>Exemplares já cadastrados</h3>
          <div id="existingBookCopiesList" class="copy-list"></div>
        </div>
        <h3>Criar novo exemplar</h3>
        <div class="form-grid">
          <label>Código tombo<input id="newCopyCode" type="text"></label>
          <label>Estado<select id="newCopyState"><option value="novo">Novo</option><option value="bom">Bom</option><option value="regular">Regular</option><option value="danificado">Danificado</option></select></label>
          <label class="wide">Localização<input id="newCopyLocation" type="text"></label>
        </div>
        <button id="addPendingCopyBtn" class="secondary-btn copy-builder-btn" type="button">Criar exemplar</button>
        <div id="pendingCopiesList" class="copy-list"></div>
      </div>
    `);
    byId("addPendingCopyBtn").addEventListener("click", () => {
      const code = byId("newCopyCode").value.trim();
      const stateValue = byId("newCopyState").value;
      const location = byId("newCopyLocation").value.trim();
      if (!code || !location) {
        notify("Informe tombo e localização do exemplar");
        return;
      }
      byId("pendingCopiesList").insertAdjacentHTML("afterbegin", `<span class="pending-copy-row"><b data-copy-code>${code}</b> | <em data-copy-state>${stateValue}</em> | <small data-copy-location>${location}</small></span>`);
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

    const exemplares = copiesForBook(Number(livroId));
    list.innerHTML = exemplares.length
      ? exemplares.map((exemplar) => `
        <span>
          <b>${exemplar.codigo_tombo}</b> | ${exemplar.estado || "-"} | ${exemplar.localizacao || "-"}
        </span>
      `).join("")
      : `<span>Nenhum exemplar cadastrado para este livro.</span>`;
  }

  const originalOpenBookForm = openBookForm;
  openBookForm = function (livro = null) {
    originalOpenBookForm(livro);
    enhanceBookForm();
    renderExistingBookCopies(livro?.idLivro || null);
  };

  document.addEventListener("DOMContentLoaded", () => {
    enhanceBookForm();
  });

  setTimeout(() => {
    applyRoleInterface();
    if (state.token && state.usuario) loadAll();
  }, 0);
})();

