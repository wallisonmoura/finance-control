import {
  AUTH_COOKIE_NAME,
  AUTH_JWT_EXPIRES_IN,
  AUTH_TOO_MANY_REGISTER_ATTEMPTS_MESSAGE,
} from '@/modules/auth/constants/auth.constants';
import { makeAuthRateLimiter } from '@/modules/auth/infra/factories/make-auth-rate-limiter';
import { makeSignUpUseCase } from '@/modules/auth/infra/factories/make-sign-up-use-case';
import { getClientIpFromRequest } from '@/modules/auth/presentation/http/helpers/get-client-ip-from-request';
import { SignUpController } from '@/modules/auth/presentation/http/controllers/sign-up.controller';
import { parseDurationToSeconds } from '@/shared/domain/duration/parse-duration-to-seconds';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const ip = getClientIpFromRequest(request);
  const rateLimiter = makeAuthRateLimiter();
  const rateLimitKey = `register:${ip}`;

  if (await rateLimiter.isBlocked(rateLimitKey)) {
    return NextResponse.json(
      { message: AUTH_TOO_MANY_REGISTER_ATTEMPTS_MESSAGE },
      { status: 429 },
    );
  }

  // Unlike sign-in's rate limiter (a lockout triggered only by failed
  // credential attempts), this is a spam-prevention quota: every request
  // that gets past the block check above counts toward it, regardless of
  // outcome (success, duplicate email, or malformed body).
  await rateLimiter.registerAttempt(rateLimitKey);

  try {
    const body = await request.json();

    const useCase = makeSignUpUseCase();
    const controller = new SignUpController(useCase);

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
    return toErrorNextResponse(error);
  }
}
