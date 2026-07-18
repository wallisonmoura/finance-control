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
