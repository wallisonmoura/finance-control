import { ExpenseCategoryNotFoundError } from '@/modules/finance/domain/errors/expense-category-not-found.error';
import { FinancialEntryNotFoundError } from '@/modules/finance/domain/errors/financial-entry-not-found.error';
import { UnauthorizedFinancialEntryAccessError } from '@/modules/finance/domain/errors/unauthorized-financial-entry-access.error';
import { DefaultWalletNotFoundError } from '@/modules/finance/infra/errors/default-wallet-not-found.error';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function toErrorNextResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: 'Dados inválidos.',
        issues: error.issues,
      },
      {
        status: 400,
      },
    );
  }

  if (error instanceof ExpenseCategoryNotFoundError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 404,
      },
    );
  }

  if (error instanceof FinancialEntryNotFoundError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 404,
      },
    );
  }

  if (error instanceof UnauthorizedFinancialEntryAccessError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 404,
      },
    );
  }

  if (error instanceof DefaultWalletNotFoundError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json(
    {
      message: 'Erro interno do servidor.',
    },
    {
      status: 500,
    },
  );
}
