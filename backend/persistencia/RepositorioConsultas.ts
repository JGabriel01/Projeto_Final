import { prisma } from "../config/prismaClient.js";

export class RepositorioConsultas {
  private normalizarBigInt<T>(dados: T): T {
    return JSON.parse(
      JSON.stringify(dados, (_chave, valor) =>
        typeof valor === "bigint" ? Number(valor) : valor
      )
    ) as T;
  }

  async emprestimosAtivosPorUsuario(usuarioId?: number) {
    const filtroUsuario = usuarioId ? `AND u.id_usuario = ${Number(usuarioId)}` : "";
    const dados = await prisma.$queryRawUnsafe(`
      SELECT
        u.nome AS nomeUsuario,
        l.titulo AS tituloLivro,
        e.data_saida AS dataSaida,
        e.data_vencimento AS dataVencimento
      FROM Emprestimo e
      INNER JOIN Usuario u ON u.id_usuario = e.usuario_id
      INNER JOIN Exemplar ex ON ex.id_exemplar = e.exemplar_id
      INNER JOIN Livro l ON l.id_livro = ex.livro_id
      WHERE e.data_devolucao_real IS NULL
      ${filtroUsuario}
      ORDER BY e.data_vencimento ASC
    `);
    return this.normalizarBigInt(dados);
  }

  async livrosMaisEmprestados(limite: number = 10, dataInicio?: Date, dataFim?: Date) {
    const filtros: string[] = [];
    if (dataInicio) filtros.push(`e.data_saida >= '${dataInicio.toISOString()}'`);
    if (dataFim) filtros.push(`e.data_saida <= '${dataFim.toISOString()}'`);
    const where = filtros.length > 0 ? `WHERE ${filtros.join(" AND ")}` : "";

    const dados = await prisma.$queryRawUnsafe(`
      SELECT
        l.titulo AS titulo,
        l.autor AS autor,
        COUNT(e.id_emprestimo) AS totalEmprestimos
      FROM Emprestimo e
      INNER JOIN Exemplar ex ON ex.id_exemplar = e.exemplar_id
      INNER JOIN Livro l ON l.id_livro = ex.livro_id
      ${where}
      GROUP BY l.id_livro, l.titulo, l.autor
      ORDER BY totalEmprestimos DESC
      LIMIT ${Number(limite)}
    `);
    return this.normalizarBigInt(dados);
  }

  async multasPendentesPorUsuario() {
    const dados = await prisma.$queryRawUnsafe(`
      SELECT
        u.nome AS nomeUsuario,
        u.email AS email,
        m.valor_multa AS valorMulta,
        m.data_geracao AS dataGeracao
      FROM Multa m
      INNER JOIN Emprestimo e ON e.id_emprestimo = m.emprestimo_id
      INNER JOIN Usuario u ON u.id_usuario = e.usuario_id
      WHERE LOWER(m.status_pagamento) = 'pendente'
      ORDER BY m.data_geracao DESC
    `);
    return this.normalizarBigInt(dados);
  }

  async relatorioUsoMensal(dataInicio: Date, dataFim: Date) {
    const dados = await prisma.$queryRawUnsafe(`
      SELECT
        strftime('%Y-%m', e.data_saida) AS mesAno,
        COUNT(DISTINCT e.id_emprestimo) AS totalEmprestimos,
        COUNT(DISTINCT m.id_multa) AS totalMultasGeradas,
        COALESCE(SUM(m.valor_multa), 0) AS valorTotalMultas
      FROM Emprestimo e
      LEFT JOIN Multa m ON m.emprestimo_id = e.id_emprestimo
      WHERE e.data_saida BETWEEN '${dataInicio.toISOString()}' AND '${dataFim.toISOString()}'
      GROUP BY strftime('%Y-%m', e.data_saida)
      ORDER BY mesAno ASC
    `);
    return this.normalizarBigInt(dados);
  }

  async disponibilidadeExemplaresPorLivro() {
    const dados = await prisma.$queryRawUnsafe(`
      SELECT
        l.titulo AS tituloLivro,
        COUNT(ex.id_exemplar) AS exemplaresDisponiveis
      FROM Livro l
      INNER JOIN Exemplar ex ON ex.livro_id = l.id_livro
      WHERE NOT EXISTS (
        SELECT 1
        FROM Emprestimo e
        WHERE e.exemplar_id = ex.id_exemplar
          AND e.data_devolucao_real IS NULL
      )
      GROUP BY l.id_livro, l.titulo
      ORDER BY l.titulo ASC
    `);
    return this.normalizarBigInt(dados);
  }
}
