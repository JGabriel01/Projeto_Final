-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Admin" (
    "usuario_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cargo" TEXT NOT NULL,
    CONSTRAINT "Admin_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Admin" ("cargo", "usuario_id") SELECT "cargo", "usuario_id" FROM "Admin";
DROP TABLE "Admin";
ALTER TABLE "new_Admin" RENAME TO "Admin";

CREATE TABLE "new_Aluno" (
    "usuario_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ano_ingresso" INTEGER NOT NULL,
    "curso" TEXT NOT NULL,
    "matricula_aluno" TEXT NOT NULL,
    CONSTRAINT "Aluno_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Aluno" ("ano_ingresso", "curso", "matricula_aluno", "usuario_id") SELECT "ano_ingresso", "curso", "matricula_aluno", "usuario_id" FROM "Aluno";
DROP TABLE "Aluno";
ALTER TABLE "new_Aluno" RENAME TO "Aluno";
CREATE UNIQUE INDEX "Aluno_matricula_aluno_key" ON "Aluno"("matricula_aluno");

CREATE TABLE "new_Professor" (
    "usuario_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "departamento" TEXT NOT NULL,
    "matricula_professor" TEXT NOT NULL,
    CONSTRAINT "Professor_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Professor" ("departamento", "matricula_professor", "usuario_id") SELECT "departamento", "matricula_professor", "usuario_id" FROM "Professor";
DROP TABLE "Professor";
ALTER TABLE "new_Professor" RENAME TO "Professor";
CREATE UNIQUE INDEX "Professor_matricula_professor_key" ON "Professor"("matricula_professor");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
