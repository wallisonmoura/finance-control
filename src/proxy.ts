import { NextRequest, NextResponse } from 'next/server';

import {
  AUTH_COOKIE_NAME,
  AUTH_PUBLIC_API_PATHS,
  AUTH_PUBLIC_PAGE_PATHS,
  AUTH_UNAUTHORIZED_MESSAGE,
} from '@/modules/auth/constants/auth.constants';

function isPublicApiPath(pathname: string) {
  return AUTH_PUBLIC_API_PATHS.some((path) => pathname.startsWith(path));
}

function isPublicPagePath(pathname: string) {
  return AUTH_PUBLIC_PAGE_PATHS.some((path) => pathname.startsWith(path));
}

function isStaticPath(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons')
  );
}

function isPublicPath(pathname: string) {
  return isPublicApiPath(pathname) || isPublicPagePath(pathname);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!authCookie) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { message: AUTH_UNAUTHORIZED_MESSAGE },
        { status: 401 },
      );
    }

    const redirectTo = pathname;

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', redirectTo);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)'],
};
