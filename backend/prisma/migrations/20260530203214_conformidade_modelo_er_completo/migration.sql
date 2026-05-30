/*
  Warnings:

  - You are about to drop the column `numero_ingresso` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `codigo_exemplar` on the `Exemplar` table. All the data in the column will be lost.
  - You are about to drop the column `ano_publicada` on the `Livro` table. All the data in the column will be lost.
  - You are about to drop the column `data_acesso` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `ano_ingresso` to the `Aluno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exemplar_id` to the `Emprestimo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigo_tombo` to the `Exemplar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ano_publicacao` to the `Livro` table without a default value. This is not possible if the table is not empty.
  - Added the required column `genero` to the `Livro` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel_acesso` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Aluno" (
    "id_aluno" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ano_ingresso" INTEGER NOT NULL,
    "curso" TEXT NOT NULL,
    "matricula_aluno" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    CONSTRAINT "Aluno_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Aluno" ("curso", "id_aluno", "matricula_aluno", "usuario_id") SELECT "curso", "id_aluno", "matricula_aluno", "usuario_id" FROM "Aluno";
DROP TABLE "Aluno";
ALTER TABLE "new_Aluno" RENAME TO "Aluno";
CREATE UNIQUE INDEX "Aluno_matricula_aluno_key" ON "Aluno"("matricula_aluno");
CREATE UNIQUE INDEX "Aluno_usuario_id_key" ON "Aluno"("usuario_id");
CREATE TABLE "new_Emprestimo" (
    "id_emprestimo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data_saida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_vencimento" DATETIME NOT NULL,
    "data_devolucao_real" DATETIME,
    "usuario_id" INTEGER NOT NULL,
    "exemplar_id" INTEGER NOT NULL,
    CONSTRAINT "Emprestimo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Emprestimo_exemplar_id_fkey" FOREIGN KEY ("exemplar_id") REFERENCES "Exemplar" ("id_exemplar") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Emprestimo" ("data_devolucao_real", "data_saida", "data_vencimento", "id_emprestimo", "usuario_id") SELECT "data_devolucao_real", "data_saida", "data_vencimento", "id_emprestimo", "usuario_id" FROM "Emprestimo";
DROP TABLE "Emprestimo";
ALTER TABLE "new_Emprestimo" RENAME TO "Emprestimo";
CREATE INDEX "Emprestimo_usuario_id_idx" ON "Emprestimo"("usuario_id");
CREATE INDEX "Emprestimo_exemplar_id_idx" ON "Emprestimo"("exemplar_id");
CREATE TABLE "new_Exemplar" (
    "id_exemplar" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo_tombo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL
);
INSERT INTO "new_Exemplar" ("estado", "id_exemplar", "localizacao") SELECT "estado", "id_exemplar", "localizacao" FROM "Exemplar";
DROP TABLE "Exemplar";
ALTER TABLE "new_Exemplar" RENAME TO "Exemplar";
CREATE UNIQUE INDEX "Exemplar_codigo_tombo_key" ON "Exemplar"("codigo_tombo");
CREATE TABLE "new_Livro" (
    "id_livro" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "ano_publicacao" INTEGER NOT NULL,
    "sinopse" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disponível'
);
INSERT INTO "new_Livro" ("autor", "id_livro", "sinopse", "status", "titulo") SELECT "autor", "id_livro", "sinopse", "status", "titulo" FROM "Livro";
DROP TABLE "Livro";
ALTER TABLE "new_Livro" RENAME TO "Livro";
CREATE TABLE "new_Notificacao" (
    "id_notificacao" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "data_envio" DATETIME NOT NULL,
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "usuario_id" INTEGER NOT NULL,
    "id_emprestimo" INTEGER,
    CONSTRAINT "Notificacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Notificacao_id_emprestimo_fkey" FOREIGN KEY ("id_emprestimo") REFERENCES "Emprestimo" ("id_emprestimo") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Notificacao" ("data_envio", "id_notificacao", "lido", "mensagem", "tipo", "usuario_id") SELECT "data_envio", "id_notificacao", "lido", "mensagem", "tipo", "usuario_id" FROM "Notificacao";
DROP TABLE "Notificacao";
ALTER TABLE "new_Notificacao" RENAME TO "Notificacao";
CREATE TABLE "new_Usuario" (
    "id_usuario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nivel_acesso" TEXT NOT NULL
);
INSERT INTO "new_Usuario" ("email", "id_usuario", "nome", "senha") SELECT "email", "id_usuario", "nome", "senha" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
