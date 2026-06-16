function definirVisaoAtiva(idVisao) {
  selecionarTodos(".nav-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.view === idVisao));
  selecionarTodos(".view").forEach((view) => view.classList.toggle("active", view.id === idVisao));
  atalhoPerfil?.classList.toggle("active", idVisao === "profileView");
  fecharMenuAplicacao();
}

function alternarMenuAplicacao() {
  const vaiAbrir = menuAplicacao.classList.contains("hidden");
  menuAplicacao.classList.toggle("hidden", !vaiAbrir);
  botaoMenu.classList.toggle("active", vaiAbrir);
  botaoMenu.setAttribute("aria-expanded", String(vaiAbrir));
}

function fecharMenuAplicacao() {
  if (!menuAplicacao || !botaoMenu) return;
  menuAplicacao.classList.add("hidden");
  botaoMenu.classList.remove("active");
  botaoMenu.setAttribute("aria-expanded", "false");
}

function resetarFormularioLivro() {
  selecionar("#bookForm").reset();
  selecionar("#bookId").value = "";
  selecionar("#bookAvailable").checked = true;
  selecionar("#removeBookCoverBtn") && (selecionar("#removeBookCoverBtn").disabled = true);
  selecionar("#pendingCopiesList") && (selecionar("#pendingCopiesList").innerHTML = "");
  selecionar("#newCopyCode") && (selecionar("#newCopyCode").value = "");
  selecionar("#newCopyLocation") && (selecionar("#newCopyLocation").value = "");
  selecionar("#newCopyState") && (selecionar("#newCopyState").value = "novo");
}

function abrirFormularioLivro(livro = null) {
  const panel = selecionar("#bookFormPanel");
  const idSolicitado = livro ? String(livro.idLivro) : "";
  const idAtual = selecionar("#bookId").value;
  const estaAberto = !panel.classList.contains("hidden");

  if (estaAberto && idAtual === idSolicitado) {
    fecharFormularioLivro();
    return;
  }

  definirVisaoAtiva("homeView");
  panel.classList.remove("hidden");
  resetarFormularioLivro();
  setTimeout(() => {
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
    selecionar("#bookTitle")?.focus({ preventScroll: true });
  }, 0);
  if (!livro) {
    return;
  }
  selecionar("#bookId").value = livro.idLivro;
  selecionar("#bookTitle").value = livro.titulo;
  selecionar("#bookAuthor").value = livro.autor;
  selecionar("#bookGenre").value = livro.genero;
  selecionar("#bookYear").value = livro.anoPublicacao;
  selecionar("#bookSynopsis").value = livro.sinopse;
  selecionar("#bookAvailable").checked = normalizarStatusLivro(livro.status) === "disponivel";
  selecionar("#removeBookCoverBtn") && (selecionar("#removeBookCoverBtn").disabled = !livro.capaUrl);
}

function fecharFormularioLivro() {
  selecionar("#bookFormPanel").classList.add("hidden");
  resetarFormularioLivro();
}

function dadosLivro() {
  const titulo = selecionar("#bookTitle").value.trim();
  const autor = selecionar("#bookAuthor").value.trim();
  const genero = selecionar("#bookGenre").value;
  const anoPublicacao = Number(selecionar("#bookYear").value);
  const sinopse = selecionar("#bookSynopsis").value.trim();
  const status = selecionar("#bookAvailable").checked ? "disponivel" : "inativo";

  if (titulo.length < 3 || autor.length < 3 || !genero || !anoPublicacao || sinopse.length < 10) {
    throw new Error("Preencha os campos do livro corretamente");
  }

  return { titulo, autor, genero, anoPublicacao, sinopse, status };
}

async function enviarCapaLivro(idLivro) {
  const arquivo = selecionar("#bookCover").files[0];
  if (!arquivo) return;
  const dadosFormulario = new FormData();
  dadosFormulario.append("capa", arquivo);
  await chamarApi(`/livros/${idLivro}/capa`, { method: "POST", body: dadosFormulario });
}
