---
description: Authentication flow — JWT cookies, middleware, and Server Component session helpers
paths: ["src/modules/auth/**", "src/proxy.ts", "middleware.ts"]
---

# Authentication

Auth is cookie-based using JWT via `jose`.

- Middleware lives in `src/proxy.ts` (re-exported from `middleware.ts`) and guards all non-public routes.
- Server Components read the session via helpers in `src/modules/auth/presentation/server/`.
- Every financial entity is isolated by authenticated `userId` — never cross-query data between users.
