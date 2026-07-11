---
description: UI conventions, Tailwind v4 semantic tokens, component patterns, and brand assets
paths: ["src/**/presentation/ui/**", "src/shared/presentation/ui/**"]
---

# Frontend Conventions

## Tailwind CSS v4

Use semantic tokens defined in `globals.css` — avoid hardcoded colors:

```
bg-background          text-foreground         text-muted-foreground
bg-card                text-card-foreground
border-border          border-input            ring-ring
bg-primary             text-primary-foreground
bg-accent              text-accent-foreground
text-destructive       bg-destructive/10
bg-income-muted        text-income
bg-expense-muted       text-expense
bg-info-muted          text-info
bg-warning-muted       text-warning
bg-success-light
```

**Avoid:**
- `!important` overrides: `!bg-*`, `!text-*`, `bg-white!`, `text-white!`
- Direct CSS variables: `text-[var(--fc-secondary)]` — use the semantic token instead
- Repeated literal colors that represent a reusable semantic
- Local color variations that should mirror light/dark via tokens

If a recurring color has no token yet, add it to `globals.css` with both light and `.dark` variants.

## Button

- Use existing variants whenever possible.
- Use `variant="custom"` when the button needs to control its own color, hover, and text without `!`.
- Never force color with `!` to override the primitive.

## MoneyDisplay

Accepts class merging for color overrides — use `cn`/`tailwind-merge`, never `!`.

## Other component rules

- No `TextareaField` — use `Input` for short text; only add textarea if explicitly justified.
- For shared components: use `cn`/merge to allow predictable overrides; keep components prepared for light/dark via tokens; avoid coupling shared UI to a module-specific literal color.
- State management: Zustand for UI state; React Hook Form + Zod for forms; Server Components for initial data load where feasible.

## Brand palette

```
Primary:           #020617
Secondary:         #10B981
Background:        #F8FAFC
Secondary text:    #475569
Primary text:      #0F172A
Error / expense:   #EF4444
Light success:     #D1FAE5
```

Slogan: "Seu dinheiro, seu controle, seu futuro."

## Brand assets

Reference assets live in `docs/finance-control-brand-assets/`:

```
docs/finance-control-brand-assets/
  README.md
  design/          # brand-board.png, palette.json, tokens.css
  docs/
  public/          # final assets — copy to public/ when deploying
```

When applying the brand:
- Use official assets when they exist; do not recreate manually.
- Maintain contrast and legibility.
- Validate desktop and mobile for relevant visual changes.
- Prefer incremental, reviewable changes.
- Preserve operational clarity of the financial system.

## Visual change scope

Do not alter without explicit need: business rules, domain, application, infrastructure, Prisma, migrations, endpoints, composite operations, debt payment flow, or API contracts. If a visual change requires backend adjustment, explain the reason first.
