-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Emprestimo" (
    "id_emprestimo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data_saida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_vencimento" DATETIME NOT NULL,
    "data_devolucao_real" DATETIME,
    "usuario_id" INTEGER NOT NULL,
    "exemplar_id" INTEGER,
    CONSTRAINT "Emprestimo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Emprestimo_exemplar_id_fkey" FOREIGN KEY ("exemplar_id") REFERENCES "Exemplar" ("id_exemplar") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Emprestimo" ("data_devolucao_real", "data_saida", "data_vencimento", "exemplar_id", "id_emprestimo", "usuario_id") SELECT "data_devolucao_real", "data_saida", "data_vencimento", "exemplar_id", "id_emprestimo", "usuario_id" FROM "Emprestimo";
DROP TABLE "Emprestimo";
ALTER TABLE "new_Emprestimo" RENAME TO "Emprestimo";
CREATE INDEX "Emprestimo_usuario_id_idx" ON "Emprestimo"("usuario_id");
CREATE INDEX "Emprestimo_exemplar_id_idx" ON "Emprestimo"("exemplar_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
