# Finance Control

Finance Control é um sistema web de controle financeiro para quem quer controlar o dinheiro do dia a dia — inclusive autônomos e quem tem renda variável —, criado para substituir o uso de planilhas por uma aplicação mais clara, responsiva e adequada ao uso diário, com foco em ajudar o usuário a economizar e ver o patrimônio crescer.

A diferença em relação a uma planilha de receitas e despesas: o saldo final considera o que você tem hoje (banco, dinheiro e valores a receber) menos as dívidas ainda pendentes — e não só receitas menos despesas. Uma dívida só vira despesa quando é paga.

## O que o sistema faz

Com o Finance Control você:

- sabe quanto realmente tem (carteira menos dívidas pendentes);
- registra o que entrou e saiu, por categoria;
- acompanha dívidas únicas, parceladas e recorrentes e paga direto da carteira;
- entende o mês e define metas (insights, gastos por categoria, faturamento e lucro).

Principais telas e recursos:

- **Painel (`/`, título "Página inicial")**: saldo final, composição dos saldos, metas de ganho do mês (com o lucro em destaque), insights do mês (onde o gasto subiu ou caiu, maior categoria, ganho comparado à média, sugestão de economia) e transações recentes.
- **Carteira (`/wallet`)**: saldos-base em banco, em dinheiro e a receber.
- **Financeiro (`/finance`)**: tela de entrada para `/finance/incomes` (receitas), `/finance/expenses` (despesas), `/finance/history` (histórico paginado com filtros de período, tipo e categoria) e `/finance/summary` (resumo operacional do mês, com resultado diário).
- **Dívidas (`/debts`, `/debts/pending`, `/debts/paid`)**: filtro por mês com mini-resumo, dívidas únicas, **parceladas** (2x a 12x, geradas de uma vez) e **recorrentes** (ao pagar, a próxima ocorrência é criada automaticamente com vencimento no mês seguinte) e **desfazer pagamento** em até 24h após o registro (no aviso logo após pagar, em `/debts` e em `/debts/paid`).
- **Relatórios (`/relatorios`)**, com as abas "Visão geral" e "Metas": gráficos de receita × despesa por mês, gastos por categoria e dívidas pagas; histórico mês a mês de cada categoria com a linha da meta (aberto pelo gráfico de gastos por categoria ou pela aba Metas); metas de gasto por categoria e metas de ganho (faturamento e lucro), cada meta de ganho com seu histórico mês a mês.
- **Conta (`/account`)**: alterar o nome e trocar a senha.
- **Cabeçalho**: sino com dívidas vencendo em breve, botão de tema claro/escuro e menu do usuário (link para `/account`).
- **Páginas públicas**: landing page `/about` (visitantes não autenticados que acessam `/` são redirecionados para ela) e `/login`.
- **Ajuda na tela**: botão "?" ao lado do título na maioria das telas, e nos números do topo do Painel e no total da Carteira, explicando o que é cada coisa e onde fazer cada ação (textos em `src/shared/presentation/ui/help/screen-help.ts`).
- **Experiência**: tema claro/escuro com botão no cabeçalho (via `next-themes`; as telas públicas são sempre escuras), skeletons de carregamento por rota (`loading.tsx` dedicado em cada rota privada), telas de erro e de página não encontrada (`error.tsx`/`not-found.tsx`), PWA instalável (service worker só no build de produção) e mensagem "Sem conexão com a internet" em qualquer chamada à API feita pela tela quando a rede cai (`src/shared/presentation/ui/lib/api-fetch.ts`).
- **Acessibilidade**: navegação por teclado com foco visível, gráficos com descrição para leitor de tela e tabela alternativa, e situação sempre escrita em texto, nunca só em cor.

## Módulos

### Auth

Responsável por login, sessão, usuário autenticado e conta (nome e senha). Todos os dados financeiros pertencem ao usuário da sessão atual. O login tem rate limiting por IP.

Ao criar um usuário, um trigger no banco provisiona automaticamente a Wallet padrão e as categorias de despesa iniciais.

### Wallet

Representa a posição financeira base do usuário:

- saldo em banco;
- saldo em dinheiro;
- valores a receber.

Esses valores são fonte primária de estado financeiro. Atualizar a Wallet não cria receita ou despesa.

```txt
walletTotal = bankBalance + cashBalance + receivableBalance
```

### Finance

Representa eventos financeiros já realizados:

