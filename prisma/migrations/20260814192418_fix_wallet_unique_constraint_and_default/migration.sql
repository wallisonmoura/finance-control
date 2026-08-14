-- DropIndex
DROP INDEX "wallets_user_id_idx";

-- DropIndex
DROP INDEX "wallets_user_id_name_key";

-- AlterTable
ALTER TABLE "wallets" ALTER COLUMN "is_default" SET DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");
