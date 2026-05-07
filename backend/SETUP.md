# Setup Completo — Backend Biblioteca com Docker

Este documento contém instruções passo a passo para rodar o backend com Docker em casa.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Docker Desktop** — https://www.docker.com/products/docker-desktop
   - Windows 10/11: Use Docker Desktop for Windows
   - Mac: Use Docker Desktop for Mac
   - Linux: Use Docker CE

2. **Node.js 16+** — https://nodejs.org/
   - Instale a versão LTS mais recente
   - Verifique com: `node -v` e `npm -v`

3. **Git** (opcional, mas recomendado)

---

## 🚀 Instalação Passo a Passo

### 1. Clone ou abra o projeto
```pwsh
# Se usar git:
git clone https://github.com/JGabriel01/Projeto_Final.git
cd Projeto_Final/backend

# Ou simplesmente abra a pasta backend do seu computador
```

### 2. Inicie Docker Desktop
- Abra o aplicativo Docker Desktop no seu computador
- Aguarde até que o ícone do Docker fique verde (significa que está rodando)
- Você pode verificar com:
  ```pwsh
  docker --version
  docker ps
  ```

### 3. Levante os containers MySQL + Adminer
Na pasta `backend`, execute:
```pwsh
docker-compose up -d
```

**Saída esperada:**
```
[+] Running 2/2
 ✔ Container biblioteca_db       Started
 ✔ Container biblioteca_adminer  Started
```

Aguarde **15-30 segundos** para o MySQL inicializar completamente.

Verifique com:
```pwsh
docker ps
```

Você deve ver 2 containers rodando (biblioteca_db e biblioteca_adminer).

### 4. Instale dependências Node.js
```pwsh
npm install
```

Isso vai instalar: express, cors, bcryptjs, jsonwebtoken, prisma, etc.

### 5. Configure o banco de dados
```pwsh
npx prisma migrate deploy
```

Se der erro "migration history not found", rode:
```pwsh
npx prisma migrate dev --name init
```

Depois:
```pwsh
npx prisma generate
```

### 6. Popule o banco com dados de teste
```pwsh
npm run seed
```

**Saída esperada:**
```
Populando banco...
População finalizada.
Teste: alice@example.com / senha123
Teste: bruno@example.com / senha456
```

### 7. Inicie o servidor
```pwsh
npm run dev
```

**Saída esperada:**
```
Servidor rodando na porta 3000
```

---

## ✅ Verificação

Abra outro terminal (sem parar o servidor) e teste:

```pwsh
# Teste 1: Verificar saúde da API
curl http://localhost:3000/saude
# Saída esperada: {"status":"ok"}

# Teste 2: Listar livros
curl http://localhost:3000/livros
# Saída esperada: JSON com os 3 livros de teste

# Teste 3: Fazer login
curl -X POST http://localhost:3000/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"alice@example.com\",\"senha\":\"senha123\"}"
# Saída esperada: {"token":"...","usuario":{...}}
```

Se tudo retornar dados, seu backend está 100% funcional! ✅

---

## 🌐 Acessar o Adminer (UI do Banco)

Abra o navegador e acesse: **http://localhost:8080**

Faça login:
- **Server:** localhost
- **Username:** biblioteca_user
- **Password:** biblioteca_pwd
- **Database:** biblioteca

Aqui você pode ver/editar dados do banco visualmente.

---

## 🛑 Parar o Servidor

Para parar o servidor (node):
- Pressione `Ctrl+C` no terminal onde o servidor está rodando

Para parar os containers Docker:
```pwsh
docker-compose down
```

Para parar + remover volumes (CUIDADO: deleta o banco):
```pwsh
docker-compose down -v
```

---

## 🔄 Reiniciar Tudo

Se precisar reiniciar do zero:

```pwsh
# 1. Parar containers e remover volumes
docker-compose down -v

# 2. Limpar migrations (opcional)
rm -r prisma/migrations

# 3. Iniciar novamente
docker-compose up -d
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

---

## 🐛 Troubleshooting

### "Docker daemon is not running"
**Problema:** Docker Desktop não está aberto

**Solução:** Abra Docker Desktop e aguarde ficar verde

---

### "bind: Address already in use"
**Problema:** Porta 3306 (MySQL) ou 3000 (servidor Node) já está em uso

**Solução A - Verifique qual processo está usando:**
```pwsh
# Windows
netstat -ano | findstr ":3000"
netstat -ano | findstr ":3306"
```

**Solução B - Mude as portas:**
- Edite `docker-compose.yaml`:
  ```yaml
  ports:
    - "3307:3306"  # Use 3307 em vez de 3306
  ```
- Edite `.env`:
  ```
  DATABASE_URL="mysql://biblioteca_user:biblioteca_pwd@localhost:3307/biblioteca"
  ```
- Rode com porta diferente:
  ```pwsh
  npm run dev -- --port 3001
  ```

---

### "Unknown authentication plugin `sha256_password`"
**Problema:** Versão do MySQL incompatível

**Solução:**
```pwsh
# Recrie os containers
docker-compose down -v
docker-compose up -d
```

---

### "database does not exist"
**Problema:** Banco não foi criado

**Solução:**
```pwsh
# Aguarde ~30 segundos (MySQL está inicializando)
# Se persistir, recrie:
docker-compose down -v
docker-compose up -d
# Aguarde 30 segundos
npx prisma migrate dev --name init
```

---

### "ECONNREFUSED 127.0.0.1:3306"
**Problema:** Servidor Node não consegue conectar ao MySQL

**Solução:**
```pwsh
# Verifique se MySQL está rodando
docker ps | findstr biblioteca_db

# Se não aparecer, inicie:
docker-compose up -d

# Se mesmo assim falhar, recrie:
docker-compose down -v
docker-compose up -d
```

---

## 📞 Precisa de Ajuda?

Se algo não funcionar:

1. Verifique os logs do Docker:
   ```pwsh
   docker logs biblioteca_db
   ```

2. Verifique os logs do servidor Node (terminal onde rodou `npm run dev`)

3. Tente fazer um "reset" completo:
   ```pwsh
   docker-compose down -v
   rm -r node_modules prisma/migrations
   npm install
   docker-compose up -d
   npx prisma migrate dev --name init
   npm run seed
   npm run dev
   ```

---

## 📚 Próximos Passos

Quando tudo estiver rodando:

1. **Teste os endpoints** (veja `README.md` para lista completa)
2. **Configure o frontend** para chamar esses endpoints
3. **Use o token JWT** retornado pelo login em endpoints protegidos

---

**Boa sorte! Backend pronto para integração! 🚀**
