# Finance Control

Finance Control e um sistema web de controle financeiro operacional, criado para substituir o uso de planilhas por uma aplicacao mais clara, responsiva e adequada ao uso diario.

O projeto e construido como um **monolito modular em Next.js**, seguindo principios de **Clean Architecture** e **Hexagonal Architecture**. A ideia e manter o MVP simples, mas com separacao suficiente para evoluir sem misturar regra de negocio, UI, banco e infraestrutura.

## O que o sistema faz

O Finance Control centraliza quatro dimensoes principais da rotina financeira:

- autenticacao e isolamento dos dados por usuario;
- manutencao da posicao financeira base na Wallet;
- registro de receitas e despesas realizadas em Finance;
- acompanhamento e pagamento de dividas em Debts;
- visualizacao de indicadores derivados, como total da wallet e saldo final.

## Modulos

### Auth

Responsavel por login, sessao e usuario autenticado. Todos os dados financeiros devem pertencer ao usuario da sessao atual.

### Wallet

Representa a posicao financeira base do usuario:

- saldo em banco;
- saldo em dinheiro;
- valores a receber.

Esses valores sao fonte primaria de estado financeiro. Atualizar a Wallet nao cria receita ou despesa.

```txt
walletTotal = bankBalance + cashBalance + receivableBalance
```

### Finance

Representa eventos financeiros ja realizados:

- receitas;
- despesas;
- categorias de despesa;
- historico;
- resumo operacional mensal;
- consultas por periodo.

Finance registra o que aconteceu no tempo, mas nao define sozinho o saldo final do usuario.

### Debts

Representa compromissos financeiros pendentes ou quitados.

Uma divida pendente nao e uma despesa realizada. Quando uma divida e paga, o sistema:

- marca a divida como paga;
- registra a origem do pagamento;
- reduz a Wallet conforme a origem;
- gera uma despesa real no Finance;
- protege a despesa gerada contra edicao/exclusao comum.

```txt
finalBalance = walletTotal - pendingDebts
```

## Arquitetura

O backend segue o fluxo:

```txt
Route Handler / Controller
  -> Use Case
  -> Repository Contract / Port
  -> Repository Prisma / Adapter
  -> PostgreSQL
```

Organizacao conceitual das camadas:

- `domain`: entidades, regras, value objects, erros e contratos;
- `application`: casos de uso e orquestracao de fluxos;
- `infra`: adapters concretos, Prisma, mappers e persistencia;
- `presentation`: controllers, schemas, presenters, server data e UI.

Regras importantes:

- `domain` nao depende de Next.js, Prisma, banco ou UI;
- `application` nao deve depender de framework;
- Prisma fica restrito a infraestrutura;
- Route Handlers nao devem conter regra de negocio;
- valores derivados nao devem ser persistidos como fonte primaria;
- operacoes financeiras devem respeitar isolamento por usuario.

## Stack

- Next.js
- React
- TypeScript
- PostgreSQL
- Prisma
- Docker Compose
- Zod
- React Hook Form
- shadcn/UI com Radix e Lucide
- Tailwind CSS
- Zustand
- Jest
- Testing Library
- bcryptjs
- jose

## Estrutura principal

```txt
src/
  app/
    api/
    dashboard/
    debts/
    finance/
    login/
    wallet/
  modules/
    auth/
    wallet/
    finance/
    debts/
  shared/
    infra/
    presentation/
  proxy.ts

prisma/
  schema.prisma
  migrations/
  seed.ts

tests/
  config/
  unit/
  integration/
```

## Configuracao local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Subir o PostgreSQL

```bash
docker compose up -d
```

O `docker-compose.yml` sobe um PostgreSQL local com o banco principal `finance_control`.

### 3. Configurar `.env`

Crie o arquivo `.env` com as variaveis locais:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_control?schema=public"
JWT_SECRET="your-local-secret"
JWT_EXPIRES_IN="7d"
```

### 4. Aplicar migrations e seed

```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

A aplicacao ficara disponivel em:

```txt
http://localhost:3000
```

## Banco de teste

Os testes de integracao devem rodar contra um banco separado do banco de desenvolvimento.

Crie um database de teste no mesmo PostgreSQL local:

```bash
docker exec finance-control-postgres createdb -U postgres finance_control_test
```

Configure o `.env.test`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_control_test?schema=public"
JWT_SECRET="your-local-secret"
JWT_EXPIRES_IN="7d"
```

A configuracao de Jest para integracao carrega `.env.test` e bloqueia a execucao se o nome do banco nao contiver `test`, evitando que testes limpem dados do banco de desenvolvimento por engano.

Para preparar o banco de teste:

```bash
set -a && source .env.test && set +a && npx prisma migrate deploy
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test:unit
npm run test:integration
npm run test:ui
npm run test:all
npm run db:seed
```

## Testes

A suite de testes esta separada por objetivo:

- `test:unit`: dominio, application, controllers, schemas e server data;
- `test:integration`: rotas, repositories Prisma, transacoes e operacoes compostas;
- `test:ui`: componentes, formularios, hooks e servicos de UI.

Os testes de integracao rodam em serie porque acessam banco real:

```bash
npm run test:integration
```

## Endpoints principais

### Auth

```txt
POST /api/auth/sign-in
POST /api/auth/sign-out
GET  /api/auth/me
```

### Wallet

```txt
GET /api/wallet
PUT /api/wallet
GET /api/wallet/summary
```

### Finance

```txt
POST   /api/finance/incomes
POST   /api/finance/expenses
PUT    /api/finance/incomes/[id]
PUT    /api/finance/expenses/[id]
DELETE /api/finance/incomes/[id]
DELETE /api/finance/expenses/[id]

GET    /api/finance/expense-categories
GET    /api/finance/daily-transactions
GET    /api/finance/history
GET    /api/finance/daily-profit
GET    /api/finance/monthly-summary
```

### Debts

```txt
POST   /api/debts
GET    /api/debts
GET    /api/debts/pending
PUT    /api/debts/[id]
DELETE /api/debts/[id]
PATCH  /api/debts/[id]/pay
```

### Balance

```txt
GET /api/balance/summary
```

## Estado atual

O MVP funcional esta implementado:

- backend de Wallet, Finance e Debts consolidado;
- pagamento de divida integrado com Wallet e Finance;
- UI operacional com dashboard, wallet, finance, debts, historico e resumo;
- formularios padronizados com React Hook Form e Zod;
- mensagens com toast e confirmacoes com dialog;
- layout responsivo e navegacao refinada;
- carregamento inicial de dados aproveitando Server Components/Server Data quando faz sentido;
- suites de testes unitarios, integracao e UI configuradas.

## Direcao do projeto

O projeto deve evoluir de forma incremental, preservando o que ja funciona. Mudancas de regra financeira devem ser feitas no dominio/application e acompanhadas por testes. Ajustes de UI devem respeitar a estrutura modular e evitar acoplamento com regra de negocio.

Possiveis evolucoes futuras:

- identidade visual propria;
- favicon e assets oficiais;
- gestao de categorias pelo usuario;
- relatorios por periodo e categoria;
- alertas de vencimento;
- exportacao de dados;
- experiencia PWA;
- eventual separacao entre frontend e backend se o produto crescer nessa direcao.
