import { HttpResponse } from './http.types';

export interface Controller<Request, Response = unknown> {
  handle(request: Request): Promise<HttpResponse<Response>>;
}
