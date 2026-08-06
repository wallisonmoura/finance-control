---
description: Authentication flow — JWT cookies, middleware, and Server Component session helpers
paths: ["src/modules/auth/**", "src/proxy.ts", "middleware.ts"]
---

# Authentication

Auth is cookie-based using JWT via `jose`.

- Middleware lives in `src/proxy.ts` (re-exported from `middleware.ts`) and guards all non-public routes.
- Server Components read the session via helpers in `src/modules/auth/presentation/server/`.
- Route Handlers authenticate via helpers in `src/modules/auth/presentation/http/helpers/`: `get-authenticated-user-id-from-request.ts`, `get-auth-token-from-request.ts`, `unauthorized-response.ts`. Every authenticated route calls `getAuthenticatedUserIdFromRequest(request)` and returns `unauthorizedResponse()` when it resolves to `null` — re-verify the JWT per request, never trust a cookie's mere presence.
- Every financial entity is isolated by authenticated `userId` — never cross-query data between users.
