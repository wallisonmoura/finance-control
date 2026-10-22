-- Undo of a debt payment (v1.32.0).
-- payment_recorded_at: when the payment was registered (the 24h undo window
-- counts from here; paid_at is chosen by the user and can be retroactive).
-- generated_from_debt_id: the debt whose payment created this recurring
-- occurrence, so undoing that payment deletes the right occurrence.

-- AlterTable
ALTER TABLE "debts" ADD COLUMN "payment_recorded_at" TIMESTAMPTZ(6),
ADD COLUMN "generated_from_debt_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "debts_generated_from_debt_id_key" ON "debts"("generated_from_debt_id");

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_generated_from_debt_id_fkey" FOREIGN KEY ("generated_from_debt_id") REFERENCES "debts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Defense in depth: a pending debt never has a recorded payment.
ALTER TABLE "debts" ADD CONSTRAINT "debts_payment_recorded_at_check" CHECK ("status" <> 'PENDING' OR "payment_recorded_at" IS NULL);
