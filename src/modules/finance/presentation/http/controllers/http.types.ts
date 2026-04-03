export interface HttpResponse<T = unknown> {
  statusCode: number;
  body: T | null;
}

export interface Controller<Request, Response = unknown> {
  handle(request: Request): Promise<HttpResponse<Response>>;
}
