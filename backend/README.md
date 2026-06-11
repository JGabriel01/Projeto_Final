# Projeto Final - Sistema de Biblioteca

Este projeto é uma API REST para gerenciamento de uma biblioteca escolar/institucional. A aplicação permite cadastrar usuários, livros e exemplares físicos, registrar empréstimos e devoluções, controlar reservas, gerar multas por atraso, enviar notificações e consultar relatórios de uso da biblioteca.

O backend foi desenvolvido em Node.js com Express, TypeScript e Prisma ORM. O banco de dados usado atualmente é SQLite, armazenado no arquivo `dev.db`.

## Objetivo do Projeto

O sistema resolve o problema de controle manual de biblioteca, centralizando informações como:

- acervo de livros;
- exemplares físicos;
- usuários com níveis de acesso;
- empréstimos ativos e históricos;
- reservas de livros;
- multas por atraso;
- notificações ao usuário;
- consultas e relatórios exigidos no projeto de banco de dados.

## Tecnologias Usadas

- `Node.js`: ambiente de execução JavaScript no backend.
- `Express`: framework usado para criar a API REST.
- `TypeScript`: adiciona tipagem ao JavaScript.
- `Prisma ORM`: faz o mapeamento entre classes/tabelas e banco de dados.
- `SQLite`: banco local usado no arquivo `dev.db`.
- `better-sqlite3`: driver usado pelo Prisma para conectar no SQLite.
- `JWT`: token usado para autenticar rotas protegidas.
- `bcryptjs`: usado para gerar e verificar hash bcrypt das senhas.
- `MinIO`: usado para armazenar arquivos de capa dos livros.
- `Multer`: middleware usado para receber upload de arquivo no Express.
- `Docker Compose`: usado para subir o MinIO localmente.

## Requisitos Atendidos

- Backend com Node.js e Express.
- Padrão REST API com prefixo `/api`.
- Mais de uma entidade relacionada: usuário, livro, exemplar, empréstimo, reserva, multa e notificação.
- JWT em rotas autenticadas.
- Armazenamento de arquivos no MinIO.
- Prisma/SQLite como camada de persistência.
- Classes de domínio com encapsulamento, getters e setters.
- Herança entre `Usuario`, `Aluno`, `Professor` e `Admin`.
- Validações com exceções customizadas.
- Controladores com `try/catch`.
- CRUD e rotas para as principais entidades.
- Consultas SQL exigidas no projeto de banco.

## Como Executar o Projeto

Entre na pasta `backend`:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
copy .env.example .env
```

Execute o servidor:

```bash
npm run server
```

Servidor local:

```text
http://localhost:3000
```

Rota de teste:

```text
GET http://localhost:3000/api/status
```

## Comandos Úteis

```bash
npm run server
```

Inicia a API REST com `server.ts`.

```bash
npm run build
```

Verifica se o TypeScript compila corretamente.

```bash
npx prisma validate
```

Valida o arquivo `prisma/schema.prisma`.

```bash
npx prisma migrate status
```

Mostra se o banco está atualizado com as migrations.

```bash
npx prisma generate
```

Regenera o Prisma Client em `generated/prisma`.

```bash
npm run dev
```

Executa o script de demonstração configurado em `package.json`.

## Como Executar o MinIO

O MinIO é usado para salvar capas de livros e imagens de perfil. Os dados ficam em `backend/minio-data`, uma pasta do próprio projeto, para que as imagens acompanhem o código quando a pasta for copiada para outro computador.

Subir o serviço:

```bash
docker compose -f docker-compose.minio.yml up -d
```

Console web:

```text
http://localhost:9001
```

Credenciais padrão:

```text
usuario: minioadmin
senha: minioadmin
```

Se você já tinha imagens no volume Docker antigo, copie o volume para a pasta do projeto antes de levar para outro PC:

```powershell
docker compose -f docker-compose.minio.yml down
docker run --rm -v backend_minio_data:/from -v ${PWD}/minio-data:/to alpine sh -c "cp -a /from/. /to/"
```

## Banco de Dados

O banco atual é SQLite.

Arquivo:

```text
dev.db
```

Configuração Prisma:

```text
prisma/schema.prisma
```

Cliente Prisma:

```text
config/prismaClient.ts
```

Observações importantes:

- `Aluno`, `Professor` e `Admin` usam `usuario_id` como chave primária e estrangeira para `Usuario`.
- `Exemplar` pertence diretamente a `Livro` por meio de `livro_id`.
- Senhas são armazenadas com hash bcrypt.
- Senhas antigas em texto puro são convertidas automaticamente para hash no primeiro login válido.

## Estrutura de Pastas

```text
backend/
  config/
  controller/
  excecoes/
  middleware/
  negocios/
  persistencia/
  prisma/
  rotas/
  servicos/
