const API_ORIGIN = window.location.protocol.startsWith("http")
  ? window.location.origin
  : "http://localhost:3000";
const API_URL = `${API_ORIGIN}/api`;

const state = {
  token: localStorage.getItem("token"),
  usuario: JSON.parse(localStorage.getItem("usuario") || "null"),
  livros: [],
  usuarios: [],
  exemplares: [],
  reservas: [],
  emprestimos: [],
  multas: [],
  curtidasUsuario: [],
  selectedBookId: null,
  selectedHomeBookId: null,
};

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

const authScreen = qs("#authScreen");
const appScreen = qs("#appScreen");
const loginForm = qs("#loginForm");
const registerForm = qs("#registerForm");
const forgotPasswordForm = qs("#forgotPasswordForm");
const toast = qs("#toast");
const themeToggle = qs("#themeToggle");
const appThemeToggle = qs("#appThemeToggle");
const menuToggle = qs("#menuToggle");
const appMenu = qs("#appMenu");
const profileShortcut = qs("#profileShortcut");
let verifiedRecoveryEmail = "";

function setCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=7200`;
}

function clearCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

function notify(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3200);
}

function applyTheme() {
  const darkMode = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark-mode", darkMode);
  if (themeToggle) themeToggle.textContent = darkMode ? "☀️" : "🌙";
  if (appThemeToggle) appThemeToggle.textContent = darkMode ? "☀️" : "🌙";
}

function toggleTheme() {
  const darkMode = !document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", String(darkMode));
  applyTheme();
}

function updatePasswordStrength(
  password,
  barSelector = "#passwordStrength",
  textSelector = "#passwordStrengthText"
) {
  const bar = qs(barSelector);
  const text = qs(textSelector);
  if (!bar || !text) return;

  let score = 0;
  if (password.length >= 6) score += 1;
  if (/[a-zA-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  bar.classList.remove("weak", "medium", "strong");

  if (!password) {
    text.textContent = "Digite uma senha com letras e números.";
    return;
  }

  if (score <= 2) {
    bar.classList.add("weak");
    text.textContent = "Senha fraca";
  } else if (score <= 4) {
    bar.classList.add("medium");
    text.textContent = "Senha média";
  } else {
    bar.classList.add("strong");
    text.textContent = "Senha forte";
  }
}

async function api(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.sucesso === false) {
    throw new Error(payload.erro?.mensagem || "Erro ao comunicar com a API");
  }
  return payload.dados;
}

function showAuth() {
  authScreen.classList.remove("hidden");
  appScreen.classList.add("hidden");
  restoreRememberedLogin();
}

function showLoginForm() {
  qs("#loginTab").classList.add("active");
  qs("#registerTab").classList.remove("active");
  loginForm.classList.add("active");
  registerForm.classList.remove("active");
  forgotPasswordForm.classList.remove("active");
}

function showRegisterForm() {
  qs("#registerTab").classList.add("active");
  qs("#loginTab").classList.remove("active");
  registerForm.classList.add("active");
  loginForm.classList.remove("active");
  forgotPasswordForm.classList.remove("active");
}

function showForgotPasswordForm() {
  qs("#loginTab").classList.remove("active");
  qs("#registerTab").classList.remove("active");
  forgotPasswordForm.classList.add("active");
  loginForm.classList.remove("active");
  registerForm.classList.remove("active");
}

function resetForgotPasswordForm() {
  verifiedRecoveryEmail = "";
  forgotPasswordForm.reset();
  qs("#resetPasswordFields").classList.add("hidden");
  qs("#verifyForgotEmailBtn").classList.remove("hidden");
  updatePasswordStrength("", "#forgotPasswordStrength", "#forgotPasswordStrengthText");
}

function showApp() {
  authScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
  renderCurrentUser();
  loadAll();
}

function saveSession(dados) {
  state.token = dados.token;
  state.usuario = dados.usuario;
  localStorage.setItem("token", state.token);
  localStorage.setItem("usuario", JSON.stringify(state.usuario));
  setCookie("bibliotecaLogado", "true");
  setCookie("bibliotecaUsuario", state.usuario.email || state.usuario.nome);
}

function clearSession() {
  state.token = null;
  state.usuario = null;
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  clearCookie("bibliotecaLogado");
  clearCookie("bibliotecaUsuario");
}

function renderCurrentUser() {
  if (!state.usuario) return;
  qs("#profileName").textContent = state.usuario.nome;
  qs("#profileMeta").textContent = `${state.usuario.nivelAcesso} | ${state.usuario.email}`;
  qs("#newBookBtn").classList.toggle("hidden", !isAdmin());
  applyRoleInterface();
  renderProfileImages(state.usuario);
  renderTopProfileShortcut(state.usuario);
}

function isAdmin() {
  return state.usuario?.nivelAcesso === "admin";
}

function isProfessor() {
  return state.usuario?.nivelAcesso === "professor";
}

function isAluno() {
  return state.usuario?.nivelAcesso === "aluno";
}

function applyRoleInterface() {
  const role = state.usuario?.nivelAcesso || "aluno";
  const roleConfig = {
    admin: {
      tag: "Painel do administrador",
      title: "Gestão completa da biblioteca.",
      description: "Cadastre livros, atualize capas, acompanhe usuários, reservas, empréstimos e multas.",
      views: ["homeView", "usersView", "operationsView", "profileView"],
      actions: [
        ["Gerenciar acervo", "Criar, atualizar e remover livros do sistema."],
        ["Acompanhar circulação", "Consultar reservas, empréstimos e multas registrados."],
        ["Consultar usuários", "Ver perfis públicos de alunos, professores e administradores."],
      ],
    },
    professor: {
      tag: "Painel do professor",
      title: "Consulta acadêmica do acervo.",
      description: "Pesquise livros, consulte usuários públicos e registre reservas vinculadas ao seu perfil.",
      views: ["homeView", "usersView", "operationsView", "profileView"],
      actions: [
        ["Pesquisar livros", "Acompanhe obras por título, autor e gênero."],
        ["Reservar obra", "Solicite reserva informando o ID do livro desejado."],
        ["Ver comunidade", "Consulte dados públicos de usuários da biblioteca."],
      ],
    },
    aluno: {
      tag: "Painel do aluno",
      title: "Seu espaço de consulta e reserva.",
      description: "Encontre livros disponíveis, faça reservas e mantenha seu perfil atualizado.",
      views: ["homeView", "operationsView", "profileView"],
      actions: [
        ["Explorar acervo", "Veja os livros cadastrados e seus dados principais."],
        ["Fazer reserva", "Informe o ID do livro para criar uma reserva ativa."],
        ["Atualizar perfil", "Envie sua foto e imagem de fundo do perfil."],
      ],
    },
  };

  const config = roleConfig[role] || roleConfig.aluno;

  qsa(".nav-btn").forEach((button) => {
    button.classList.toggle("hidden", !config.views.includes(button.dataset.view));
  });

  qs("#metricUsers")?.closest("article")?.classList.toggle("hidden", isAluno());
  qs("#loanCard").classList.toggle("hidden", !isAdmin());
  qs("#copyCard").classList.toggle("hidden", !isAdmin());
  qs("#reservationTitle").textContent = isAdmin() ? "Nova reserva" : "Minha reserva";

  const activeView = qs(".view.active")?.id;
  if (!config.views.includes(activeView)) {
    setActiveView("homeView");
  }
}

function renderProfileImages(usuario) {
  const avatar = qs("#profileAvatar");
  const cover = qs("#profileCover");
  const fotoPerfilUrl = normalizeImageUrl(usuario.fotoPerfilUrl);
  const fundoPerfilUrl = normalizeImageUrl(usuario.fundoPerfilUrl);
  avatar.textContent = (usuario.nome || "U").slice(0, 1).toUpperCase();
  avatar.style.backgroundImage = "";
  cover.style.backgroundImage = "";

  if (fotoPerfilUrl) {
    avatar.textContent = "";
    avatar.style.backgroundImage = `url("${fotoPerfilUrl}")`;
    avatar.style.backgroundSize = "cover";
    avatar.style.backgroundPosition = "center";
  }

  if (fundoPerfilUrl) {
    cover.style.backgroundImage = `linear-gradient(90deg, rgba(7,29,65,.35), rgba(19,81,180,.2)), url("${fundoPerfilUrl}")`;
    cover.style.backgroundSize = "cover";
    cover.style.backgroundPosition = "center";
  }
}

function renderTopProfileShortcut(usuario) {
  const avatar = qs("#topProfileAvatar");
  if (!avatar) return;

  const fotoPerfilUrl = normalizeImageUrl(usuario.fotoPerfilUrl);
  avatar.textContent = (usuario.nome || "U").slice(0, 1).toUpperCase();
  avatar.style.backgroundImage = "";

  if (fotoPerfilUrl) {
    avatar.textContent = "";
    avatar.style.backgroundImage = `url("${fotoPerfilUrl}")`;
  }
}

function normalizeImageUrl(url) {
  if (!url) return "";
  const texto = String(url).trim();
  const objetoMinio = texto.match(/\/biblioteca\/(.+)$/)?.[1];
  if (objetoMinio) {
    return `${API_ORIGIN}/api/arquivos/${objetoMinio.replace(/^\/+/, "")}`;
  }
  if (texto.startsWith("/api/")) return `${API_ORIGIN}${texto}`;
  if (/^https?:\/\//.test(texto)) return texto;
  return `${API_ORIGIN}/api/arquivos/${texto.replace(/^\/+/, "")}`;
}

async function loadAll() {
  try {
    const [livros, usuarios, usuarioAtual, exemplares, reservas, emprestimos, multas] = await Promise.all([
      api("/livros"),
      api("/usuarios"),
      api(`/usuarios/${state.usuario.idUsuario}`),
      api("/exemplares"),
      api("/reservas"),
      api("/emprestimos"),
      api("/multas"),
    ]);
    state.usuario = { ...state.usuario, ...usuarioAtual };
    localStorage.setItem("usuario", JSON.stringify(state.usuario));
    state.livros = livros || [];
    state.usuarios = usuarios || [];
    state.exemplares = exemplares || [];
    state.reservas = reservas || [];
    state.emprestimos = emprestimos || [];
    state.multas = multas || [];
    renderAll();
    renderCurrentUser();
  } catch (error) {
    notify(error.message);
  }
}

function renderAll() {
  renderMetrics();
  renderHomeInsights();
  renderBooks();
  renderUsers();
  renderOperations();
  renderProfileSummary();
}

function renderMetrics() {
  if (qs("#metricBooks")) qs("#metricBooks").textContent = state.livros.length;
  if (qs("#metricUsers")) qs("#metricUsers").textContent = state.usuarios.length;
  if (qs("#metricReservations")) qs("#metricReservations").textContent = state.reservas.length;
  if (qs("#metricLoans")) qs("#metricLoans").textContent = state.emprestimos.length;
}

function renderHomeInsights() {
  renderHomeBooks();
  renderInsightList("#mostReservedBooks", mostReservedBooks(), "Ainda não há reservas.");
  renderInsightList("#bestConditionBooks", bestConditionBooks(), "Ainda não há exemplares cadastrados.");
  renderInsightList("#soldOutBooks", soldOutBooks(), "Nenhum livro está esgotado.");
}

function renderHomeBooks() {
  const target = qs("#homeBooksGrid");
  if (!target) return;
  const livros = highlightedBooks();
  target.innerHTML = livros.map((livro) => `
    ${bookCardHtml(livro, state.selectedHomeBookId)}
    ${state.selectedHomeBookId === livro.idLivro ? bookInlineDetailsHtml(livro) : ""}
  `).join("");
}

function highlightedBooks() {
  const reservationScore = new Map();
  state.reservas.forEach((reserva) => {
    reservationScore.set(reserva.livroId, (reservationScore.get(reserva.livroId) || 0) + 1);
  });

  return [...activeCatalogBooks()]
    .sort((a, b) => (reservationScore.get(b.idLivro) || 0) - (reservationScore.get(a.idLivro) || 0))
    .slice(0, 12);
}

function mostReservedBooks() {
  return activeCatalogBooks()
    .map((livro) => {
      const total = state.reservas.filter((reserva) => reserva.livroId === livro.idLivro).length;
      return {
        title: livro.titulo,
        detail: `${total} reserva${total === 1 ? "" : "s"}`,
        coverUrl: livro.capaUrl,
        score: total,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function bestConditionBooks() {
  return activeCatalogBooks()
    .map((livro) => {
      const exemplares = copiesByBookId(livro.idLivro);
      const bons = exemplares.filter((exemplar) =>
        ["novo", "bom"].includes(String(exemplar.estado).toLowerCase())
      ).length;
      return {
        title: livro.titulo,
        detail: `${bons}/${exemplares.length} exemplar${exemplares.length === 1 ? "" : "es"} em bom estado`,
        coverUrl: livro.capaUrl,
        score: bons,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function soldOutBooks() {
  return activeCatalogBooks()
    .map((livro) => {
      const exemplares = copiesByBookId(livro.idLivro);
      const emprestados = exemplares.filter((exemplar) =>
        state.emprestimos.some((emprestimo) =>
          emprestimo.exemplarId === exemplar.id_exemplar && !emprestimo.dataDevolucaoReal
        )
      ).length;
      const esgotado = exemplares.length === 0 || emprestados >= exemplares.length;
      return {
        title: livro.titulo,
        detail: exemplares.length === 0
          ? "sem exemplares cadastrados"
          : `${emprestados}/${exemplares.length} exemplares emprestados`,
        coverUrl: livro.capaUrl,
        score: esgotado ? 1 : 0,
      };
    })
    .filter((item) => item.score > 0)
    .slice(0, 5);
}

function renderProfileSummary() {
  if (!state.usuario) return;
  const userId = state.usuario.idUsuario;
  const ownReservations = state.reservas.filter((reserva) => reserva.usuarioId === userId);
  const ownLoans = state.emprestimos.filter((emprestimo) => emprestimo.usuarioId === userId);
  const ownLoanIds = new Set(ownLoans.map((emprestimo) => emprestimo.idEmprestimo));
  const ownFines = state.multas.filter((multa) => ownLoanIds.has(multa.idEmprestimo));

  qs("#profileBooksCount").textContent = state.livros.length;
  qs("#profileReservationsCount").textContent = ownReservations.length;
  qs("#profileLoansCount").textContent = ownLoans.length;
  qs("#profileFinesCount").textContent = ownFines.length;

  renderInsightList(
    "#profileReservationsList",
    ownReservations.map((reserva) => ({
      title: bookTitleById(reserva.livroId),
      detail: `Reserva ${reserva.idReserva} | ${formatStatus(reserva.statusReserva || "ativa")}`,
    })),
    "Você ainda não fez reservas."
  );

  renderInsightList(
    "#profileLoansList",
    ownLoans.map((emprestimo) => ({
      title: copyDescriptionById(emprestimo.exemplarId),
      detail: emprestimo.dataDevolucaoReal
        ? "Concluído"
        : `Vence em ${formatDate(emprestimo.dataVencimento)}`,
    })),
    "Você ainda não tem empréstimos."
  );

  renderInsightList(
    "#profileFinesList",
    ownFines.map((multa) => ({
      title: `Multa ${multa.idMulta}`,
      detail: `R$ ${Number(multa.valor || 0).toFixed(2)} | ${formatStatus(multa.statusPagamento)}`,
    })),
    "Você não tem multas vinculadas."
  );

  renderInsightList(
    "#profileBooksList",
    visibleBooks().slice(0, 8).map((livro) => ({
      title: livro.titulo,
      detail: `${livro.autor} | ${formatStatus(livro.status)}`,
    })),
    "Nenhum livro cadastrado."
  );
}

function renderInsightList(selector, items, emptyText) {
  const target = qs(selector);
  if (!target) return;
  if (!items.length) {
    target.innerHTML = `<p class="empty-state">${emptyText}</p>`;
    return;
  }

  target.innerHTML = items.map((item) => `
    <div class="insight-item">
      ${insightCoverHtml(item)}
      <div>
        <strong>${item.title}</strong>
        <span>${item.detail}</span>
      </div>
    </div>
  `).join("");
}

function insightCoverHtml(item) {
  if (!("coverUrl" in item)) return "";
  if (!item.coverUrl) {
    return `<div class="insight-cover insight-cover-placeholder">Livro</div>`;
  }

  return `<img class="insight-cover" src="${normalizeImageUrl(item.coverUrl)}" alt="Capa de ${item.title}">`;
}

function copiesByBookId(bookId) {
  return state.exemplares.filter((exemplar) => exemplar.livro_id === bookId);
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR");
}

function filteredBooks() {
  const term = qs("#globalSearch").value.trim().toLowerCase();
  const livros = activeCatalogBooks();
  if (!term) return livros;
  return livros.filter((livro) =>
    [livro.titulo, livro.autor, livro.genero]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term))
  );
}

function isBookInactive(livro) {
  return String(livro?.status || "").toLowerCase() === "inativo";
}

function visibleBooks() {
  return isAdmin()
    ? state.livros
    : state.livros.filter((livro) => !isBookInactive(livro));
}

function activeCatalogBooks() {
  return state.livros.filter((livro) => !isBookInactive(livro));
}

function userHasBlockingFines(userId = state.usuario?.idUsuario) {
  const userLoanIds = new Set(state.emprestimos.filter((emprestimo) => emprestimo.usuarioId === userId).map((emprestimo) => emprestimo.idEmprestimo));
  return state.multas.some((multa) =>
    userLoanIds.has(multa.idEmprestimo) &&
    ["pendente", "aguardando_confirmacao"].includes(multa.statusPagamento)
  );
}

function renderBooks() {
  const livros = filteredBooks();
  qs("#booksGrid").innerHTML = livros.map((livro) => `
    ${bookCardHtml(livro)}
    ${state.selectedBookId === livro.idLivro ? bookInlineDetailsHtml(livro) : ""}
  `).join("");

}

function bookCardHtml(livro, selectedId = state.selectedBookId) {
  return `
    <article class="book-card ${selectedId === livro.idLivro ? "selected" : ""}">
      <button class="book-cover" type="button" data-select-book="${livro.idLivro}" aria-label="Ver detalhes de ${livro.titulo}">
        ${bookCoverHtml(livro)}
      </button>
      <div class="card-body">
        <span class="book-chip">${livro.genero || "Livro"}</span>
        <h3>${livro.titulo}</h3>
        <p>${livro.autor}</p>
      </div>
    </article>
  `;
}

function bookCoverHtml(livro) {
  if (!livro.capaUrl) return `<span>Livro</span>`;
  return `<img src="${normalizeImageUrl(livro.capaUrl)}" alt="Capa de ${livro.titulo}">`;
}

function bookInlineDetailsHtml(livro) {
  const exemplares = copiesByBookId(livro.idLivro);
  const emprestados = exemplares.filter((exemplar) =>
    state.emprestimos.some((emprestimo) =>
      emprestimo.exemplarId === exemplar.id_exemplar && !emprestimo.dataDevolucaoReal
    )
  ).length;
  const inativo = isBookInactive(livro);
  const disponiveis = inativo ? 0 : Math.max(exemplares.length - emprestados, 0);
  const bloqueadoPorMulta = !isAdmin() && userHasBlockingFines();
  let action = "";

  if (isAdmin()) {
    action = `
        <div class="row-actions">
          <button class="secondary-btn" type="button" data-edit-book="${livro.idLivro}">Atualizar</button>
          <button class="danger-btn" type="button" data-delete-book="${livro.idLivro}">Remover</button>
        </div>
      `;
  } else if (inativo) {
    action = `<button class="secondary-btn book-more-btn" type="button" disabled>Livro inativo</button>`;
  } else if (bloqueadoPorMulta) {
    action = `<button class="secondary-btn book-more-btn" type="button" disabled>Reservas e empréstimos indisponíveis: pague sua multa pendente</button>`;
  } else {
    action = `<button class="secondary-btn book-more-btn" type="button">Mais informações</button>`;
  }

  return `
    <aside class="book-detail-panel open" aria-live="polite">
      <div class="book-detail-cover">${bookCoverHtml(livro)}</div>
    <div class="book-detail-content">
      <span class="system-tag">Sobre a obra</span>
      <h3>${livro.titulo}</h3>
      <p class="book-detail-author">${livro.autor}</p>
      <div class="book-detail-tags">
        <span>${livro.genero}</span>
        <span>${livro.anoPublicacao}</span>
        <span>${formatStatus(livro.status)}</span>
      </div>
      <p class="book-detail-synopsis">${livro.sinopse || "Sinopse não cadastrada."}</p>
      <div class="book-detail-stats">
        <article><strong>${exemplares.length}</strong><span>exemplares</span></article>
        <article><strong>${disponiveis}</strong><span>disponíveis</span></article>
        <article><strong>${emprestados}</strong><span>emprestados</span></article>
        <article><strong>${livro.curtidasTotal || livro._count?.curtidas || 0}</strong><span>curtidas</span></article>
      </div>
      ${isAdmin() ? `
        <div class="row-actions">
          <button class="secondary-btn" type="button" data-edit-book="${livro.idLivro}">Atualizar</button>
          <button class="danger-btn" type="button" data-delete-book="${livro.idLivro}">Remover</button>
        </div>
      ` : inativo
        ? `<button class="secondary-btn book-more-btn" type="button" disabled>Livro inativo</button>`
        : `<button class="secondary-btn book-more-btn" type="button">Mais informações</button>`}
    </div>
    </aside>
  `;
}

function formatStatus(status) {
  const labels = {
    disponivel: "disponível",
    "disponível": "disponível",
    emprestado: "emprestado",
    reservado: "reservado",
    inativo: "inativo",
    ativa: "ativa",
    pronta: "pronta",
    retirada: "retirada",
    cancelada: "cancelada",
    expirada: "expirada",
    pendente: "pendente",
    aguardando_confirmacao: "aguardando confirmação",
    paga: "paga",
  };
  return labels[status] || status || "-";
}

function renderUsers() {
  const term = qs("#globalSearch").value.trim().toLowerCase();
  const usuarios = state.usuarios.filter((usuario) =>
    !term || [usuario.nome, usuario.nivelAcesso, usuario.curso, usuario.departamento, usuario.cargo]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term))
  );

  qs("#usersGrid").innerHTML = usuarios.map((usuario) => {
    const detalhe = usuario.curso || usuario.departamento || usuario.cargo || "Usuário do sistema";
    const fotoPerfilUrl = normalizeImageUrl(usuario.fotoPerfilUrl);
    return `
      <article class="user-card">
        <div class="user-avatar" ${fotoPerfilUrl ? `style="background-image:url('${fotoPerfilUrl}');background-size:cover;background-position:center"` : ""}>
          ${fotoPerfilUrl ? "" : usuario.nome.slice(0, 1).toUpperCase()}
        </div>
        <h3>${usuario.nome}</h3>
        <p>${usuario.nivelAcesso}</p>
        <strong>${detalhe}</strong>
      </article>
    `;
  }).join("");
}

function renderOperations() {
  renderTableRows(
    "#reservationsTable",
    state.reservas.map((reserva) => `
      <tr>
        <td>${reserva.idReserva}</td>
        <td>${userNameById(reserva.usuarioId)}</td>
        <td>${bookTitleById(reserva.livroId)}</td>
        <td>${formatStatus(reserva.statusReserva)}</td>
        <td>${formatDate(reserva.dataReserva)}</td>
      </tr>
    `),
    5,
    "Nenhuma reserva cadastrada."
  );

  renderTableRows(
    "#loansTable",
    state.emprestimos.map((emprestimo) => `
      <tr>
        <td>${emprestimo.idEmprestimo}</td>
        <td>${userNameById(emprestimo.usuarioId)}</td>
        <td>${copyDescriptionById(emprestimo.exemplarId)}</td>
        <td>${formatDate(emprestimo.dataSaida)}</td>
        <td>${formatDate(emprestimo.dataVencimento)}</td>
        <td>${emprestimo.dataDevolucaoReal ? "concluído" : "em aberto"}</td>
      </tr>
    `),
    6,
    "Nenhum empréstimo registrado."
  );

  renderTableRows(
    "#finesTable",
    state.multas.map((multa) => `
      <tr>
        <td>${multa.idMulta}</td>
        <td>${multa.idEmprestimo ?? multa.emprestimoId ?? "-"}</td>
        <td>${multa.exemplarId ?? "-"}</td>
        <td>R$ ${Number(multa.valor ?? multa.valorMulta ?? 0).toFixed(2)}</td>
        <td>${formatStatus(multa.statusPagamento)}</td>
      </tr>
    `),
    5,
    "Nenhuma multa registrada."
  );

  renderTableRows(
    "#copiesTable",
    state.exemplares.map((exemplar) => `
      <tr>
        <td>${exemplar.id_exemplar}</td>
        <td>${exemplar.livro?.titulo || bookTitleById(exemplar.livro_id)}</td>
        <td>${exemplar.codigo_tombo}</td>
        <td>${exemplar.estado}</td>
        <td>${exemplar.localizacao}</td>
      </tr>
    `),
    5,
    "Nenhum exemplar cadastrado."
  );
  return;

  const rows = [
    ...state.exemplares.map((exemplar) => ({
      tipo: "Exemplar",
      id: exemplar.id_exemplar,
      referencia: exemplar.livro?.titulo || `Livro ${exemplar.livro_id}`,
      status: `${exemplar.codigo_tombo} | ${exemplar.estado} | ${exemplar.localizacao}`,
    })),
    ...state.reservas.map((reserva) => ({
      tipo: "Reserva",
      id: reserva.idReserva,
      referencia: `${userNameById(reserva.usuarioId)} reservou ${bookTitleById(reserva.livroId)}`,
      status: reserva.statusReserva || reserva.dataReserva,
    })),
    ...state.emprestimos.map((emprestimo) => ({
      tipo: "Empréstimo",
      id: emprestimo.idEmprestimo,
      referencia: `${userNameById(emprestimo.usuarioId)} pegou ${copyDescriptionById(emprestimo.exemplarId)}`,
      status: emprestimo.dataDevolucaoReal ? "concluído" : emprestimo.dataVencimento,
    })),
    ...state.multas.map((multa) => ({
      tipo: "Multa",
      id: multa.idMulta,
      usuario: "-",
      status: multa.statusPagamento,
    })),
  ];

  qs("#operationsTable").innerHTML = rows.map((row) => `
    <tr><td>${row.tipo}</td><td>${row.id ?? "-"}</td><td>${row.referencia ?? row.usuario ?? "-"}</td><td>${row.status ?? "-"}</td></tr>
  `).join("");
}

function renderTableRows(selector, rows, colSpan, emptyMessage) {
  const target = qs(selector);
  if (!target) return;
  target.innerHTML = rows.length
    ? rows.join("")
    : `<tr><td colspan="${colSpan}" class="empty-table">${emptyMessage}</td></tr>`;
}

function userNameById(id) {
  return state.usuarios.find((usuario) => usuario.idUsuario === id)?.nome || `Usuário ${id}`;
}

function bookTitleById(id) {
  return state.livros.find((livro) => livro.idLivro === id)?.titulo || `Livro ${id}`;
}

function copyDescriptionById(id) {
  if (!id) return "sem exemplar vinculado";
  const exemplar = state.exemplares.find((item) => item.id_exemplar === id);
  if (!exemplar) return `Exemplar ${id}`;
  return `Exemplar ${id} de ${exemplar.livro?.titulo || `Livro ${exemplar.livro_id}`}`;
}

function setActiveView(viewId) {
  qsa(".nav-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.view === viewId));
  qsa(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  profileShortcut?.classList.toggle("active", viewId === "profileView");
  closeAppMenu();
}

function toggleAppMenu() {
  const willOpen = appMenu.classList.contains("hidden");
  appMenu.classList.toggle("hidden", !willOpen);
  menuToggle.classList.toggle("active", willOpen);
  menuToggle.setAttribute("aria-expanded", String(willOpen));
}

function closeAppMenu() {
  if (!appMenu || !menuToggle) return;
  appMenu.classList.add("hidden");
  menuToggle.classList.remove("active");
  menuToggle.setAttribute("aria-expanded", "false");
}

function resetBookForm() {
  qs("#bookForm").reset();
  qs("#bookId").value = "";
  qs("#bookAvailable").checked = true;
  qs("#pendingCopiesList") && (qs("#pendingCopiesList").innerHTML = "");
  qs("#newCopyCode") && (qs("#newCopyCode").value = "");
  qs("#newCopyLocation") && (qs("#newCopyLocation").value = "");
  qs("#newCopyState") && (qs("#newCopyState").value = "novo");
}

function openBookForm(livro = null) {
  const panel = qs("#bookFormPanel");
  const requestedId = livro ? String(livro.idLivro) : "";
  const currentId = qs("#bookId").value;
  const isOpen = !panel.classList.contains("hidden");

  if (isOpen && currentId === requestedId) {
    closeBookForm();
    return;
  }

  setActiveView("homeView");
  panel.classList.remove("hidden");
  resetBookForm();
  if (!livro) {
    return;
  }
  qs("#bookId").value = livro.idLivro;
  qs("#bookTitle").value = livro.titulo;
  qs("#bookAuthor").value = livro.autor;
  qs("#bookGenre").value = livro.genero;
  qs("#bookYear").value = livro.anoPublicacao;
  qs("#bookSynopsis").value = livro.sinopse;
  qs("#bookAvailable").checked = ["disponivel", "disponível"].includes(livro.status);
}

function closeBookForm() {
  qs("#bookFormPanel").classList.add("hidden");
  resetBookForm();
}

function bookPayload() {
  const titulo = qs("#bookTitle").value.trim();
  const autor = qs("#bookAuthor").value.trim();
  const genero = qs("#bookGenre").value;
  const anoPublicacao = Number(qs("#bookYear").value);
  const sinopse = qs("#bookSynopsis").value.trim();
  const status = qs("#bookAvailable").checked ? "disponivel" : "reservado";

  if (titulo.length < 3 || autor.length < 3 || !genero || !anoPublicacao || sinopse.length < 10) {
    throw new Error("Preencha os campos do livro corretamente");
  }

  return { titulo, autor, genero, anoPublicacao, sinopse, status };
}

async function uploadBookCover(bookId) {
  const file = qs("#bookCover").files[0];
  if (!file) return;
  const data = new FormData();
  data.append("capa", file);
  await api(`/livros/${bookId}/capa`, { method: "POST", body: data });
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const dados = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: qs("#loginEmail").value.trim(),
        senha: qs("#loginPassword").value,
      }),
    });
    saveSession(dados);
    if (!qs("#rememberLogin").checked) clearCookie("bibliotecaUsuario");
    notify("Login realizado com sucesso");
    showApp();
  } catch (error) {
    notify(error.message);
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const tipo = qs("#registerType").value;
    const base = {
      nome: qs("#registerName").value.trim(),
      email: qs("#registerEmail").value.trim(),
      senha: qs("#registerPassword").value,
    };
    let payload = base;
    if (tipo === "alunos") {
      payload = {
        ...base,
        anoIngresso: Number(qs("#registerYear").value),
        curso: qs("#registerCourse").value.trim(),
        matriculaAluno: qs("#registerStudentId").value.trim(),
      };
    }
    if (tipo === "professores") {
      payload = {
        ...base,
        departamento: qs("#registerDepartment").value.trim(),
        matriculaProfessor: qs("#registerTeacherId").value.trim(),
      };
    }
    if (tipo === "admins") {
      payload = { ...base, cargo: qs("#registerRole").value.trim() };
    }
    await api(`/usuarios/${tipo}`, { method: "POST", body: JSON.stringify(payload) });
    notify("Cadastro criado. Faça login para entrar");
    qs("#loginTab").click();
  } catch (error) {
    notify(error.message);
  }
});

forgotPasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const email = qs("#forgotEmail").value.trim();
    await api("/auth/recuperar-senha/verificar-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    verifiedRecoveryEmail = email;
    qs("#resetPasswordFields").classList.remove("hidden");
    qs("#verifyForgotEmailBtn").classList.add("hidden");
    notify("E-mail encontrado. Crie uma nova senha");
  } catch (error) {
    verifiedRecoveryEmail = "";
    qs("#resetPasswordFields").classList.add("hidden");
    notify(error.message);
  }
});

qs("#resetPasswordBtn").addEventListener("click", async () => {
  try {
    const email = verifiedRecoveryEmail || qs("#forgotEmail").value.trim();
    const senha = qs("#forgotPassword").value;
    await api("/auth/recuperar-senha/redefinir", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
    notify("Senha redefinida com sucesso. Faça login para entrar");
    resetForgotPasswordForm();
    showLoginForm();
  } catch (error) {
    notify(error.message);
  }
});

qs("#bookForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const id = qs("#bookId").value;
    const payload = bookPayload();
    const { status, ...createPayload } = payload;
    const saved = id
      ? await api(`/livros/${id}`, { method: "PUT", body: JSON.stringify(payload) })
      : await api("/livros", { method: "POST", body: JSON.stringify(createPayload) });
    await uploadBookCover(saved.idLivro);
    notify("Livro salvo com sucesso");
    closeBookForm();
    await loadAll();
  } catch (error) {
    notify(error.message);
  }
});

qs("#reservationForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/reservas", {
      method: "POST",
      body: JSON.stringify({
        usuarioId: state.usuario.idUsuario,
        livroId: Number(qs("#reservationBookId").value),
      }),
    });
    notify("Reserva criada");
    await loadAll();
  } catch (error) {
    notify(error.message);
  }
});

qs("#loanForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/emprestimos", {
      method: "POST",
      body: JSON.stringify({
        usuarioId: state.usuario.idUsuario,
        exemplarId: Number(qs("#loanCopyId").value),
        dataVencimento: qs("#loanDueDate").value || undefined,
      }),
    });
    notify("Empréstimo registrado");
    await loadAll();
  } catch (error) {
    notify(error.message);
  }
});

qs("#copyForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/exemplares", {
      method: "POST",
      body: JSON.stringify({
        livroId: Number(qs("#copyBookId").value),
        codigoTombo: qs("#copyCode").value.trim(),
        estado: qs("#copyState").value,
        localizacao: qs("#copyLocation").value.trim(),
      }),
    });
    qs("#copyForm").reset();
    notify("Exemplar cadastrado");
    await loadAll();
  } catch (error) {
    notify(error.message);
  }
});

qs("#profileImageForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = new FormData();
    const foto = qs("#profilePhotoInput").files[0];
    const fundo = qs("#profileCoverInput").files[0];
    if (foto) data.append("fotoPerfil", foto);
    if (fundo) data.append("fundoPerfil", fundo);
    if (!foto && !fundo) throw new Error("Escolha pelo menos uma imagem");
    const usuario = await api(`/usuarios/${state.usuario.idUsuario}/imagens-perfil`, {
      method: "POST",
      body: data,
    });
    state.usuario = usuario;
    localStorage.setItem("usuario", JSON.stringify(usuario));
    renderCurrentUser();
    notify("Perfil atualizado");
  } catch (error) {
    notify(error.message);
  }
});

qs("#logoutBtn").addEventListener("click", async () => {
  try {
    if (state.token) await api("/auth/logout", { method: "POST", body: JSON.stringify({}) });
  } catch {
    // Mesmo que a sessão já tenha expirado, limpa o cliente.
  }
  clearSession();
  showAuth();
  notify("Você saiu do sistema");
});

qs("#loginTab").addEventListener("click", () => {
  resetForgotPasswordForm();
  showLoginForm();
});

qs("#registerTab").addEventListener("click", () => {
  resetForgotPasswordForm();
  showRegisterForm();
});

qs("#forgotPasswordBtn").addEventListener("click", () => {
  resetForgotPasswordForm();
  showForgotPasswordForm();
});

qs("#backToLoginBtn").addEventListener("click", () => {
  resetForgotPasswordForm();
  showLoginForm();
});

qs("#registerType").addEventListener("change", (event) => {
  qs("#studentFields").classList.toggle("hidden", event.target.value !== "alunos");
  qs("#teacherFields").classList.toggle("hidden", event.target.value !== "professores");
  qs("#adminFields").classList.toggle("hidden", event.target.value !== "admins");
});

themeToggle.addEventListener("click", toggleTheme);
appThemeToggle.addEventListener("click", toggleTheme);
qs("#registerPassword").addEventListener("input", (event) => {
  updatePasswordStrength(event.target.value);
});

qs("#forgotPassword").addEventListener("input", (event) => {
  updatePasswordStrength(
    event.target.value,
    "#forgotPasswordStrength",
    "#forgotPasswordStrengthText"
  );
});

qsa("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = qs(`#${button.dataset.passwordToggle}`);
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    button.setAttribute("aria-label", showing ? "Mostrar senha" : "Ocultar senha");
    button.classList.toggle("active", !showing);
  });
});

