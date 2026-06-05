# Entrega 2 - Sistema de Biblioteca

## Resumo das Implementações

Este documento descreve as implementações feitas para atender aos critérios da **Entrega 2: Lógica Avançada, Validações e Exceções**.

---

## ✅ Critério 1: Aplicação de Herança e Polimorfismo (1,0 pt)

### Hierarquia de Classes Implementada

O projeto implementa uma hierarquia clara de usuários no sistema:

```
Usuario (Classe Base)
├── Aluno (Especialização)
├── Professor (Especialização)
└── Admin (Especialização)
```

### Detalhes da Implementação

**Arquivo: `negocios/Usuario.ts`**
- Classe base com atributos e métodos comuns
- Validações de entrada rigorosas
- Métodos de autenticação

**Arquivos de Especialização:**
- `negocios/Aluno.ts` - Estende Usuario com campos específicos (matrícula, ano de ingresso, curso)
- `negocios/Professor.ts` - Estende Usuario com campos específicos (departamento, matrícula de professor)
- `negocios/Admin.ts` - Estende Usuario com campos específicos (cargo)

### Polimorfismo

Cada classe especializada sobrescreve métodos para adequar-se ao seu contexto:
- Cada tipo de usuário tem validações específicas
- Método `toJSON()` implementado em cada classe
- Nível de acesso diferenciado ("aluno", "professor", "admin")

### Exemplo de Uso

```typescript
const aluno = new Aluno(1, 1, "João", "joao@aluno.com", "Senha123", 2024, "Engenharia", "ENG001");
const professor = new Professor(1, 2, "Carlos", "carlos@univ.com", "Senha456", "Eng", "PROF001");
const admin = new Admin(1, 3, "Ana", "ana@bib.com", "Senha789", "Gerente");

// Todos são instâncias de Usuario (polimorfismo)
const usuarios: Usuario[] = [aluno, professor, admin];
```

---

## 🔒 Critério 2: Validação de Regras e Exceções (1,0 pt)

### Exceções Customizadas

**Arquivo: `negocios/Excecoes.ts`**

Hierarquia de exceções customizadas:

```
Error (JS Nativa)
├── ErroValidacao
│   ├── ErroUsuario
│   │   ├── ErroEmail
│   │   ├── ErroSenha
│   │   └── ErroAutenticacao
│   ├── ErroLivro
│   ├── ErroEmprestimo
│   ├── ErroExemplar
│   ├── ErroReserva
│   └── ErroMulta
├── ErroDuplicado
├── ErroNaoEncontrado
└── ErroBancoDados
```

### Validações Implementadas

#### **Usuario.ts**
- Email: formato válido (padrão RFC 5322 simplificado)
- Senha: mínimo 6 caracteres, pelo menos 1 letra e 1 número
- Nome: mínimo 3 caracteres, máximo 100
- Nível de Acesso: valores permitidos ("aluno", "professor", "admin")

#### **Aluno.ts**
- Ano de Ingresso: entre 1900 e ano atual
- Curso: mínimo 3 caracteres, máximo 100
- Matrícula: mínimo 5 caracteres, máximo 50, apenas alfanuméricos

#### **Professor.ts**
- Departamento: obrigatório, mínimo 3 caracteres, máximo 100
- Matrícula: mínimo 5 caracteres, máximo 50, apenas alfanuméricos

#### **Livro.ts**
- Título: 3-200 caracteres
- Autor: 3-150 caracteres
- Gênero: 3-100 caracteres
- Ano de Publicação: entre 1000 e ano atual
- Sinopse: 10-5000 caracteres
- Status: valores válidos ("disponível", "emprestado", "reservado")

#### **Emprestimo.ts**
- Usuário ID: número positivo
- Exemplar ID: número positivo ou nulo
- Data de Vencimento: não pode ser anterior à data de saída
- Duração máxima: 30 dias

#### **Exemplar.ts**
- Código de Tombo: 5-50 caracteres, alfanuméricos + hífen/underscore
- Estado: valores válidos ("novo", "bom", "desgastado", "danificado")
- Localização: 3-100 caracteres

#### **Reserva.ts**
- Data de Expiração: não pode ser anterior à data de reserva
- Duração máxima: 30 dias
- Status: valores válidos ("ativa", "cancelada", "retirada")

#### **Multa.ts**
- Valor: não negativo, máximo R$ 10.000,00
- Status: valores válidos ("pendente", "paga", "cancelada")

#### **Notificacao.ts**
- Tipo: valores específicos (emprestimo, multa, reserva, devolucao, renovacao, aviso)
- Mensagem: 5-2000 caracteres

### Exemplo de Validação com Exceção

```typescript
try {
  const aluno = new Aluno(1, 1, "Jo", "email@invalido", "abc", 1800, "Eng", "MAT");
} catch (erro) {
  if (erro instanceof ErroEmail) {
    console.log("Email inválido:", erro.message);
  } else if (erro instanceof ErroSenha) {
    console.log("Senha fraca:", erro.message);
  } else if (erro instanceof ErroValidacao) {
    console.log("Validação falhou:", erro.message);
  }
}
```

---

## 🛡️ Critério 3: Resiliência no Fluxo (1,0 pt)

### Controladores com Try/Catch

**Arquivo: `negocios/Controladores.ts`**

Implementa três controladores principais:

#### **ControladorUsuarios**
```typescript
async criarAluno(nome, email, senha, ...): Promise<ResultadoOperacao<Aluno>>
async criarProfessor(nome, email, senha, ...): Promise<ResultadoOperacao<Professor>>
async criarAdmin(nome, email, senha, ...): Promise<ResultadoOperacao<Admin>>
async buscarPorId(id): Promise<ResultadoOperacao<Usuario>>
async autenticar(email, senha): Promise<ResultadoOperacao<Usuario>>
```

