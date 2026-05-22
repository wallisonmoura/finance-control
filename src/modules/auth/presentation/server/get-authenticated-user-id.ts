import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';
import { makeTokenService } from '@/modules/auth/infra/factories/make-token-service';
import { cookies } from 'next/headers';

export async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;

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
