async function carregarTudo() {
  try {
    const [livros, usuarios, usuarioAtualizado, exemplares, reservas, emprestimos, multas] = await Promise.all([
      chamarApi("/livros"),
      chamarApi("/usuarios"),
      chamarApi(`/usuarios/${estado.usuario.idUsuario}`),
      chamarApi("/exemplares"),
      chamarApi("/reservas"),
      chamarApi("/emprestimos"),
      chamarApi("/multas"),
    ]);
    estado.usuario = { ...estado.usuario, ...usuarioAtualizado };
    localStorage.setItem("usuario", JSON.stringify(estado.usuario));
    estado.livros = ordenarPorIdMaisNovo(livros, "idLivro", "id_livro");
    estado.usuarios = usuarios || [];
    estado.exemplares = ordenarPorIdMaisNovo(exemplares, "idExemplar", "id_exemplar");
    estado.reservas = reservas || [];
    estado.emprestimos = emprestimos || [];
    estado.multas = multas || [];
    renderizarTudo();
    renderizarUsuarioAtual();
  } catch (error) {
    notificar(error.message);
  }
}

function renderizarTudo() {
  renderizarMetricas();
  renderizarDestaquesInicio();
  renderizarLivros();
  renderizarUsuarios();
  renderizarOperacoes();
  renderizarResumoPerfil();
}

function renderizarMetricas() {
  if (selecionar("#metricBooks")) selecionar("#metricBooks").textContent = estado.livros.length;
  if (selecionar("#metricUsers")) selecionar("#metricUsers").textContent = estado.usuarios.length;
  if (selecionar("#metricReservations")) selecionar("#metricReservations").textContent = estado.reservas.length;
  if (selecionar("#metricLoans")) selecionar("#metricLoans").textContent = estado.emprestimos.length;
}

function renderizarDestaquesInicio() {
  renderizarLivrosEmAlta();
  renderizarSecoesGeneros();
  renderizarLivrosIndisponiveis();
  renderizarListaDestaques("#mostReservedBooks", livrosMaisReservados(), "Ainda não há reservas.");
  renderizarListaDestaques("#bestConditionBooks", livrosMelhorEstado(), "Ainda não há exemplares cadastrados.");
  renderizarListaDestaques("#soldOutBooks", livrosEsgotados(), "Nenhum livro está esgotado.");
}

function restaurarScrollHorizontal(elemento, scrollLeft) {
  if (!elemento) return;
  requestAnimationFrame(() => {
    elemento.scrollLeft = scrollLeft;
  });
}

function renderizarLivrosEmAlta() {
  const alvo = selecionar("#gradeLivrosEmAlta");
  if (!alvo) return;
  const scrollAnterior = alvo.scrollLeft;
  const livros = livrosEmAlta();
  if (!livros.length) {
    alvo.innerHTML = `<p class="empty-state">Nenhum livro curtido ainda.</p>`;
    return;
  }

  alvo.innerHTML = livros.map((livro, index) => `
    ${htmlCardLivro(livro, estado.livroEmAltaSelecionadoId, { rank: index + 1, origem: "alta" })}
    ${estado.livroEmAltaSelecionadoId === livro.idLivro ? htmlDetalhesLivroInline(livro) : ""}
  `).join("");
  restaurarScrollHorizontal(alvo, scrollAnterior);
}

function livrosEmAlta() {
  const livros = [...livrosDoAcervo()]
    .filter((livro) => curtidasDoLivro(livro) > 0)
    .sort((a, b) => curtidasDoLivro(b) - curtidasDoLivro(a) || Number(b.idLivro || 0) - Number(a.idLivro || 0));
  const termo = termoBusca();

  return (termo
    ? livros.filter((livro) => livroCombinaComBusca(livro, termo))
    : livros
  ).slice(0, 5);
}

function curtidasDoLivro(livro) {
  return Number(livro.curtidasTotal ?? livro._count?.curtidas ?? 0);
}

