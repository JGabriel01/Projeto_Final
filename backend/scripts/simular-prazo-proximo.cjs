const Database = require("better-sqlite3");

const [, , emprestimoIdArg, diasParaVencerArg] = process.argv;
const emprestimoId = Number(emprestimoIdArg);
const diasParaVencer = Math.max(0, Number(diasParaVencerArg ?? 1));
const prazoPadraoDias = 15;
const dia = 24 * 60 * 60 * 1000;

if (!Number.isInteger(emprestimoId) || emprestimoId <= 0) {
  console.error("Uso: npm run simular:prazo-proximo -- <id_emprestimo> [dias_para_vencer]");
  console.error("Exemplo: npm run simular:prazo-proximo -- 3 1");
  process.exit(1);
}

if (!Number.isFinite(diasParaVencer) || diasParaVencer > 2) {
  console.error("Informe um valor entre 0 e 2 dias para disparar o alerta de prazo proximo.");
  process.exit(1);
}

const db = new Database("dev.db");
const emprestimo = db.prepare(`
  SELECT
    e.id_emprestimo,
    e.usuario_id,
    e.data_devolucao_real,
    l.titulo
  FROM Emprestimo e
  LEFT JOIN Exemplar x ON x.id_exemplar = e.exemplar_id
  LEFT JOIN Livro l ON l.id_livro = x.livro_id
  WHERE e.id_emprestimo = ?
`).get(emprestimoId);

if (!emprestimo) {
  console.error(`Emprestimo ${emprestimoId} nao encontrado.`);
  process.exit(1);
}

if (emprestimo.data_devolucao_real) {
  console.error(`Emprestimo ${emprestimoId} ja foi devolvido. Escolha um emprestimo ativo.`);
  process.exit(1);
}

const vencimento = new Date(Date.now() + diasParaVencer * dia);
const saida = new Date(vencimento.getTime() - prazoPadraoDias * dia);

const atualizarEmprestimo = db.prepare(`
  UPDATE Emprestimo
  SET data_saida = ?, data_vencimento = ?
  WHERE id_emprestimo = ?
`);

const buscarAlerta = db.prepare(`
  SELECT id_notificacao
  FROM Notificacao
  WHERE usuario_id = ?
    AND tipo = 'devolucao'
    AND acao = 'consultar_emprestimos'
    AND referencia_id = ?
  LIMIT 1
`);

const criarAlerta = db.prepare(`
  INSERT INTO Notificacao (tipo, mensagem, data_envio, lido, acao, referencia_id, usuario_id, id_emprestimo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const transacao = db.transaction(() => {
  atualizarEmprestimo.run(saida.toISOString(), vencimento.toISOString(), emprestimoId);

  const alertaExistente = buscarAlerta.get(emprestimo.usuario_id, emprestimoId);
  if (!alertaExistente) {
    const prazo = vencimento.toLocaleDateString("pt-BR");
    const textoPrazo = diasParaVencer === 0
      ? "vence hoje"
      : `vence em ${diasParaVencer} ${diasParaVencer === 1 ? "dia" : "dias"}`;
    criarAlerta.run(
      "devolucao",
      `O prazo de devolucao de "${emprestimo.titulo || "este livro"}" ${textoPrazo} (${prazo}).`,
      new Date().toISOString(),
      0,
      "consultar_emprestimos",
      emprestimoId,
      emprestimo.usuario_id,
      emprestimoId
    );
  }
});

transacao();

console.log(`Emprestimo ${emprestimoId} ajustado para vencimento proximo.`);
console.log(`Data de saida: ${saida.toISOString()}`);
console.log(`Data de vencimento: ${vencimento.toISOString()}`);
console.log("Alerta de devolucao criado se ainda nao existia.");
console.log("Recarregue a tela da biblioteca para visualizar a notificacao no painel.");
