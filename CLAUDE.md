# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Next.js dev server on http://localhost:3000
npm run build        # prisma generate + next build
npm run lint         # eslint

# Testing
npm run test:unit        # domain, application, controllers, schemas (node env)
npm run test:integration # routes + Prisma repos, --runInBand (needs .env.test + Docker)
npm run test:ui          # React components, hooks, UI services (jsdom env)
npm run test             # unit + integration
npm run test:all         # unit + integration + ui

# Single test file
npx jest tests/unit/modules/auth/application/sign-in.use-case.spec.ts

# Database
docker compose up -d                          # start PostgreSQL
npx prisma migrate dev                        # apply migrations (dev)
npx prisma generate                           # regenerate Prisma client
npm run db:seed:dev                           # seed dev data
set -a && source .env.test && set +a && npx prisma migrate deploy  # prepare test DB
```

## Environment

Requires two `.env` files:

**.env** (dev):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_control?schema=public"
JWT_SECRET="your-local-secret"
JWT_EXPIRES_IN="7d"
```

**.env.test** (integration tests — must point to a DB with "test" in the name):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_control_test?schema=public"
JWT_SECRET="your-local-secret"
JWT_EXPIRES_IN="7d"
```

Create the test DB:
```bash
docker exec finance-control-postgres createdb -U postgres finance_control_test
```

**WSL notes:** Prefer `git grep` over `rg` — ripgrep may not be installed. Docker must be running for integration tests.

## Architecture

Modular monolith — Next.js, Clean Architecture / Hexagonal Architecture.

**Layer flow (backend):**
```
Route Handler (src/app/api/)
  → Controller (presentation/http/controllers/)
    → Use Case (application/use-cases/)
      → Repository Contract (domain/repositories/)
        → Prisma Repository (infra/repositories/)
          → PostgreSQL
```

**Layer rules:**
- `domain` — no dependency on Next.js, Prisma, or UI
- `application` — no framework dependency; orchestrates domain via ports
- `infra` — concrete Prisma adapters, mappers, factories
- `presentation` — controllers, Zod schemas, presenters, server data helpers, React UI

Route Handlers contain no business logic; they call a controller and return its response.

## Commit style

Conventional Commits. Separate commits by module/theme when possible.

## Onde encontrar mais contexto

Regras detalhadas por área estão em `.claude/rules/`:

| Rule | Cobre |
|---|---|
| `rules/testing.md` | Which tests to run, Jest projects, test DB safety |
| `rules/modules.md` | Estrutura interna de módulo, shared code, infra factories |
| `rules/auth.md` | JWT cookies, middleware, session helpers |
| `rules/domain-financeiro.md` | walletTotal, finalBalance, regras de Debt/Transaction |
| `rules/database.md` | Key tables, constraints, isolamento por userId |
| `rules/frontend.md` | UI conventions, Tailwind tokens, Button/MoneyDisplay, brand assets |
| `rules/git-workflow.md` | Branch policy, CI, PR flow, merge policy |

## Documentação de domínio (carregada automaticamente)

@docs/regras-de-negocio-finance-control-v2.0.md
@docs/realinhamento-dominio-financeiro-wallet-balance-debts.md
@docs/casos-de-uso-finance-control-v2.0.md
@docs/documentacao-de-modelagem-db-v2.0.md
@docs/status-implementacao-finance-control-v1.0.md
