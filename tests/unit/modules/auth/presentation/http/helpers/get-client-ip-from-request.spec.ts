import { NextRequest } from 'next/server';

import { getClientIpFromRequest } from '@/modules/auth/presentation/http/helpers/get-client-ip-from-request';

describe('getClientIpFromRequest', () => {
  it('should return the first ip from x-forwarded-for', () => {
    const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
      headers: { 'x-forwarded-for': '203.0.113.10, 70.41.3.18' },
    });

    expect(getClientIpFromRequest(request)).toBe('203.0.113.10');
  });

  it('should trim whitespace around the first ip', () => {
    const request = new NextRequest('http://localhost:3000/api/auth/sign-in', {
      headers: { 'x-forwarded-for': '  203.0.113.10  ,70.41.3.18' },
    });

    expect(getClientIpFromRequest(request)).toBe('203.0.113.10');
  });

  it('should fall back to a default value when the header is absent', () => {
    const request = new NextRequest('http://localhost:3000/api/auth/sign-in');

    expect(getClientIpFromRequest(request)).toBe('unknown');
  });
});
