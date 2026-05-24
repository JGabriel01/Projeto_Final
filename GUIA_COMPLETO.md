# 📚 Guia Completo - Sistema de Biblioteca

**Um guia abrangente desde a inicialização até a arquitetura avançada**

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Início Rápido - 5 Passos](#início-rápido---5-passos)
4. [Arquitetura em Camadas](#arquitetura-em-camadas)
5. [Componentes do Sistema](#componentes-do-sistema)
6. [API REST - Todos os Endpoints](#api-rest---todos-os-endpoints)
7. [Autenticação JWT](#autenticação-jwt)
8. [Armazenamento com MinIO](#armazenamento-com-minio)
9. [Fluxos Completos de Negócio](#fluxos-completos-de-negócio)
10. [Exemplos Práticos com cURL](#exemplos-práticos-com-curl)
11. [Troubleshooting e Problemas Comuns](#troubleshooting-e-problemas-comuns)
12. [Estrutura de Pastas Explicada](#estrutura-de-pastas-explicada)
13. [Compilação e Execução](#compilação-e-execução)
14. [Modelo ER do Projeto](#modelo-er-do-projeto)
15. [Próximos Passos e Melhorias](#próximos-passos-e-melhorias)

---

## 🎯 Visão Geral

Este é um **Sistema de Biblioteca completo** que atende aos requisitos de duas disciplinas:

### Requisitos PWEB (Programação Web)
- ✅ Backend com **Node.js** e **Express**
- ✅ **REST API** com padrão RESTful
- ✅ **JWT** para autenticação
- ✅ **MinIO** para armazenamento de arquivos

### Requisitos POO (Programação Orientada a Objetos)
- ✅ **TypeScript** em todo o projeto
- ✅ **Prisma** para persistência
- ✅ **Arquitetura em 3 camadas** (separação de responsabilidades)
- ✅ **Múltiplas entidades relacionadas** (5 modelos com relacionamentos)

### O Que o Sistema Faz

```
┌─────────────────────────────────────┐
│   USUÁRIO (Autenticado com JWT)    │
├─────────────────────────────────────┤
│ • Registrar/Login                  │
│ • Ver catálogo de livros           │
│ • Emprestar livros                 │
│ • Ler PDFs de livros emprestados   │
│ • Reservar livros indisponíveis    │
│ • Pagar multas por atraso          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   BIBLIOTECÁRIO (Admin)             │
├─────────────────────────────────────┤
│ • Adicionar/editar/deletar livros   │
│ • Gerenciar catálogo                │
│ • Visualizar relatórios             │
└─────────────────────────────────────┘
```

---

## 🔧 Pré-requisitos

Você precisa ter instalado **antes de começar**:

### 1. Node.js 16+ (com npm)
```bash
# Verificar instalação
node -v
npm -v

# Download: https://nodejs.org/
```

### 2. Docker Desktop
```bash
# Verificar instalação
docker --version
docker ps

# Download: https://www.docker.com/products/docker-desktop
```

### 3. Git (opcional mas recomendado)
```bash
git --version

# Download: https://git-scm.com/
```

### 4. Editor de código (VS Code recomendado)
```
Download: https://code.visualstudio.com/
```

---

## 🚀 Início Rápido - 5 Passos

Se você quer **colocar rodando agora**, siga esses 5 passos:

### Passo 1️⃣: Entrar na pasta backend

```bash
cd Projeto_Final/backend
```

### Passo 2️⃣: Instalar dependências

```bash
npm install
```

**O que faz:** Baixa todas as bibliotecas necessárias (express, prisma, typescript, etc)  
**Tempo:** 2-3 minutos  
**Resultado:** Pasta `node_modules/` criada

### Passo 3️⃣: Configurar variáveis de ambiente

```bash
cp .env.example .env
```

**O que faz:** Cria arquivo `.env` com configurações padrão  
**Não mude nada:** Valores padrão funcionam localmente

### Passo 4️⃣: Iniciar Docker Compose

```bash
docker-compose up -d
```

**O que faz:** Inicia 3 containers:
- MySQL (banco de dados na porta 3306)
- MinIO (armazenamento na porta 9000 e 9001)
- Adminer (gerenciador de BD na porta 8080)

**Verifique:** 
```bash
docker ps
```

Você deve ver 3 containers rodando: `biblioteca_db`, `biblioteca_minio`, `biblioteca_adminer`

### Passo 5️⃣: Preparar BD e iniciar servidor

```bash
# Executar migrações (criar tabelas)
npx prisma migrate dev

# Iniciar servidor em modo desenvolvimento
npm run dev
```

**Saída esperada:**
```
✅ Servidor rodando em http://localhost:3000
📚 API REST - Sistema de Biblioteca
🔐 JWT Autenticação ativada
📦 MinIO armazenamento ativado
```

### ✅ Pronto! A API está rodando!

Você pode acessar:
- API: **http://localhost:3000**
- Health: **http://localhost:3000/saude**
- Adminer: **http://localhost:8080**
- MinIO: **http://localhost:9001**

---

## 🏗️ Arquitetura em Camadas

### O Conceito

A arquitetura divide a aplicação em **3 camadas**, cada uma com uma responsabilidade clara:

```
┌─────────────────────────────────────┐
│   APRESENTAÇÃO (Camada de HTTP)     │ ← Controllers, Routes, Middlewares
├─────────────────────────────────────┤
│   NEGÓCIO (Camada de Lógica)        │ ← Services, Validações, Regras
├─────────────────────────────────────┤
│   PERSISTÊNCIA (Camada de Dados)    │ ← Repositories, Prisma, BD
└─────────────────────────────────────┘
```

### Por Que 3 Camadas?

| Benefício | Explicação |
|-----------|-----------|
| **Separação de Responsabilidades** | Cada camada faz uma coisa e faz bem |
| **Testabilidade** | Cada camada pode ser testada isoladamente |
| **Manutenibilidade** | Fácil encontrar e corrigir bugs |
| **Escalabilidade** | Fácil adicionar novas features |
| **Reusabilidade** | Services podem ser usados por múltiplos controllers |

### 1️⃣ Camada de Apresentação (src/apresentacao)

**Responsabilidade:** Lidar com requisições HTTP e devolver respostas JSON

**Componentes:**
- `controladores/` - Recebem requisições, chamam services, retornam respostas
- `middlewares/` - Autenticação JWT, validações
- `rotas/` - Definem endpoints REST

**Exemplo:**
```typescript
// controlador-livro.ts
async criar(req: Request, res: Response): Promise<void> {
  try {
    // 1. Extrai dados da requisição
    const dados = req.body;
    const arquivo = req.file?.buffer;
    
    // 2. Chama o serviço
    const livro = await servicoLivro.criar(dados, arquivo);
    
    // 3. Retorna resposta
    res.status(201).json(livro);
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
}
```

### 2️⃣ Camada de Negócio (src/negocio)

**Responsabilidade:** Executar a lógica de domínio e validações

**Componentes:**
- `servicos/` - Orquestram repositórios e aplicam regras de negócio

**Exemplo:**
```typescript
// servico-emprestimo.ts
async devolver(id: number): Promise<Emprestimo> {
  // Regra de negócio: Se atrasado, criar multa
  const hoje = new Date();
  if (hoje > emprestimo.dataVencimento) {
    const diasAtraso = calcularDias(hoje, emprestimo.dataVencimento);
    const multa = diasAtraso * 5.0; // R$ 5/dia
    await repositorioMulta.criar(usuarioId, emprestimoId, multa);
  }
  
  return await repositorioEmprestimo.devolverLivro(id);
}
```

### 3️⃣ Camada de Persistência (src/persistencia)

**Responsabilidade:** Acessar e manipular dados no banco de dados

**Componentes:**
- `repositorios/` - Encapsulam Prisma, fornecem interface de dados

**Exemplo:**
```typescript
// repositorio-livro.ts
async criar(dados: CriarLivroDTO): Promise<Livro> {
  return await prisma.livro.create({
    data: {
      titulo: dados.titulo,
      autor: dados.autor,
      // ... outros campos
    }
  });
}
```

### Fluxo Completo de uma Requisição

```
1. CLIENT
   GET /api/livros/5/ler
   Authorization: Bearer TOKEN

2. MIDDLEWARE (autenticacao.ts)
   ✓ Valida token JWT
   ✓ Define req.usuario

3. CONTROLLER (controlador-livro.ts)
   obterArquivoParaLeitura(req, res) {
     • Extrai livroId = 5, usuarioId = 1
     • Chama servicoEmprestimo.validarLeitura(1, 5)
     • Chama servicoLivro.obterArquivoParaLeitura(5)
   }

4. SERVICE (servico-emprestimo.ts)
   validarLeitura(usuarioId, livroId) {
     • Busca empréstimo ativo
     • Valida se não expirou
     • Retorna empréstimo ou erro
   }

5. REPOSITORY (repositorio-emprestimo.ts)
   listarPorUsuario(usuarioId) {
     await prisma.emprestimo.findMany(...)
   }

6. DATABASE
   SELECT * FROM emprestimo WHERE usuarioId = 1

7. RESPOSTA
   {
     "url": "https://minio:9000/...",
     "mensagem": "URL de acesso gerada"
   }
```

---

## 🔌 Componentes do Sistema

### Tecnologias Utilizadas

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Node.js** | 16+ | Runtime JavaScript |
| **Express** | 4.18 | Framework web |
| **TypeScript** | 5.3 | Linguagem com tipos |
| **Prisma** | 5.9 | ORM para banco de dados |
| **MySQL** | 8.0 | Banco de dados (Docker) |
| **MinIO** | latest | Armazenamento S3 (Docker) |
| **JWT** | 9.0 | Token de autenticação |
| **bcryptjs** | 2.4 | Hash de senhas |
| **Multer** | 1.4 | Upload de arquivos |

### Entidades do Banco de Dados

```sql
┌──────────────────────────────────────────────┐
│ USUARIO                                      │
│ ├─ id (PK)                                   │
│ ├─ nome                                      │
│ ├─ email (UNIQUE)                            │
│ ├─ senha (hash bcrypt)                       │
│ └─ criadoEm (timestamp)                      │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ LIVRO                                        │
│ ├─ id (PK)                                   │
│ ├─ titulo                                    │
│ ├─ autor                                     │
│ ├─ genero                                    │
│ ├─ ano                                       │
│ ├─ sinopse                                   │
│ ├─ disponivel (boolean)                      │
│ ├─ capa (URL MinIO)                          │
│ └─ arquivo (URL MinIO PDF)                   │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ EMPRESTIMO                                   │
│ ├─ id (PK)                                   │
│ ├─ usuarioId (FK)                            │
│ ├─ livroId (FK)                              │
│ ├─ dataEmprestimo                            │
│ ├─ dataVencimento                            │
│ └─ dataDevolucao (nullable)                  │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ RESERVA                                      │
│ ├─ id (PK)                                   │
│ ├─ usuarioId (FK)                            │
│ ├─ livroId (FK)                              │
│ ├─ reservadoEm                               │
│ └─ status ('ativa'|'cancelada'|'retirada')   │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ MULTA                                        │
│ ├─ id (PK)                                   │
│ ├─ usuarioId (FK)                            │
│ ├─ emprestimoId (FK UNIQUE)                  │
│ ├─ valorMulta                                │
│ ├─ dataMulta                                 │
│ └─ pago (boolean)                            │
└──────────────────────────────────────────────┘
```

### Relacionamentos

```
┌─────────┐ 1 ────── N ┌─────────────┐ 1 ───── 1 ┌──────┐
│ Usuario │           │ Emprestimo  │           │ Multa│
└─────────┘           │             │           └──────┘
    │                 └─────────────┘
    │                       │
    │                       │
    │ 1                  Livro
    │                    (N:N)
    │                       │
    │                       │
    └─────────────────────────
           Reserva (N:N)
```

---

## 📡 API REST - Todos os Endpoints

### Convenções REST

| Método | Significado | Exemplo |
|--------|-------------|---------|
| **GET** | Obter dados | `GET /api/livros` |
| **POST** | Criar dados | `POST /api/livros` |
| **PUT** | Atualizar dados | `PUT /api/livros/1` |
| **DELETE** | Deletar dados | `DELETE /api/livros/1` |

### Códigos de Status HTTP

| Código | Significado | Exemplo |
|--------|-------------|---------|
| **200** | OK - Sucesso | Listagem retornou dados |
| **201** | Created - Criado | Livro foi criado com sucesso |
| **204** | No Content - Deletado | Livro foi deletado (sem resposta) |
| **400** | Bad Request - Erro | Dados inválidos |
| **401** | Unauthorized - Não autenticado | Token ausente ou inválido |
| **404** | Not Found - Não encontrado | Livro com id=999 não existe |
| **422** | Unprocessable Entity - Validação | Campo obrigatório faltando |

### 🔐 Autenticação (`/api/auth`)

#### 1. Registrar novo usuário
```
POST /api/auth/registrar
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "senha": "senha123"
}

✅ 201 Created
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "criadoEm": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. Fazer login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@exemplo.com",
  "senha": "senha123"
}

✅ 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": { ... }
}
```

#### 3. Obter perfil (autenticado)
```
GET /api/auth/perfil
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

✅ 200 OK
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "criadoEm": "2024-01-15T10:30:00Z"
}
```

### 📚 Livros (`/api/livros`)

#### 1. Listar todos os livros (público)
```
GET /api/livros

✅ 200 OK
[
  {
    "id": 1,
    "titulo": "Dom Casmurro",
    "autor": "Machado de Assis",
    "genero": "Romance",
    "ano": 1899,
    "sinopse": "...",
    "disponivel": true,
    "capa": "capas-livros/1705319400000-abc",
    "arquivo": "livros-pdfs/1705319400001-xyz"
  }
]
```

#### 2. Listar apenas livros disponíveis (público)
```
GET /api/livros/disponiveis

✅ 200 OK
[...]
```

#### 3. Buscar livros (público)
```
GET /api/livros/buscar?termo=Machado

✅ 200 OK
[...] // Livros com "Machado" no título ou autor
```

#### 4. Obter detalhes de um livro (público)
```
GET /api/livros/1

✅ 200 OK
{
  "id": 1,
  "titulo": "Dom Casmurro",
  ...
}

❌ 404 Not Found
{ "erro": "Livro não encontrado" }
```

#### 5. Criar novo livro (autenticado)
```
POST /api/livros
Authorization: Bearer TOKEN
Content-Type: multipart/form-data

titulo: "Dom Casmurro"
autor: "Machado de Assis"
genero: "Romance"
ano: 1899
sinopse: "..."
capa: [arquivo PNG/JPG] (opcional)
arquivo: [arquivo PDF] (opcional)

✅ 201 Created
{ "id": 1, ... }
```

#### 6. Atualizar livro (autenticado)
```
PUT /api/livros/1
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "titulo": "Dom Casmurro - Edição Revisada",
  "sinopse": "Novo texto"
}

✅ 200 OK
{ "id": 1, ... }
```

#### 7. Obter arquivo para leitura (autenticado)
```
GET /api/livros/1/ler
Authorization: Bearer TOKEN

✅ 200 OK
{
  "url": "https://minio:9000/livros-pdfs/...?X-Amz-...",
  "mensagem": "URL de acesso gerada com sucesso. Válida por 24 horas."
}

❌ 400 Bad Request
{ "erro": "Você precisa emprestar este livro para lê-lo" }
```

#### 8. Deletar livro (autenticado)
```
DELETE /api/livros/1
Authorization: Bearer TOKEN

✅ 204 No Content
(sem resposta)
```

### 🎫 Empréstimos (`/api/emprestimos`)

#### 1. Listar todos (autenticado)
```
GET /api/emprestimos
Authorization: Bearer TOKEN

✅ 200 OK
[...]
```

#### 2. Listar de um usuário (autenticado)
```
GET /api/emprestimos/usuario/1
Authorization: Bearer TOKEN

✅ 200 OK
[...]
```

#### 3. Criar empréstimo (autenticado)
```
POST /api/emprestimos
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "usuarioId": 1,
  "livroId": 5,
  "diasEmprestimo": 14
}

✅ 201 Created
{
  "id": 12,
  "usuarioId": 1,
  "livroId": 5,
  "dataEmprestimo": "2024-01-15T10:00:00Z",
  "dataVencimento": "2024-01-29T10:00:00Z",
  "dataDevolucao": null
}
```

#### 4. Devolver livro (autenticado)
```
PUT /api/emprestimos/12/devolver
Authorization: Bearer TOKEN

✅ 200 OK
{
  "id": 12,
  ...
  "dataDevolucao": "2024-01-20T14:30:00Z"
}

⚠️ Se atrasado: Cria multa automaticamente
```

#### 5. Renovar empréstimo (autenticado)
```
PUT /api/emprestimos/12/renovar
Authorization: Bearer TOKEN

✅ 200 OK
{
  "id": 12,
  ...
  "dataVencimento": "2024-02-12T10:00:00Z"
}
```

### 📌 Reservas (`/api/reservas`)

#### 1. Criar reserva (autenticado)
```
POST /api/reservas
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "usuarioId": 1,
  "livroId": 3
}

✅ 201 Created
{
  "id": 8,
  "usuarioId": 1,
  "livroId": 3,
  "reservadoEm": "2024-01-15T11:00:00Z",
  "status": "ativa"
}
```

#### 2. Ver fila de reservas de um livro (autenticado)
```
GET /api/reservas/livro/3/fila
Authorization: Bearer TOKEN

✅ 200 OK
[
  { "id": 8, "usuarioId": 1, ... },
  { "id": 9, "usuarioId": 2, ... }
]
```

#### 3. Cancelar reserva (autenticado)
```
PUT /api/reservas/8/cancelar
Authorization: Bearer TOKEN

✅ 200 OK
{ "status": "cancelada" }
```

#### 4. Marcar como retirada (autenticado)
```
PUT /api/reservas/8/retirada
Authorization: Bearer TOKEN

✅ 200 OK
{ "status": "retirada" }
```

### 💰 Multas (`/api/multas`)

#### 1. Listar multas do usuário (autenticado)
```
GET /api/multas/usuario/1
Authorization: Bearer TOKEN

✅ 200 OK
[
  {
    "id": 3,
    "usuarioId": 1,
    "emprestimoId": 12,
    "valorMulta": 15.00,
    "dataMulta": "2024-01-29T10:45:00Z",
    "pago": false
  }
]
```

#### 2. Ver multas não pagas (autenticado)
```
GET /api/multas/usuario/1/nao-pagas
Authorization: Bearer TOKEN

✅ 200 OK
{
  "multas": [...],
  "total": 15.00
}
```

#### 3. Pagar multa (autenticado)
```
PUT /api/multas/3/pagar
Authorization: Bearer TOKEN

✅ 200 OK
{
  "id": 3,
  ...
  "pago": true
}
```

---

## 🔐 Autenticação JWT

### O Que é JWT?

JWT = **JSON Web Token** - Um padrão de token autenticado

```
Token JWT = Header.Payload.Signature

Exemplo:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJpZCI6MSwi...
.NFlqQU5J7Y...
```

### Fluxo de Autenticação

```
1. USUÁRIO REGISTRA/FAZ LOGIN
   POST /api/auth/registrar
   { nome, email, senha }
                ↓
2. SERVIDOR
   • Hash da senha com bcrypt
   • Gera token JWT com payload { id, email }
   • Token tem expiração de 24h
                ↓
3. RESPOSTA
   { token: "abc123...", usuario: { id: 1, ... } }
                ↓
4. CLIENTE ARMAZENA TOKEN
   localStorage.setItem('token', 'abc123...')
                ↓
5. PRÓXIMAS REQUISIÇÕES
   Authorization: Bearer abc123...
                ↓
6. MIDDLEWARE VALIDA
   • Extrai token do header
   • Verifica assinatura com JWT_SECRET
   • Define req.usuario com dados
   • Permite requisição continuar
```

### Como Usar

#### Guardar token após login:
```javascript
const res = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, senha })
});

const data = await res.json();
localStorage.setItem('token', data.token); // Guardar
```

#### Usar token em requisições autenticadas:
```javascript
const token = localStorage.getItem('token');

const res = await fetch('http://localhost:3000/api/livros', {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
});
```

### Segurança

✅ **Token é seguro porque:**
- Assinado com JWT_SECRET (chave secreta no servidor)
- Impossível falsificar sem a chave
- Expira após 24 horas
- Servidor valida assinatura a cada requisição

⚠️ **Boas práticas:**
- Nunca commit JWT_SECRET no Git
- Sempre use HTTPS em produção
- Guarde token em localStorage (frontend)
- Limpe token ao fazer logout

---

## 📦 Armazenamento com MinIO

### O Que é MinIO?

MinIO é um servidor **S3-compatível** que armazena arquivos localmente.

```
Cliente
   ↓
Express API
   ↓
MinIO Server
   ↓
/minio_data (Diretório local)
```

### Como Funciona

```
1. USUÁRIO FAZ UPLOAD
   POST /api/livros
   -F "arquivo=@livro.pdf"
                ↓
2. CONTROLLER RECEBE
   req.file.buffer = dados do arquivo
                ↓
3. SERVICE FAZ UPLOAD
   servicoArmazenamento.enviarLivroPDF(nome, buffer)
                ↓
4. MINIO ARMAZENA
   /minio_data/livros-pdfs/1705319400000-xyz.pdf
                ↓
5. MINIO RETORNA
   "livros-pdfs/1705319400000-xyz.pdf"
                ↓
6. SALVA NO BD
   UPDATE livro SET arquivo = "livros-pdfs/..."
```

### URLs Temporárias

Para segurança, MinIO gera **URLs temporárias** (válidas por 24 horas):

```
Sem autenticação:
https://minio:9000/livros-pdfs/arquivo.pdf (inválido, precisa de token)

Com token:
https://minio:9000/livros-pdfs/arquivo.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&...
(válida por 24 horas)
```

### Dashboard MinIO

Acesse: **http://localhost:9001**

Credenciais:
- Access Key: `minioadmin`
- Secret Key: `minioadmin`

Você verá:
- Buckets: `capas-livros` e `livros-pdfs`
- Arquivos armazenados
- Gerenciar permissões

### Buckets

```
┌─────────────────────────────────────┐
│ MINIO                               │
├─────────────────────────────────────┤
│ ├─ capas-livros/                    │
│ │  └─ 1705319400000-abc.png         │
│ │  └─ 1705319400001-def.png         │
│ │                                   │
│ └─ livros-pdfs/                     │
│    └─ 1705319400002-xyz.pdf         │
│    └─ 1705319400003-uvw.pdf         │
└─────────────────────────────────────┘
```

---

## 🔄 Fluxos Completos de Negócio

### Fluxo 1: Registrar e Fazer Login

```
┌─────────────────────────────────────────┐
│ 1. USUÁRIO ACESSA TELA DE REGISTRO      │
│    Preenche: nome, email, senha         │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 2. POST /api/auth/registrar             │
│    { nome, email, senha }               │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 3. SERVIDOR                             │
│    • Valida email com regex             │
│    • Verifica se email já existe        │
│    • Hash da senha com bcrypt           │
│    • Cria usuário no BD                 │
│    • Gera token JWT                     │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 4. RESPOSTA                             │
│    { token: "...", usuario: {...} }    │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 5. CLIENTE                              │
│    • Guarda token em localStorage       │
│    • Redireciona para home              │
└─────────────────────────────────────────┘
```

### Fluxo 2: Emprestar um Livro

```
┌──────────────────────────────────────────────┐
│ 1. USUÁRIO VÊ CATÁLOGO                       │
│    GET /api/livros/disponiveis               │
│    (sem autenticação)                        │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ 2. USUÁRIO CLICA "EMPRESTAR"                 │
│    POST /api/emprestimos                     │
│    { usuarioId: 1, livroId: 5 }              │
│    (com token)                               │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ 3. SERVIDOR - ServicoEmprestimo.criar()      │
│    • Valida se livro existe                  │
│    • Valida se livro está disponível         │
│    • Se não: erro 400                        │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ 4. SERVIDOR - Regra de Negócio               │
│    • Marca livro como indisponível           │
│    • Cria empréstimo com:                    │
│      - dataEmprestimo = hoje                 │
│      - dataVencimento = hoje + 14 dias       │
│      - dataDevolucao = null                  │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ 5. RESPOSTA                                  │
│    { id: 12, usuarioId: 1, livroId: 5, ... }│
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ 6. CLIENTE                                   │
│    Mostra: "Livro emprestado até 29/01"      │
└──────────────────────────────────────────────┘
```

### Fluxo 3: Ler um Livro

```
┌──────────────────────────────────────────────┐
│ 1. USUÁRIO TEM EMPRÉSTIMO ATIVO              │
│    de um livro com arquivo PDF               │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ 2. USUÁRIO CLICA "LER LIVRO"                 │
│    GET /api/livros/5/ler                     │
│    (com token)                               │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ 3. SERVIDOR - Valida Leitura                 │
│    • Procura empréstimo ativo do livro       │
│    • Verifica se data de vencimento > hoje   │
│    • Se não: erro 400                        │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ 4. SERVIDOR - Gera URL Temporária            │
│    • Busca arquivo no BD (MinIO)             │
│    • Gera URL presigned (válida 24h)         │
│    • Retorna URL ao cliente                  │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ 5. RESPOSTA                                  │
│    {                                         │
│      "url": "https://minio:9000/...",        │
│      "mensagem": "Válida por 24 horas"       │
│    }                                         │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ 6. CLIENTE                                   │
│    • Abre URL em nova aba                    │
│    • PDF carrega no navegador                │
│    • Usuário lê o livro                      │
└──────────────────────────────────────────────┘
```

### Fluxo 4: Devolver Livro com Atraso

```
┌───────────────────────────────────────────────┐
│ 1. DATA VENCIMENTO: 29/01                     │
│    DATA DEVOLUÇÃO: 02/02 (ATRASADO!)          │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│ 2. USUÁRIO CLICA "DEVOLVER LIVRO"             │
│    PUT /api/emprestimos/12/devolver           │
│    (com token)                                │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│ 3. SERVIDOR - ServicoEmprestimo.devolver()    │
│    • Marca livro como disponível              │
│    • Atualiza dataDevolucao = 02/02           │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│ 4. REGRA: Calcular Multa                      │
│    const diasAtraso = 02/02 - 29/01 = 4 dias │
│    const multa = 4 * 5.00 = R$ 20.00          │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│ 5. CRIAR MULTA                                │
│    INSERT INTO multa (                        │
│      usuarioId=1,                             │
│      emprestimoId=12,                         │
│      valorMulta=20.00,                        │
│      pago=false                               │
│    )                                          │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│ 6. RESPOSTA                                   │
│    {                                          │
│      "id": 12,                                │
│      "dataDevolucao": "2024-02-02T...",       │
│      "mensagem": "Livro devolvido com sucesso"│
│    }                                          │
└──────────────┬────────────────────────────────┘
               ↓
┌───────────────────────────────────────────────┐
│ 7. CLIENTE NOTIFICA                           │
│    "Atenção! Você tem uma multa de R$ 20.00" │
│    "Clique para pagar"                        │
└───────────────────────────────────────────────┘
```

### Fluxo 5: Pagar Multa

```
┌──────────────────────────────────┐
│ 1. USUÁRIO VÊ MULTA NAO PAGA     │
│    GET /api/multas/usuario/1/... │
│    { id: 3, valor: 20.00 }       │
└────────────┬───────────────────────┘
             ↓
┌──────────────────────────────────┐
│ 2. USUÁRIO CLICA "PAGAR"         │
│    PUT /api/multas/3/pagar       │
│    (com token)                   │
└────────────┬───────────────────────┘
             ↓
┌──────────────────────────────────┐
│ 3. SERVIDOR                      │
│    UPDATE multa                  │
│    SET pago = true               │
│    WHERE id = 3                  │
└────────────┬───────────────────────┘
             ↓
┌──────────────────────────────────┐
│ 4. RESPOSTA                      │
│    { id: 3, pago: true }         │
└────────────┬───────────────────────┘
             ↓
┌──────────────────────────────────┐
│ 5. CLIENTE                       │
│    "Multa paga com sucesso!"     │
│    Remove multa da lista         │
└──────────────────────────────────┘
```

---

## 📝 Exemplos Práticos com cURL

### Setup: Guardar Token

```bash
# 1. Registrar e obter token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João",
    "email": "joao@ex.com",
    "senha": "123456"
  }' | jq -r '.token')

echo "Token: $TOKEN"

# 2. Agora você pode usar em outras requisições
curl -X GET http://localhost:3000/api/livros \
  -H "Authorization: Bearer $TOKEN"
```

### Exemplo 1: Criar um Livro com Arquivo

```bash
curl -X POST http://localhost:3000/api/livros \
  -H "Authorization: Bearer $TOKEN" \
  -F "titulo=Dom Casmurro" \
  -F "autor=Machado de Assis" \
  -F "genero=Romance" \
  -F "ano=1899" \
  -F "sinopse=Uma história de amor e ciúmes em um palácio do século XIX" \
  -F "capa=@/caminho/para/capa.png" \
  -F "arquivo=@/caminho/para/livro.pdf"
```

### Exemplo 2: Listar Livros Disponíveis

```bash
curl -X GET http://localhost:3000/api/livros/disponiveis
```

### Exemplo 3: Emprestar um Livro

```bash
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": 1,
    "livroId": 5,
    "diasEmprestimo": 14
  }'
```

### Exemplo 4: Ler um Livro

```bash
# Obter URL
curl -X GET http://localhost:3000/api/livros/5/ler \
  -H "Authorization: Bearer $TOKEN"

# Salvar resposta em variável
RESPONSE=$(curl -s -X GET http://localhost:3000/api/livros/5/ler \
  -H "Authorization: Bearer $TOKEN")

URL=$(echo $RESPONSE | jq -r '.url')
echo "Abra no navegador: $URL"
```

### Exemplo 5: Ver Multas Não Pagas

```bash
curl -X GET http://localhost:3000/api/multas/usuario/1/nao-pagas \
  -H "Authorization: Bearer $TOKEN"
```

### Exemplo 6: Pagar Multa

```bash
curl -X PUT http://localhost:3000/api/multas/3/pagar \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔧 Troubleshooting e Problemas Comuns

### ❌ Erro: "Port 3000 already in use"

**Causa:** Outro programa está usando porta 3000

**Solução Windows (PowerShell):**
```powershell
# Encontrar processo
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Matar processo
Stop-Process -Id <PID> -Force
```

**Solução Linux/Mac:**
```bash
lsof -i :3000
kill -9 <PID>
```

### ❌ Erro: "Cannot connect to Docker daemon"

**Causa:** Docker Desktop não está rodando

**Solução:**
1. Abra Docker Desktop
2. Aguarde ícone ficar verde
3. Verifique: `docker ps`

### ❌ Erro: "ERROR: pull access denied"

**Causa:** Sem internet ou registry não acessível

**Solução:**
```bash
docker login
docker-compose up -d
```

### ❌ Erro: "connect ECONNREFUSED 127.0.0.1:3306"

**Causa:** MySQL não está rodando

**Solução:**
```bash
docker-compose up -d
docker ps # Verificar se db está rodando
```

### ❌ Erro: "EADDRINUSE: address already in use :::3306"

**Causa:** Porta 3306 já está em uso

**Solução:**
```bash
# Parar containers
docker-compose down

# Ou mudar porta em docker-compose.yaml
# "3307:3306"
```

### ❌ Erro ao fazer `npm install`

**Causa:** Node ou npm não instalado corretamente

**Solução:**
```bash
node -v  # Deve ser 16+
npm -v   # Deve ser 8+

# Se não funcionar, reinstale Node.js
```

### ❌ Erro: "Unexpected end of JSON"

**Causa:** .env não foi criado

**Solução:**
```bash
cp .env.example .env
```

### ❌ Erro: "Cannot find module 'express'"

**Causa:** node_modules não foi instalado

**Solução:**
```bash
npm install
```

### ❌ Erro de Autenticação JWT

**Causa:** Token expirado (24h) ou inválido

**Solução:**
```bash
# Faça login novamente para obter novo token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"...","senha":"..."}'
```

### ✅ Verificar Saúde do Sistema

```bash
# Health check
curl http://localhost:3000/saude

# Resposta esperada:
# { "status": "ok", "timestamp": "2024-01-15T..." }

# Verificar containers
docker ps

# Ver logs
docker-compose logs -f
docker-compose logs db
docker-compose logs minio

# Acessar banco via Adminer
# http://localhost:8080
```

---

## 📁 Estrutura de Pastas Explicada

```
Projeto_Final/
│
├── README.md                     ← Visão geral do projeto
├── INICIO_RAPIDO.md             ← Como começar em 5 passos
├── ARQUITETURA.md               ← Explicação da arquitetura
├── DOCUMENTACAO.md              ← Guia de qual doc ler
├── GUIA_COMPLETO.md             ← ESTE ARQUIVO
│
├── modeloER/
│   └── modeloER.brM3            ← Diagrama ER (Brmodelo)
│
└── backend/
    │
    ├── src/                     ← Código-fonte (TypeScript)
    │   ├── servidor.ts          ← Arquivo principal
    │   ├── README.md            ← Documentação técnica
    │   │
    │   ├── apresentacao/        ← 🎨 Camada de Apresentação
    │   │   ├── controladores/   ← Controllers
    │   │   │   ├── controlador-autenticacao.ts
    │   │   │   ├── controlador-livro.ts
    │   │   │   ├── controlador-emprestimo.ts
    │   │   │   ├── controlador-reserva.ts
    │   │   │   └── controlador-multa.ts
    │   │   │
    │   │   ├── middlewares/     ← Middlewares
    │   │   │   └── autenticacao.ts (valida JWT)
    │   │   │
    │   │   └── rotas/           ← Rotas REST
    │   │       ├── rotas-autenticacao.ts
    │   │       ├── rotas-livro.ts
    │   │       ├── rotas-emprestimo.ts
    │   │       ├── rotas-reserva.ts
    │   │       └── rotas-multa.ts
    │   │
    │   ├── negocio/             ← 💼 Camada de Negócio
    │   │   └── servicos/        ← Services
    │   │       ├── servico-autenticacao.ts
    │   │       ├── servico-livro.ts
    │   │       ├── servico-emprestimo.ts
    │   │       ├── servico-reserva.ts
    │   │       ├── servico-multa.ts
    │   │       └── servico-armazenamento.ts (MinIO)
    │   │
    │   ├── persistencia/        ← 💾 Camada de Persistência
    │   │   └── repositorios/    ← Repositories
    │   │       ├── repositorio-usuario.ts
    │   │       ├── repositorio-livro.ts
    │   │       ├── repositorio-emprestimo.ts
    │   │       ├── repositorio-reserva.ts
    │   │       └── repositorio-multa.ts
    │   │
    │   ├── modelos/             ← 📝 Tipos TypeScript
    │   │   └── tipos.ts         ← Interfaces
    │   │
    │   └── utilitarios/         ← 🔧 Funções Auxiliares
    │       ├── autenticacao.ts  ← JWT (gerarToken, verificarToken)
    │       ├── validadores.ts   ← Validações
    │       └── minio-cliente.ts ← Cliente MinIO
    │
    ├── prisma/                  ← 📊 Banco de Dados
    │   ├── schema.prisma        ← Schema (5 modelos)
    │   └── seed.js              ← Dados iniciais
    │
    ├── dist/                    ← 📦 Código compilado (gerado)
    │
    ├── node_modules/            ← 📚 Dependências (gerado)
    │
    ├── package.json             ← Dependências do projeto
    ├── tsconfig.json            ← Configuração TypeScript
    ├── docker-compose.yaml      ← Configuração Docker
    ├── .env.example             ← Variáveis de ambiente
    │
    ├── README.md                ← Documentação técnica
    ├── SETUP.md                 ← Setup com Docker
    ├── EXEMPLOS_USO.md          ← Exemplos com curl
    │
    └── .gitignore              ← Arquivos ignorados pelo Git
```

### Fluxo de Criação de Arquivo em uma Requisição

```
Requisição HTTP
    ↓
src/servidor.ts (carrega rotas)
    ↓
src/apresentacao/rotas/*.ts (router.post/get/put/delete)
    ↓
src/apresentacao/controladores/*.ts (método criar/ler/atualizar)
    ↓
src/negocio/servicos/*.ts (lógica de negócio)
    ↓
src/persistencia/repositorios/*.ts (acesso ao BD)
    ↓
prisma/schema.prisma (modelo de dados)
    ↓
MySQL (dados armazenados)
    ↓
Resposta JSON
```

---

## ⚙️ Compilação e Execução

### Compilação TypeScript

O projeto usa **TypeScript com Node16 module resolution** para melhor compatibilidade com módulos modernos.

**Arquivo de configuração:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "Node16",              ← Módulos CommonJS com suporte Node16
    "moduleResolution": "node16",    ← Resolução de módulos moderna
    "outDir": "./dist",              ← Saída compilada
    "rootDir": "./src",              ← Código-fonte
    "strict": false                  ← Menos restritivo para POO
  }
}
```

### Comandos de Build

```bash
# Compilar TypeScript para JavaScript
npm run build

# Compilar sem parar em erros
npx tsc --skipLibCheck

# Compilar com watch (recompila ao salvar)
npx tsc --watch

# Limpar dist e recompilar
rm -r dist && npm run build
```

### Executando o Servidor

```bash
# Modo desenvolvimento (com hot-reload)
npm run dev

# Modo produção (compilado)
npm start

# Com ts-node (sem compilação prévia)
npx ts-node src/servidor.ts

# Com tsx (mais rápido)
npx tsx src/servidor.ts
```

### Saída Esperada

```
✅ Servidor rodando em http://localhost:3000
📚 API REST - Sistema de Biblioteca
🔐 JWT Autenticação ativada
📦 MinIO armazenamento ativado
```

### Problemas de Compilação Comuns

#### ❌ "Cannot find module"
**Causa:** Caminhos de import incorretos

**Solução:** TypeScript está na pasta `src/negocio/servicos/`, então imports devem usar `../../` para subir 2 níveis:
```typescript
// ✅ CORRETO
import { servicoLivro } from '../../servicos/servico-livro';

// ❌ ERRADO
import { servicoLivro } from '../servicos/servico-livro';
```

#### ❌ "Type 'string' is not assignable to type '...'"
**Causa:** Prisma retorna tipos genéricos que precisam de type casting

**Solução:** Use `as` para type casting:
```typescript
const resultado = await prisma.reserva.create(...);
return resultado as Reserva;  // ← Type casting
```

---

## 📊 Modelo ER do Projeto

### Visualização BRModelo

O modelo entidade-relacionamento segue o padrão **BRModelo** com 5 entidades principais:

```
┌──────────┐    realiza (1:N)    ┌──────────────┐
│ USUARIO  │────────────────────→ │ EMPRESTIMO   │
│ ────────── │                    │ ──────────── │
│ PK: id     │                    │ PK: id       │
│ nome       │                    │ FK: usuarioId│
│ email*     │                    │ FK: livroId  │
│ senha      │                    │ (campos...)  │
│ criadoEm   │                    └──────────────┘
└──────────┘           │                  │
    │                  │              gera│ 1:1
    │recebe (1:N)      │                  ↓
    │                  │            ┌──────────┐
    ↓                  └───────────→│  MULTA   │
┌──────────┐       empresa 1:N      │ ────────│
│ MULTA    │←───────────────────────│ PK: id   │
│ ────────│                         │ FK: usuarioId
│ (campos)│                         │ FK: emprestimoId
└──────────┘                        │ valor...
    ↓                              └──────────┘
┌──────────┐    é emprestado       ┌──────────┐
│  LIVRO   │←───────────────────── │ EMPRESTIMO│
│ ────────│       1:N              │ ──────────│
│ PK: id   │      ↑                │ (campos) │
│ titulo   │      │                └──────────┘
│ autor    │      │
│ genero   │      └───ativa 1:N
│ (campos) │                 ┌─────────┐
└──────────┘                │ RESERVA │
    │                       │ ────────│
    └──reservado 1:N──────→ │ PK: id  │
                            │ status  │
                            └─────────┘
```

**Cardinalidade:**
- **1:N** (Um para Muitos) - Um usuário pode fazer N empréstimos
- **1:1** (Um para Um) - Um empréstimo gera no máximo uma multa
- **N:N** (Muitos para Muitos) - Não há neste projeto

**Arquivo do modelo:** `modeloER/modeloER.brM3` (BRModelo 3.0)

---

## 🚀 Próximos Passos e Melhorias

### Curto Prazo (Melhorias Imediatas)

- [ ] **Criar Frontend** (React/Vue/Angular)
  - Tela de Login/Registro
  - Catálogo de livros
  - Painel do usuário
  - Leitor de PDF integrado

- [ ] **Adicionar Testes**
  ```bash
  npm install --save-dev jest @types/jest
  ```
  - Testes unitários (Services)
  - Testes de integração (Endpoints)

- [ ] **Validação Avançada**
  ```bash
  npm install zod
  ```
  - Validar schemas de entrada

- [ ] **Rate Limiting**
  ```bash
  npm install express-rate-limit
  ```
  - Proteger contra abuso

### Médio Prazo (Funcionalidades)

- [ ] **Notificações Email**
  ```bash
  npm install nodemailer
  ```
  - Aviso de vencimento (7 dias antes)
  - Confirmação de empréstimo
  - Aviso de multa

- [ ] **Logging Estruturado**
  ```bash
  npm install winston
  ```
  - Rastrear ações dos usuários
  - Relatórios de atividade

- [ ] **Autenticação OAuth**
  ```bash
  npm install passport passport-google-oauth20
  ```
  - Login com Google
  - Login com GitHub

- [ ] **Paginação**
  - Adicionar offset/limit em listagens
  - Melhorar performance em BD grande

### Longo Prazo (Escala)

- [ ] **Cache (Redis)**
  ```bash
  npm install redis
  ```
  - Cache de consultas frequentes
  - Session management

- [ ] **Message Queue (RabbitMQ)**
  - Processar uploads assincronamente
  - Enviar emails em background

- [ ] **CI/CD (GitHub Actions)**
  - Testes automáticos
  - Deploy automático
  - Verificação de código

- [ ] **Monitoring (Prometheus/Grafana)**
  - Métricas de performance
  - Alertas

### Deploy (Colocar em Produção)

```bash
# 1. Escolher hosting (Heroku, AWS, DigitalOcean, Render)
# 2. Configurar variáveis de produção
# 3. Usar banco de dados gerenciado (RDS, MongoDB Atlas)
# 4. Usar armazenamento em nuvem (S3, Azure Blob)
# 5. Configurar HTTPS (SSL/TLS)
# 6. Configurar CDN (CloudFront, CloudFlare)
# 7. Fazer backup automático
# 8. Monitorar logs e erros
```

---

## 📚 Leitura Adicional

Para aprofundar em conceitos:

### JWT e Autenticação
- https://jwt.io/
- https://tools.ietf.org/html/rfc7519

### REST API Design
- https://restfulapi.net/
- https://www.rfc-editor.org/rfc/rfc7231

### TypeScript
- https://www.typescriptlang.org/docs/
- https://www.typescriptlang.org/docs/handbook/

### Prisma
- https://www.prisma.io/docs/
- https://www.prisma.io/docs/getting-started/quickstart

### Express.js
- https://expressjs.com/
- https://expressjs.com/en/api.html

### Docker
- https://docs.docker.com/
- https://docs.docker.com/compose/

### MinIO
- https://min.io/
- https://docs.min.io/

---

## ✅ Checklist Final

Você está pronto para usar o sistema quando conseguir fazer:

- [ ] Instalar dependências com `npm install`
- [ ] Iniciar Docker com `docker-compose up -d`
- [ ] Executar migrações com `npx prisma migrate dev`
- [ ] Iniciar servidor com `npm run dev`
- [ ] Acessar health check em `http://localhost:3000/saude`
- [ ] Registrar novo usuário via POST `/api/auth/registrar`
- [ ] Fazer login via POST `/api/auth/login`
- [ ] Listar livros via GET `/api/livros`
- [ ] Criar empréstimo via POST `/api/emprestimos`
- [ ] Ler livro via GET `/api/livros/:id/ler`
- [ ] Devolver livro via PUT `/api/emprestimos/:id/devolver`
- [ ] Ver multas via GET `/api/multas/usuario/:id`
- [ ] Pagar multa via PUT `/api/multas/:id/pagar`

---

## 🎉 Parabéns!

Você agora tem um **Sistema de Biblioteca completo e profissional** que:

✅ Atende requisitos de **PWEB** (Node.js, REST API, JWT, MinIO)  
✅ Atende requisitos de **POO** (TypeScript, Prisma, 3 camadas)  
✅ Pode ser **testado localmente** com Docker  
✅ Tem **documentação completa**  
✅ Segue **boas práticas** de desenvolvimento  
✅ Está pronto para **evoluir**  

---

**Qualquer dúvida, consulte os documentos específicos ou explore o código-fonte em `backend/src/`**

**Bom desenvolvimento! 🚀📚**
