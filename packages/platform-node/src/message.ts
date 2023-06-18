import {
  Message as CoreMessage,
  HttpStatusCode,
  Params,
  HttpMethod,
} from '@rxtp/core';
import { IncomingMessage, ServerResponse } from 'http';

export class Message implements CoreMessage<IncomingMessage, ServerResponse> {
  private _params: Params = {};
  private _body: unknown;

  constructor(
    readonly request: IncomingMessage,
    readonly response: ServerResponse
  ) {}

  static createNodeMessage(
    request: IncomingMessage,
    response: ServerResponse
  ): Message {
    return new Message(request, response);
  }

  get statusCode(): HttpStatusCode {
    return this.response.statusCode as HttpStatusCode;
  }

  set statusCode(statusCode: HttpStatusCode) {
    this.response.statusCode = statusCode;
  }

  get url(): URL {
    return new URL(this.request.url, 'http://localhost');
  }

  get headers(): Record<string, string | string[]> {
    return this.request.headers;
  }

  set headers(headers: Record<string, string | string[]>) {
    for (const [key, value] of Object.entries(headers)) {
      this.response.setHeader(key, value);
    }
  }

  get method(): HttpMethod {
    return this.request.method as HttpMethod;
  }

  set method(method: HttpMethod) {
    this.request.method = method;
  }

  get params(): Params {
    return this._params;
  }

  set params(params: Params) {
    this._params = params;
  }

  get body(): unknown {
    return this._body;
  }

  set body(body: unknown) {
    this._body = body;
  }

  respond(
    data?: unknown,
    statusCode?: HttpStatusCode,
    headers?: Record<string, string | string[]>
  ): void {
    if (!this.response.writableEnded || !this.response.writableFinished) {
      if (!this.response.headersSent) {
        statusCode ? (this.statusCode = statusCode) : (this.statusCode = 200);
        headers ? (this.headers = headers) : (this.headers = {});
      }
      if (data === undefined) {
        this.response.end();
        return;
      }
      if (typeof data === 'string') {
        this.response.setHeader('Content-Type', 'text/plain');
        this.response.end(data);
        return;
      }
      if (typeof data === 'object') {
        this.response.setHeader('Content-Type', 'application/json');
        this.response.end(JSON.stringify(data));
        return;
      }
      if (data instanceof Buffer) {
        this.response.setHeader('Content-Type', 'application/octet-stream');
        this.response.end(data);
        return;
      }
      this.response.end();
      return;
    }
  }
}
