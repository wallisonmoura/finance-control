---
description: Which tests to run, Jest project structure, and test DB safety rules
paths: ["src/**", "tests/**"]
---

# Testing

## Which tests to run

| Change type | Command |
|---|---|
| Visual/UI-only | `npm run lint` → `npm run test:ui` |
| Component, hook, UI service | `npm run test:ui` |
| `globals.css`, Tailwind tokens, layout, metadata, config | `npm run build` |
| Domain, use case, controller, schema, Prisma repo, route | `npm run test:unit && npm run test:integration` |

Avoid `test:all` for purely visual changes.

## Jest projects

- `backend` — node env; domain, application, controllers, schemas
- `integration` — node env, `--runInBand`; routes + Prisma repositories (needs `.env.test` + Docker)
- `ui` — jsdom env; React components, hooks, UI services

## Test structure

```
tests/
  config/           # jest setup files per project
  helpers/database/ # test factories and DB cleanup utilities
  unit/             # mirrors src/modules/ and src/shared/
  integration/      # mirrors src/app/api/ routes and infra repos
```

Path alias `@/` maps to `src/`.

## Test DB safety

Integration tests require `.env.test` pointing to a DB whose name contains `test` (e.g. `finance_control_test`). Jest config aborts if `DATABASE_URL` does not contain `test`. Never run integration tests if there is any risk of `DATABASE_URL` pointing to the dev database.

Seed is blocked in `NODE_ENV=production`.

## Run a single test file

```bash
npx jest tests/unit/modules/auth/application/sign-in.use-case.spec.ts
```
