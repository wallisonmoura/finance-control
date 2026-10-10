-- Income goals: optional fixed monthly targets for revenue (income of the
-- month) and profit (income − expenses of the month). One row per user,
-- created the first time the user sets a goal. NULL = no goal for that measure.

-- CreateTable
CREATE TABLE "income_goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "revenue_target" DECIMAL(14,2),
    "profit_target" DECIMAL(14,2),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "income_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "income_goals_user_id_key" ON "income_goals"("user_id");

-- AddForeignKey
ALTER TABLE "income_goals" ADD CONSTRAINT "income_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Defense in depth: the domain already refuses non-positive targets.
ALTER TABLE "income_goals" ADD CONSTRAINT "income_goals_revenue_target_check" CHECK ("revenue_target" IS NULL OR "revenue_target" > 0);
ALTER TABLE "income_goals" ADD CONSTRAINT "income_goals_profit_target_check" CHECK ("profit_target" IS NULL OR "profit_target" > 0);
