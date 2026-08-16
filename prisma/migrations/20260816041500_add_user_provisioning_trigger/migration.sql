-- ============================================================================
-- INTENTIONAL RG104 EXCEPTION — READ BEFORE TOUCHING OR IMITATING THIS PATTERN
-- ============================================================================
--
-- RG104 (docs/regras-de-negocio-finance-control-v2.0.md) states that
-- Infrastructure implements concrete adapters for domain contracts and must
-- not redefine the system's central behavior — business logic belongs in
-- domain/application, not in the database.
--
-- This migration is a deliberate, owner-approved exception to that rule.
-- It puts two pieces of business logic directly in Postgres, via an
-- AFTER INSERT trigger on "users":
--   1. the default Wallet shape (name = 'Main Wallet', is_default = true,
--      zeroed balances)
--   2. the list of the 26 default ExpenseCategory rows (name + slug pairs)
--
-- Why: today a new user can be created through more than one path that
-- application code cannot intercept — a manual SQL INSERT INTO users run
-- directly in the Supabase SQL editor (the only way new users are created
-- today, since there is no /register flow yet), the dev seed
-- (prisma/seed.ts), and, in the future, a SignUpUseCase. A trigger is the
-- only mechanism that guarantees provisioning regardless of *how* the row
-- was inserted, including a raw SQL INSERT that never touches the Node
-- process at all.
--
-- This is NOT a pattern to replicate elsewhere in this project. Every other
-- business rule in this codebase belongs in domain/application, enforced by
-- the normal Controller -> UseCase -> Repository flow. If a future
-- SignUpUseCase is implemented, it does NOT need to (and should not)
-- duplicate this provisioning logic — the trigger already covers it.
-- ============================================================================

CREATE OR REPLACE FUNCTION provision_default_user_data()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "wallets" (
    "id", "user_id", "name", "is_default",
    "bank_balance", "cash_balance", "receivable_balance",
    "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), NEW."id", 'Main Wallet', true,
    0, 0, 0,
    NOW(), NOW()
  );

  INSERT INTO "expense_categories" (
    "id", "user_id", "name", "slug", "is_active", "created_at", "updated_at"
  ) VALUES
    (gen_random_uuid(), NEW."id", 'Combustível', 'combustivel', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Alimentação', 'alimentacao', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Manutenção', 'manutencao', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Transporte', 'transporte', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Moradia / Aluguel', 'moradia-aluguel', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Energia', 'energia', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Água', 'agua', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Internet / Telefone', 'internet-telefone', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Compras / Insumos', 'compras-insumos', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Taxas / Impostos', 'taxas-impostos', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Equipamentos', 'equipamentos', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Marketing', 'marketing', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Saúde', 'saude', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Parcelas', 'parcelas', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Bebida alcoólica', 'bebida-alcoolica', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Bebida não alcoólica', 'bebida-nao-alcoolica', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Empréstimo pessoal', 'emprestimo-pessoal', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Assinaturas', 'assinaturas', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Seguros', 'seguros', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Cuidados pessoais', 'cuidados-pessoais', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Pet', 'pet', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Lazer / Entretenimento', 'lazer-entretenimento', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Vestuário', 'vestuario', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Educação', 'educacao', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Presentes', 'presentes', true, NOW(), NOW()),
    (gen_random_uuid(), NEW."id", 'Outros', 'outros', true, NOW(), NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_provision_default_user_data
AFTER INSERT ON "users"
FOR EACH ROW
EXECUTE FUNCTION provision_default_user_data();
