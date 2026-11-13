import { NextRequest } from 'next/server';
import { getAuthTokenFromRequest } from './get-auth-token-from-request';
import { makeResolveSessionUseCase } from '@/modules/auth/infra/factories/make-resolve-session-use-case';

export async function getAuthenticatedUserIdFromRequest(
  request: NextRequest,
): Promise<string | null> {
  const token = getAuthTokenFromRequest(request);

  if (!token) {
    return null;
  }

  return makeResolveSessionUseCase().execute(token);
}
