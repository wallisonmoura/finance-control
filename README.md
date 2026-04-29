# Finance Control

Sistema web de controle financeiro operacional desenvolvido para substituir o uso de planilhas por uma aplicação responsiva, organizada e preparada para uso frequente em dispositivos móveis.

O projeto é construído como um **monólito modular em Next.js**, seguindo princípios de **Clean Architecture** e **Hexagonal Architecture**, com foco em clareza de domínio, separação de responsabilidades, testabilidade e evolução incremental sem overengineering.

---

## Objetivo

O objetivo do **Finance Control** é centralizar a rotina financeira do usuário em um único ambiente, permitindo:

- manter a posição financeira base atualizada;
- registrar receitas realizadas;
- registrar despesas realizadas;
- categorizar despesas;
- acompanhar dívidas pendentes e quitadas;
- pagar dívidas com reflexo correto em Wallet e Finance;
- consultar histórico financeiro por dia e período;
- calcular lucro diário;
- calcular resumo mensal;
- visualizar indicadores derivados como `walletTotal` e, futuramente, `finalBalance`.

O sistema nasceu para resolver uma necessidade pessoal de controle financeiro, mas foi modelado com conceitos genéricos o suficiente para evoluir e atender diferentes perfis, como autônomos, motoristas de aplicativo, vendedores, profissionais liberais e usuários que desejam organizar melhor sua vida financeira.

---

## Problema que o projeto resolve

Antes do sistema, o controle financeiro era feito por planilhas. Apesar de funcionarem como solução inicial, planilhas geram limitações importantes no uso diário:

- baixa usabilidade em dispositivos móveis;
- dependência frequente de computador;
- cálculos manuais ou semiautomáticos;
- risco de erro na consolidação dos dados;
- mistura entre saldo atual, lançamentos realizados e compromissos futuros;
- baixa clareza entre dívida pendente e despesa efetivamente paga.

A proposta do Finance Control é substituir esse fluxo por uma aplicação mais prática, clara e aderente ao uso real do dia a dia.

---

## Visão atual do domínio

Após o realinhamento v2.0, o domínio do sistema passou a ser organizado em quatro módulos principais:

- `auth`
- `wallet`
- `finance`
- `debts`

Cada módulo possui uma responsabilidade própria dentro do domínio financeiro.

---

## Módulos principais

### Auth

Responsável por autenticação, sessão e isolamento dos dados por usuário.

Todas as operações financeiras do sistema devem estar vinculadas ao usuário autenticado.

---

### Wallet

Representa a posição financeira base do usuário.

A Wallet armazena valores reais, informados ou mantidos pelo usuário:

- `bankBalance`
- `cashBalance`
- `receivableBalance`

Esses valores são fonte primária de estado financeiro e não são derivados de receitas e despesas.

O total da carteira é calculado sob demanda:

```txt
walletTotal = bankBalance + cashBalance + receivableBalance
```

---

### Finance

Representa o histórico operacional de eventos financeiros realizados.

O módulo Finance é responsável por:

- receitas realizadas;
- despesas realizadas;
- categorias de despesa;
- histórico de lançamentos;
- consultas por dia e período;
- lucro diário;
- resumo mensal;
- agregações operacionais.

Finance não define sozinho o saldo final do sistema. Ele registra o que aconteceu financeiramente no tempo.

---

### Debts

Representa compromissos financeiros pendentes ou quitados.

Uma dívida cadastrada não é automaticamente uma despesa realizada. Enquanto estiver pendente, ela representa uma obrigação. Quando for paga, o sistema deve:

- alterar o status da dívida para paga;
- registrar `paidAt`;
- registrar `paymentSource`;
- reduzir a Wallet conforme a origem do pagamento;
- gerar uma despesa real no módulo Finance.

As origens de pagamento previstas são:

- `BANK`
- `CASH`
- `RECEIVABLE`

---

## Saldo derivado

O saldo final deixa de ser entendido apenas como `income - expense`.

A leitura consolidada passa a considerar:

```txt
walletTotal = bankBalance + cashBalance + receivableBalance

finalBalance = walletTotal - pendingDebts
```

