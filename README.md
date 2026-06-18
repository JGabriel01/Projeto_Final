# Sistema de Biblioteca

Projeto final com backend em Node.js/TypeScript, Prisma com SQLite e frontend servido pelo próprio backend.

## Requisitos

- Node.js e npm
- Docker, para rodar o MinIO

## Instalar dependências

Abra o PowerShell na raiz do projeto:

```powershell
cd C:\Users\jgcda\Downloads\Projeto_Final
```

Entre na pasta do backend e instale as dependências:

```powershell
cd backend
npm install
```

## Rodar frontend e backend juntos

O backend já serve o frontend automaticamente. Não é necessário subir um servidor separado para a pasta `frontend`.

Dentro da pasta `backend`, rode:

```powershell
npm run server
```

Depois abra no navegador:

```text
http://localhost:3000
```

A API fica disponível no mesmo servidor:

```text
http://localhost:3000/api
```

Para parar o servidor, use `Ctrl + C`.

Ao iniciar, o backend cria automaticamente um administrador base caso ele ainda não exista:

```text
Email: admin@biblioteca.com
Senha: admin123
```

## Rodar o MinIO

O MinIO é usado para salvar imagens, como capas de livros e imagens de perfil.

Dentro da pasta `backend`, rode:

```powershell
docker compose -f docker-compose.minio.yml up -d
```

Console do MinIO:

```text
http://localhost:9001
```

Credenciais:

```text
Usuário: minioadmin
Senha: minioadmin
```

URL pública dos arquivos:

```text
http://localhost:9000/biblioteca
```

Para parar o MinIO:

```powershell
docker compose -f docker-compose.minio.yml down
```

Para parar o MinIO e apagar os arquivos salvos no volume:

```powershell
docker compose -f docker-compose.minio.yml down -v
```

## Resetar o banco de dados

O banco usado é SQLite e fica em:

```text
backend\dev.db
```

Antes de resetar, pare o servidor com `Ctrl + C`.

Dentro da pasta `backend`, rode:

```powershell
npx prisma migrate reset --force
```

Esse comando apaga os dados do banco e recria as tabelas pelas migrations.

Depois, se quiser garantir que o Prisma Client foi atualizado, rode:

```powershell
npx prisma generate
```

Por fim, suba o servidor novamente:

```powershell
npm run server
```

Depois do reset, o banco fica vazio. Crie um usuário novamente pela tela de cadastro ou pela API. O administrador base também será recriado quando o servidor iniciar, se ainda não existir.

## Ordem recomendada para rodar tudo

Em um terminal:

```powershell
cd C:\Users\jgcda\Downloads\Projeto_Final\backend
docker compose -f docker-compose.minio.yml up -d
npm run server
```

No navegador:

```text
http://localhost:3000
```

## Simular empréstimo atrasado

Dentro da pasta `backend`, rode:

```powershell
npm run simular:atraso -- 4 8
```

Nesse exemplo:

- `4` é o ID do empréstimo.
- `8` é a quantidade de dias de atraso.

## Simular alerta de devolução próxima

O sistema gera uma notificação quando um empréstimo ativo está com vencimento entre hoje e os próximos 2 dias. A notificação aparece no painel de notificações do usuário quando a biblioteca é carregada.

Para testar manualmente, dentro da pasta `backend`, rode:

```powershell
npm run simular:prazo-proximo -- 4 1
```

Nesse exemplo:

- `4` é o ID do empréstimo.
- `1` é a quantidade de dias até o vencimento.

Use `0`, `1` ou `2` dias para gerar o alerta de prazo próximo. Depois recarregue a tela da biblioteca e abra o painel de notificações.

## Senha e email de usuário admin para testes

- `email`: admin@biblioteca.com
- `senha`: Novasenha 1

Obs.: o caractere de espaço conta como parte dessa senha.