```

Cada pasta separa uma responsabilidade:

- `config`: configurações de conexão com banco e MinIO.
- `controller`: regras de entrada, tratamento de erros e chamada dos repositórios.
- `excecoes`: classes de erro customizadas.
- `middleware`: funções intermediárias do Express, como autenticação JWT.
- `negocios`: classes de domínio, validações, encapsulamento e regras de negócio.
- `persistencia`: acesso ao banco com Prisma e consultas SQL.
- `prisma`: schema, migrations e configuração do banco.
- `rotas`: endpoints REST da API.
- `servicos`: integrações externas, como envio de arquivo para MinIO.

## Arquivos da Raiz do Backend

### `package.json`

Define o nome do projeto, scripts e dependências. Os scripts principais são:

- `npm run server`: inicia a API.
- `npm run start`: também inicia a API.
- `npm run build`: valida o TypeScript.
- `npm run dev`: executa `script.ts`.

Também lista dependências como Express, Prisma, JWT, bcryptjs, MinIO e Multer.

### `package-lock.json`

Registra as versões exatas das dependências instaladas. Ele garante que o projeto seja instalado de forma consistente em outras máquinas.

### `tsconfig.json`

Configura o TypeScript. Define módulo ESNext, resolução de módulos, alvo ES2023, modo estrito e `noEmit`, ou seja, o build checa tipos sem gerar arquivos JavaScript.

### `server.ts`

É o ponto de entrada da API.

Responsabilidades:

- importa Express e middlewares;
- configura CORS;
- configura leitura de JSON;
- registra a rota raiz `/`;
- registra todas as rotas da API no prefixo `/api`;
- registra apenas endpoints no padrão REST dentro de `/api`;
- retorna erro 404 para rotas inexistentes;
- inicia o servidor na porta do `.env` ou na porta `3000`;
- fecha a conexão Prisma ao receber `SIGINT`.

### `script.ts`

Script de demonstração geral do sistema. Cria usuários, livros e empréstimos, testa validações, autenticação e estatísticas.

### `script-entrega2.ts`

Script focado nos critérios da entrega de POO:

- herança e polimorfismo;
- validações e exceções;
- resiliência com `try/catch`.

### `script-consulta.ts`

Script simples para consultar dados persistidos no banco, como usuários, livros e empréstimos.

### `prisma.config.ts`

Configura o Prisma CLI, informando o caminho do schema e das migrations.

### `.env.example`

Modelo das variáveis de ambiente usadas pelo projeto:

- `DATABASE_URL`;
- `PORT`;
- `JWT_SECRET`;
- configurações do MinIO.

### `docker-compose.minio.yml`

Arquivo para subir o MinIO localmente com Docker Compose.

### `dev.db`

Arquivo SQLite local com os dados do projeto.

## Pasta `config`

### `config/prismaClient.ts`

Cria uma instância única do `PrismaClient` usando o adapter `PrismaBetterSqlite3`.

Função no projeto:

- centraliza a conexão com o banco;
- evita criar várias conexões Prisma em arquivos diferentes;
- é importado pelos repositórios.

### `config/database.ts`

Reexporta o cliente Prisma. Serve como compatibilidade para arquivos que queiram importar a conexão pelo nome `database`.

### `config/minioClient.ts`

Configura o cliente MinIO.

Responsabilidades:

- ler endpoint, porta, chave e segredo do `.env`;
- definir o bucket padrão;
- criar o cliente `Minio.Client`;
- montar URL REST da API para arquivos enviados.

## Pasta `middleware`

### `middleware/autenticacaoJwt.ts`

Contém a lógica de JWT.

Principais funções:

- `gerarToken(payload)`: gera token com `idUsuario`, `email` e `nivelAcesso`.
- `autenticarJwt(req, res, next)`: verifica se existe header `Authorization: Bearer <token>`.

Se o token for válido, os dados do usuário ficam em `res.locals.usuario`. Se for inválido ou ausente, a API responde erro 401.

## Pasta `servicos`

### `servicos/ServicoMinio.ts`

Serviço responsável pelo upload de capas de livros.

Fluxo:

1. recebe o `livroId` e o arquivo enviado pelo Multer;
2. cria um nome único para o objeto usando `randomUUID`;
3. garante que o bucket exista;
4. envia o arquivo para o MinIO com `putObject`;
5. retorna o nome do objeto e a URL REST `/api/arquivos/...`.

## Pasta `excecoes`

Esta pasta possui erros customizados usados nas validações e controladores.

### `ErroValidacao.ts`

Erro base para problemas de validação.

### `ErroUsuario.ts`

Erro relacionado a dados de usuário, como nome, nível de acesso ou campos inválidos.

### `ErroEmail.ts`

Erro específico para formato ou tamanho de email inválido.

### `ErroSenha.ts`

Erro específico para senha inválida ou fraca.

### `ErroAutenticacao.ts`

Erro usado quando login ou token são inválidos.

### `ErroLivro.ts`

Erro para validações da entidade `Livro`.

### `ErroExemplar.ts`

Erro para validações da entidade `Exemplar`.

### `ErroEmprestimo.ts`

Erro para validações da entidade `Emprestimo`.

### `ErroReserva.ts`

Erro para validações da entidade `Reserva`.

### `ErroMulta.ts`

Erro para validações da entidade `Multa`.

### `ErroDuplicado.ts`

Erro usado quando um dado único já existe, como email ou matrícula.

### `ErroNaoEncontrado.ts`

Erro usado quando um registro não existe no banco.

### `ErroBancoDados.ts`

Erro reservado para falhas de persistência ou conexão.

### `index.ts`

Arquivo central que exporta todas as exceções. Facilita imports como:

```typescript
import { ErroValidacao, ErroNaoEncontrado } from "../excecoes/index.js";
```

## Pasta `negocios`

Contém as classes de domínio. Essas classes representam as entidades principais e guardam regras de validação.

### `Usuario.ts`

Classe base dos usuários.

Campos privados:

- `#idUsuario`;
- `#nome`;
- `#email`;
- `#senha`;
- `#nivelAcesso`.

