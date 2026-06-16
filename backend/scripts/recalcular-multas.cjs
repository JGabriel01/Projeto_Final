const Database = require("better-sqlite3");

const DIA = 24 * 60 * 60 * 1000;
const db = new Database("dev.db");

const multas = db.prepare(`
  SELECT
    m.id_multa,
    m.valor_multa,
    e.data_vencimento,
    e.data_devolucao_real
  FROM Multa m
  JOIN Emprestimo e ON e.id_emprestimo = m.emprestimo_id
  WHERE m.status_pagamento IN ('pendente', 'aguardando_confirmacao')
`).all();

const atualizar = db.prepare("UPDATE Multa SET valor_multa = ? WHERE id_multa = ?");
let alteradas = 0;

for (const multa of multas) {
  const vencimento = new Date(multa.data_vencimento).getTime();
  const fim = multa.data_devolucao_real ? new Date(multa.data_devolucao_real).getTime() : Date.now();
  const valor = Math.max(1, Math.ceil((fim - vencimento) / DIA));

  if (Number(multa.valor_multa) !== valor) {
    atualizar.run(valor, multa.id_multa);
    alteradas += 1;
  }
}

console.log(`${alteradas} multa(s) recalculada(s).`);
console.table(db.prepare(`
  SELECT
    m.id_multa AS multa,
    m.valor_multa AS valor,
    m.status_pagamento AS status,
    e.id_emprestimo AS emprestimo,
    e.data_vencimento AS vencimento,
    e.data_devolucao_real AS devolucao
  FROM Multa m
  JOIN Emprestimo e ON e.id_emprestimo = m.emprestimo_id
  ORDER BY m.id_multa
`).all());
