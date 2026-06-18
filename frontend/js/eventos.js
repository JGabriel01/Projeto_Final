formularioLogin.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const dados = await chamarApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: selecionar("#loginEmail").value.trim(),
        senha: selecionar("#loginPassword").value,
      }),
    });
    salvarSessao(dados);
    if (selecionar("#rememberLogin").checked) {
      const trintaDias = 60 * 60 * 24 * 30;
      definirCookie("bibliotecaUsuario", selecionar("#loginEmail").value.trim(), trintaDias);
      definirCookie("bibliotecaSenha", selecionar("#loginPassword").value, trintaDias);
    } else {
      limparCookie("bibliotecaUsuario");
      limparCookie("bibliotecaSenha");
    }
    notificar("Login realizado com sucesso");
    mostrarAplicacao();
  } catch (error) {
    notificar(error.message);
  }
});

selecionar("#rememberLogin").addEventListener("change", () => {
  if (!selecionar("#rememberLogin").checked) {
    limparCookie("bibliotecaUsuario");
    limparCookie("bibliotecaSenha");
  }
});

formularioCadastro.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const tipo = selecionar("#registerType").value;
    const base = {
      nome: selecionar("#registerName").value.trim(),
      email: selecionar("#registerEmail").value.trim(),
      senha: selecionar("#registerPassword").value,
    };
    let corpoRequisicao = base;
    if (tipo === "alunos") {
      corpoRequisicao = {
        ...base,
        anoIngresso: Number(selecionar("#registerYear").value),
        curso: selecionar("#registerCourse").value.trim(),
        matriculaAluno: selecionar("#registerStudentId").value.trim(),
      };
    }
    if (tipo === "professores") {
      corpoRequisicao = {
        ...base,
        departamento: selecionar("#registerDepartment").value.trim(),
        matriculaProfessor: selecionar("#registerTeacherId").value.trim(),
      };
    }
    if (tipo === "admins") {
      corpoRequisicao = { ...base, cargo: selecionar("#registerRole").value.trim() };
    }
    await chamarApi(`/usuarios/${tipo}`, { method: "POST", body: JSON.stringify(corpoRequisicao) });
    notificar("Cadastro criado. Faça login para entrar");
    selecionar("#loginTab").click();
  } catch (error) {
    notificar(error.message);
  }
});

formularioRecuperarSenha.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const email = selecionar("#forgotEmail").value.trim();
    await chamarApi("/auth/recuperar-senha/verificar-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    emailRecuperacaoVerificado = email;
    selecionar("#resetPasswordFields").classList.remove("hidden");
    selecionar("#verifyForgotEmailBtn").classList.add("hidden");
    notificar("E-mail encontrado. Crie uma nova senha");
  } catch (error) {
    emailRecuperacaoVerificado = "";
    selecionar("#resetPasswordFields").classList.add("hidden");
    notificar(error.message);
  }
});

selecionar("#resetPasswordBtn").addEventListener("click", async () => {
  try {
    const email = emailRecuperacaoVerificado || selecionar("#forgotEmail").value.trim();
    const senha = selecionar("#forgotPassword").value;
    await chamarApi("/auth/recuperar-senha/redefinir", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
    notificar("Senha redefinida com sucesso. Faça login para entrar");
    resetarFormularioRecuperarSenha();
    mostrarFormularioLogin();
  } catch (error) {
    notificar(error.message);
  }
});

selecionar("#bookForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const id = selecionar("#bookId").value;
    const corpoRequisicao = dadosLivro();
    const livroSalvo = id
      ? await chamarApi(`/livros/${id}`, { method: "PUT", body: JSON.stringify(corpoRequisicao) })
      : await chamarApi("/livros", { method: "POST", body: JSON.stringify(corpoRequisicao) });
    await enviarCapaLivro(livroSalvo.idLivro);
    notificar("Livro salvo com sucesso");
    fecharFormularioLivro();
    await carregarTudo();
  } catch (error) {
    notificar(error.message);
  }
});

selecionar("#reservationForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await chamarApi("/biblioteca/reservas", {
      method: "POST",
      body: JSON.stringify({
        livroId: Number(selecionar("#reservationBookId").value),
      }),
    });
    notificar("Reserva criada");
    await carregarTudo();
  } catch (error) {
    notificar(error.message);
  }
});

selecionar("#loanForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await chamarApi("/emprestimos", {
      method: "POST",
      body: JSON.stringify({
        usuarioId: estado.usuario.idUsuario,
        exemplarId: Number(selecionar("#loanCopyId").value),
        dataVencimento: selecionar("#loanDueDate").value || undefined,
      }),
    });
    notificar("Empréstimo registrado");
    await carregarTudo();
  } catch (error) {
    notificar(error.message);
  }
});

