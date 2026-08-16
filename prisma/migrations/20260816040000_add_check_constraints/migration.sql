-- Defense-in-depth CHECK constraints.
--
-- These 5 rules are already enforced in the domain/application layer (the
-- Money value object for amount/balance validation, ExpenseCategoryRequiredError,
-- InvalidDebtPendingStateError / InvalidDebtPaidStateError). This migration adds
-- a second layer of protection at the database level, matching what is already
-- documented in docs/documentacao-de-modelagem-db-v2.0.md section 14. It causes
-- zero observable behavior change for the running application.

-- Wallets: balances can never go negative.
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_bank_balance_check" CHECK ("bank_balance" >= 0);
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_cash_balance_check" CHECK ("cash_balance" >= 0);
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_receivable_balance_check" CHECK ("receivable_balance" >= 0);

-- Transactions and debts: amount must always be strictly positive.
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_amount_check" CHECK ("amount" > 0);
ALTER TABLE "debts" ADD CONSTRAINT "debts_amount_check" CHECK ("amount" > 0);

-- Transactions: expense_category_id is required for EXPENSE, forbidden for INCOME.
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_expense_category_check" CHECK (
  ("type" = 'EXPENSE' AND "expense_category_id" IS NOT NULL) OR
  ("type" = 'INCOME' AND "expense_category_id" IS NULL)
);

-- Debts: paid_at/payment_source must be null while PENDING, and both set when PAID.
ALTER TABLE "debts" ADD CONSTRAINT "debts_paid_state_check" CHECK (
  ("status" = 'PENDING' AND "paid_at" IS NULL AND "payment_source" IS NULL) OR
  ("status" = 'PAID' AND "paid_at" IS NOT NULL AND "payment_source" IS NOT NULL)
);