Esses valores são derivados e não devem ser persistidos como fonte primária.

---

## Arquitetura

O sistema segue uma abordagem de **monólito modular**, organizado por domínio e por camadas.

Fluxo conceitual:

```txt
Presentation → Application → Domain ← Infrastructure
```

Fluxo prático no backend:

```txt
Route Handler / Controller
        ↓
Use Case
        ↓
Repository Contract / Port
        ↓
Repository Prisma / Adapter
        ↓
PostgreSQL
```

---

## Camadas

### Domain

Camada central do sistema.

Contém:

- entidades;
- enums;
- value objects;
- regras de negócio;
- erros de domínio;
- contratos de repositórios;
- ports de integração entre módulos.

Regras importantes:

- não depende de Next.js;
- não depende de Prisma;
- não conhece banco de dados;
- não conhece framework;
- concentra a semântica principal do negócio.

---

### Application

Camada responsável por orquestrar os casos de uso.

Contém:

- use cases;
- DTOs;
- coordenação de fluxos;
- integração entre ports quando necessário.

Regras importantes:

- depende do domínio;
- não depende de framework;
- não deve conter detalhes de HTTP;
- não deve depender diretamente de Prisma.

---

### Infrastructure

Camada responsável pelos adapters concretos.

Contém:

- repositórios Prisma;
- mappers;
- services técnicos;
- factories;
- integrações concretas com banco e serviços externos.

---

### Presentation

Camada responsável por entrada e saída.

No backend atual, contém:

- controllers;
- schemas HTTP;
- presenters quando necessário;
- validação de payload/query;
- tradução de resposta para HTTP.

No Next.js, os Route Handlers em `src/app/api` apenas orquestram a entrada e saída, chamando controllers/factories. Eles não devem conter regra de negócio.

---

## Stack principal

A base tecnológica atual do projeto é composta por:

- **Next.js**
- **TypeScript**
- **PostgreSQL**
- **Prisma ORM**
- **Docker Compose**
- **Zod**
- **Jest**
- **Rest Client**
- **bcryptjs**
- **jose**

A aplicação usa backend integrado ao próprio Next.js por meio de **Route Handlers**.

A proteção inicial de rotas usa:

```txt
src/proxy.ts
```

O projeto adota `proxy.ts` no lugar do antigo `middleware.ts`.

---

## Estrutura sugerida do projeto

```txt
finance-control/
├── docker-compose.yml
├── package.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── jest.config.ts
├── prisma.config.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── rest-client/
│   ├── auth.http
│   ├── wallet.http
│   ├── finance.http
│   └── debts.http
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── auth/
    │   │   ├── wallet/
    │   │   ├── finance/
    │   │   └── debts/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    │
    ├── modules/
    │   ├── auth/
    │   │   ├── domain/
    │   │   ├── application/
    │   │   ├── infra/
    │   │   └── presentation/
    │   │
    │   ├── wallet/
    │   │   ├── domain/
    │   │   ├── application/
    │   │   ├── infra/
    │   │   └── presentation/
    │   │
    │   ├── finance/
    │   │   ├── domain/
    │   │   ├── application/
    │   │   ├── infra/
    │   │   └── presentation/
    │   │
    │   └── debts/
    │       ├── domain/
    │       ├── application/
    │       ├── infra/
    │       └── presentation/
    │
    ├── shared/
    │   ├── infra/
    │   │   └── database/
    │   │       └── prisma/
    │   │           └── client.ts
    │   └── presentation/
    │       └── http/
    │
    └── proxy.ts
```

---

## Modelagem de dados

A modelagem atual é baseada em PostgreSQL com Prisma ORM.

Principais entidades persistidas:

- `users`
- `wallets`
- `expense_categories`
- `transactions`
- `debts`

---

### Users

Representa o usuário autenticado e dono dos dados financeiros.

Responsabilidades principais:

- armazenar identidade do usuário;
- permitir autenticação;
- garantir isolamento dos dados financeiros por `userId`.

---

### Wallets

Representa a posição financeira base do usuário.

Campos conceituais principais:

- `bank_balance`
- `cash_balance`
- `receivable_balance`

