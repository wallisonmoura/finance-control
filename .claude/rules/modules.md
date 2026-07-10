---
description: Internal module structure, shared code, infra factories, and implementation strategy
paths: ["src/modules/**", "src/shared/**"]
---

# Modules

## Internal structure

Every module (`auth`, `wallet`, `finance`, `debts`, `balance`) follows the same layout:

```
src/modules/<module>/
  domain/          # entities, value objects, errors, repository contracts, domain services
  application/     # use cases, DTOs
  infra/           # Prisma repos, mappers, factories, concrete services
  presentation/
    http/          # controllers, Zod schemas, presenters
    server/        # Server Component data helpers
    ui/            # React components, hooks, services, types
```

## Shared code (`src/shared/`)

- `infra/database/prisma/client.ts` — singleton PrismaClient (pg adapter)
- `presentation/http/` — base controller type, response helpers
- `presentation/ui/primitives/` — shadcn primitives (Button, Input, Card, etc.)
- `presentation/ui/components/` — composed shared components (MoneyDisplay, ConfirmDialog, etc.)
- `presentation/ui/layout/` — sidebar, mobile menu, navigation

## Infra factories

Each use case is wired via a factory in `infra/factories/` (e.g., `make-sign-in-use-case.ts`). Route Handlers call the factory to get the composed use case — no DI container.

## Implementation strategy

- Preserve what already works; evolve incrementally.
- Do not restart existing modules without explicit need.
- Do not touch backend/business rules during visual changes unless explicitly required — explain the reason first.
- Before changing anything, check `git status`.
- Read only the files necessary for the current task.
- Prefer `git grep` over `rg` — ripgrep may not be installed in WSL.
- Make small, reviewable changes with a clear objective.
- Use Conventional Commits; separate commits by module/theme when possible.
