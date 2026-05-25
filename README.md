# Sistema de Biblioteca - Entrega 1

Este diretório contém a modelagem do domínio para o Tema 10 (Sistema de Biblioteca) conforme a Entrega 1 do projeto.

Resumo do que foi incluído:

- `Usuario` (classe de domínio) - campos mínimos para tela de login
- `Livro` (classe de domínio) - campos do cadastro de livros (>=5)
 - `DaoLivro` / `DaoUsuario` - DAOs que encapsulam a persistência (estado em memória neste estágio)
 - `NegociosLivros` / `NegociosUsuarios` - camada de negócios (regras e orquestração) que consome os DAOs
- `src/principal.js` - script de demonstração que cria instâncias e mostra operações em memória

Como rodar:

1. Abra um terminal na pasta do projeto.
2. Rode `npm install` (não há dependências externas, mas cria package-lock)
3. Rode `npm start`

Observação: o script principal agora é `src/principal.js` e o projeto usa nomes de arquivos em português. Os DAOs em `src/persistencia/` mantêm hoje o estado em memória; futuramente podem ser adaptados para usar SQLite/Prisma.

Contrato (inputs/outputs):

- Book: { id, title, author, genre, year, summary }
- User: { id, email, passwordHash, role }
- Métodos do BookService retornam valores síncronos e lançam Error em validação falha.

Observações:

- Implementação usa ES Modules (package.json com "type": "module").
- Persistência será adicionada nas próximas entregas; por enquanto é apenas em memória.
