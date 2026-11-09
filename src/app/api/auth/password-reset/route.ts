import { AUTH_TOO_MANY_PASSWORD_RESET_ATTEMPTS_MESSAGE } from '@/modules/auth/constants/auth.constants';
import { makeAuthRateLimiter } from '@/modules/auth/infra/factories/make-auth-rate-limiter';
import { makeRequestPasswordResetUseCase } from '@/modules/auth/infra/factories/make-request-password-reset-use-case';
import { RequestPasswordResetController } from '@/modules/auth/presentation/http/controllers/request-password-reset.controller';
import { getClientIpFromRequest } from '@/modules/auth/presentation/http/helpers/get-client-ip-from-request';
import { toErrorNextResponse } from '@/shared/presentation/http/to-error-next-response';
import { toNextResponse } from '@/shared/presentation/http/to-next-response';
import { after, NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const rateLimiter = makeAuthRateLimiter();
    const rateLimitKey = `password-reset:${getClientIpFromRequest(request)}`;

    if (await rateLimiter.isBlocked(rateLimitKey)) {
      return NextResponse.json(
        { message: AUTH_TOO_MANY_PASSWORD_RESET_ATTEMPTS_MESSAGE },
        { status: 429 },
      );
    }

    // Every request counts: this limit is about sending e-mails, not failures.
    await rateLimiter.registerAttempt(rateLimitKey);

    const body = await request.json();

    const controller = new RequestPasswordResetController(makeRequestPasswordResetUseCase, after);
    const response = await controller.handle({ body });

    return toNextResponse(response);
  } catch (error) {
    return toErrorNextResponse(error);
  }
}
