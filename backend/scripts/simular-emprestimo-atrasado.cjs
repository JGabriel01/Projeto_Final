const Database = require("better-sqlite3");

const [, , emprestimoIdArg, diasAtrasoArg] = process.argv;
const emprestimoId = Number(emprestimoIdArg);
const diasAtraso = Math.max(1, Number(diasAtrasoArg || 1));
const prazoPadraoDias = 15;
const dia = 24 * 60 * 60 * 1000;

if (!Number.isInteger(emprestimoId) || emprestimoId <= 0) {
  console.error("Uso: npm run simular:atraso -- <id_emprestimo> [dias_atraso]");
  process.exit(1);
}

const db = new Database("dev.db");
const emprestimo = db.prepare(`
  SELECT id_emprestimo, data_saida, data_vencimento, data_devolucao_real
  FROM Emprestimo
  WHERE id_emprestimo = ?
`).get(emprestimoId);

if (!emprestimo) {
  console.error(`Emprestimo ${emprestimoId} nao encontrado.`);
  process.exit(1);
}

if (emprestimo.data_devolucao_real) {
  console.error(`Emprestimo ${emprestimoId} ja foi devolvido. Escolha um emprestimo ativo.`);
  process.exit(1);
}

const vencimento = new Date(Date.now() - diasAtraso * dia);
const saida = new Date(vencimento.getTime() - prazoPadraoDias * dia);

db.prepare(`
  UPDATE Emprestimo
  SET data_saida = ?, data_vencimento = ?
  WHERE id_emprestimo = ?
`).run(saida.toISOString(), vencimento.toISOString(), emprestimoId);

console.log(`Emprestimo ${emprestimoId} simulado com ${diasAtraso} dia(s) de atraso.`);
console.log(`Data de saida: ${saida.toISOString()}`);
console.log(`Data de vencimento: ${vencimento.toISOString()}`);
console.log("Recarregue a tela da biblioteca para o sistema gerar a multa e bloquear novas reservas/emprestimos.");
