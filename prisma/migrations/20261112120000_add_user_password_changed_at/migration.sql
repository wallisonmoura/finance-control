-- When the password was last changed (reset link or Account). A login issued
-- before this moment is no longer accepted. Null = never changed.
ALTER TABLE "users" ADD COLUMN "password_changed_at" TIMESTAMPTZ(6);
