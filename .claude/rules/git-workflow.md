---
description: Branch and PR workflow — no direct commits to main, CI requirements, merge policy
---

# Git Workflow

## Branch policy

No change is made directly on `main`. Every change starts on a new descriptive branch:

```
feat/<name>    # new feature
fix/<name>     # bug fix
chore/<name>   # tooling, config, docs, refactor
```

## CI

CI runs on every pull request targeting `main` — when the PR is opened and on every new commit pushed while it is open. Pushes to branches without an open PR (and direct pushes to `main`) do not trigger it. Jobs: lint → test:all → build. All must pass before merge.

## Opening a PR

After implementing and tests passing, open a PR from the feature branch to `main`. **Do not merge automatically.**

Only merge to `main` after the user explicitly reviews and approves the PR.

## Commit style

Conventional Commits. Separate commits by module/theme when possible.

Examples:
```
feat(wallet): add receivable balance field
fix(debts): prevent editing auto-generated transactions
chore(ci): run workflow only on pull requests to main
```

## Versioning

Every `feat` or `fix` PR bumps `package.json` `"version"` by SemVer — `feat` = minor, `fix` = patch — in its own `chore(release): bump version to X.Y.Z` commit, in the same PR. Pure `chore`/`docs`-only PRs (no `feat`/`fix` commits) do not need a bump.

**`fix` means an observable behavior change** — something a caller of the code (an API consumer, a use case's return value, an error type) could actually notice was different before vs. after. A change that only touches internal structure/style with zero observable difference (renaming a method signature's shape, switching `.toNumber()` for `Number(...)` on an equivalent value, moving files between folders) is `refactor`/`chore`, not `fix` — even if it was found while auditing for "bugs." `refactor`-only PRs do not need a version bump either, for the same reason `chore`/`docs`-only ones don't: nothing changed that a consumer would need to know about via SemVer.

**Do this before opening the PR, not after** — it's easy to forget once the PR is already up. Check the bump is present as part of the pre-PR review, the same way the Prisma-migration check is (see `backend-engineer` agent's Prisma pre-PR gate). If a bump is missing on an already-open PR, add it as a new commit before merge rather than skipping it.