function renderizarSecoesGeneros() {
  const alvo = selecionar("#secoesGeneros");
  if (!alvo) return;
  const scrollPorGenero = new Map(
    selecionarTodos("#secoesGeneros .genre-section").map((secao) => [
      secao.querySelector("h4")?.textContent || "",
      secao.querySelector(".book-grid")?.scrollLeft || 0,
    ])
  );
  const termo = termoBusca();
  const livros = livrosDoAcervo().filter((livro) => !termo || livroCombinaComBusca(livro, termo));
  const generos = [...new Set(livros.map((livro) => livro.genero || "Sem gênero"))].sort((a, b) => a.localeCompare(b));

  if (!generos.length) {
    alvo.innerHTML = `<p class="empty-state">Nenhum gênero encontrado.</p>`;
    return;
  }

  alvo.innerHTML = generos.map((genero) => {
    const livrosDoGenero = livros.filter((livro) => (livro.genero || "Sem gênero") === genero);
    return `
      <section class="genre-section">
        <h4>${genero}</h4>
        <div class="book-grid compact-book-grid">
          ${livrosDoGenero.map((livro) => `
            ${htmlCardLivro(livro, estado.livroGeneroSelecionadoId, { origem: "genero" })}
            ${estado.livroGeneroSelecionadoId === livro.idLivro ? htmlDetalhesLivroInline(livro) : ""}
          `).join("")}
        </div>
      </section>
    `;
  }).join("");
  requestAnimationFrame(() => {
    selecionarTodos("#secoesGeneros .genre-section").forEach((secao) => {
      const genero = secao.querySelector("h4")?.textContent || "";
      const lista = secao.querySelector(".book-grid");
      if (lista) lista.scrollLeft = scrollPorGenero.get(genero) || 0;
    });
  });
}

function renderizarLivrosIndisponiveis() {
  const alvo = selecionar("#gradeLivrosIndisponiveis");
  if (!alvo) return;
  const scrollAnterior = alvo.scrollLeft;
  const termo = termoBusca();
  const livros = estado.livros
    .filter((livro) => livroEstaInativo(livro) || quantidadeExemplaresDisponiveis(livro.idLivro) === 0)
    .filter((livro) => !termo || livroCombinaComBusca(livro, termo));

  alvo.innerHTML = livros.length
    ? livros.map((livro) => `
      ${htmlCardLivro(livro, estado.livroIndisponivelSelecionadoId, { origem: "indisponivel" })}
      ${estado.livroIndisponivelSelecionadoId === livro.idLivro ? htmlDetalhesLivroInline(livro, { forceReservationOnly: true }) : ""}
    `).join("")
    : `<p class="empty-state">Nenhum livro indisponível para empréstimo no momento.</p>`;
  restaurarScrollHorizontal(alvo, scrollAnterior);
}

