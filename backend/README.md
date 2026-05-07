# Biblioteca Backend (Prisma + MySQL)

Backend completo para o Tema 10 (Sistema de Biblioteca) com autenticação JWT, CRUD de livros, empréstimos, reservas e gestão de multas.

## ⚡ Quick Start (com Docker)

### Pré-requisitos
- Docker Desktop instalado e rodando
- Node.js 16+ instalado

### Passo 1: Entre na pasta backend
```pwsh
cd backend
```

### Passo 2: Inicie MySQL e Adminer via Docker Compose
```pwsh
docker-compose up -d
```

Aguarde ~10 segundos para o MySQL inicializar.

Adminer (UI): http://localhost:8080
- Server: localhost
- User: biblioteca_user
- Password: biblioteca_pwd
- Database: biblioteca

### Passo 3: Instale dependências Node.js
```pwsh
npm install
```

### Passo 4: Gere o client Prisma e aplique as migrações
```pwsh
npx prisma migrate deploy
npx prisma generate
```

### Passo 5: Popular o banco com dados de teste
```pwsh
npm run seed
```

Credenciais de teste:
- alice@example.com / senha123
- bruno@example.com / senha456

### Passo 6: Inicie o servidor
```pwsh
npm run dev
```

Servidor: http://localhost:3000

---

## 📚 Endpoints da API

### Autenticação
- POST /registrar — Registrar novo usuário
- POST /login — Fazer login (retorna token)
- GET /saude — Verificar saúde da API

### Livros
- GET /livros — Listar todos
- GET /livros/:id — Obter um livro
- POST /livros (autenticado) — Criar livro
- PUT /livros/:id (autenticado) — Atualizar livro
- DELETE /livros/:id (autenticado) — Deletar livro

### Usuários
- GET /usuarios/perfil (autenticado) — Perfil do usuário

### Empréstimos
- GET /emprestimos/:usuarioId (autenticado) — Listar empréstimos
- POST /emprestimos (autenticado) — Emprestar livro
- POST /emprestimos/:id/devolver (autenticado) — Devolver livro

### Reservas
- GET /reservas/:usuarioId (autenticado) — Listar reservas
- POST /reservas (autenticado) — Reservar livro
- DELETE /reservas/:id (autenticado) — Cancelar reserva

### Multas
- GET /multas/:usuarioId (autenticado) — Listar multas
- POST /multas/:emprestimoId (autenticado) — Registrar multa
- PUT /multas/:id/pagar (autenticado) — Marcar multa como paga

---

## 🔐 Autenticação

Header obrigatório para endpoints protegidos:
```
Authorization: Bearer <token>
```

---

## 🐳 Parar Docker
```pwsh
docker-compose down
```

---

## 📝 Notas

- Código em português
- MySQL via docker-compose
- JWT tokens expiram em 7 dias
- Validação robusta de dados
- Pronto para integração com frontend

1. Entre na pasta `backend`:

   ```pwsh
   cd backend
   ```

2. Inicie o banco de dados MySQL e o Adminer:

   ```pwsh
   docker-compose up -d
   ```

   - Adminer (interface web): http://localhost:8080
     Use as credenciais do `docker-compose.yaml` (user: biblioteca_user, password: biblioteca_pwd, database: biblioteca)

3. Instale dependências:

   ```pwsh
   npm install
   ```

4. Gere o client Prisma e aplique a migração no MySQL (vai criar as tabelas):

   ```pwsh
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. Rode o seed (popula dados de exemplo):

   ```pwsh
   npm run seed
   ```

6. Inicie o servidor:

   ```pwsh
   npm run dev
   ```

APIs importantes (rotas em PT-BR)

- GET /livros
- POST /livros { titulo, autor, genero, ano, sinopse }
- GET /livros/:id
- PUT /livros/:id
- DELETE /livros/:id

- GET /usuarios
- POST /usuarios { nome, email }

- POST /emprestimos { usuarioId, livroId, dataVencimento }
- POST /emprestimos/:id/devolver

Notas

- O `DATABASE_URL` está configurado em `.env` para apontar ao MySQL do `docker-compose.yaml`.
- Validação do front-end e autenticação não estão implementadas aqui — este é um scaffold Prisma + API para começar.
