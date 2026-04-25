export interface HttpRequest {
  body?: unknown;
  params?: Record<string, string>;
  query?: Record<string, string | string[] | undefined>;
  userId?: string;
}

export interface HttpResponse<T = unknown> {
  statusCode: number;
  body: T | null;
}
