import { AUTH_UNAUTHORIZED_MESSAGE } from '@/modules/auth/constants/auth.constants';
import { makeGetCurrentUserUseCase } from '@/modules/auth/infra/factories/make-get-current-user.use-case';
import { JoseJwtTokenService } from '@/modules/auth/infra/services/jose-jwt-token.service';
import { GetCurrentUserController } from '@/modules/auth/presentation/http/controllers/get-current-user.controller';
import { getAuthTokenFromRequest } from '@/modules/auth/presentation/http/helpers/get-auth-token-from-request';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return NextResponse.json(
      { message: AUTH_UNAUTHORIZED_MESSAGE },
      { status: 500 },
    );
  }

  const getCurrentUserUseCase = makeGetCurrentUserUseCase();

  const tokenService = new JoseJwtTokenService(jwtSecret!);

  const controller = new GetCurrentUserController(
    getCurrentUserUseCase,
    tokenService,
  );

  const token = getAuthTokenFromRequest(request);

  return controller.handle({ token });
}
