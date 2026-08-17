import { EmailAlreadyInUseError } from '@/modules/auth/domain/errors/email-already-in-use.error';
import { InvalidCredentialsError } from '@/modules/auth/domain/errors/invalid-credentials.error';
import { InvalidEmailError } from '@/modules/auth/domain/errors/invalid-email.error';
import { UserNotFoundError } from '@/modules/auth/domain/errors/user-not-found.error';
import { InvalidDebtUserIdError } from '@/modules/debts/domain/errors/invalid-debt-user-id.error';
import { DebtAlreadyPaidError } from '@/modules/debts/domain/errors/debt-already-paid.error';
import { DebtNotFoundError } from '@/modules/debts/domain/errors/debt-not-found.error';
import { InvalidDebtAmountError } from '@/modules/debts/domain/errors/invalid-debt-amount.error';
import { InvalidDebtDescriptionError } from '@/modules/debts/domain/errors/invalid-debt-description.error';
import { InvalidDebtDueDateError } from '@/modules/debts/domain/errors/invalid-debt-due-date.error';
import { InvalidDebtPaidStateError } from '@/modules/debts/domain/errors/invalid-debt-paid-state.error';
import { InvalidDebtPendingStateError } from '@/modules/debts/domain/errors/invalid-debt-pending-state.error';
import { UnauthorizedDebtAccessError } from '@/modules/debts/domain/errors/unauthorized-debt-access.error';
import { InvalidExpenseCategorySlugError } from '@/modules/finance/domain/errors/invalid-expense-category-slug.error';
import { InvalidExpenseCategoryUserIdError } from '@/modules/finance/domain/errors/invalid-expense-category-user-id.error';
import { ExpenseCategoryNotFoundError } from '@/modules/finance/domain/errors/expense-category-not-found.error';
import { ExpenseCategoryRequiredError } from '@/modules/finance/domain/errors/expense-category-required.error';
import { FinancialEntryLinkedToDebtError } from '@/modules/finance/domain/errors/financial-entry-linked-to-debt.error';
import { FinancialEntryNotFoundError } from '@/modules/finance/domain/errors/financial-entry-not-found.error';
import { InvalidExpenseCategoryNameError } from '@/modules/finance/domain/errors/invalid-expense-category-name.error';
import { InvalidFinancialEntryDateError } from '@/modules/finance/domain/errors/invalid-financial-entry-date.error';
import { InvalidFinancialEntryDescriptionError } from '@/modules/finance/domain/errors/invalid-financial-entry-description.error';
import { InvalidFinancialEntryTypeError } from '@/modules/finance/domain/errors/invalid-financial-entry-type.error';
import { InvalidFinancialEntryUserIdError } from '@/modules/finance/domain/errors/invalid-financial-entry-user-id.error';
import { UnauthorizedFinancialEntryAccessError } from '@/modules/finance/domain/errors/unauthorized-financial-entry-access.error';
import { InsufficientWalletBalanceError } from '@/modules/wallet/domain/errors/insufficient-wallet-balance.error';
import { InvalidWalletBalanceError } from '@/modules/wallet/domain/errors/invalid-wallet-balance.error';
import { InvalidWalletUserIdError } from '@/modules/wallet/domain/errors/invalid-wallet-user-id.error';
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
  // Auth
  // ---------------------------------------------------------------------------

  if (
    error instanceof InvalidCredentialsError ||
    error instanceof UserNotFoundError
  ) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 401 },
    );
  }

  if (error instanceof InvalidEmailError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 400 },
    );
  }

  if (error instanceof EmailAlreadyInUseError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 409 },
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

  if (error instanceof FinancialEntryLinkedToDebtError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 409 },
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

  if (error instanceof UnauthorizedDebtAccessError) {
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
    error instanceof InvalidDebtDueDateError ||
    error instanceof InvalidDebtUserIdError
  ) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 400 },
    );
  }

  // ---------------------------------------------------------------------------
  // Finance — entity validation
  // ---------------------------------------------------------------------------

  if (
    error instanceof InvalidFinancialEntryUserIdError ||
    error instanceof InvalidFinancialEntryDescriptionError ||
    error instanceof InvalidFinancialEntryDateError ||
    error instanceof InvalidFinancialEntryTypeError ||
    error instanceof ExpenseCategoryRequiredError ||
    error instanceof InvalidExpenseCategoryUserIdError ||
    error instanceof InvalidExpenseCategorySlugError ||
    error instanceof InvalidExpenseCategoryNameError
  ) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 400 },
    );
  }

  // ---------------------------------------------------------------------------
  // Wallet — entity validation
  // ---------------------------------------------------------------------------

  if (
    error instanceof InvalidWalletUserIdError ||
    error instanceof InvalidWalletBalanceError
  ) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      message: 'Erro interno do servidor.',
    },
    { status: 500 },
  );
}