Também pode manter campos de apoio como:

- `name`
- `is_default`

A Wallet não representa histórico financeiro. Ela representa o estado financeiro base atual.

---

### Expense Categories

Representa categorias usadas para classificar despesas realizadas.

Exemplos:

- combustível;
- alimentação;
- manutenção;
- moradia;
- parcelas;
- outros.

No MVP, categorias podem ser criadas por seed.

---

### Transactions

Representa eventos financeiros efetivamente realizados.

Tipos:

- `INCOME`
- `EXPENSE`

Uma `transaction` representa um evento ocorrido no tempo, como uma receita recebida ou uma despesa paga.

---

### Debts

Representa compromissos financeiros pendentes ou quitados.

Tipos:

- `ONE_TIME`
- `RECURRING`

Status:

- `PENDING`
- `PAID`

Origem de pagamento:

- `BANK`
- `CASH`
- `RECEIVABLE`

Quando uma dívida é paga, ela deve gerar uma despesa real em `transactions`.

---

## Regras de negócio essenciais

Alguns princípios do domínio são obrigatórios no projeto:

- valores derivados não devem ser persistidos como fonte primária;
- `walletTotal` é derivado da Wallet;
- `finalBalance` é derivado de `walletTotal - pendingDebts`;
- Finance representa eventos financeiros realizados;
- Debt pendente não é despesa realizada;
- Debt paga deve gerar despesa real no Finance;
- pagamento de dívida deve reduzir a Wallet conforme `paymentSource`;
- despesas exigem categoria;
- receitas não exigem categoria;
- valores financeiros não podem ser negativos quando a regra de domínio não permitir;
- regra de negócio não deve ficar na UI;
- regra de negócio não deve ficar na infraestrutura;
- dados financeiros devem sempre respeitar o usuário autenticado.

---

## Casos de uso centrais

### Auth

- autenticar usuário;
- encerrar sessão;
- consultar sessão atual.

---

### Wallet

- visualizar Wallet do usuário;
- atualizar saldos-base;
- visualizar resumo da Wallet;
- calcular `walletTotal`.

---

### Finance

- registrar receita;
- registrar despesa;
- editar receita;
- editar despesa;
- excluir receita;
- excluir despesa;
- consultar lançamentos do dia;
- consultar histórico;
- calcular lucro diário;
- calcular resumo mensal.

---

### Debts

- registrar dívida;
- editar dívida;
- excluir dívida;
- listar dívidas;
- listar dívidas pendentes;
- pagar dívida.

---

### Saldo derivado

- visualizar saldo final;
- calcular `pendingDebts`;
- calcular `finalBalance`.

---

## Endpoints principais

### Auth

```txt
POST /api/auth/sign-in
POST /api/auth/sign-out
GET  /api/auth/me
```

---

### Wallet

```txt
GET /api/wallet
PUT /api/wallet
GET /api/wallet/summary
```

---

### Finance

```txt
POST   /api/finance/incomes
POST   /api/finance/expenses

PUT    /api/finance/incomes/[id]
PUT    /api/finance/expenses/[id]

DELETE /api/finance/incomes/[id]
DELETE /api/finance/expenses/[id]

GET    /api/finance/daily-transactions
GET    /api/finance/history
GET    /api/finance/daily-profit
GET    /api/finance/monthly-summary
```

---

### Debts

```txt
POST   /api/debts
GET    /api/debts
GET    /api/debts/pending

PUT    /api/debts/[id]
DELETE /api/debts/[id]

PATCH  /api/debts/[id]/pay
```

> Observação: os endpoints de `debts` representam a direção esperada do backend após conclusão da integração da Fase 2.

---

## Estado atual do projeto

### Base técnica

A base técnica do projeto já está consolidada:

- projeto Next.js criado;
- TypeScript configurado;
- Docker Compose configurado;
- PostgreSQL rodando;
- Prisma configurado;
- migrations executadas;
- banco validado;
- estrutura modular criada;
- testes com Jest configurados;
- Rest Client utilizado para validações manuais.

---

### Auth

Backend do módulo Auth concluído e validado.

Inclui:

