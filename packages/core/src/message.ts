import { HttpHeaders, HttpMethod, HttpStatusCode } from './types/http.js';
import { Params } from './types/router.js';

export abstract class Message<Request = unknown, Response = unknown> {
  abstract readonly request: Request;
  abstract readonly response: Response;

  abstract get url(): URL;

  abstract get params(): Params;
  abstract set params(params: Params);

  abstract get body(): unknown;
  abstract set body(body: unknown);

  abstract get method(): HttpMethod;
  abstract set method(method: HttpMethod);

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
