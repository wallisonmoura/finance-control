import { AUTH_UNAUTHORIZED_MESSAGE } from '@/modules/auth/constants/auth.constants';
import { SESSION_ENDED_HEADER } from '@/shared/presentation/http/session-ended';
import { NextResponse } from 'next/server';

import { clearAuthCookie } from './auth-cookie';

// No valid login (missing, expired or signed out by a password change). Marked
// so the app takes the user to the login notice, and clears a leftover cookie.
export function unauthorizedResponse(message = AUTH_UNAUTHORIZED_MESSAGE) {
  const response = NextResponse.json(
    { message },
    { status: 401, headers: { [SESSION_ENDED_HEADER]: '1' } },
  );

  clearAuthCookie(response);

  return response;
}
