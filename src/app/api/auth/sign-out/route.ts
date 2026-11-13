import { clearAuthCookie } from '@/modules/auth/presentation/http/helpers/auth-cookie';
import { makeSignOutUseCase } from '@/modules/auth/infra/factories/make-sign-out-use-case';
import { SignOutController } from '@/modules/auth/presentation/http/controllers/sign-out.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';

export async function POST() {
  try {
    const useCase = makeSignOutUseCase();
    const controller = new SignOutController(useCase);

    const response = await controller.handle();

    const nextResponse = toNextResponse(response);

    clearAuthCookie(nextResponse);

    return nextResponse;
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
