-- Password reset links ("esqueci minha senha"). Only a SHA-256 hash of each
-- token is stored: the token itself exists only in the e-mail sent to the
-- user. A token is valid until expires_at and only while used_at is NULL;
-- using it, asking for a new one or changing the password sets used_at.
-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_created_at_idx" ON "password_reset_tokens"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- The app talks to the database only through Prisma (as the table owner), so
-- RLS without policies changes nothing for it and keeps Supabase's public
-- REST API from reading these hashes.
ALTER TABLE "password_reset_tokens" ENABLE ROW LEVEL SECURITY;
