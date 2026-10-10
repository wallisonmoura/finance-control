import { EmailAlreadyInUseError } from '@/modules/auth/domain/errors/email-already-in-use.error';
import { InvalidCredentialsError } from '@/modules/auth/domain/errors/invalid-credentials.error';
import { InvalidEmailError } from '@/modules/auth/domain/errors/invalid-email.error';
import { InvalidUserNameError } from '@/modules/auth/domain/errors/invalid-user-name.error';
import { UserNotFoundError } from '@/modules/auth/domain/errors/user-not-found.error';
import { DebtAlreadyPaidError } from '@/modules/debts/domain/errors/debt-already-paid.error';
import { DebtNotFoundError } from '@/modules/debts/domain/errors/debt-not-found.error';
import { UnauthorizedDebtAccessError } from '@/modules/debts/domain/errors/unauthorized-debt-access.error';
import { InvalidDebtAmountError } from '@/modules/debts/domain/errors/invalid-debt-amount.error';
import { InvalidDebtDescriptionError } from '@/modules/debts/domain/errors/invalid-debt-description.error';
import { InvalidDebtDueDateError } from '@/modules/debts/domain/errors/invalid-debt-due-date.error';
import { InvalidDebtPaidStateError } from '@/modules/debts/domain/errors/invalid-debt-paid-state.error';
import { InvalidDebtPendingStateError } from '@/modules/debts/domain/errors/invalid-debt-pending-state.error';
import { ExpenseCategoryNotFoundError } from '@/modules/finance/domain/errors/expense-category-not-found.error';
import { ExpenseCategoryRequiredError } from '@/modules/finance/domain/errors/expense-category-required.error';
import { FinancialEntryNotFoundError } from '@/modules/finance/domain/errors/financial-entry-not-found.error';
import { InvalidExpenseCategoryNameError } from '@/modules/finance/domain/errors/invalid-expense-category-name.error';
import { InvalidIncomeGoalTargetError } from '@/modules/finance/domain/errors/invalid-income-goal-target.error';
import { InvalidFinancialEntryTypeError } from '@/modules/finance/domain/errors/invalid-financial-entry-type.error';
import { UnauthorizedFinancialEntryAccessError } from '@/modules/finance/domain/errors/unauthorized-financial-entry-access.error';
import { InsufficientWalletBalanceError } from '@/modules/wallet/domain/errors/insufficient-wallet-balance.error';
import { InvalidWalletBalanceError } from '@/modules/wallet/domain/errors/invalid-wallet-balance.error';
import { WalletNotFoundError } from '@/modules/wallet/domain/errors/wallet-not-found.error';
import { DefaultWalletNotFoundError } from '@/shared/infra/errors/default-wallet-not-found.error';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { z, ZodError } from 'zod';

async function readJson(response: Response) {
  return response.json() as Promise<{
    error?: string;
    message?: string;
    issues?: unknown;
  }>;
}