qsa(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => setActiveView(btn.dataset.view));
});

menuToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleAppMenu();
});

profileShortcut.addEventListener("click", () => {
  setActiveView("profileView");
});

document.addEventListener("click", (event) => {
  if (
    appMenu.classList.contains("hidden") ||
    appMenu.contains(event.target) ||
    menuToggle.contains(event.target)
  ) {
    return;
  }
  closeAppMenu();
});

qs("#newBookBtn").addEventListener("click", () => openBookForm());
qs("#cancelBookBtn").addEventListener("click", closeBookForm);
qs("#refreshBtn")?.addEventListener("click", loadAll);
qs("#globalSearch").addEventListener("input", renderAll);

document.addEventListener("click", async (event) => {
  const selectBookId = event.target.closest("[data-select-book]")?.dataset.selectBook;
  const editId = event.target.dataset?.editBook;
  const deleteId = event.target.dataset?.deleteBook;
  if (selectBookId) {
    if (qs("#homeView")?.classList.contains("active")) {
      state.selectedHomeBookId = Number(selectBookId);
      renderHomeBooks();
    } else {
      state.selectedBookId = Number(selectBookId);
      renderBooks();
    }
    return;
  }
  if (editId) {
    const livro = state.livros.find((item) => String(item.idLivro) === String(editId));
    openBookForm(livro);
  }
  if (deleteId && confirm("Remover este livro? Se ele tiver histórico, será marcado como inativo.")) {
    try {
      const resultado = await api(`/livros/${deleteId}`, { method: "DELETE" });
      notify(resultado.mensagem || (resultado.acao === "inativado" ? "Livro marcado como inativo" : "Livro removido"));
      await loadAll();
    } catch (error) {
      notify(error.message);
    }
  }
});

applyTheme();

if (state.token && state.usuario) {
  showApp();
} else {
  showAuth();
}
