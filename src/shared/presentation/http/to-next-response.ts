import { NextResponse } from 'next/server';

type HttpResponse<T = unknown> = {
  statusCode: number;
  body: T | null;
};

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