function livrosMaisReservados() {
  return livrosDoAcervo()
    .map((livro) => {
      const total = estado.reservas.filter((reserva) => reserva.livroId === livro.idLivro).length;
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

function livrosMelhorEstado() {
  return livrosDoAcervo()
    .map((livro) => {
      const exemplares = exemplaresPorLivroId(livro.idLivro);
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

function livrosEsgotados() {
  return livrosDoAcervo()
    .map((livro) => {
      const exemplares = exemplaresPorLivroId(livro.idLivro);
      const emprestados = exemplares.filter((exemplar) =>
        estado.emprestimos.some((emprestimo) =>
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

function renderizarResumoPerfil() {
  if (!estado.usuario) return;
  const userId = estado.usuario.idUsuario;
  const reservasDoUsuario = estado.reservas.filter((reserva) => reserva.usuarioId === userId);
  const emprestimosDoUsuario = estado.emprestimos.filter((emprestimo) => emprestimo.usuarioId === userId);
  const idsEmprestimosDoUsuario = new Set(emprestimosDoUsuario.map((emprestimo) => emprestimo.idEmprestimo));
  const multasDoUsuario = estado.multas.filter((multa) => idsEmprestimosDoUsuario.has(multa.idEmprestimo));

  selecionar("#profileBooksCount").textContent = estado.livros.length;
  selecionar("#profileReservationsCount").textContent = reservasDoUsuario.length;
  selecionar("#profileLoansCount").textContent = emprestimosDoUsuario.length;
  selecionar("#profileFinesCount").textContent = multasDoUsuario.length;

  renderizarListaDestaques(
    "#profileReservationsList",
    reservasDoUsuario.map((reserva) => ({
      title: tituloLivroPorId(reserva.livroId),
      detail: `Reserva ${reserva.idReserva} | ${formatarStatus(reserva.statusReserva || "ativa")}`,
    })),
    "Você ainda não fez reservas."
  );

  renderizarListaDestaques(
    "#profileLoansList",
    emprestimosDoUsuario.map((emprestimo) => ({
      title: descricaoExemplarPorId(emprestimo.exemplarId),
      detail: emprestimo.dataDevolucaoReal
        ? "Concluído"
        : `Vence em ${formatarData(emprestimo.dataVencimento)}`,
    })),
    "Você ainda não tem empréstimos."
  );

  renderizarListaDestaques(
    "#profileFinesList",
    multasDoUsuario.map((multa) => ({
      title: `Multa ${multa.idMulta}`,
      detail: `R$ ${Number(multa.valor || 0).toFixed(2)} | ${formatarStatus(multa.statusPagamento)}`,
    })),
    "Você não tem multas vinculadas."
  );

  renderizarListaDestaques(
    "#profileBooksList",
    livrosVisiveis().slice(0, 8).map((livro) => ({
      title: livro.titulo,
      detail: `${livro.autor} | ${formatarStatus(livro.status)}`,
    })),
    "Nenhum livro cadastrado."
  );
}

function renderizarListaDestaques(selector, items, emptyText) {
  const alvo = selecionar(selector);
  if (!alvo) return;
  if (!items.length) {
    alvo.innerHTML = `<p class="empty-state">${emptyText}</p>`;
    return;
  }

  alvo.innerHTML = items.map((item) => `
    <div class="insight-item">
      ${htmlCapaDestaque(item)}
      <div>
        <strong>${item.title}</strong>
        <span>${item.detail}</span>
      </div>
    </div>
  `).join("");
}

function htmlCapaDestaque(item) {
  if (!("coverUrl" in item)) return "";
  if (!item.coverUrl) {
    return `<div class="insight-cover insight-cover-placeholder">Livro</div>`;
  }

  return `<img class="insight-cover" src="${normalizarUrlImagem(item.coverUrl)}" alt="Capa de ${item.title}">`;
}

function exemplaresPorLivroId(idLivro) {
  return estado.exemplares.filter((exemplar) => exemplar.livro_id === idLivro);
}

function emprestimoAtivoDoExemplar(copyId) {
  return estado.emprestimos.some((emprestimo) =>
    emprestimo.exemplarId === copyId && !emprestimo.dataDevolucaoReal
  );
}

function quantidadeExemplaresDisponiveis(idLivro) {
  return exemplaresPorLivroId(idLivro).filter((exemplar) => !emprestimoAtivoDoExemplar(exemplar.id_exemplar)).length;
}

function formatarData(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR");
}

function livrosFiltrados() {
  const termo = termoBusca();
  const livros = livrosDoAcervo();
  if (!termo) return livros;
  return livros.filter((livro) => livroCombinaComBusca(livro, termo));
}

function termoBusca() {
  return normalizarTexto(selecionar("#globalSearch").value);
}

function livroCombinaComBusca(livro, termo) {
  return [livro.titulo, livro.autor, livro.genero]
    .filter(Boolean)
    .some((value) => normalizarTexto(value).includes(termo));
}

function livroEstaInativo(livro) {
  return normalizarStatusLivro(livro?.status) === "inativo";
}

function livrosVisiveis() {
  return ehAdmin()
    ? estado.livros
    : estado.livros.filter((livro) => !livroEstaInativo(livro));
}

function livrosDoAcervo() {
  return livrosVisiveis();
}

function usuarioPossuiMultasBloqueantes(userId = estado.usuario?.idUsuario) {
  const userLoanIds = new Set(estado.emprestimos.filter((emprestimo) => emprestimo.usuarioId === userId).map((emprestimo) => emprestimo.idEmprestimo));
  return estado.multas.some((multa) =>
    userLoanIds.has(multa.idEmprestimo) &&
    ["pendente", "aguardando_confirmacao"].includes(multa.statusPagamento)
  );
}

function renderizarLivros() {
  const livros = livrosFiltrados();
  selecionar("#booksGrid").innerHTML = livros.map((livro) => `
    ${htmlCardLivro(livro)}
    ${estado.idLivroSelecionado === livro.idLivro ? htmlDetalhesLivroInline(livro) : ""}
  `).join("");

}

function htmlCardLivro(livro, selectedId = estado.idLivroSelecionado, options = {}) {
  const origem = options.origem ? `data-book-origin="${options.origem}"` : "";
  return `
    <article class="book-card ${selectedId === livro.idLivro ? "selected" : ""}">
      ${options.rank ? `<span class="book-rank">${options.rank}º</span>` : ""}
      <button class="book-cover" type="button" data-select-book="${livro.idLivro}" ${origem} aria-label="Ver detalhes de ${livro.titulo}">
        ${htmlCapaLivro(livro)}
      </button>
      <div class="card-body">
        <span class="book-chip">${livro.genero || "Livro"}</span>
        <h3>${livro.titulo}</h3>
        <p>${livro.autor}</p>
      </div>
    </article>
  `;
}

function htmlCapaLivro(livro) {
  if (!livro.capaUrl) return `<span>Livro</span>`;
  return `<img src="${normalizarUrlImagem(livro.capaUrl)}" alt="Capa de ${livro.titulo}">`;
}

function htmlDetalhesLivroInline(livro, options = {}) {
  const exemplares = exemplaresPorLivroId(livro.idLivro);
  const emprestados = exemplares.filter((exemplar) =>
    emprestimoAtivoDoExemplar(exemplar.id_exemplar)
  ).length;
  const livroInativo = livroEstaInativo(livro);
  const bloqueadoPorMulta = !ehAdmin() && usuarioPossuiMultasBloqueantes();
  const disponiveis = livroInativo ? 0 : quantidadeExemplaresDisponiveis(livro.idLivro);
  const reserva = estado.reservas.find((item) =>
    item.livroId === livro.idLivro &&
    item.usuarioId === estado.usuario?.idUsuario &&
    ["ativa", "pronta"].includes(item.statusReserva)
  );
  let action = "";

  if (ehAdmin()) {
    action = `
        <div class="row-actions">
          <button class="secondary-btn" type="button" data-edit-book="${livro.idLivro}">Atualizar</button>
          <button class="danger-btn" type="button" data-delete-book="${livro.idLivro}">Remover</button>
        </div>
      `;
  } else if (livroInativo) {
    action = `<button class="secondary-btn book-more-btn" type="button" disabled>Livro inativo</button>`;
  } else if (bloqueadoPorMulta) {
    action = `<button class="secondary-btn book-more-btn" type="button" disabled>Reservas e empréstimos indisponíveis: pague sua multa pendente</button>`;
  } else if (options.forceReservationOnly) {
    action = reserva
      ? `<button class="reserved-btn book-more-btn" type="button" disabled>Reservado</button>`
      : `<button class="secondary-btn book-more-btn" type="button" data-reserve-book="${livro.idLivro}">Reservar livro</button>`;
  } else {
    action = `<button class="secondary-btn book-more-btn" type="button">Mais informações</button>`;
  }

  return `
    <aside class="book-detail-panel open" aria-live="polite">
      <div class="book-detail-cover">${htmlCapaLivro(livro)}</div>
    <div class="book-detail-content">
      <span class="system-tag">Sobre a obra</span>
      <h3>${livro.titulo}</h3>
      <p class="book-detail-author">${livro.autor}</p>
      <div class="book-detail-tags">
        <span>${livro.genero}</span>
        <span>${livro.anoPublicacao}</span>
        <span>${formatarStatus(livro.status)}</span>
      </div>
      <p class="book-detail-synopsis">${livro.sinopse || "Sinopse não cadastrada."}</p>
      <div class="book-detail-stats">
        <article><strong>${exemplares.length}</strong><span>exemplares</span></article>
        <article><strong>${disponiveis}</strong><span>disponíveis</span></article>
        <article><strong>${emprestados}</strong><span>emprestados</span></article>
        <article><strong>${livro.curtidasTotal || livro._count?.curtidas || 0}</strong><span>curtidas</span></article>
      </div>
      ${action}
    </div>
    </aside>
  `;
}

function formatarStatus(status) {
  const chave = normalizarStatusLivro(status);
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
  return labels[chave] || labels[status] || status || "-";
}

function renderizarUsuarios() {
  const termo = selecionar("#globalSearch").value.trim().toLowerCase();
  const usuarios = estado.usuarios.filter((usuario) =>
    !termo || [usuario.nome, usuario.nivelAcesso, usuario.curso, usuario.departamento, usuario.cargo]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(termo))
  );

  selecionar("#usersGrid").innerHTML = usuarios.map((usuario) => {
    const detalhe = usuario.curso || usuario.departamento || usuario.cargo || "Usuário do sistema";
    const urlFotoPerfil = normalizarUrlImagem(usuario.fotoPerfilUrl);
    return `
      <article class="user-card">
        <div class="user-avatar" ${urlFotoPerfil ? `style="background-image:url('${urlFotoPerfil}');background-size:cover;background-position:center"` : ""}>
          ${urlFotoPerfil ? "" : usuario.nome.slice(0, 1).toUpperCase()}
        </div>
        <h3>${usuario.nome}</h3>
        <p>${usuario.nivelAcesso}</p>
        <strong>${detalhe}</strong>
      </article>
    `;
  }).join("");
}

function renderizarOperacoes() {
  renderizarLinhasTabela(
    "#reservationsTable",
    estado.reservas.map((reserva) => `
      <tr>
        <td>${reserva.idReserva}</td>
        <td>${nomeUsuarioPorId(reserva.usuarioId)}</td>
        <td>${tituloLivroPorId(reserva.livroId)}</td>
        <td>${formatarStatus(reserva.statusReserva)}</td>
        <td>${formatarData(reserva.dataReserva)}</td>
      </tr>
    `),
    5,
    "Nenhuma reserva cadastrada."
  );

  renderizarLinhasTabela(
    "#loansTable",
    estado.emprestimos.map((emprestimo) => `
      <tr>
        <td>${emprestimo.idEmprestimo}</td>
        <td>${nomeUsuarioPorId(emprestimo.usuarioId)}</td>
        <td>${descricaoExemplarPorId(emprestimo.exemplarId)}</td>
        <td>${formatarData(emprestimo.dataSaida)}</td>
        <td>${formatarData(emprestimo.dataVencimento)}</td>
        <td>${emprestimo.dataDevolucaoReal ? "concluído" : "em aberto"}</td>
      </tr>
    `),
    6,
    "Nenhum empréstimo registrado."
  );

  renderizarLinhasTabela(
    "#finesTable",
    estado.multas.map((multa) => `
      <tr>
        <td>${multa.idMulta}</td>
        <td>${multa.idEmprestimo ?? multa.emprestimoId ?? "-"}</td>
        <td>${multa.exemplarId ?? "-"}</td>
        <td>R$ ${Number(multa.valor ?? multa.valorMulta ?? 0).toFixed(2)}</td>
        <td>${formatarStatus(multa.statusPagamento)}</td>
      </tr>
    `),
    5,
    "Nenhuma multa registrada."
  );

  renderizarLinhasTabela(
    "#copiesTable",
    estado.exemplares.map((exemplar) => `
      <tr>
        <td>${exemplar.id_exemplar}</td>
        <td>${exemplar.livro?.titulo || tituloLivroPorId(exemplar.livro_id)}</td>
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
    ...estado.exemplares.map((exemplar) => ({
      tipo: "Exemplar",
      id: exemplar.id_exemplar,
      referencia: exemplar.livro?.titulo || `Livro ${exemplar.livro_id}`,
      status: `${exemplar.codigo_tombo} | ${exemplar.estado} | ${exemplar.localizacao}`,
    })),
    ...estado.reservas.map((reserva) => ({
      tipo: "Reserva",
      id: reserva.idReserva,
      referencia: `${nomeUsuarioPorId(reserva.usuarioId)} reservou ${tituloLivroPorId(reserva.livroId)}`,
      status: reserva.statusReserva || reserva.dataReserva,
    })),
    ...estado.emprestimos.map((emprestimo) => ({
      tipo: "Empréstimo",
      id: emprestimo.idEmprestimo,
      referencia: `${nomeUsuarioPorId(emprestimo.usuarioId)} pegou ${descricaoExemplarPorId(emprestimo.exemplarId)}`,
      status: emprestimo.dataDevolucaoReal ? "concluído" : emprestimo.dataVencimento,
    })),
    ...estado.multas.map((multa) => ({
      tipo: "Multa",
      id: multa.idMulta,
      usuario: "-",
      status: multa.statusPagamento,
    })),
  ];

  selecionar("#operationsTable").innerHTML = rows.map((row) => `
    <tr><td>${row.tipo}</td><td>${row.id ?? "-"}</td><td>${row.referencia ?? row.usuario ?? "-"}</td><td>${row.status ?? "-"}</td></tr>
  `).join("");
}

function renderizarLinhasTabela(selector, rows, colunas, mensagemVazia) {
  const alvo = selecionar(selector);
  if (!alvo) return;
  alvo.innerHTML = rows.length
    ? rows.join("")
    : `<tr><td colspan="${colunas}" class="empty-table">${mensagemVazia}</td></tr>`;
}

function nomeUsuarioPorId(id) {
  return estado.usuarios.find((usuario) => usuario.idUsuario === id)?.nome || `Usuário ${id}`;
}

function tituloLivroPorId(id) {
  return estado.livros.find((livro) => livro.idLivro === id)?.titulo || `Livro ${id}`;
}

function descricaoExemplarPorId(id) {
  if (!id) return "sem exemplar vinculado";
  const exemplar = estado.exemplares.find((item) => item.id_exemplar === id);
  if (!exemplar) return `Exemplar ${id}`;
  return `Exemplar ${id} de ${exemplar.livro?.titulo || `Livro ${exemplar.livro_id}`}`;
}