- receitas;
- despesas (sempre com categoria);
- categorias de despesa e metas de gasto por categoria;
- metas de ganho (faturamento e lucro);
- histórico;
- lucro diário e resumo operacional mensal;
- insights do mês;
- consultas por período.

Finance registra o que aconteceu no tempo, mas não define sozinho o saldo final do usuário.

### Debts

Representa compromissos financeiros pendentes ou quitados, do tipo único, parcelado ou recorrente.

Uma dívida pendente não é uma despesa realizada. Quando uma dívida é paga, o sistema, numa única transação:

- marca a dívida como paga e registra a data do pagamento;
- registra a origem do pagamento (banco, dinheiro ou a receber);
- reduz a Wallet conforme a origem;
- gera uma despesa real no Finance;
- protege a despesa gerada contra edição/exclusão comum;
- cria a próxima ocorrência, se a dívida for recorrente.

Desfazer o pagamento (até 24h após o registro) reverte todos esses efeitos de forma atômica.

### Balance

Saldo derivado, que cruza Wallet e Debts sem pertencer a nenhum dos dois:

```txt
finalBalance = walletTotal - pendingDebts
```

### Reports e About

Módulos apenas de `presentation`, sem domain/application/infra:

- `reports`: gráficos, histórico por categoria e páginas de metas em `/relatorios`;
- `about`: landing page pública.

Eles existem porque uma feature que lê dados de dois ou mais módulos ganha um módulo próprio, em vez de morar dentro de um dos módulos que ela lê — o mesmo papel que `balance` cumpre para o saldo final. Assim, por exemplo, `finance` não passa a depender de `debts`.

## Arquitetura

O projeto é construído como um **monólito modular em Next.js**, seguindo princípios de **Clean Architecture** e **Hexagonal Architecture**. A ideia é manter o sistema simples, mas com separação suficiente para evoluir sem misturar regra de negócio, UI, banco e infraestrutura.

O backend segue o fluxo:

```txt
Route Handler (src/app/api/)
  -> Controller (presentation/http/controllers/)
    -> Use Case (application/use-cases/)
      -> Repository Contract (domain/repositories/)
        -> Prisma Repository (infra/repositories/)
          -> PostgreSQL
```

Organização das camadas:

- `domain`: entidades, regras, value objects, erros, serviços de domínio e contratos;
- `application`: casos de uso, DTOs e orquestração de fluxos;
- `infra`: repositórios Prisma, mappers, factories (`make-<use-case>.ts`, sem container de DI) e serviços concretos;
- `presentation`: controllers, schemas Zod, presenters, helpers de dados para Server Components e UI React.

Regras importantes:

- `domain` não depende de Next.js, Prisma, banco ou UI;
- `application` não depende de framework;
- Prisma fica restrito à infraestrutura;
- Route Handlers não contêm regra de negócio: autenticam, chamam o controller e devolvem a resposta;
- valores derivados (`walletTotal`, `finalBalance`, lucro diário, resumos e insights) não são persistidos;
- toda operação respeita isolamento por `userId`.

A autenticação usa JWT em cookie (via `jose`). O `proxy` do Next.js (antigo middleware), em `src/proxy.ts`, protege as rotas não públicas e verifica a origem das requisições mutantes da API.

## Stack

- Node.js 24
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- PostgreSQL 16
- Prisma 7 com driver adapter `pg`
- Docker Compose
- Zod 4
- React Hook Form 7
- Componentes base próprios no estilo shadcn/ui (`src/shared/presentation/ui/primitives/`), sobre Radix UI, com ícones Lucide React
- Tailwind CSS v4
- Recharts 3.10
- Zustand 5
- next-themes 0.4
- next-pwa (`@ducanh2912/next-pwa`)
- sonner
- bcryptjs
- jose 6
- Jest 30
- Testing Library

## Estrutura principal

```txt
src/
  app/
    (private)/
      account/
      debts/            # paid/, pending/
      finance/          # expenses/, history/, incomes/, summary/
      relatorios/       # categorias/[id]/, metas/ (faturamento/, lucro/)
      wallet/
      page.tsx          # Painel
    (public)/
      about/
      login/
    api/
      auth/
      balance/
      debts/
      finance/
      wallet/
  modules/
    about/              # só presentation
    auth/
    balance/
    debts/
    finance/
    reports/            # só presentation
    wallet/
  shared/
    domain/
    infra/
    presentation/
  proxy.ts

# por dentro de um módulo e do shared:
modules/<módulo>/presentation/
  http/      # controllers, schemas, presenters
  server/    # helpers de dados para Server Components
  ui/        # components/, hooks/, services/, types/, utils/
shared/presentation/ui/
  primitives/  components/ (inclui skeletons/)  layout/  help/  lib/  utils/

prisma/
  schema.prisma
  migrations/
  seed.ts

tests/
  config/
  helpers/
  unit/
  integration/
```

