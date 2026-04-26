-- CreateEnum
CREATE TYPE "DebtPaymentSource" AS ENUM ('BANK', 'CASH', 'RECEIVABLE');

-- AlterTable
ALTER TABLE "debts" ADD COLUMN     "payment_source" "DebtPaymentSource";
