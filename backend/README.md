# Projeto Final - Sistema de Biblioteca

Tema 10: Sistema de Biblioteca.

API REST em Node.js, Express, TypeScript e Prisma para gerenciar usuarios, livros, exemplares, emprestimos, reservas, multas, notificacoes e relatorios de uso da biblioteca.

## Funcionalidades

- Catalogo de livros.
- Cadastro e controle de exemplares fisicos.
- Cadastro de usuarios com perfis de aluno, professor e admin.
- Emprestimos e devolucoes de exemplares.
- Reservas de livros.
- Multas por atraso.
- Notificacoes para usuarios.
- Consultas e relatorios exigidos no projeto de banco.
- Autenticacao JWT para rotas protegidas.
- Upload de capas de livros com MinIO.

## Tecnologias

- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite com `better-sqlite3`
- JWT
- bcrypt para hash de senhas
- MinIO

O banco usado atualmente e SQLite. O arquivo local fica em:

```text
dev.db
```

## Como Rodar

```bash
npm install
copy .env.example .env
npm run server
```

Servidor:

```text
http://localhost:3000
```

Verificar TypeScript:

```bash
npm run build
```

Validar Prisma:

```bash
npx prisma validate
npx prisma migrate status
```

## MinIO

O MinIO e usado para armazenar capas dos livros. Para subir localmente:

```bash
docker compose -f docker-compose.minio.yml up -d
```

Console:

```text
http://localhost:9001
usuario: minioadmin
senha: minioadmin
```

## Estrutura Principal

```text
backend/
  config/          conexao Prisma e cliente MinIO
  controller/      controladores com tratamento de erro
  excecoes/        excecoes customizadas
  middleware/      autenticacao JWT
  negocios/        classes de dominio e validacoes
  persistencia/    repositorios Prisma e consultas SQL
  prisma/          schema, migrations e banco SQLite
  rotas/           rotas Express
  servicos/        servicos externos, como MinIO
  server.ts        API REST
```

## Modelo de Dados

Entidades principais:

- `Usuario`
- `Aluno`
- `Professor`
- `Admin`
- `Livro`
- `Exemplar`
- `Emprestimo`
- `Reserva`
- `Multa`
- `Notificacao`

Observacao importante: `Aluno`, `Professor` e `Admin` usam `usuario_id` como PK/FK para `Usuario`, sem uma segunda PK propria.
`Exemplar` pertence diretamente a `Livro` por meio de `livro_id`, seguindo o modelo relacional do PDF.

## Autenticacao

Login:

```text
POST /api/auth/login
```

Body:

```json
{
  "email": "ana@biblioteca.com",
  "senha": "Senha123"
}
```

As rotas protegidas usam:

```text
Authorization: Bearer SEU_TOKEN
```

Rotas de autenticacao:

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

## Rotas Principais

Status:

```text
GET /api/status
```

Usuarios:

```text
GET    /api/usuarios
GET    /api/usuarios/:id
POST   /api/usuarios/alunos
POST   /api/usuarios/professores
POST   /api/usuarios/admins
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id
POST   /api/excluirNomeCadastro
DELETE /api/excluirNomeCadastro
```

Livros:

```text
GET    /api/livros
GET    /api/livros/:id
POST   /api/livros
PUT    /api/livros/:id
DELETE /api/livros/:id
POST   /api/livros/:id/capa
```

Exemplares:

```text
GET    /api/exemplares
GET    /api/exemplares/:id
POST   /api/exemplares
PUT    /api/exemplares/:id
DELETE /api/exemplares/:id
```

Emprestimos:

```text
GET    /api/emprestimos
GET    /api/emprestimos/:id
POST   /api/emprestimos
PUT    /api/emprestimos/:id
PATCH  /api/emprestimos/:id/devolucao
DELETE /api/emprestimos/:id
```

Reservas:

```text
GET    /api/reservas
GET    /api/reservas/:id
GET    /api/reservas/usuario/:usuarioId
POST   /api/reservas
PUT    /api/reservas/:id
DELETE /api/reservas/:id
```

Multas:

