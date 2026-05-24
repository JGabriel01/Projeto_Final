# Frontend - BiblioTech

Frontend moderno para o sistema de biblioteca digital BiblioTech, construído com React, TypeScript e Tailwind CSS.

## Recursos

- ✅ Autenticação com JWT
- ✅ Catálogo de livros com busca e filtros
- ✅ Detalhes completos dos livros
- ✅ Sistema de empréstimos
- ✅ Reservas de livros indisponíveis
- ✅ Gerenciamento de multas
- ✅ Leitura de PDFs
- ✅ Design responsivo e moderno
- ✅ Integração com API REST

## Tecnologias

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Routing
- **Zustand** - State management
- **Lucide React** - Icons

## Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

## Estrutura de Pastas

```
src/
├── components/       # Componentes reutilizáveis
│   ├── Header.tsx
│   ├── CardLivro.tsx
│   ├── Botao.tsx
│   └── PrivateRoute.tsx
├── pages/           # Páginas principais
│   ├── PaginaHome.tsx
│   ├── PaginaLogin.tsx
│   ├── PaginaRegistro.tsx
│   ├── PaginaCatalogo.tsx
│   ├── PaginaDetalhesLivro.tsx
│   ├── PaginaMeusEmprestimos.tsx
│   ├── PaginaMinhasReservas.tsx
│   └── PaginaMultas.tsx
├── services/        # Integração com API
│   └── api.ts
├── stores/          # Estado global (Zustand)
│   └── authStore.ts
├── types.ts         # Tipos TypeScript
├── App.tsx          # Componente principal
├── main.tsx         # Entrada da aplicação
└── index.css        # Estilos globais
```

## Páginas

### Públicas
- **/** - Página inicial
- **/login** - Login de usuário
- **/registro** - Registrar nova conta

### Protegidas (requerem autenticação)
- **/catalogo** - Catálogo completo de livros
- **/livro/:id** - Detalhes do livro
- **/meus-emprestimos** - Gerenciar empréstimos
- **/minhas-reservas** - Gerenciar reservas
- **/multas** - Visualizar multas

## Funcionalidades

### Autenticação
- Login com email e senha
- Registro de novo usuário
- Persistência de sessão com JWT
- Logout

### Catálogo
- Listagem de todos os livros
- Busca por título ou autor
- Filtro por gênero
- Visualização de detalhes
- Cards responsivos

### Livros
- Emprestar livro disponível
- Reservar livro indisponível
- Visualizar sinopse completa
- Download/leitura de PDF
- Informações de disponibilidade

### Empréstimos
- Listar empréstimos ativos
- Verificar data de vencimento
- Devolver livro
- Visualizar multas pendentes

### Reservas
- Reservar livros indisponíveis
- Listar reservas ativas
- Cancelar reserva
- Rastrear status

### Multas
- Visualizar multas por atraso
- Pagar multa
- Ver histórico

## API Base URL

Por padrão, a aplicação conecta em: `http://localhost:3000/api`

Configure em `.env` se necessário.

## Scripts

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

## Autenticação

Exemplo de credenciais para testes:
```
Email: usuario@exemplo.com
Senha: senha123
```

## Problemas Comuns

### Erro de conexão com API
- Verifique se o backend está rodando em `http://localhost:3000`
- Configure o `.env` com a URL correta

### Token expirado
- Faça login novamente
- O token é armazenado no localStorage

### Componentes não carregam
- Limpe o cache: `npm run dev -- --clearCache`
- Reinstale dependências: `rm -rf node_modules && npm install`

## Contato & Suporte

Para dúvidas sobre o frontend, consulte a documentação do backend em `../GUIA_COMPLETO.md`.
