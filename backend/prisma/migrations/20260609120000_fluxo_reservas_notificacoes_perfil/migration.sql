-- Campos para central de notificacoes e acoes direcionadas
ALTER TABLE "Notificacao" ADD COLUMN "acao" TEXT;
ALTER TABLE "Notificacao" ADD COLUMN "referencia_id" INTEGER;

-- Campos para fila de reserva pronta por 1 hora
ALTER TABLE "Reserva" ADD COLUMN "notificado_em" DATETIME;

-- Campos para controle de extensoes de emprestimo
ALTER TABLE "Emprestimo" ADD COLUMN "renovacoes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Emprestimo" ADD COLUMN "status_extensao" TEXT NOT NULL DEFAULT 'nenhuma';

-- Solicitacoes de exclusao de contas admin, aprovadas por outro admin
CREATE TABLE "SolicitacaoExclusaoAdmin" (
    "id_solicitacao" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "admin_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "data_criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_decisao" DATETIME,
    "decidido_por" INTEGER,
    CONSTRAINT "SolicitacaoExclusaoAdmin_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Usuario" ("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "SolicitacaoExclusaoAdmin_admin_id_idx" ON "SolicitacaoExclusaoAdmin"("admin_id");
