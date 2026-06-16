-- CreateTable
CREATE TABLE "CurtidaLivro" (
    "id_curtida" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data_curtida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,
    "livro_id" INTEGER NOT NULL,
    CONSTRAINT "CurtidaLivro_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CurtidaLivro_livro_id_fkey" FOREIGN KEY ("livro_id") REFERENCES "Livro" ("id_livro") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CurtidaLivro_usuario_id_livro_id_key" ON "CurtidaLivro"("usuario_id", "livro_id");

-- CreateIndex
CREATE INDEX "CurtidaLivro_livro_id_idx" ON "CurtidaLivro"("livro_id");
