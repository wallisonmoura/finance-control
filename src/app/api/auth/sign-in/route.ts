import {
  AUTH_COOKIE_NAME,
  AUTH_JWT_EXPIRES_IN,
  AUTH_TOO_MANY_ATTEMPTS_MESSAGE,
} from '@/modules/auth/constants/auth.constants';
import { InvalidCredentialsError } from '@/modules/auth/domain/errors/invalid-credentials.error';
import { makeLoginRateLimiter } from '@/modules/auth/infra/factories/make-login-rate-limiter';
import { makeSignInUseCase } from '@/modules/auth/infra/factories/make-sign-in-use-case';
import { getClientIpFromRequest } from '@/modules/auth/presentation/http/helpers/get-client-ip-from-request';
import { SignInController } from '@/modules/auth/presentation/http/controllers/sign-in.controller';
import { parseDurationToSeconds } from '@/shared/domain/duration/parse-duration-to-seconds';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const ip = getClientIpFromRequest(request);
  const rateLimiter = makeLoginRateLimiter();

  if (await rateLimiter.isBlocked(ip)) {
    return NextResponse.json(
      { message: AUTH_TOO_MANY_ATTEMPTS_MESSAGE },
      { status: 429 },
    );
  }

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
      maxAge: parseDurationToSeconds(AUTH_JWT_EXPIRES_IN),
    });

    return nextResponse;
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      await rateLimiter.registerFailedAttempt(ip);
    }

    return toErrorNextResponse(error);
  }
}
