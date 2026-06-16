-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Exemplar" (
    "id_exemplar" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo_tombo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "livro_id" INTEGER NOT NULL,
    CONSTRAINT "Exemplar_livro_id_fkey" FOREIGN KEY ("livro_id") REFERENCES "Livro" ("id_livro") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Exemplar" (
    "id_exemplar",
    "codigo_tombo",
    "estado",
    "localizacao",
    "livro_id"
)
SELECT
    e."id_exemplar",
    e."codigo_tombo",
    e."estado",
    e."localizacao",
    p."livro_id"
FROM "Exemplar" e
INNER JOIN "Pertence" p ON p."exemplar_id" = e."id_exemplar";

DROP TABLE "Exemplar";
ALTER TABLE "new_Exemplar" RENAME TO "Exemplar";
CREATE UNIQUE INDEX "Exemplar_codigo_tombo_key" ON "Exemplar"("codigo_tombo");
CREATE INDEX "Exemplar_livro_id_idx" ON "Exemplar"("livro_id");

DROP TABLE "Pertence";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
