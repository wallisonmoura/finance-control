import { NextRequest } from 'next/server';
import { getAuthTokenFromRequest } from './get-auth-token-from-request';
import { makeTokenService } from '@/modules/auth/infra/factories/make-token-service';

export async function getAuthenticatedUserIdFromRequest(
  request: NextRequest,
): Promise<string | null> {
  const token = getAuthTokenFromRequest(request);

  if (!token) {
    return null;
  }

  try {
    const tokenService = makeTokenService();
    const payload = await tokenService.verifyAccessToken(token);

    return payload.sub;
  } catch {
    return null;
  }
}