## Configuração local

### 1. Instalar dependências

Use Node.js 24 (`engines` no `package.json` e `.nvmrc` na raiz; com nvm: `nvm use`):

```bash
npm install
```

### 2. Subir o PostgreSQL

```bash
docker compose up -d
```

O `docker-compose.yml` sobe um PostgreSQL 16 local (container `finance-control-postgres`) com o banco principal `finance_control`.

### 3. Configurar `.env`

Copie o `.env.example` (o conteúdo padrão já serve para o ambiente local):

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_control?schema=public"
JWT_SECRET="your-local-secret"
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Localmente não existe pooler, então só `DATABASE_URL` é necessária — o Prisma CLI usa `DIRECT_URL` quando ela existe e cai para `DATABASE_URL` quando não existe.

### 4. Aplicar migrations e seed local

```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed:dev
```

O seed cria (ou atualiza) um usuário local de desenvolvimento — a Wallet e as categorias vêm do trigger de provisionamento — e recria a cada execução transações e dívidas de demonstração. As credenciais estão em `prisma/seed.ts`. O seed é bloqueado em `NODE_ENV=production` e também recusa bancos que não pareçam locais ou de teste.

Não rode seed no banco de produção.

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

A aplicação ficará disponível em:

```txt
http://localhost:3000
```

## Banco de teste

Os testes de integração devem rodar contra um banco separado do banco de desenvolvimento.

Crie um database de teste no mesmo PostgreSQL local:

```bash
docker exec finance-control-postgres createdb -U postgres finance_control_test
```

Crie o `.env.test` (por exemplo com `cp .env.example .env.test`) apontando para o banco de teste:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_control_test?schema=public"
JWT_SECRET="your-local-secret"
JWT_EXPIRES_IN="7d"
```

A configuração do Jest para integração carrega `.env.test` e bloqueia a execução se o nome do banco não contiver `test`, evitando que testes limpem dados do banco de desenvolvimento por engano.

Antes de rodar os testes de integração (com o Docker rodando), aplique as migrations no banco de teste:

```bash
set -a && source .env.test && set +a && npx prisma migrate deploy
```

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | `prisma generate` + build de produção (webpack) |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint |
| `npm run test:unit` | Projeto Jest `backend` |
| `npm run test:integration` | Projeto Jest `integration`, em série |
| `npm run test:ui` | Projeto Jest `ui` (com `TZ=America/Sao_Paulo`) |
| `npm run test` | Unit + integração |
| `npm run test:all` | Unit + integração + UI |
| `npm run test:watch` | Jest em modo watch |
| `npm run test:coverage:unit` | Cobertura dos testes unitários |
| `npm run test:coverage:integration` | Cobertura dos testes de integração |
| `npm run test:coverage` | Cobertura unit + integração |
| `npm run db:seed` / `npm run db:seed:dev` | Seed de desenvolvimento |

## Testes

A suíte está separada em três projetos Jest:

- `backend` (`test:unit`, ambiente node): domínio, application, controllers, schemas e helpers de servidor;
- `integration` (`test:integration`, ambiente node): rotas, repositórios Prisma, transações, constraints e trigger do banco — precisa do Docker e do `.env.test`;
- `ui` (`test:ui`, jsdom): componentes, formulários, hooks e serviços de UI.

Os testes ficam em `tests/unit/` e `tests/integration/`, espelhando `src/`. Os testes de integração rodam em série porque acessam banco real.

Para rodar um arquivo só:

```bash
npx jest tests/unit/modules/auth/application/sign-in.use-case.spec.ts
```

## Endpoints principais

Todas as rotas exigem usuário autenticado, exceto as marcadas como **pública**.

### Auth

```txt
POST /api/auth/sign-in          (pública, com rate limiting)
POST /api/auth/sign-out
GET  /api/auth/me
PUT  /api/auth/me               # atualizar nome
PUT  /api/auth/me/password      # trocar senha
```

### Wallet

```txt
GET /api/wallet
PUT /api/wallet
```

### Finance

```txt
POST   /api/finance/incomes
PUT    /api/finance/incomes/[id]
DELETE /api/finance/incomes/[id]

