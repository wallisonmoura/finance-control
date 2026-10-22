import { getAuthenticatedUserId } from '@/modules/auth/presentation/server/get-authenticated-user-id';
import { DebtOutput } from '@/modules/debts/application/dtos/debt.output';
import { makeListDebtsUseCase } from '@/modules/debts/infra/factories/make-list-debts-use-case';
import { makeListPendingDebtsUseCase } from '@/modules/debts/infra/factories/make-list-pending-debts-use-case';
import { cache } from 'react';

import { DebtUi } from '../ui/types/debts-ui.types';

type CurrentUserDebtsResult = {
  data?: DebtUi[];
  error?: string;
};

// Field by field (no spread) so backend-only fields such as the recurrence
// link never reach the client.
function toDebtUi(debt: DebtOutput): DebtUi {
  return {
    id: debt.id,
    userId: debt.userId,
    description: debt.description,
    amount: debt.amount,
    dueDate: debt.dueDate.toISOString(),
    type: debt.type,
    status: debt.status,
    notes: debt.notes,
    paidAt: debt.paidAt?.toISOString() ?? null,
    paymentSource: debt.paymentSource,
    paymentRecordedAt: debt.paymentRecordedAt?.toISOString() ?? null,
    createdAt: debt.createdAt.toISOString(),
    updatedAt: debt.updatedAt.toISOString(),
  };
}

async function getCurrentUserIdOrError(): Promise<
  { userId: string; error?: never } | { userId?: never; error: string }
> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      error: 'Não autenticado',
    };
  }

  return { userId };
}

export async function getCurrentUserDebts(): Promise<CurrentUserDebtsResult> {
  const auth = await getCurrentUserIdOrError();

  if ('error' in auth) {
    return {
      error: auth.error,
    };
  }

  try {
    const useCase = makeListDebtsUseCase();
    const debts = await useCase.execute({ userId: auth.userId });

    return {
      data: debts.map(toDebtUi),
    };
  } catch {
    return {
      error: 'Não foi possível carregar dívidas.',
    };
  }
}

export const getCurrentUserPendingDebts = cache(
  async (): Promise<CurrentUserDebtsResult> => {
    const auth = await getCurrentUserIdOrError();

    if ('error' in auth) {
      return {
        error: auth.error,
      };
    }

    try {
      const useCase = makeListPendingDebtsUseCase();
      const debts = await useCase.execute({ userId: auth.userId });

      return {
        data: debts.map(toDebtUi),
      };
    } catch {
      return {
        error: 'Não foi possível carregar dívidas pendentes.',
      };
    }
  },
);
