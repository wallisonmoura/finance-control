-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "bank_balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN     "cash_balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN     "receivable_balance" DECIMAL(14,2) NOT NULL DEFAULT 0;