POST   /api/finance/expenses
PUT    /api/finance/expenses/[id]
DELETE /api/finance/expenses/[id]

GET    /api/finance/expense-categories
PUT    /api/finance/expense-categories/[id]/monthly-limit   # meta de gasto (null remove)

PUT    /api/finance/income-goals                            # metas de faturamento e lucro

GET    /api/finance/daily-transactions
GET    /api/finance/daily-profit
GET    /api/finance/history                                 # paginado (page, pageSize)
GET    /api/finance/history/full                            # período completo, sem paginação
GET    /api/finance/monthly-summary
GET    /api/finance/monthly-summary/range                   # últimos N meses (months)
```

### Debts

```txt
POST   /api/debts
GET    /api/debts
GET    /api/debts/pending
POST   /api/debts/installments          # parcelamento (2 a 12 parcelas)
PUT    /api/debts/[id]
DELETE /api/debts/[id]
PATCH  /api/debts/[id]/pay
POST   /api/debts/[id]/undo-payment     # até 24h após o pagamento
```

### Balance

```txt
GET /api/balance/summary
```

## Estado atual e deploy

Os casos de uso do MVP estão implementados, junto com relatórios, metas, insights e as melhorias de experiência listadas acima. A documentação de domínio (regras de negócio, casos de uso, modelagem do banco) e o histórico detalhado de entregas são mantidos fora deste repositório.

Ambientes:

- **local**: PostgreSQL via Docker (`finance_control`);
- **teste local**: PostgreSQL via Docker (`finance_control_test`);
- **CI**: PostgreSQL 16 como service do GitHub Actions;
- **homologação (hml)**: as Preview deployments da Vercel (geradas a cada PR) usam um projeto Supabase separado do de produção, com variáveis próprias escopadas só para Preview. É um recurso opcional para validar mudanças contra um Postgres real antes do merge, não um gate obrigatório;
- **produção**: Vercel para a aplicação Next.js e Supabase como PostgreSQL gerenciado. Merges em `main` disparam deploy automático.

Conexão com o banco em produção (e hml), usando o pooler Supavisor do Supabase:

- `DATABASE_URL`: pooler em **transaction mode** (porta 6543, com `?pgbouncer=true`), usado pela aplicação em runtime;
- `DIRECT_URL`: conexão direta/session mode, usada apenas pelo Prisma CLI para migrations.

Não existe passo automático de migration no deploy. Migrations são aplicadas manualmente, em hml e em produção, antes do merge de uma mudança de schema:

```bash
DIRECT_URL="<connection string direta>" npx prisma migrate deploy
```

A Wallet e as categorias iniciais de cada usuário novo vêm do trigger de provisionamento. O seed do projeto é apenas para desenvolvimento local e se recusa a rodar contra hml e produção.

### CI

O workflow `.github/workflows/ci.yml` roda em todo pull request para `main`, com Node 24 e um PostgreSQL 16 de serviço: aplica as migrations no banco de teste e executa lint → `test:all` → build. Pushes direto em `main` ou em branches sem PR não disparam o CI. Nenhuma mudança vai direto para `main`: toda alteração passa por branch (`feat/`, `fix/`, `chore/`) e PR revisado.

## Direção do projeto

O projeto evolui de forma incremental, preservando o que já funciona. Mudanças de regra financeira são feitas no domínio/application e acompanhadas por testes. Ajustes de UI respeitam a estrutura modular e evitam acoplamento com regra de negócio.

A direção atual de produto é levar o usuário a economizar e ver o patrimônio crescer. Já foram entregues os insights do mês, as metas de gasto por categoria e as metas de ganho. Próximos passos e ideias:

- **próximo**: reserva/investimento com metas — mover parte do saldo para uma reserva (viagem, emergência) e acompanhar o crescimento, como transferência dentro da posição financeira, não como despesa;
- ideias sem prioridade definida: importação de CSV, sugestão de lançamento a partir do histórico (autocomplete), projeção de saldo de fim de mês e uma tela de categorias para ativar ou desativar cada uma (primeiro passo de categorias gerenciadas pelo usuário);
- pausados: "esqueci minha senha" (reset por e-mail) e login com Google;
- fora de escopo por enquanto: várias carteiras por usuário, transferência entre carteiras e lançamentos automáticos de receita/despesa (uma dívida só vira despesa quando paga).
