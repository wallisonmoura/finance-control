import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';
import { makeSignInUseCase } from '@/modules/auth/infra/factories/make-sign-in-use-case';
import { SignInController } from '@/modules/auth/presentation/http/controllers/sign-in.controller';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const useCase = makeSignInUseCase();
    const controller = new SignInController(useCase);

    const response = await controller.handle({ body });

    const nextResponse = toNextResponse(response);

    nextResponse.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: response.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return nextResponse;
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