```text
GET    /api/multas
GET    /api/multas/pendentes
GET    /api/multas/:id
POST   /api/multas
POST   /api/multas/gerar-por-emprestimo/:emprestimoId
PUT    /api/multas/:id
DELETE /api/multas/:id
```

Notificacoes:

```text
GET    /api/notificacoes
GET    /api/notificacoes/:id
GET    /api/notificacoes/usuario/:usuarioId
POST   /api/notificacoes
PUT    /api/notificacoes/:id
PATCH  /api/notificacoes/:id/lida
DELETE /api/notificacoes/:id
```

## Consultas do Projeto de Banco

As consultas exigidas no PDF estao em:

```text
GET /api/consultas/emprestimos-ativos
GET /api/consultas/livros-mais-emprestados
GET /api/consultas/multas-pendentes
GET /api/consultas/relatorio-uso-mensal
GET /api/consultas/disponibilidade-exemplares
```

Elas cobrem:

- emprestimos ativos por usuario;
- livros mais emprestados;
- multas pendentes por usuario;
- relatorio mensal de uso;
- disponibilidade de exemplares por livro.

## Fluxo Rapido com cURL

Criar admin:

```bash
curl -X POST http://localhost:3000/api/usuarios/admins ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Ana Admin\",\"email\":\"ana@biblioteca.com\",\"senha\":\"Senha123\",\"cargo\":\"Gerente\"}"
```

Fazer login:

```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"ana@biblioteca.com\",\"senha\":\"Senha123\"}"
```

Criar livro:

```bash
curl -X POST http://localhost:3000/api/livros ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer SEU_TOKEN" ^
  -d "{\"titulo\":\"Clean Code\",\"autor\":\"Robert Martin\",\"genero\":\"Programacao\",\"anoPublicacao\":2008,\"sinopse\":\"Livro sobre codigo limpo e boas praticas.\"}"
```

Criar exemplar:

```bash
curl -X POST http://localhost:3000/api/exemplares ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer SEU_TOKEN" ^
  -d "{\"livroId\":1,\"codigoTombo\":\"TOMBO001\",\"estado\":\"bom\",\"localizacao\":\"Prateleira A1\"}"
```

Criar emprestimo:

```bash
curl -X POST http://localhost:3000/api/emprestimos ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer SEU_TOKEN" ^
  -d "{\"usuarioId\":1,\"exemplarId\":1}"
```

Registrar devolucao:

```bash
curl -X PATCH http://localhost:3000/api/emprestimos/1/devolucao ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer SEU_TOKEN" ^
  -d "{}"
```

Consultar livros mais emprestados:

```bash
curl http://localhost:3000/api/consultas/livros-mais-emprestados ^
  -H "Authorization: Bearer SEU_TOKEN"
```

Enviar capa para MinIO:

```bash
curl -X POST http://localhost:3000/api/livros/1/capa ^
  -H "Authorization: Bearer SEU_TOKEN" ^
  -F "capa=@capa.jpg"
```

## Validacoes e Erros

O projeto usa classes de negocio com validacoes e excecoes customizadas:

- email e senha;
- matriculas;
- campos obrigatorios;
- status de livro, reserva, multa e notificacao;
- datas de emprestimo e reserva;
- valor de multa;
- codigo de tombo e estado de exemplar.
- senhas sao armazenadas com hash bcrypt no banco.

Os controladores retornam sempre um formato padrao:

```json
{
  "sucesso": false,
  "erro": {
    "mensagem": "Mensagem do erro",
    "tipo": "ErroValidacao"
  }
}
```

## Scripts Uteis

```bash
npm run server
npm run build
npm run dev
npx prisma validate
npx prisma migrate status
npx prisma generate
```

## Observacoes

- O projeto usa SQLite, mesmo que exista dependencia `mysql2` instalada.
- Senhas antigas em texto puro sao convertidas para hash bcrypt automaticamente no primeiro login valido.
- Rotas de escrita e rotas administrativas usam JWT.
- Rotas publicas de consulta simples de livros e exemplares ficam abertas.
- O modelo ER da pasta `modeloER/` nao deve ser usado como fonte final se houver divergencia com o schema Prisma.
