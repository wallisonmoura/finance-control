import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';
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

    nextResponse.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return nextResponse;
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
