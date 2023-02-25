import { HttpHeaders, HttpStatusCode } from './types/http.js';

export abstract class Message<Request = unknown, Response = unknown> {
  abstract readonly request: Request;
  abstract readonly response: Response;

  abstract get url(): URL;

  abstract get statusCode(): HttpStatusCode;
  abstract set statusCode(statusCode: HttpStatusCode);

  abstract get headers(): HttpHeaders;
  abstract set headers(headers: HttpHeaders);

  abstract respond(
    data?: unknown,
    statusCode?: HttpStatusCode,
    headers?: HttpHeaders
  ): void;
}
