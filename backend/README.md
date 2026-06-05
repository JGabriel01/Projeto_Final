# 📚 Sistema de Biblioteca - Entrega 2

Sistema completo de gerenciamento de biblioteca com validações rigorosas, exceções customizadas e controle de resiliência.

## ⚡ Início Rápido

### Instalar
```bash
cd backend
npm install
```

### Executar Demo
```bash
npm run dev script-entrega2.ts
```

---

## 📂 Estrutura do Projeto

```
backend/
├── excecoes/              // Todas as exceções customizadas
│   ├── ErroValidacao.ts
│   ├── ErroUsuario.ts
│   ├── ErroEmail.ts
│   ├── ErroSenha.ts
│   ├── ErroAutenticacao.ts
│   ├── ErroLivro.ts
│   ├── ErroEmprestimo.ts
│   ├── ErroExemplar.ts
│   ├── ErroReserva.ts
│   ├── ErroMulta.ts
│   ├── ErroNaoEncontrado.ts
│   ├── ErroDuplicado.ts
│   ├── ErroBancoDados.ts
│   └── index.ts
│
├── controller/            // Controladores com try/catch
│   ├── ControladorUsuarios.ts
│   ├── ControladorLivros.ts
│   ├── ControladorEmprestimos.ts
│   └── index.ts
│
├── negocios/              // Lógica de negócio
│   ├── Usuario.ts         // Base para todos os usuários
│   ├── Aluno.ts           // Especialização de Usuario
│   ├── Professor.ts       // Especialização de Usuario
│   ├── Admin.ts           // Especialização de Usuario
│   ├── Livro.ts
│   ├── Emprestimo.ts
│   ├── Exemplar.ts
│   ├── Reserva.ts
│   ├── Multa.ts
│   └── Notificacao.ts
│
└── script-entrega2.ts     // Demonstração dos 3 critérios
```

---

## 🎯 3 Critérios Implementados

### 1️⃣ Herança e Polimorfismo

**Hierarquia de Usuários:**
```typescript
Usuario (classe base)
├── Aluno (estende Usuario)
├── Professor (estende Usuario)
└── Admin (estende Usuario)
```

Cada tipo de usuário tem:
- Nível de acesso diferenciado
- Campos específicos próprios
- Validações específicas
- Método `toJSON()` polimórfico

### 2️⃣ Validação e Exceções

**11 Exceções Customizadas:** Cada uma em arquivo separado
- ErroValidacao (base)
- ErroUsuario, ErroEmail, ErroSenha, ErroAutenticacao
- ErroLivro, ErroEmprestimo, ErroExemplar, ErroReserva, ErroMulta
- ErroDuplicado, ErroNaoEncontrado, ErroBancoDados

**30+ Validações Rigorosas:**
- Email: formato RFC 5322 completo
- Senha: 6+ caracteres, letra + número
- Nome: 3-100 caracteres
- Matrícula: 5-50 caracteres, alfanuméricos
- Livro: título (3-200), autor (3-150), ano (1000-atual), sinopse (10-5000)
- Empréstimo: datas válidas, máximo 30 dias
- Exemplar: estado (novo|bom|desgastado|danificado)
- Reserva: datas válidas, máximo 30 dias
- Multa: valor (0-10000), status (pendente|paga|cancelada)
- Notificação: tipo específico, mensagem (5-2000)

### 3️⃣ Resiliência (Try/Catch)

**3 Controladores em arquivos separados:**
- `ControladorUsuarios.ts` - 5 métodos com try/catch
- `ControladorLivros.ts` - Gerencia livros
- `ControladorEmprestimos.ts` - Gerencia empréstimos

**Fluxo de Tratamento:**
```
1. Validar entrada
2. Verificar duplicatas
3. Criar instância (valida regras)
4. Salvar no banco
5. Retornar resposta estruturada
```

**Resposta Padrão:**
```typescript
{
  sucesso: boolean,
  dados?: T,              // objeto se sucesso
  erro?: {
    mensagem: string,     // "Email já cadastrado"
    tipo: string,        // "ErroDuplicado"
    detalhes?: string
  }
}
```

---

## 💻 Como Usar

### Criar Aluno
```typescript
import { ControladorUsuarios } from "./controller/index.js";

const controlador = new ControladorUsuarios();
const resultado = await controlador.criarAluno(
  "João Silva",
  "joao@aluno.com",
  "Senha123",
  2024,
  "Engenharia",
  "ENG2024001"
);

if (resultado.sucesso) {
  console.log("Aluno criado:", resultado.dados.nome);
} else {
  console.log("Erro:", resultado.erro.mensagem);
  console.log("Tipo:", resultado.erro.tipo);
}
```

### Usar Validações
```typescript
import { Livro } from "./negocios/Livro.js";
import { ErroLivro } from "./excecoes/index.js";

try {
  const livro = new Livro(
    1,
    "AB",              // ❌ Título muito curto!
    "Autor",
    "Gênero",
    2024,
    "Sinopse válida"
  );
} catch (erro) {
  if (erro instanceof ErroLivro) {
    console.log("Erro de Livro:", erro.message);
  }
}
```

### Usar Exceções
```typescript
import { ErroEmail, ErroSenha, ErroDuplicado } from "./excecoes/index.js";

try {
  const aluno = new Aluno(1, 1, "João", "email-invalido", "abc", 2024, "Eng", "MAT");
} catch (erro) {
  if (erro instanceof ErroEmail) {
    // Handle email error
  } else if (erro instanceof ErroSenha) {
    // Handle password error
  }
}
```

---

## 📊 Resumo de Implementação

| Aspecto | Detalhes |
|---------|----------|
| **Exceções** | 11 classes customizadas, cada uma em arquivo .ts |
| **Validações** | 30+ implementadas, todas com throw |
| **Controladores** | 3 classes, 1 arquivo cada, com try/catch |
| **Métodos** | 8+ com tratamento centralizado |
| **Entidades** | 10 classes com validações |
| **Pontuação** | 3,0 pontos (1 + 1 + 1) |

---

## 🧪 Testes

Execute o script de demonstração para ver os 3 critérios em ação:

```bash
npm run dev script-entrega2.ts
```

Você verá:
1. ✅ Demonstração de Herança e Polimorfismo
2. ✅ Demonstração de Validações e Exceções
3. ✅ Demonstração de Resiliência com Try/Catch

---

## ✨ Destaques

- **Separação de Responsabilidades:** Cada exceção em arquivo, cada controlador isolado
- **Validações em Camadas:** Classe de negócio + Controlador
- **Sem Comentários Poluídos:** Apenas comentários simples de uma linha
- **Código Limpo:** Estrutura clara e fácil de manter
- **Type-Safe:** TypeScript com tipagem completa

---

## 📝 Notas Importantes

- Todas as exceções estão em `excecoes/` com arquivo `.ts` separado
- Todos os controladores estão em `controller/` com arquivo `.ts` separado
- Use `excecoes/index.ts` e `controller/index.ts` para importar tudo
- Validações não travam a aplicação (capturadas em try/catch)
- Mensagens de erro são precisas e reutilizáveis

---

**Status:** ✅ Entrega 2 Completa  
**Data:** 2026-06-05  
**Pontuação:** 3,0 pontos