describe('toErrorNextResponse', () => {
  it('should return 400 for ZodError', async () => {
    const schema = z.object({
      amount: z.number().positive(),
    });

    let error: ZodError;

    try {
      schema.parse({
        amount: 0,
      });
    } catch (err) {
      error = err as ZodError;
    }

    const response = toErrorNextResponse(error!);
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body).toBeDefined();
  });

  it('should return 404 for DebtNotFoundError', async () => {
    const response = toErrorNextResponse(new DebtNotFoundError());
    const body = await readJson(response);

    expect(response.status).toBe(404);
    expect(JSON.stringify(body)).toContain('Dívida não encontrada');
  });

  it('should return 404 for UnauthorizedDebtAccessError', async () => {
    const response = toErrorNextResponse(new UnauthorizedDebtAccessError());
    const body = await readJson(response);

    expect(response.status).toBe(404);
    expect(JSON.stringify(body)).toContain('não tem acesso a esta dívida');
  });

  it('should return 409 for DebtAlreadyPaidError', async () => {
    const response = toErrorNextResponse(new DebtAlreadyPaidError());
    const body = await readJson(response);

    expect(response.status).toBe(409);
    expect(JSON.stringify(body)).toContain('já está paga');
  });

  it('should return 409 for InvalidDebtPendingStateError', async () => {
    const response = toErrorNextResponse(new InvalidDebtPendingStateError());

    expect(response.status).toBe(409);
  });

  it('should return 409 for InvalidDebtPaidStateError', async () => {
    const response = toErrorNextResponse(new InvalidDebtPaidStateError());

    expect(response.status).toBe(409);
  });

  it('should return 400 for InvalidDebtAmountError', async () => {
    const response = toErrorNextResponse(new InvalidDebtAmountError());

    expect(response.status).toBe(400);
  });

  it('should return 400 with the message for InvalidIncomeGoalTargetError', async () => {
    const response = toErrorNextResponse(new InvalidIncomeGoalTargetError());

    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toEqual({
      message: 'Meta de ganho deve ser maior que zero.',
    });
  });

  it('should return 400 for InvalidDebtDescriptionError', async () => {
    const response = toErrorNextResponse(new InvalidDebtDescriptionError());

    expect(response.status).toBe(400);
  });

  it('should return 400 for InvalidDebtDueDateError', async () => {
    const response = toErrorNextResponse(new InvalidDebtDueDateError());

    expect(response.status).toBe(400);
  });

  it('should return 404 for WalletNotFoundError', async () => {
    const response = toErrorNextResponse(new WalletNotFoundError());
    const body = await readJson(response);

    expect(response.status).toBe(404);
    expect(JSON.stringify(body)).toContain('Wallet');
  });

  it('should return 404 for DefaultWalletNotFoundError', async () => {
    const response = toErrorNextResponse(new DefaultWalletNotFoundError());

    expect(response.status).toBe(404);
  });

  it('should return 422 for InsufficientWalletBalanceError', async () => {
    const response = toErrorNextResponse(new InsufficientWalletBalanceError());

    expect(response.status).toBe(422);
  });

  it('should return 404 for FinancialEntryNotFoundError', async () => {
    const response = toErrorNextResponse(new FinancialEntryNotFoundError());

    expect(response.status).toBe(404);
  });

  it('should return 404 for ExpenseCategoryNotFoundError', async () => {
    const response = toErrorNextResponse(new ExpenseCategoryNotFoundError());

    expect(response.status).toBe(404);
  });

  it('should return 404 for UnauthorizedFinancialEntryAccessError', async () => {
    const response = toErrorNextResponse(
      new UnauthorizedFinancialEntryAccessError(),
    );

    expect(response.status).toBe(404);
  });

  it('should return 400 for ExpenseCategoryRequiredError', async () => {
    const response = toErrorNextResponse(new ExpenseCategoryRequiredError());

    expect(response.status).toBe(400);
  });

  it('should return 400 for InvalidFinancialEntryTypeError', async () => {
    const response = toErrorNextResponse(new InvalidFinancialEntryTypeError());

    expect(response.status).toBe(400);
  });

  it('should return 400 for InvalidWalletBalanceError', async () => {
    const response = toErrorNextResponse(
      new InvalidWalletBalanceError('bankBalance', -10),
    );

    expect(response.status).toBe(400);
  });

  it('should return 400 for InvalidExpenseCategoryNameError', async () => {
    const response = toErrorNextResponse(new InvalidExpenseCategoryNameError());

    expect(response.status).toBe(400);
  });

  it('should return 401 for InvalidCredentialsError', async () => {
    const response = toErrorNextResponse(new InvalidCredentialsError());
    const body = await readJson(response);

    expect(response.status).toBe(401);
    expect(JSON.stringify(body)).toContain('Credenciais inválidas');
  });

  it('should return 401 for UserNotFoundError', async () => {
    const response = toErrorNextResponse(new UserNotFoundError());

    expect(response.status).toBe(401);
  });

  it('should return 400 for InvalidEmailError', async () => {
    const response = toErrorNextResponse(new InvalidEmailError());

    expect(response.status).toBe(400);
  });

  it('should return 400 for InvalidUserNameError', async () => {
    const response = toErrorNextResponse(new InvalidUserNameError());

    expect(response.status).toBe(400);
  });

  it('should return 409 for EmailAlreadyInUseError', async () => {
    const response = toErrorNextResponse(new EmailAlreadyInUseError());
    const body = await readJson(response);

    expect(response.status).toBe(409);
    expect(JSON.stringify(body)).toContain('já está em uso');
  });

  it('should return 500 for an unknown error', async () => {
    const response = toErrorNextResponse(new Error('Unexpected error'));
    const body = await readJson(response);

    expect(response.status).toBe(500);
    expect(body).toBeDefined();
  });
});