selecionar("#copyForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await chamarApi("/exemplares", {
      method: "POST",
      body: JSON.stringify({
        livroId: Number(selecionar("#copyBookId").value),
        codigoTombo: selecionar("#copyCode").value.trim().toUpperCase(),
        estado: selecionar("#copyState").value,
        localizacao: selecionar("#copyLocation").value.trim(),
      }),
    });
    selecionar("#copyForm").reset();
    notificar("Exemplar cadastrado");
    await carregarTudo();
  } catch (error) {
    notificar(error.message);
  }
});

selecionar("#profileImageForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const dadosFormulario = new FormData();
    const foto = selecionar("#profilePhotoInput").files[0];
    const fundo = selecionar("#profileCoverInput").files[0];
    if (foto) dadosFormulario.append("fotoPerfil", foto);
    if (fundo) dadosFormulario.append("fundoPerfil", fundo);
    if (!foto && !fundo) throw new Error("Escolha pelo menos uma imagem");
    const usuario = await chamarApi(`/usuarios/${estado.usuario.idUsuario}/imagens-perfil`, {
      method: "POST",
      body: dadosFormulario,
    });
    estado.usuario = usuario;
    localStorage.setItem("usuario", JSON.stringify(usuario));
    renderizarUsuarioAtual();
    notificar("Perfil atualizado");
  } catch (error) {
    notificar(error.message);
  }
});

selecionar("#removeBookCoverBtn")?.addEventListener("click", async () => {
  const idLivro = selecionar("#bookId").value;
  if (!idLivro) {
    notificar("Salve ou selecione um livro antes de remover a capa");
    return;
  }
  if (!confirm("Remover a capa deste livro?")) return;

  try {
    await chamarApi(`/livros/${idLivro}/capa`, { method: "DELETE" });
    selecionar("#bookCover").value = "";
    selecionar("#removeBookCoverBtn").disabled = true;
    notificar("Capa removida");
    await carregarTudo();
  } catch (error) {
    notificar(error.message);
  }
});

async function removerImagemPerfil(tipo, mensagemConfirmacao, mensagemSucesso) {
  if (!confirm(mensagemConfirmacao)) return;

  try {
    const usuario = await chamarApi(`/usuarios/${estado.usuario.idUsuario}/imagens-perfil/${tipo}`, {
      method: "DELETE",
    });
    estado.usuario = usuario;
    localStorage.setItem("usuario", JSON.stringify(usuario));
    selecionar("#profilePhotoInput").value = "";
    selecionar("#profileCoverInput").value = "";
    renderizarUsuarioAtual();
    notificar(mensagemSucesso);
  } catch (error) {
    notificar(error.message);
  }
}

selecionar("#removeProfilePhotoBtn")?.addEventListener("click", () => {
  removerImagemPerfil("foto", "Remover sua foto de perfil?", "Foto de perfil removida");
});

selecionar("#removeProfileCoverBtn")?.addEventListener("click", () => {
  removerImagemPerfil("fundo", "Remover a imagem de fundo do perfil?", "Imagem de fundo removida");
});

selecionar("#logoutBtn").addEventListener("click", async () => {
  try {
    if (estado.token) await chamarApi("/auth/logout", { method: "POST", body: JSON.stringify({}) });
  } catch {
    // Mesmo que a sessão já tenha expirado, limpa o cliente.
  }
  limparSessao();
  mostrarAutenticacao();
  notificar("Você saiu do sistema");
});

selecionar("#loginTab").addEventListener("click", () => {
  resetarFormularioRecuperarSenha();
  mostrarFormularioLogin();
});

selecionar("#registerTab").addEventListener("click", () => {
  resetarFormularioRecuperarSenha();
  mostrarFormularioCadastro();
});

selecionar("#forgotPasswordBtn").addEventListener("click", () => {
  resetarFormularioRecuperarSenha();
  mostrarFormularioRecuperarSenha();
});

selecionar("#backToLoginBtn").addEventListener("click", () => {
  resetarFormularioRecuperarSenha();
  mostrarFormularioLogin();
});

selecionar("#registerType").addEventListener("change", (event) => {
  selecionar("#studentFields").classList.toggle("hidden", event.target.value !== "alunos");
  selecionar("#teacherFields").classList.toggle("hidden", event.target.value !== "professores");
  selecionar("#adminFields").classList.toggle("hidden", event.target.value !== "admins");
});

botaoTema.addEventListener("click", alternarTema);
botaoTemaAplicacao.addEventListener("click", alternarTema);
selecionar("#registerPassword").addEventListener("input", (event) => {
  atualizarForcaSenha(event.target.value);
});

selecionar("#forgotPassword").addEventListener("input", (event) => {
  atualizarForcaSenha(
    event.target.value,
    "#forgotPasswordStrength",
    "#forgotPasswordStrengthText"
  );
});

["#registerStudentId", "#registerTeacherId", "#copyCode"].forEach((selector) => {
  selecionar(selector)?.addEventListener("input", (event) => {
    event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  });
});

