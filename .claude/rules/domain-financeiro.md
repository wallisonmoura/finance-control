---
description: Core financial domain rules — wallet, balance, debts, transactions, and derived values
paths: ["src/modules/wallet/**", "src/modules/finance/**", "src/modules/debts/**", "src/modules/balance/**"]
---

# Financial Domain Rules

## Derived values

```
walletTotal  = bankBalance + cashBalance + receivableBalance
finalBalance = walletTotal - pendingDebts
```

Derived values are **never persisted** as primary sources.

## Wallet

- Updating Wallet is not a financial transaction.
- Wallet represents the user's base financial position.

## Debts

- A pending Debt is not a realized expense.
- Paying a Debt is atomic: marks the debt as paid, records payment source, reduces Wallet, and creates a protected Transaction in Finance.
- The auto-generated expense (`debtId` on Transaction) **cannot be edited or deleted** through normal Finance flows.

## Transactions

- `debtId` on Transaction is unique — one transaction per debt payment.
- A Transaction with `debtId` is protected; treat it as read-only from the Finance module's perspective.

## Isolation

Every financial entity is isolated by authenticated `userId`. Never cross-query data between users.
