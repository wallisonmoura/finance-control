import { NextResponse } from 'next/server';
import { HttpResponse } from './http.types';

export function toNextResponse<T>(response: HttpResponse<T>): NextResponse {
  if (response.body === null) {
    return new NextResponse(null, {
      status: response.statusCode,
    });
  }

  return NextResponse.json(response.body, {
    status: response.statusCode,
  });
}