#### **ControladorLivros**
```typescript
async criarLivro(titulo, autor, ...): Promise<ResultadoOperacao<Livro>>
```

#### **ControladorEmprestimos**
```typescript
async criarEmprestimo(usuarioId, exemplarId, ...): Promise<ResultadoOperacao<Emprestimo>>
```

### Tratamento de Erros

Cada controlador implementa:
1. **Validação de entrada** - verifica dados obrigatórios
2. **Try/Catch** - captura todas as exceções
3. **Resposta estruturada** - retorna objeto padronizado

### Interface de Resposta

```typescript
interface ResultadoOperacao<T = any> {
  sucesso: boolean;
  dados?: T;
  erro?: {
    mensagem: string;
    tipo: string;
    detalhes?: string;
  };
}
```

### Exemplo de Uso

```typescript
const controlador = new ControladorUsuarios();

// Operação bem-sucedida
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

// Operação com erro (email duplicado)
const resultadoDuplicado = await controlador.criarAluno(...);
if (!resultadoDuplicado.sucesso) {
  console.log("Erro:", resultadoDuplicado.erro.mensagem); 
  // Output: "Email joao@aluno.com já está cadastrado"
}
```

### Fluxo de Tratamento de Erros

```
Controlador
  ↓
Try {
  - Validar entrada
  - Criar instância (valida regras)
  - Salvar no banco
}
Catch {
  - Identificar tipo de erro
  - Retornar resposta estruturada
  - Logar erro
}
```

---

## 📁 Estrutura de Arquivos

```
backend/
├── negocios/
│   ├── Usuario.ts          # Classe base
│   ├── Aluno.ts            # Especialização
│   ├── Professor.ts        # Especialização
│   ├── Admin.ts            # Especialização
│   ├── Livro.ts            # Entidade
│   ├── Emprestimo.ts       # Entidade com validações
│   ├── Exemplar.ts         # Entidade
│   ├── Reserva.ts          # Entidade
│   ├── Multa.ts            # Entidade
│   ├── Notificacao.ts      # Entidade
│   ├── Excecoes.ts         # 🆕 Exceções customizadas
│   └── Controladores.ts    # 🆕 Try/Catch e resiliência
├── script-entrega2.ts      # 🆕 Demonstração completa
└── ...
```

---

## 🧪 Como Executar a Demonstração

### Instalação de Dependências
```bash
cd backend
npm install
```

### Rodar Script de Demonstração
```bash
npm run dev script-entrega2.ts
```

### Saída Esperada

O script demonstrará:
1. ✅ Criação de usuários com hierarquia correta
2. ✅ Validações rejeitando dados inválidos
3. ✅ Controladores tratando erros com graça
4. ✅ Mensagens de erro precisas e estruturadas

---

## 📊 Cobertura de Validações

| Entidade | Validações | Exceções | Controladores |
|----------|-----------|----------|---------------|
| Usuario | ✅ 4 campos | ✅ ErroEmail, ErroSenha, ErroUsuario | ✅ 5 métodos |
| Aluno | ✅ 3 campos | ✅ ErroUsuario, ErroValidacao | ✅ Integrado |
| Professor | ✅ 2 campos | ✅ ErroUsuario, ErroValidacao | ✅ Integrado |
| Admin | ✅ 1 campo | ✅ ErroUsuario | ✅ Integrado |
| Livro | ✅ 6 campos | ✅ ErroLivro | ✅ ControladorLivros |
| Emprestimo | ✅ 4 campos | ✅ ErroEmprestimo | ✅ ControladorEmprestimos |
| Exemplar | ✅ 4 campos | ✅ ErroExemplar | ✅ -  |
| Reserva | ✅ 4 campos | ✅ ErroReserva | ✅ - |
| Multa | ✅ 4 campos | ✅ ErroMulta | ✅ - |
| Notificacao | ✅ 3 campos | ✅ ErroValidacao | ✅ - |

---

## 🎯 Atendimento aos Critérios

### Critério 1: Herança e Polimorfismo ✅
- **Hierarquia de classes**: Usuario base com 3 especializações
- **Polimorfismo**: cada tipo de usuário tem comportamento próprio
- **Relevância ao tema**: diferenciação essencial para níveis de acesso

### Critério 2: Validação e Exceções ✅
- **Validações severas**: 30+ regras de validação implementadas
- **Exceções customizadas**: 11 classes de exceção específicas
- **Throw de erros**: todas as validações usam `throw new Error()`
- **Tratamento preciso**: mensagens de erro claras e descritivas

### Critério 3: Resiliência ✅
- **Try/Catch nos controladores**: 100% das operações coberto
- **Resposta estruturada**: todos os erros retornam formato padronizado
- **Sem travamentos**: exceções são capturadas e tratadas
- **Mensagens ao frontend**: estrutura pronta para reenviar ao cliente

---

## 📝 Notas Técnicas

### Pontos Fortes
1. **Encapsulamento**: uso de atributos privados (#)
2. **Validação em camadas**: validação na classe + no controlador
3. **Escalabilidade**: fácil adicionar novos tipos de usuários
4. **Type-safety**: uso de TypeScript para segurança de tipos
5. **Documentação**: comentários detalhados em cada arquivo

### Possíveis Melhorias Futuras
1. Adicionar testes unitários
2. Implementar padrão de erro global
3. Adicionar logging estruturado
4. Integrar com API REST
5. Adicionar cache para validações frequentes

---

**Data**: 2026-06-05  
**Versão**: 2.0 (Entrega 2)  
**Status**: ✅ Completo
