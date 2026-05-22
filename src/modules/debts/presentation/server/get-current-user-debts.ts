import { getAuthenticatedUserId } from '@/modules/auth/presentation/server/get-authenticated-user-id';
import { DebtOutput } from '@/modules/debts/application/dto/debt.output';
import { makeListDebtsUseCase } from '@/modules/debts/infra/factories/make-list-debts-use-case';
import { makeListPendingDebtsUseCase } from '@/modules/debts/infra/factories/make-list-pending-debts-use-case';

import { DebtUi } from '../ui/types/debt-ui.types';

type CurrentUserDebtsResult = {
  data?: DebtUi[];
  error?: string;
};

function toDebtUi(debt: DebtOutput): DebtUi {
  return {
    ...debt,
    dueDate: debt.dueDate.toISOString(),
    paidAt: debt.paidAt?.toISOString() ?? null,
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

export async function getCurrentUserPendingDebts(): Promise<CurrentUserDebtsResult> {
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
}