Responsabilidades:

- validar nome;
- validar email;
- validar senha;
- validar nível de acesso;
- expor getters e setters;
- autenticar senha normal ou hash bcrypt;
- retornar dados seguros no `toJSON`, sem expor a senha.

### `Aluno.ts`

Especialização de `Usuario`.

Campos:

- `anoIngresso`;
- `curso`;
- `matriculaAluno`.

Responsabilidades:

- definir nível de acesso `aluno`;
- validar ano de ingresso;
- validar curso;
- validar matrícula.

### `Professor.ts`

Especialização de `Usuario`.

Campos:

- `departamento`;
- `matriculaProfessor`.

Responsabilidades:

- definir nível de acesso `professor`;
- validar departamento;
- validar matrícula de professor.

### `Admin.ts`

Especialização de `Usuario`.

Campo:

- `cargo`.

Responsabilidades:

- definir nível de acesso `admin`;
- validar cargo administrativo.

### `Livro.ts`

Representa uma obra do catálogo.

Campos principais:

- título;
- autor;
- gênero;
- ano de publicação;
- sinopse;
- status;
- dados da capa no MinIO.

Responsabilidades:

- validar dados bibliográficos;
- controlar status como disponível, emprestado ou reservado;
- guardar URL e objeto da capa.

### `Exemplar.ts`

Representa uma cópia física de um livro.

Campos:

- código de tombo;
- estado;
- localização;
- id do livro.

Responsabilidades:

- validar código de tombo;
- validar estado físico;
- indicar se pode ser emprestado.

### `Emprestimo.ts`

Representa o registro de saída de um exemplar para um usuário.

Campos:

- usuário;
- exemplar;
- data de saída;
- data de vencimento;
- data real de devolução.

Responsabilidades:

- validar datas;
- registrar devolução;
- verificar atraso;
- calcular dias de atraso;
- renovar empréstimo.

### `Reserva.ts`

Representa a reserva de um livro por um usuário.

Responsabilidades:

- validar usuário e livro;
- validar data de reserva e expiração;
- controlar status da reserva;
- cancelar reserva;
- confirmar retirada.

### `Multa.ts`

Representa multa gerada por atraso.

Responsabilidades:

- validar valor;
- validar empréstimo e exemplar;
- controlar status de pagamento;
- registrar pagamento;
- cancelar multa.

