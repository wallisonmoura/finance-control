import { NextRequest, NextResponse } from 'next/server';

import {
  AUTH_COOKIE_NAME,
  AUTH_CSRF_ORIGIN_MISMATCH_MESSAGE,
  AUTH_PUBLIC_API_PATHS,
  AUTH_PUBLIC_PAGE_PATHS,
  AUTH_UNAUTHORIZED_MESSAGE,
} from '@/modules/auth/constants/auth.constants';

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

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

function isMutatingMethod(method: string) {
  return MUTATING_METHODS.includes(method);
}

function isOriginMismatch(request: NextRequest) {
  const origin = request.headers.get('origin');

  if (!origin) {
    return false;
  }

  const host = request.headers.get('host');

  if (!host) {
    return false;
  }

  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/api') &&
    isMutatingMethod(request.method) &&
    isOriginMismatch(request)
  ) {
    return NextResponse.json(
      { message: AUTH_CSRF_ORIGIN_MISMATCH_MESSAGE },
      { status: 403 },
    );
  }

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!authCookie) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { message: AUTH_UNAUTHORIZED_MESSAGE },
        { status: 401 },
      );
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/about', request.url));
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
