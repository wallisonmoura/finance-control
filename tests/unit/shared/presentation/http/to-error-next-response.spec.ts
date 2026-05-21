import { DebtAlreadyPaidError } from '@/modules/debts/domain/errors/debt-already-paid.error';
import { DebtNotFoundError } from '@/modules/debts/domain/errors/debt-not-found.error';
import { InvalidDebtAmountError } from '@/modules/debts/domain/errors/invalid-debt-amount.error';
import { InvalidDebtDescriptionError } from '@/modules/debts/domain/errors/invalid-debt-description.error';
import { InvalidDebtDueDateError } from '@/modules/debts/domain/errors/invalid-debt-due-date.error';
import { InvalidDebtPaidStateError } from '@/modules/debts/domain/errors/invalid-debt-paid-state.error';
import { InvalidDebtPendingStateError } from '@/modules/debts/domain/errors/invalid-debt-pending-state.error';
import { ExpenseCategoryNotFoundError } from '@/modules/finance/domain/errors/expense-category-not-found.error';
import { FinancialEntryNotFoundError } from '@/modules/finance/domain/errors/financial-entry-not-found.error';
import { UnauthorizedFinancialEntryAccessError } from '@/modules/finance/domain/errors/unauthorized-financial-entry-access.error';
import { InsufficientWalletBalanceError } from '@/modules/wallet/domain/errors/insufficient-wallet-balance.error';
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
  it('deve retornar 400 para ZodError', async () => {
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

  it('deve retornar 404 para DebtNotFoundError', async () => {
    const response = toErrorNextResponse(new DebtNotFoundError());
    const body = await readJson(response);

    expect(response.status).toBe(404);
    expect(JSON.stringify(body)).toContain('Dívida não encontrada');
  });

  it('deve retornar 409 para DebtAlreadyPaidError', async () => {
    const response = toErrorNextResponse(new DebtAlreadyPaidError());
    const body = await readJson(response);

    expect(response.status).toBe(409);
    expect(JSON.stringify(body)).toContain('já está paga');
  });

  it('deve retornar 409 para InvalidDebtPendingStateError', async () => {
    const response = toErrorNextResponse(new InvalidDebtPendingStateError());

    expect(response.status).toBe(409);
  });

  it('deve retornar 409 para InvalidDebtPaidStateError', async () => {
    const response = toErrorNextResponse(new InvalidDebtPaidStateError());

    expect(response.status).toBe(409);
  });

  it('deve retornar 400 para InvalidDebtAmountError', async () => {
    const response = toErrorNextResponse(new InvalidDebtAmountError());

    expect(response.status).toBe(400);
  });

  it('deve retornar 400 para InvalidDebtDescriptionError', async () => {
    const response = toErrorNextResponse(new InvalidDebtDescriptionError());

    expect(response.status).toBe(400);
  });

  it('deve retornar 400 para InvalidDebtDueDateError', async () => {
    const response = toErrorNextResponse(new InvalidDebtDueDateError());

    expect(response.status).toBe(400);
  });

  it('deve retornar 404 para WalletNotFoundError', async () => {
    const response = toErrorNextResponse(new WalletNotFoundError());
    const body = await readJson(response);

    expect(response.status).toBe(404);
    expect(JSON.stringify(body)).toContain('Wallet');
  });

  it('deve retornar 404 para DefaultWalletNotFoundError', async () => {
    const response = toErrorNextResponse(new DefaultWalletNotFoundError());

    expect(response.status).toBe(404);
  });

  it('deve retornar 422 para InsufficientWalletBalanceError', async () => {
    const response = toErrorNextResponse(new InsufficientWalletBalanceError());

    expect(response.status).toBe(422);
  });

  it('deve retornar 404 para FinancialEntryNotFoundError', async () => {
    const response = toErrorNextResponse(new FinancialEntryNotFoundError());

    expect(response.status).toBe(404);
  });

  it('deve retornar 404 para ExpenseCategoryNotFoundError', async () => {
    const response = toErrorNextResponse(new ExpenseCategoryNotFoundError());

    expect(response.status).toBe(404);
  });

  it('deve retornar 404 para UnauthorizedFinancialEntryAccessError', async () => {
    const response = toErrorNextResponse(
      new UnauthorizedFinancialEntryAccessError(),
    );

    expect(response.status).toBe(404);
  });

  it('deve retornar 500 para erro desconhecido', async () => {
    const response = toErrorNextResponse(new Error('Unexpected error'));
    const body = await readJson(response);

    expect(response.status).toBe(500);
    expect(body).toBeDefined();
  });
});
