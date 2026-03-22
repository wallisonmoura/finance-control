import { AUTH_UNAUTHORIZED_MESSAGE } from '@/modules/auth/constants/auth.constants';
import { NextResponse } from 'next/server';

export function unauthorizedResponse(message = AUTH_UNAUTHORIZED_MESSAGE) {
  return NextResponse.json({ message }, { status: 401 });
}