### `Notificacao.ts`

Representa mensagens enviadas ao usuário.

Responsabilidades:

- validar tipo da notificação;
- validar mensagem;
- vincular usuário;
- opcionalmente vincular empréstimo;
- marcar como lida ou não lida.

## Pasta `persistencia`

Contém os repositórios. Eles isolam o acesso ao banco e impedem que as rotas usem Prisma diretamente.

### `RepositórioUsuarios.ts`

Repositório de usuários.

Responsabilidades:

- criar aluno, professor e admin;
- salvar senhas com hash bcrypt;
- buscar usuário por ID ou email;
- buscar aluno/professor por matrícula;
- listar usuários;
- autenticar login com bcrypt;
- migrar senha antiga em texto puro para hash no primeiro login válido;
- atualizar usuário;
- deletar usuário;
- contar usuários.

### `RepositórioLivros.ts`

Repositório de livros.

Responsabilidades:

- criar livro;
- buscar por ID;
- buscar por título, autor e ano;
- listar todos;
- listar por status;
- ordenar por título ou autor;
- atualizar dados;
- excluir;
- atualizar capa enviada ao MinIO;
- contar livros;
- gerar estatísticas.

### `RepositórioExemplares.ts`

Repositório de exemplares físicos.

Responsabilidades:

- criar exemplar vinculado diretamente a um livro por `livro_id`;
- listar exemplares com dados do livro;
- buscar exemplar por ID;
- atualizar código, estado, localização ou livro;
- excluir exemplar.

### `RepositórioEmprestimos.ts`

Repositório de empréstimos.

Responsabilidades:

- criar empréstimo;
- buscar por ID;
- buscar por usuário;
- listar todos;
- listar ativos;
- listar atrasados;
- listar devolvidos;
- atualizar vencimento ou exemplar;
- registrar devolução;
- excluir;
- contar empréstimos;
- calcular estatísticas.

### `RepositórioReservas.ts`

Repositório de reservas.

Responsabilidades:

- criar reserva;
- listar reservas;
- buscar por ID;
- buscar por usuário;
- atualizar data de expiração ou status;
- excluir reserva.

### `RepositórioMultas.ts`

Repositório de multas.

Responsabilidades:

- criar multa;
- gerar multa por empréstimo com base nos dias de atraso;
- listar multas;
- buscar por ID;
- listar pendentes;
- atualizar valor, status ou data de pagamento;
- excluir multa.

### `RepositórioNotificacoes.ts`

Repositório de notificações.

Responsabilidades:

- criar notificação;
- listar notificações;
- buscar por ID;
- buscar por usuário;
- atualizar tipo, mensagem ou status de leitura;
- excluir notificação.

### `RepositórioConsultas.ts`

Repositório com consultas SQL exigidas no projeto de banco.

Consultas implementadas:

- empréstimos ativos por usuário;
- livros mais emprestados;
- multas pendentes por usuário;
- relatório mensal de uso;
- disponibilidade de exemplares por livro.

Também converte `bigint` para `number` para permitir resposta JSON.

## Pasta `controller`

Os controladores recebem dados das rotas, validam entradas simples, chamam repositórios e tratam erros com `try/catch`.

### `ControladorUsuarios.ts`

Controla criação, consulta, atualização, exclusão e login de usuários.

Principais métodos:

- `criarAluno`;
- `criarProfessor`;
- `criarAdmin`;
- `buscarPorId`;
- `listarTodos`;
- `atualizarUsuario`;
- `excluirUsuario`;
- `autenticar`.

### `ControladorLivros.ts`

Controla CRUD de livros e atualização de capa.

Principais métodos:

- `criarLivro`;
- `listarTodos`;
- `buscarPorId`;
- `atualizarLivro`;
- `excluirLivro`;
- `atualizarCapa`.

### `ControladorExemplares.ts`

Controla exemplares físicos.

Principais métodos:

- `criarParaLivro`;
- `listarTodos`;
- `buscarPorId`;
- `atualizar`;
- `excluir`.

### `ControladorEmprestimos.ts`

Controla empréstimos e devoluções.

Principais métodos:

- `criarEmprestimo`;
- `listarTodos`;
- `buscarPorId`;
- `excluirEmprestimo`;
- `atualizarEmprestimo`;
- `registrarDevolucao`.

### `ControladorReservas.ts`

Controla reservas.

Principais métodos:

