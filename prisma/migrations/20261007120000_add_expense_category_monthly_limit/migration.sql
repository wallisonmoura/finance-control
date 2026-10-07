-- Spending goals (sub-project B): an optional fixed monthly cap per expense
-- category. NULL = the category is not controlled.
ALTER TABLE "expense_categories" ADD COLUMN "monthly_limit" DECIMAL(14,2);

ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_monthly_limit_check" CHECK ("monthly_limit" IS NULL OR "monthly_limit" > 0);
