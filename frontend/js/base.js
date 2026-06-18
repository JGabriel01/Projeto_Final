const ORIGEM_API = window.location.protocol.startsWith("http")
  ? window.location.origin
  : "http://localhost:3000";
const URL_API = `${ORIGEM_API}/api`;

const estado = {
  token: localStorage.getItem("token"),
  usuario: JSON.parse(localStorage.getItem("usuario") || "null"),
  livros: [],
  usuarios: [],
  exemplares: [],
  reservas: [],
  emprestimos: [],
  multas: [],
  curtidasUsuario: [],
  idLivroSelecionado: null,
  livroEmAltaSelecionadoId: null,
  livroGeneroSelecionadoId: null,
  livroIndisponivelSelecionadoId: null,
};

const selecionar = (selector) => document.querySelector(selector);
const selecionarTodos = (selector) => [...document.querySelectorAll(selector)];

const telaAutenticacao = selecionar("#authScreen");
const telaAplicacao = selecionar("#appScreen");
const formularioLogin = selecionar("#loginForm");
const formularioCadastro = selecionar("#registerForm");
const formularioRecuperarSenha = selecionar("#forgotPasswordForm");
const avisoToast = selecionar("#toast");
const botaoTema = selecionar("#themeToggle");
const botaoTemaAplicacao = selecionar("#appThemeToggle");
const botaoMenu = selecionar("#menuToggle");
const menuAplicacao = selecionar("#appMenu");
const atalhoPerfil = selecionar("#profileShortcut");
let emailRecuperacaoVerificado = "";

function definirCookie(name, value, maxAge = 7200) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
}

function obterCookie(name) {
  return document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=") || "";
}

function limparCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

function notificar(message) {
  avisoToast.textContent = message;
  avisoToast.classList.remove("hidden");
  setTimeout(() => avisoToast.classList.add("hidden"), 3200);
}

function aplicarTema() {
  const modoEscuro = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark-mode", modoEscuro);
  if (botaoTema) botaoTema.textContent = modoEscuro ? "\u2600" : "\u263e";
  if (botaoTemaAplicacao) botaoTemaAplicacao.textContent = modoEscuro ? "\u2600" : "\u263e";
}

function alternarTema() {
  const modoEscuro = !document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", String(modoEscuro));
  aplicarTema();
}

