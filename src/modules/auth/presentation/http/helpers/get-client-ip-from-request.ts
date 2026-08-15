import { NextRequest } from 'next/server';

const UNKNOWN_IP = 'unknown';

export function getClientIpFromRequest(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (!forwardedFor) {
    return UNKNOWN_IP;
  }

  const [firstIp] = forwardedFor.split(',');

  return firstIp.trim() || UNKNOWN_IP;
}