- domínio;
- aplicação;
- repositório Prisma;
- hash de senha com bcrypt;
- geração e validação de token;
- cookie `httpOnly`;
- controllers;
- schemas HTTP;
- factories;
- rotas:
  - `POST /api/auth/sign-in`
  - `POST /api/auth/sign-out`
  - `GET /api/auth/me`
- testes unitários;
- testes de integração;
- validação via Rest Client.

---

### Wallet

Backend do módulo Wallet implementado.

Inclui:

- entity `Wallet`;
- validações de domínio;
- cálculo de `walletTotal`;
- casos de uso:
  - `GetWalletUseCase`
  - `UpdateWalletBalancesUseCase`
  - `GetWalletSummaryUseCase`
- repository contract;
- mapper Prisma;
- repository Prisma;
- controllers;
- schemas HTTP;
- factories;
- rotas:
  - `GET /api/wallet`
  - `PUT /api/wallet`
  - `GET /api/wallet/summary`
- testes unitários;
- testes de integração;
- validação via Rest Client.

---

### Finance

Backend do módulo Finance implementado e realinhado ao modelo v2.0.

O módulo permanece responsável pelo histórico operacional, receitas, despesas e agregações.

Inclui:

- entity `FinancialEntry`;
- entity `ExpenseCategory`;
- enum `FinancialEntryType`;
- contratos de repositório;
- use cases de escrita;
- use cases de leitura;
- mappers Prisma;
- repositories Prisma;
- controllers;
- schemas HTTP;
- factories;
- rotas de escrita;
- rotas de leitura;
- testes unitários;
- testes de integração;
- validação via Rest Client.

Rotas principais:

```txt
POST   /api/finance/incomes
POST   /api/finance/expenses
PUT    /api/finance/incomes/[id]
PUT    /api/finance/expenses/[id]
DELETE /api/finance/incomes/[id]
DELETE /api/finance/expenses/[id]

GET    /api/finance/daily-transactions
GET    /api/finance/history
GET    /api/finance/daily-profit
GET    /api/finance/monthly-summary
```

Observação importante:

O antigo conceito de `available-balance` dentro de Finance foi reavaliado, pois o saldo final agora pertence ao eixo derivado entre Wallet e Debts, não mais ao módulo Finance isoladamente.

---

### Debts

O módulo Debts está em evolução.

Fase 1 concluída:

- entity `Debt`;
- enums:
  - `DebtType`
  - `DebtStatus`
  - `DebtPaymentSource`
- regras de domínio;
- errors;
- repository contract;
- ports de integração:
  - `DebtPaymentFinancialEffectPort`
  - `DebtPaymentWalletEffectPort`
- use cases:
  - `RegisterDebtUseCase`
  - `UpdateDebtUseCase`
  - `DeleteDebtUseCase`
  - `ListDebtsUseCase`
  - `ListPendingDebtsUseCase`
  - `PayDebtUseCase`
- DTOs;
- testes unitários;
- fakes/in-memory.

Fase 2 em andamento/validação:

- implementação de infra com Prisma;
- adapters de integração com Finance e Wallet;
- factories;
- controllers;
- rotas;
- testes de integração;
- validação via Rest Client.

---

## Como rodar o projeto localmente

### 1. Instalar dependências

```bash
npm install
```

---

### 2. Subir o banco com Docker

```bash
docker compose up -d
```

---

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` com as variáveis necessárias.

Exemplo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_control?schema=public"

JWT_SECRET="your-local-secret"
JWT_EXPIRES_IN="7d"
```

---

### 4. Executar migrations

```bash
npx prisma migrate dev
```

---

### 5. Gerar o Prisma Client

```bash
npx prisma generate
```

---

### 6. Executar seed

```bash
npx prisma db seed
```

---

### 7. Rodar a aplicação

```bash
npm run dev
```

A aplicação ficará disponível em:

```txt
http://localhost:3000
```

---

## Scripts úteis

