import { makeGetCurrentUserUseCase } from '@/modules/auth/infra/factories/make-get-current-user-use-case';

import { AuthenticatedUser } from '../ui/types/auth-ui.types';
import { requireActiveSession } from './require-active-session';

type CurrentAuthenticatedUserResult = {
  data?: AuthenticatedUser | null;
  error?: string;
};

export async function getCurrentAuthenticatedUser(): Promise<CurrentAuthenticatedUserResult> {
  const userId = await requireActiveSession();

  try {
    const useCase = makeGetCurrentUserUseCase();
    const { user } = await useCase.execute({ userId });

    return {
      data: user,
    };
  } catch {
    return {
      error: 'Não foi possível carregar o usuário atual.',
    };
  }
}