selecionarTodos("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = selecionar(`#${button.dataset.passwordToggle}`);
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    button.setAttribute("aria-label", showing ? "Mostrar senha" : "Ocultar senha");
    button.classList.toggle("active", !showing);
  });
});

selecionarTodos(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => definirVisaoAtiva(btn.dataset.view));
});

botaoMenu.addEventListener("click", (event) => {
  event.stopPropagation();
  alternarMenuAplicacao();
});

atalhoPerfil.addEventListener("click", () => {
  definirVisaoAtiva("profileView");
});

document.addEventListener("click", (event) => {
  if (
    menuAplicacao.classList.contains("hidden") ||
    menuAplicacao.contains(event.target) ||
    botaoMenu.contains(event.target)
  ) {
    return;
  }
  fecharMenuAplicacao();
});

selecionar("#newBookBtn").addEventListener("click", () => abrirFormularioLivro());
selecionar("#cancelBookBtn").addEventListener("click", fecharFormularioLivro);
selecionar("#refreshBtn")?.addEventListener("click", carregarTudo);
selecionar("#globalSearch").addEventListener("input", renderizarTudo);

function elementoPodeRolarVerticalmente(elemento, deltaY) {
  let atual = elemento;
  while (atual && atual !== document.body) {
    const estilo = window.getComputedStyle(atual);
    const permiteScrollVertical = ["auto", "scroll"].includes(estilo.overflowY);
    const temScrollVertical = atual.scrollHeight > atual.clientHeight;
    if (permiteScrollVertical && temScrollVertical) {
      const indoParaBaixo = deltaY > 0;
      const podeDescer = atual.scrollTop + atual.clientHeight < atual.scrollHeight;
      const podeSubir = atual.scrollTop > 0;
      return indoParaBaixo ? podeDescer : podeSubir;
    }
    atual = atual.parentElement;
  }
  return false;
}

document.addEventListener("wheel", (event) => {
  const listaHorizontal = event.target.closest(".book-showcase, .book-grid, .profile-book-grid, .table-wrap");
  if (!listaHorizontal || listaHorizontal.scrollWidth <= listaHorizontal.clientWidth) return;
  if (elementoPodeRolarVerticalmente(event.target, event.deltaY)) return;

  const deslocamentoBase = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  const deslocamento = deslocamentoBase * 7;
  listaHorizontal.scrollLeft += deslocamento;
  event.preventDefault();
}, { passive: false });

document.addEventListener("click", async (event) => {
  const idLivroSelecionado = event.target.closest("[data-select-book]")?.dataset.selectBook;
  const idLivroReserva = event.target.closest("[data-reserve-book]")?.dataset.reserveBook;
  const idEdicao = event.target.dataset?.editBook;
  const idExclusao = event.target.dataset?.deleteBook;
  if (idLivroSelecionado) {
    if (selecionar("#homeView")?.classList.contains("active")) {
      const origem = event.target.closest("[data-select-book]")?.dataset.bookOrigin || "alta";
      const chaveSelecao = {
        alta: "livroEmAltaSelecionadoId",
        genero: "livroGeneroSelecionadoId",
        indisponivel: "livroIndisponivelSelecionadoId",
      }[origem] || "livroEmAltaSelecionadoId";
      const id = Number(idLivroSelecionado);
      estado[chaveSelecao] = estado[chaveSelecao] === id ? null : id;
      renderizarLivrosEmAlta();
      renderizarSecoesGeneros();
      renderizarLivrosIndisponiveis();
    } else {
      estado.idLivroSelecionado = Number(idLivroSelecionado);
      renderizarLivros();
    }
    return;
  }
  if (idLivroReserva && confirm("Deseja reservar este livro indisponível para empréstimo?")) {
    try {
      await chamarApi("/biblioteca/reservas", { method: "POST", body: JSON.stringify({ livroId: Number(idLivroReserva) }) });
      notificar("Reserva criada. Acompanhe sua posição na fila.");
      await carregarTudo();
    } catch (error) {
      notificar(error.message);
    }
    return;
  }
  if (idEdicao) {
    const livro = estado.livros.find((item) => String(item.idLivro) === String(idEdicao));
    abrirFormularioLivro(livro);
  }
  if (idExclusao && confirm("Remover este livro do acervo? Se ele tiver histórico, será marcado como inativo e reservas pendentes serão canceladas com notificação aos usuários.")) {
    try {
      const resultado = await chamarApi(`/livros/${idExclusao}`, { method: "DELETE" });
      limparLivroDaInterface(idExclusao);
      notificar(resultado.mensagem || (resultado.acao === "inativado" ? "Livro marcado como inativo" : "Livro removido"));
      await carregarTudo();
    } catch (error) {
      notificar(error.message);
    }
  }
});

aplicarTema();

if (estado.token && estado.usuario) {
  mostrarAplicacao();
} else {
  mostrarAutenticacao();
}