- `criarReserva`;
- `listarTodos`;
- `buscarPorId`;
- `buscarPorUsuario`;
- `atualizarReserva`;
- `excluirReserva`.

### `ControladorMultas.ts`

Controla multas.

Principais métodos:

- `criarMulta`;
- `gerarPorEmprestimo`;
- `listarTodos`;
- `buscarPorId`;
- `listarPendentes`;
- `atualizarMulta`;
- `excluirMulta`.

### `ControladorNotificacoes.ts`

Controla notificações.

Principais métodos:

- `criarNotificacao`;
- `listarTodos`;
- `buscarPorId`;
- `buscarPorUsuario`;
- `atualizarNotificacao`;
- `excluirNotificacao`.

### `ControladorConsultas.ts`

Controla as consultas do projeto de banco.

Principais métodos:

- `emprestimosAtivosPorUsuario`;
- `livrosMaisEmprestados`;
- `multasPendentesPorUsuario`;
- `relatorioUsoMensal`;
- `disponibilidadeExemplaresPorLivro`.

### `index.ts`

Exporta todos os controladores para facilitar importações.

## Pasta `rotas`

Contém as rotas Express. Cada arquivo agrupa endpoints de uma área.

### `rotas/index.ts`

Agrupa todas as rotas da API.

Registra:

- `/api/auth`;
- `/api/usuarios`;
- `/api/livros`;
- `/api/exemplares`;
- `/api/emprestimos`;
- `/api/reservas`;
- `/api/multas`;
- `/api/notificacoes`;
- `/api/consultas`;
- `/api/arquivos`.

Também define `/api/status`.

### `rotas/resposta.ts`

Padroniza respostas HTTP.

Funções:

- `statusErro`: transforma o tipo de erro em status HTTP.
- `responderResultado`: envia JSON com sucesso ou erro.

### `rotas/rotasAuth.ts`

Rotas de autenticação:

- `POST /api/auth/login`: valida email/senha e retorna token JWT.
- `GET /api/auth/me`: retorna dados do token autenticado.
- `POST /api/auth/logout`: confirma logout no cliente.

### `rotas/rotasUsuarios.ts`

Rotas de usuários:

- listar;
- buscar por ID;
- cadastrar aluno;
- cadastrar professor;
- cadastrar admin;
- atualizar;
- excluir com `DELETE /api/usuarios/:id`;
- atualizar imagens de perfil com `POST /api/usuarios/:id/imagens-perfil`.

### `rotas/rotasLivros.ts`

Rotas de livros:

- listar;
- buscar por ID;
- criar;
- atualizar;
- deletar;
- enviar capa para MinIO.

Usa `multer.memoryStorage()` para receber o arquivo da capa em memória antes de enviar ao MinIO.

### `rotas/rotasExemplares.ts`

Rotas de exemplares:

- listar;
- buscar por ID;
- criar exemplar vinculado a livro;
- atualizar;
- deletar.

### `rotas/rotasEmprestimos.ts`

Rotas de empréstimos:

- listar;
- buscar por ID;
- criar empréstimo;
- atualizar vencimento ou exemplar;
- registrar devolução;
- deletar.

### `rotas/rotasReservas.ts`

Rotas de reservas:

- listar;
- buscar por ID;
- buscar por usuário;
- criar;
- atualizar;
- deletar.

### `rotas/rotasMultas.ts`

Rotas de multas:

- listar;
- listar pendentes;
- buscar por ID;
- criar multa manual;
- gerar multa por empréstimo;
- atualizar;
- deletar.

### `rotas/rotasNotificacoes.ts`

Rotas de notificações:

- listar;
- buscar por ID;
- buscar por usuário;
- criar;
- atualizar;
- marcar como lida;
- deletar.

### `rotas/rotasConsultas.ts`

Rotas das consultas SQL do projeto de banco:

- `GET /api/consultas/emprestimos-ativos`;
- `GET /api/consultas/livros-mais-emprestados`;
- `GET /api/consultas/multas-pendentes`;
- `GET /api/consultas/relatorio-uso-mensal`;
- `GET /api/consultas/disponibilidade-exemplares`.

Todas usam JWT.

## Pasta `prisma`

### `prisma/schema.prisma`

Define o modelo relacional do banco.

Modelos:

- `Usuario`;
- `Aluno`;
- `Professor`;
- `Admin`;
- `Livro`;
- `Exemplar`;
- `Reserva`;
- `Emprestimo`;
- `Multa`;
- `Notificacao`.

