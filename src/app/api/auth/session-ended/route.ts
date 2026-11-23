import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { clearAuthCookie } from '@/modules/auth/presentation/http/helpers/auth-cookie';
import { NextRequest, NextResponse } from 'next/server';

// Where a page or the app sends a login that is no longer valid: clears the
// cookie (a page cannot) and shows the "session ended" notice on the login.
// A login that is still valid is kept: a link on another site, or a request
// sent just before a password change in Account, must not sign anyone out.
export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserIdFromRequest(request);

  if (userId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.redirect(new URL('/login?session=expired', request.url));

  clearAuthCookie(response);

  return response;
}
