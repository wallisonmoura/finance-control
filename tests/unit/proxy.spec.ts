import { NextRequest } from 'next/server';

import { proxy } from '@/proxy';
import {
  AUTH_COOKIE_NAME,
  AUTH_CSRF_ORIGIN_MISMATCH_MESSAGE,
} from '@/modules/auth/constants/auth.constants';

function makeAuthedRequest(overrides: {
  method?: string;
  origin?: string;
  host?: string;
  pathname?: string;
}) {
  const host = overrides.host ?? 'app.financecontrol.com';
  const url = `http://${host}${overrides.pathname ?? '/api/wallet'}`;

  const headers: Record<string, string> = { host };
  if (overrides.origin) headers.origin = overrides.origin;

  const request = new NextRequest(url, {
    method: overrides.method ?? 'POST',
    headers,
  });

  request.cookies.set(AUTH_COOKIE_NAME, 'fake-token');

  return request;
}

describe('proxy — CSRF origin check', () => {
  it('should return 403 when Origin host does not match Host', async () => {
    const request = makeAuthedRequest({
      origin: 'https://evil.example.com',
      host: 'app.financecontrol.com',
    });

    const response = proxy(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({ message: AUTH_CSRF_ORIGIN_MISMATCH_MESSAGE });
  });

  it('should allow the request through when Origin host matches Host', () => {
    const request = makeAuthedRequest({
      origin: 'https://app.financecontrol.com',
      host: 'app.financecontrol.com',
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it('should allow the request through when Origin header is absent', () => {
    const request = makeAuthedRequest({ host: 'app.financecontrol.com' });

    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it('should not apply the origin check to GET requests', () => {
    const request = makeAuthedRequest({
      method: 'GET',
      origin: 'https://evil.example.com',
      host: 'app.financecontrol.com',
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it('should not apply the origin check to public api paths', () => {
    const request = makeAuthedRequest({
      pathname: '/api/auth/sign-in',
      origin: 'https://evil.example.com',
      host: 'app.financecontrol.com',
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it('should treat /api/auth/register as a public api path', () => {
    const request = makeAuthedRequest({
      pathname: '/api/auth/register',
      origin: 'https://evil.example.com',
      host: 'app.financecontrol.com',
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
  });
});

describe('proxy — public page paths', () => {
  it('should allow an unauthenticated visitor to reach /register without redirecting to /login', () => {
    const request = new NextRequest('http://app.financecontrol.com/register', {
      method: 'GET',
      headers: { host: 'app.financecontrol.com' },
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it('should redirect an unauthenticated visitor away from a private page', () => {
    const request = new NextRequest('http://app.financecontrol.com/wallet', {
      method: 'GET',
      headers: { host: 'app.financecontrol.com' },
    });

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login');
  });

  it('should allow an unauthenticated visitor to reach /about without redirecting to /login', () => {
    const request = new NextRequest('http://app.financecontrol.com/about', {
      method: 'GET',
      headers: { host: 'app.financecontrol.com' },
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it('should redirect an unauthenticated visitor from the root path to /about instead of /login', () => {
    const request = new NextRequest('http://app.financecontrol.com/', {
      method: 'GET',
      headers: { host: 'app.financecontrol.com' },
    });

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/about');
    expect(response.headers.get('location')).not.toContain('/login');
  });

  it('should still redirect an unauthenticated visitor from any other private page to /login, not /about', () => {
    const request = new NextRequest('http://app.financecontrol.com/wallet', {
      method: 'GET',
      headers: { host: 'app.financecontrol.com' },
    });

    const response = proxy(request);

    expect(response.headers.get('location')).toContain('/login');
    expect(response.headers.get('location')).not.toContain('/about');
  });
});
