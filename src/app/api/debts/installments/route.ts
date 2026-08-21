import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { unauthorizedResponse } from '@/modules/auth/presentation/http/helpers/unauthorized-response';
import { makeRegisterInstallmentDebtUseCase } from '@/modules/debts/infra/factories/make-register-installment-debt-use-case';
import { RegisterInstallmentDebtController } from '@/modules/debts/presentation/http/controllers/register-installment-debt.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserIdFromRequest(request);

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();

    const controller = new RegisterInstallmentDebtController(
      makeRegisterInstallmentDebtUseCase(),
    );

    const response = await controller.handle({
      userId,
      body,
    });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
