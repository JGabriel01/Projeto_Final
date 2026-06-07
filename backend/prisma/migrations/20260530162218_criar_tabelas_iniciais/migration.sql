-- CreateTable
CREATE TABLE "Notificacao" (
    "id_notificacao" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "data_envio" DATETIME NOT NULL,
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "usuario_id" INTEGER NOT NULL,
    CONSTRAINT "Notificacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "data_acesso" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id_aluno" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero_ingresso" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "matricula_aluno" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    CONSTRAINT "Aluno_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Professor" (
    "id_professor" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "departamento" TEXT NOT NULL,
    "matricula_professor" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    CONSTRAINT "Professor_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Admin" (
    "id_admin" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cargo" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    CONSTRAINT "Admin_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Livro" (
    "id_livro" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "ano_publicada" INTEGER NOT NULL,
    "sinopse" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disponível'
);

-- CreateTable
CREATE TABLE "Exemplar" (
    "id_exemplar" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo_exemplar" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id_reserva" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data_reserva" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_expiracao" DATETIME NOT NULL,
    "status_reserva" TEXT NOT NULL DEFAULT 'ativa',
    "usuario_id" INTEGER NOT NULL,
    "livro_id" INTEGER NOT NULL,
    CONSTRAINT "Reserva_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reserva_livro_id_fkey" FOREIGN KEY ("livro_id") REFERENCES "Livro" ("id_livro") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Emprestimo" (
    "id_emprestimo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data_saida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_vencimento" DATETIME NOT NULL,
    "data_devolucao_real" DATETIME,
    "usuario_id" INTEGER NOT NULL,
    CONSTRAINT "Emprestimo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Multa" (
    "id_multa" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "valor_multa" REAL NOT NULL,
    "status_pagamento" TEXT NOT NULL DEFAULT 'pendente',
    "data_geracao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_pagamento" DATETIME,
    "emprestimo_id" INTEGER NOT NULL,
    "exemplar_id" INTEGER NOT NULL,
    CONSTRAINT "Multa_emprestimo_id_fkey" FOREIGN KEY ("emprestimo_id") REFERENCES "Emprestimo" ("id_emprestimo") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Multa_exemplar_id_fkey" FOREIGN KEY ("exemplar_id") REFERENCES "Exemplar" ("id_exemplar") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pertence" (
    "id_pertence" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "livro_id" INTEGER NOT NULL,
    "exemplar_id" INTEGER NOT NULL,
    CONSTRAINT "Pertence_livro_id_fkey" FOREIGN KEY ("livro_id") REFERENCES "Livro" ("id_livro") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pertence_exemplar_id_fkey" FOREIGN KEY ("exemplar_id") REFERENCES "Exemplar" ("id_exemplar") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Notificacao_usuario_id_key" ON "Notificacao"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_numero_ingresso_key" ON "Aluno"("numero_ingresso");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_matricula_aluno_key" ON "Aluno"("matricula_aluno");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_usuario_id_key" ON "Aluno"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_matricula_professor_key" ON "Professor"("matricula_professor");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_usuario_id_key" ON "Professor"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_usuario_id_key" ON "Admin"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "Exemplar_codigo_exemplar_key" ON "Exemplar"("codigo_exemplar");

-- CreateIndex
CREATE INDEX "Reserva_usuario_id_idx" ON "Reserva"("usuario_id");

-- CreateIndex
CREATE INDEX "Reserva_livro_id_idx" ON "Reserva"("livro_id");

-- CreateIndex
CREATE INDEX "Emprestimo_usuario_id_idx" ON "Emprestimo"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "Multa_emprestimo_id_key" ON "Multa"("emprestimo_id");

-- CreateIndex
CREATE INDEX "Pertence_livro_id_idx" ON "Pertence"("livro_id");

-- CreateIndex
CREATE INDEX "Pertence_exemplar_id_idx" ON "Pertence"("exemplar_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pertence_livro_id_exemplar_id_key" ON "Pertence"("livro_id", "exemplar_id");
