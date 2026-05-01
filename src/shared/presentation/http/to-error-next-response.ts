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
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function toErrorNextResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: 'Erro de validação.',
        issues: error.issues,
      },
      { status: 400 },
    );
  }

  // ---------------------------------------------------------------------------
  // Auth / Infra shared
  // ---------------------------------------------------------------------------

  if (error instanceof DefaultWalletNotFoundError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 404 },
    );
  }

  // ---------------------------------------------------------------------------
  // Wallet
  // ---------------------------------------------------------------------------

  if (error instanceof WalletNotFoundError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 404 },
    );
  }

  if (error instanceof InsufficientWalletBalanceError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 422 },
    );
  }

  // ---------------------------------------------------------------------------
  // Finance
  // ---------------------------------------------------------------------------

  if (error instanceof FinancialEntryNotFoundError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 404 },
    );
  }

  if (error instanceof ExpenseCategoryNotFoundError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 404 },
    );
  }

  if (error instanceof UnauthorizedFinancialEntryAccessError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 404 },
    );
  }

  // ---------------------------------------------------------------------------
  // Debts
  // ---------------------------------------------------------------------------

  if (error instanceof DebtNotFoundError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 404 },
    );
  }

  if (error instanceof DebtAlreadyPaidError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 409 },
    );
  }

  if (
    error instanceof InvalidDebtPendingStateError ||
    error instanceof InvalidDebtPaidStateError
  ) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 409 },
    );
  }

  if (
    error instanceof InvalidDebtAmountError ||
    error instanceof InvalidDebtDescriptionError ||
    error instanceof InvalidDebtDueDateError
  ) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 400 },
    );
  }

  console.error('[HTTP_ERROR]', error);

  return NextResponse.json(
    {
      message: 'Erro interno do servidor.',
    },
    { status: 500 },
  );
}