Os scripts podem variar conforme o `package.json`, mas a organização recomendada é:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration --runInBand",
    "test:watch": "jest --watch",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "prisma db seed"
  }
}
```

---

## Testes

A estratégia de testes acompanha a arquitetura em camadas.

---

### Testes unitários

Cobrem:

- entidades;
- value objects;
- regras de domínio;
- use cases;
- fakes/in-memory.

Comando sugerido:

```bash
npm run test:unit
```

---

### Testes de integração

Cobrem:

- repositories Prisma;
- integração com PostgreSQL;
- rotas;
- controllers quando aplicável;
- operações compostas;
- escopo por usuário autenticado.

Comando sugerido:

```bash
npm run test:integration
```

Para testes com banco real, a execução em série é recomendada:

```bash
jest tests/integration --runInBand
```

---

### Testes gerais

```bash
npm run test
```

---

### Rest Client

Os arquivos em `rest-client/` são usados para validação manual dos fluxos HTTP:

```txt
rest-client/
├── auth.http
├── wallet.http
├── finance.http
└── debts.http
```

---

## Estratégia de implementação

O projeto evolui por módulos e fases.

---

### Fase 1 — Núcleo do módulo

Inclui:

- `domain`;
- `application`;
- contratos;
- DTOs;
- erros;
- testes unitários;
- fakes/in-memory.

---

### Fase 2 — Integração backend

Inclui:

- mappers;
- repositories Prisma;
- factories;
- controllers;
- schemas HTTP;
- rotas/API;
- integração com autenticação;
- testes de integração;
- validação com Rest Client.

---

### Fase 3 — Interface

Inclui:

- páginas;
- componentes;
- formulários;
- integração visual com os fluxos de backend.

A UI será implementada após a consolidação do backend e das regras centrais.

---

## Diretrizes arquiteturais obrigatórias

- `domain` não depende de Prisma;
- `domain` não depende de Next.js;
- `application` não depende de framework;
- `infra` implementa adapters concretos;
- `presentation` valida entrada e traduz saída;
- `src/app/api` não contém regra de negócio;
- regra financeira não deve ficar em componente React;
- valores derivados não devem ser persistidos como fonte primária;
- módulos devem manter responsabilidades bem delimitadas;
- evitar overengineering;
- evoluir de forma incremental.

---

## Decisões técnicas importantes

### Uso de `proxy.ts`

O projeto usa `src/proxy.ts` para proteção inicial de rotas, em vez do antigo `middleware.ts`.

---

### JWT e testes

O fluxo real de autenticação usa JWT, mas testes automatizados podem usar fakes ou mocks quando o objetivo não for validar a biblioteca de token em si.

---

### Prisma restrito à infra

Tipos e modelos do Prisma não devem vazar para `domain` ou `application`.

---

### Wallet como módulo próprio

Wallet não deve mais ser tratada como detalhe técnico dentro de Finance.

---

### Finance como histórico operacional

Finance permanece essencial, mas não representa sozinho o saldo final do usuário.

---

### Debt não é Expense automática

A dívida só gera despesa real quando for paga.

---

### Pagamento de dívida como operação composta

O pagamento de dívida integra:

- Debts;
- Wallet;
- Finance.

Esse fluxo deve ser tratado com consistência transacional na infraestrutura.

---

## Evolução futura

A arquitetura atual prepara o projeto para evoluções como:

- dashboard financeiro consolidado;
- visualização de `finalBalance`;
- relatórios por período;
- relatórios por categoria;
- gestão de categorias pelo usuário;
- múltiplas wallets;
- projeção de saldo futuro;
- alertas de vencimento;
- exportação de dados;
- experiência PWA;
- eventual separação entre frontend e backend.

---

## Status resumido

```txt
Auth      ✅ Backend concluído
Wallet    ✅ Backend concluído
Finance   ✅ Backend concluído e realinhado ao modelo v2.0
Debts     🟡 Backend em evolução / integração
UI        🔜 Próxima etapa após estabilização do backend
PWA       🔜 Evolução posterior
```

---

## Observações finais

O Finance Control prioriza uma abordagem pragmática: simples para o MVP, mas tecnicamente organizado para crescer.

O foco do projeto não é apenas criar uma aplicação funcional, mas manter uma base limpa, testável, coerente com o domínio e preparada para evolução sem refatorações caóticas.