function atualizarForcaSenha(
  password,
  barSelector = "#passwordStrength",
  textSelector = "#passwordStrengthText"
) {
  const bar = selecionar(barSelector);
  const text = selecionar(textSelector);
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

async function chamarApi(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (estado.token) {
    headers.Authorization = `Bearer ${estado.token}`;
  }

  const response = await fetch(`${URL_API}${path}`, { ...options, headers });
  const corpoRequisicao = await response.json().catch(() => ({}));
  if (!response.ok || corpoRequisicao.sucesso === false) {
    throw new Error(corpoRequisicao.erro?.mensagem || "Erro ao comunicar com a API");
  }
  return corpoRequisicao.dados;
}

function mostrarAutenticacao() {
  telaAutenticacao.classList.remove("hidden");
  telaAplicacao.classList.add("hidden");
  restaurarLoginLembrado();
}

function restaurarLoginLembrado() {
  const remember = selecionar("#rememberLogin");
  const email = selecionar("#loginEmail");
  const password = selecionar("#loginPassword");
  if (!remember || !email || !password) return;

  const rememberedEmail = decodeURIComponent(obterCookie("bibliotecaUsuario"));
  const rememberedPassword = decodeURIComponent(obterCookie("bibliotecaSenha"));
  remember.checked = Boolean(rememberedEmail || rememberedPassword);
  email.value = rememberedEmail;
  password.value = rememberedPassword;

  if (!rememberedEmail && !rememberedPassword) {
    const clearAutofill = () => {
      if (!remember.checked) {
        email.value = "";
        password.value = "";
      }
    };
    setTimeout(clearAutofill, 250);
    setTimeout(clearAutofill, 1000);
  }
}

function mostrarFormularioLogin() {
  selecionar("#loginTab").classList.add("active");
  selecionar("#registerTab").classList.remove("active");
  formularioLogin.classList.add("active");
  formularioCadastro.classList.remove("active");
  formularioRecuperarSenha.classList.remove("active");
}

function mostrarFormularioCadastro() {
  selecionar("#registerTab").classList.add("active");
  selecionar("#loginTab").classList.remove("active");
  formularioCadastro.classList.add("active");
  formularioLogin.classList.remove("active");
  formularioRecuperarSenha.classList.remove("active");
}

function mostrarFormularioRecuperarSenha() {
  selecionar("#loginTab").classList.remove("active");
  selecionar("#registerTab").classList.remove("active");
  formularioRecuperarSenha.classList.add("active");
  formularioLogin.classList.remove("active");
  formularioCadastro.classList.remove("active");
}

function resetarFormularioRecuperarSenha() {
  emailRecuperacaoVerificado = "";
  formularioRecuperarSenha.reset();
  selecionar("#resetPasswordFields").classList.add("hidden");
  selecionar("#verifyForgotEmailBtn").classList.remove("hidden");
  atualizarForcaSenha("", "#forgotPasswordStrength", "#forgotPasswordStrengthText");
}

function mostrarAplicacao() {
  telaAutenticacao.classList.add("hidden");
  telaAplicacao.classList.remove("hidden");
  resetarInterfaceSessao();
  definirVisaoAtiva("homeView");
  renderizarUsuarioAtual();
  carregarTudo();
}

function salvarSessao(dados) {
  estado.token = dados.token;
  estado.usuario = dados.usuario;
  localStorage.setItem("token", estado.token);
  localStorage.setItem("usuario", JSON.stringify(estado.usuario));
  definirCookie("bibliotecaLogado", "true");
}

function limparSessao() {
  estado.token = null;
  estado.usuario = null;
  resetarInterfaceSessao();
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  limparCookie("bibliotecaLogado");
}

function resetarInterfaceSessao() {
  estado.idLivroSelecionado = null;
  estado.livroEmAltaSelecionadoId = null;
  estado.livroGeneroSelecionadoId = null;
  estado.livroIndisponivelSelecionadoId = null;
  estado.idLivroPerfilSelecionado = null;

  selecionar("#bookFormPanel")?.classList.add("hidden");
  if (selecionar("#bookForm")) resetarFormularioLivro();
  selecionar("#profileImageForm")?.reset();
  selecionar("#reservationForm")?.reset();
  selecionar("#loanForm")?.reset();
  selecionar("#copyForm")?.reset();
  selecionarTodos(".view").forEach((view) => view.classList.toggle("active", view.id === "homeView"));
  selecionarTodos(".nav-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.view === "homeView"));
  atalhoPerfil?.classList.remove("active");
  fecharMenuAplicacao();
}

function limparLivroDaInterface(idLivro) {
  const id = Number(idLivro);
  if (!id) return;

  if (estado.idLivroSelecionado === id) estado.idLivroSelecionado = null;
  if (estado.livroEmAltaSelecionadoId === id) estado.livroEmAltaSelecionadoId = null;
  if (estado.livroGeneroSelecionadoId === id) estado.livroGeneroSelecionadoId = null;
  if (estado.livroIndisponivelSelecionadoId === id) estado.livroIndisponivelSelecionadoId = null;
  if (estado.idLivroPerfilSelecionado === id) estado.idLivroPerfilSelecionado = null;

  if (String(selecionar("#bookId")?.value || "") === String(id)) {
    fecharFormularioLivro();
  }
}

function limparLivrosAusentesDaInterface() {
  const idsAtuais = new Set((estado.livros || []).map((livro) => Number(livro.idLivro)));
  [
    estado.idLivroSelecionado,
    estado.livroEmAltaSelecionadoId,
    estado.livroGeneroSelecionadoId,
    estado.livroIndisponivelSelecionadoId,
    estado.idLivroPerfilSelecionado,
  ].forEach((id) => {
    if (id && !idsAtuais.has(Number(id))) limparLivroDaInterface(id);
  });

  const idEmEdicao = Number(selecionar("#bookId")?.value || 0);
  if (idEmEdicao && !idsAtuais.has(idEmEdicao)) limparLivroDaInterface(idEmEdicao);
}

function renderizarUsuarioAtual() {
  if (!estado.usuario) return;
  selecionar("#profileName").textContent = estado.usuario.nome;
  selecionar("#profileMeta").textContent = `${estado.usuario.nivelAcesso} | ${estado.usuario.email}`;
  selecionar("#newBookBtn").classList.toggle("hidden", !ehAdmin());
  aplicarInterfacePorPerfil();
  renderizarImagensPerfil(estado.usuario);
  renderizarAtalhoPerfilTopo(estado.usuario);
}

function ehAdmin() {
  return estado.usuario?.nivelAcesso === "admin";
}

function ehProfessor() {
  return estado.usuario?.nivelAcesso === "professor";
}

function ehAluno() {
  return estado.usuario?.nivelAcesso === "aluno";
}

function aplicarInterfacePorPerfil() {
  const role = estado.usuario?.nivelAcesso || "aluno";
  const configuracaoPerfil = {
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

  const config = configuracaoPerfil[role] || configuracaoPerfil.aluno;

  selecionarTodos(".nav-btn").forEach((button) => {
    button.classList.toggle("hidden", !config.views.includes(button.dataset.view));
  });

  selecionar("#metricUsers")?.closest("article")?.classList.toggle("hidden", ehAluno());
  selecionar("#loanCard").classList.toggle("hidden", !ehAdmin());
  selecionar("#copyCard").classList.toggle("hidden", !ehAdmin());
  selecionar("#reservationTitle").textContent = ehAdmin() ? "Nova reserva" : "Minha reserva";

  const visaoAtiva = selecionar(".view.active")?.id;
  if (!config.views.includes(visaoAtiva)) {
    definirVisaoAtiva("homeView");
  }
}

function renderizarImagensPerfil(usuario) {
  const avatar = selecionar("#profileAvatar");
  const cover = selecionar("#profileCover");
  const urlFotoPerfil = normalizarUrlImagem(usuario.fotoPerfilUrl);
  const urlFundoPerfil = normalizarUrlImagem(usuario.fundoPerfilUrl);
  avatar.textContent = (usuario.nome || "U").slice(0, 1).toUpperCase();
  avatar.style.backgroundImage = "";
  cover.style.backgroundImage = "";

  if (urlFotoPerfil) {
    avatar.textContent = "";
    avatar.style.backgroundImage = `url("${urlFotoPerfil}")`;
    avatar.style.backgroundSize = "cover";
    avatar.style.backgroundPosition = "center";
  }

  if (urlFundoPerfil) {
    cover.style.backgroundImage = `linear-gradient(90deg, rgba(7,29,65,.35), rgba(19,81,180,.2)), url("${urlFundoPerfil}")`;
    cover.style.backgroundSize = "cover";
    cover.style.backgroundPosition = "center";
  }
}

function renderizarAtalhoPerfilTopo(usuario) {
  const avatar = selecionar("#topProfileAvatar");
  if (!avatar) return;

  const urlFotoPerfil = normalizarUrlImagem(usuario.fotoPerfilUrl);
  avatar.textContent = (usuario.nome || "U").slice(0, 1).toUpperCase();
  avatar.style.backgroundImage = "";

  if (urlFotoPerfil) {
    avatar.textContent = "";
    avatar.style.backgroundImage = `url("${urlFotoPerfil}")`;
  }
}

function normalizarUrlImagem(url) {
  if (!url) return "";
  const texto = String(url).trim();
  const objetoMinio = texto.match(/\/biblioteca\/(.+)$/)?.[1];
  if (objetoMinio) {
    return `${ORIGEM_API}/api/arquivos/${objetoMinio.replace(/^\/+/, "")}`;
  }
  if (texto.startsWith("/api/")) return `${ORIGEM_API}${texto}`;
  if (/^https?:\/\//.test(texto)) return texto;
  return `${ORIGEM_API}/api/arquivos/${texto.replace(/^\/+/, "")}`;
}

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizarStatusLivro(status) {
  const texto = normalizarTexto(status);
  if (texto.includes("dispon")) return "disponivel";
  if (texto.includes("inativo")) return "inativo";
  return texto;
}

function ordenarPorIdMaisNovo(items, chaveCamel, chaveSnake) {
  return [...(items || [])].sort((a, b) =>
    Number(b?.[chaveCamel] ?? b?.[chaveSnake] ?? 0) - Number(a?.[chaveCamel] ?? a?.[chaveSnake] ?? 0)
  );
}
