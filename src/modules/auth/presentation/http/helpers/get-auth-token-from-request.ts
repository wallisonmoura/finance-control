import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';
import { NextRequest } from 'next/server';

export function getAuthTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
}