Também define:

- chave primária;
- chaves estrangeiras;
- relações;
- índices;
- campos opcionais.

### `prisma/migrations/`

Guarda as alterações históricas do banco.

Arquivos principais:

- `20260530162218_criar_tabelas_iniciais`: cria as tabelas iniciais.
- `20260530203214_conformidade_modelo_er_completo`: ajusta tabelas ao modelo completo.
- `20260530203614_exemplar_id_nullable_em_emprestimo`: permite empréstimo sem exemplar.
- `20260606200000_adicionar_capa_livro_minio`: adiciona campos de capa no livro.
- `20260606213000_remover_pks_subtipos_usuario`: remove PK própria de aluno/professor/admin.
- `20260606223000_exemplar_livro_id_direto`: move a relação livro/exemplar para `Exemplar.livro_id`.

### `prisma/migrations/migration_lock.toml`

Arquivo interno do Prisma que registra o provider usado nas migrations.

## Rotas Principais

Status:

```text
GET /api/status
```

Autenticação:

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

Usuários:

```text
GET    /api/usuarios
GET    /api/usuarios/:id
POST   /api/usuarios/alunos
POST   /api/usuarios/professores
POST   /api/usuarios/admins
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id
POST   /api/usuarios/:id/imagens-perfil
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
POST   /api/multas/emprestimos/:emprestimoId
PUT    /api/multas/:id
DELETE /api/multas/:id
```

Arquivos:

```text
GET /api/arquivos/:objeto
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

Consultas:

```text
GET /api/consultas/emprestimos-ativos
GET /api/consultas/livros-mais-emprestados
GET /api/consultas/multas-pendentes
GET /api/consultas/relatorio-uso-mensal
GET /api/consultas/disponibilidade-exemplares
```

## Fluxo Rápido de Uso

### 1. Criar admin

```bash
curl -X POST http://localhost:3000/api/usuarios/admins ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Ana Admin\",\"email\":\"ana@biblioteca.com\",\"senha\":\"Senha123\",\"cargo\":\"Gerente\"}"
```

### 2. Fazer login

```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"ana@biblioteca.com\",\"senha\":\"Senha123\"}"
```

Copie o token retornado.

### 3. Criar livro

```bash
curl -X POST http://localhost:3000/api/livros ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer SEU_TOKEN" ^
  -d "{\"titulo\":\"Clean Code\",\"autor\":\"Robert Martin\",\"genero\":\"Programacao\",\"anoPublicacao\":2008,\"sinopse\":\"Livro sobre codigo limpo e boas praticas.\"}"
```

### 4. Criar exemplar

```bash
curl -X POST http://localhost:3000/api/exemplares ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer SEU_TOKEN" ^
  -d "{\"livroId\":1,\"codigoTombo\":\"TOMBO001\",\"estado\":\"bom\",\"localizacao\":\"Prateleira A1\"}"
```

### 5. Criar empréstimo

```bash
curl -X POST http://localhost:3000/api/emprestimos ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer SEU_TOKEN" ^
  -d "{\"usuarioId\":1,\"exemplarId\":1}"
```

### 6. Registrar devolução

```bash
curl -X PATCH http://localhost:3000/api/emprestimos/1/devolucao ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer SEU_TOKEN" ^
  -d "{}"
```

### 7. Consultar livros mais emprestados

```bash
curl http://localhost:3000/api/consultas/livros-mais-emprestados ^
  -H "Authorization: Bearer SEU_TOKEN"
```

### 8. Enviar capa para MinIO

```bash
curl -X POST http://localhost:3000/api/livros/1/capa ^
  -H "Authorization: Bearer SEU_TOKEN" ^
  -F "capa=@capa.jpg"
```

## Padrão de Resposta

Sucesso:

```json
{
  "sucesso": true,
  "dados": {}
}
```

Erro:

```json
{
  "sucesso": false,
  "erro": {
    "mensagem": "Mensagem do erro",
    "tipo": "ErroValidacao"
  }
}
```

## Observações Finais

- O projeto usa SQLite, mesmo que exista dependencia `mysql2` instalada.
- JWT é usado como mecanismo principal de autenticação.
- MinIO é usado para armazenar capas de livros.
- O schema Prisma atual é a fonte mais confiável do modelo relacional.
- O modelo ER antigo deve ser ignorado se divergir do schema atual.
